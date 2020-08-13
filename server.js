'use strict';

var https = require('https');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var app = express();
var morgan = require('morgan');
var methodOverride = require('method-override');
var fs = require('fs');
var Busboy = require('busboy')
var path = require('path');
var zip = require('express-zip');
var ip = require('ip');

var config = require('./server/config');
var fileWalker = require('./server/file-walker');
var authentication = require('./server/authentication');
var stats = require('./server/stats');

config.initializeConfig(path.join(__dirname, 'config', 'config.json'));

if(!fs.existsSync(config.getConfig().dir)) {
    fs.mkdirSync(config.getConfig().dir);
}

stats.initialize(config.getConfig().statsFile);

app.use(cookieParser());
app.use(bodyParser.json())

authentication.initialize(config.getConfig().webPassword, config.getConfig().adminPassword);
app.use("*", function (request, response, next) {
    if(authentication.checkAuthorized(request)) {
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
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));
app.use('/admin/files', express.static(path.join(__dirname, 'public', 'admin')));
app.use('/admin/files/*', express.static(path.join(__dirname, 'public', 'admin')));
app.use(morgan('dev'));
app.use(methodOverride());

var getZipFiles = function(files, done) {
    var toZip = [];
    var processed = 0;
    files.forEach(function(file) {
        fs.stat(path.join(config.getConfig().dir, file), function(error, fileStats) {
            if(fileStats.isDirectory()) {
                stats.addDownload(file + '/');
                fs.readdir(path.join(config.getConfig().dir, file), function(error, contents) {
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
                toZip.push({path: path.join(config.getConfig().dir, file), name: file});
                processed++;

                if (processed === files.length) {
                    done(null, toZip);
                }
            }
        });
    });
};

app.get('/api/web/files', function(request, response) {
    fileWalker.getFiles(config.getConfig().dir).then(
        function(value) {
            response.json(value)
        });
});

app.get('/api/config', function(request, response) {
    stats.addPageView(config.getConfig());
    let uiConfig = {
        banner: config.getConfig().banner,
        uploads: config.getConfig().uploads,
        darkMode: config.getConfig().darkMode,
        authenticated: authentication.checkWebAuthenticated(request)
    };
    response.send(uiConfig);
});

app.post('/api/web/upload', function(request, response, next) {
    if(config.getConfig().uploads) {
        var busboy = new Busboy({ headers: request.headers });
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            var saveTo = path.join(config.getConfig().dir, filename);
            file.pipe(fs.createWriteStream(saveTo));
        });

        busboy.on('finish', function() {
            response.writeHead(200, { 'Connection': 'close' });
            response.end("That's all folks!");
        });
    
        return request.pipe(busboy);
    } else {
        response.status(405).send('Uploading is not currently allowed.');
    }
});

app.post('/api/web/upload/*', function(request, response, next) {
    if(config.getConfig().uploads) {
        var busboy = new Busboy({ headers: request.headers });
        let folder = path.join(config.getConfig().dir, request.url.substring(16));
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            var saveTo = path.join(folder, filename);
            file.pipe(fs.createWriteStream(saveTo));
        });

        busboy.on('finish', function() {
            response.writeHead(200, { 'Connection': 'close' });
            response.end("That's all folks!");
        });
    
        return request.pipe(busboy);
    } else {
        response.status(405).send('Uploading is not currently allowed.');
    }
});

app.get('/api/web/download', function(request, response) {
    fs.stat(path.join(config.getConfig().dir, request.query.file), function (error, fileStats) {
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
                response.download(path.join(config.getConfig().dir, request.query.file));
            }
        }
    });
});

app.get('/api/web/downloadZip', function(request, response) {
    getZipFiles(JSON.parse(request.query.files), function(error, results) {
        response.zip(results, config.getConfig().banner.replace(/ /gi, '-') + '.zip');
    });
});

app.post('/api/admin/rename', function(request, response) {
    fs.rename(path.join(config.getConfig().dir, request.body.original), 
              path.join(config.getConfig().dir, request.body.replacement), 
              (error) => {
        if(error) {
            console.log(error);
            response.status(409).send('Could not rename file.');
        } else {
            response.status(200).send('File renamed.');
        }
    });
});

app.delete('/api/admin/delete', function(request, response) {
    //TODO: handle deleting dir
    fs.unlink(path.join(config.getConfig().dir, request.body.file), (error) => {
        if(error) {
            console.log(error);
            response.status(409).send('Could not delete file.');
        } else {
            response.status(200).send('File deleted.');
        }
    })
});

app.put('/api/admin/mkdir', function(request, response) {
    fs.mkdir(path.join(config.getConfig().dir, request.body.folder), {recursive: true}, (error) => {
        if(error) {
            console.log(error);
            response.status(409).send('Could not create folder.');
        } else {
            response.status(200).send('Folder created.');
        }
    })
});

app.post('/api/admin/setConfig', function(request, response) {
    config.overrideConfig(request.body);

    response.status(200).send('Config updated.');
});

app.get('/api/admin/config', function(request, response) {
    response.status(200).send(config.getConfig());
});

if(config.getConfig().https) {
    let credentials = {
        cert: fs.readFileSync(config.getConfig().httpsCert, 'utf8'),
        key: fs.readFileSync(config.getConfig().httpsKey, 'utf8'),
    };
    https.createServer(credentials, app).listen(config.getConfig().port);
} else {
    app.listen(config.getConfig().port);
}

console.log('Local address: ' + ip.address() + ':' + config.getConfig().port);
