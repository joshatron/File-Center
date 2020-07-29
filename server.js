'use strict';

var https = require('https');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var app = express();
var morgan = require('morgan');
var methodOverride = require('method-override');
var fs = require('fs');
var multer = require('multer');
var path = require('path');
var zip = require('express-zip');
var ip = require('ip');

var configParse = require('./server/config');
var fileWalker = require('./server/file-walker');
var authentication = require('./server/authentication');
var stats = require('./server/stats');

var configFile = path.join(__dirname, 'config', 'config.json');
var config = configParse.getConfig(fs.readFileSync(configFile, 'utf8'));
console.log("Config: ");
console.log(config);
//Using watchFile instead of watch because editting in vim was causing problems.
fs.watchFile(configFile, (curr, prev) => {
    if(curr.mtime > prev.mtime) {
        fs.readFile(configFile, function(err, data) {
            if(err) {
                console.log("Couldn't read config file change.");
            } else {
                config = configParse.getConfig(data);

                stats.updateStatsFile(config.statsFile);
                authentication.updateWebAccessPassword(config.webPassword);
                if(!fs.existsSync(config.dir)) {
                    fs.mkdirSync(config.dir);
                }

                console.log("Config changed. New config: ");
                console.log(config);
            }
        });
    }
});

if(!fs.existsSync(config.dir)) {
    fs.mkdirSync(config.dir);
}

var storage = multer.diskStorage({
    destination: function (request, file, cb) {
        let folder = config.dir;
        if(request.url.length > 12) {
            folder = path.join(folder, request.url.substring(12));
        }
        cb(null, folder);
    },
    filename: function (request, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({storage: storage});

stats.initialize(config.statsFile);

app.use(cookieParser());
app.use(bodyParser.json())

authentication.initialize(config.webPassword);
app.use("*", function (request, response, next) {
    if(authentication.checkToken(request, config)) {
        next();
    } else {
        response.status(401).send("You are unauthorized.");
    }
});
app.post("/authenticate", function(request, response, next) {
    let newCookie = authentication.getWebAccessToken(request.body.password);

    if(newCookie !== "") {
        response.cookie('auth', newCookie, {maxAge: 900000, httpOnly: true, sameSite: "strict"});
        response.send("Successfully Authenticated.");
    } else {
        response.status(401).send("Incorrect password.");
    }
});
app.post("/authenticateAdmin", function(request, response, next) {
    let newCookie = authentication.getAdminToken(request.body.password);

    if(newCookie !== "") {
        response.cookie('auth', newCookie, {maxAge: 900000, httpOnly: true, sameSite: "strict"});
        response.send("Successfully Authenticated.");
    } else {
        response.status(401).send("Incorrect password.");
    }
});

app.use('/public', express.static(path.join(__dirname, 'public', 'static')));
app.use('/', express.static(path.join(__dirname, 'public', 'html')));
app.use('/files', express.static(path.join(__dirname, 'public', 'html')));
app.use('/files/*', express.static(path.join(__dirname, 'public', 'html')));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:'true', limit: '1tb'}));
app.use(bodyParser.json({limit: '1tb'}));
app.use(bodyParser.json({type: 'application/vnd.api+json', limit: '1tb'}));
app.use(methodOverride());

var getZipFiles = function(files, done) {
    var toZip = [];
    var processed = 0;
    files.forEach(function(file) {
        fs.stat(path.join(config.dir, file), function(error, fileStats) {
            if(fileStats.isDirectory()) {
                stats.addDownload(file + '/');
                fs.readdir(path.join(config.dir, file), function(error, contents) {
                    contents = contents.map(function(result) {
                        return path.join(file, result);
                    });
                    getZipFiles(contents, function(error, results) {
                        toZip = toZip.concat(results);
                        processed++;

                        if (processed === files.length) {
                            done(null, toZip);
                        }
                    })
                })
            }
            else {
                stats.addDownload(file);
                toZip.push({path: path.join(config.dir, file), name: file});
                processed++;

                if (processed === files.length) {
                    done(null, toZip);
                }
            }
        });
    });
};

app.get('/api/web/files', function(request, response) {
    fileWalker.getFiles(config.dir).then(
        function(value) {
            response.json(value)
        });
});

app.get('/api/config', function(request, response) {
    stats.addPageView(config);
    let uiConfig = {
        banner: config.banner,
        uploads: config.uploads,
        darkMode: config.darkMode,
        webPassword: config.webPassword !== ""
    };
    response.send(uiConfig);
});

if(config.uploads) {
    app.post('/api/web/upload', upload.any(), function(request, response, next) {
        response.send("Upload successful");
    });

    app.post('/api/web/upload/*', upload.any(), function(request, response, next) {
        response.send("Upload successful");
    });
}

app.get('/api/web/download', function(request, response) {
    fs.stat(path.join(config.dir, request.query.file), function (error, fileStats) {
        if (fileStats === undefined) {
            response.status(404).send('File ' + request.query.file + ' not found');
        }
        else {
            if (fileStats.isDirectory()) {
                stats.addDownload(request.query.file + '/');
                getZipFiles([request.query.file], function (error, results) {
                    response.zip(results, request.query.file.split('/').pop() + '.zip');
                });
            }
            else {
                stats.addDownload(request.query.file);
                response.download(path.join(config.dir, request.query.file));
            }
        }
    });
});

app.get('/api/web/downloadZip', function(request, response) {
    getZipFiles(JSON.parse(request.query.files), function(error, results) {
        response.zip(results, config.banner.replace(/ /gi, '-') + '.zip');
    });
});

// app.post('/api/admin/rename');
// app.delete('/api/admin/delete');
// app.put('/api/admin/mkdir');
// app.post('/api/admin/setConfig');

if(config.https) {
    let credentials = {
        cert: fs.readFileSync(config.httpsCert, 'utf8'),
        key: fs.readFileSync(config.httpsKey, 'utf8'),
    };
    https.createServer(credentials, app).listen(config.port);
} else {
    app.listen(config.port);
}


console.log('Local address: ' + ip.address() + ':' + config.port);
