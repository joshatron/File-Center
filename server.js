'use strict';

var https = require('https');
var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var fs = require('fs');
var multer = require('multer');
var path = require('path');
var zip = require('express-zip');
var ip = require('ip');

var configParse = require('./config')
var fileWalker = require('./file-walker')

var configFile = path.join(__dirname, 'config', 'config.json');
var config = configParse.getConfig(fs.readFileSync(configFile, 'utf8'));
console.log("Config: ");
console.log(config);
var fsWait = false;
fs.watch(configFile, (event, filename) => {
    if (filename) {
        if (fsWait) return;
        fsWait = setTimeout(() => {
            fsWait = false;
        }, 100);

        config = configParse.getConfig(fs.readFileSync(configFile, 'utf8'));
        console.log("Config changed. New config: ");
        console.log(config);
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
        fs.stat(path.join(config.dir, file), function(error, stats) {
            if(stats.isDirectory()) {
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
                toZip.push({path: path.join(config.dir, file), name: file});
                processed++;

                if (processed === files.length) {
                    done(null, toZip);
                }
            }
        });
    });
};

app.get('/api/files', function(request, response) {
    fileWalker.getFiles(config.dir).then(
        function(value) {
            response.json(value)
        });
});

app.get('/api/config', function(request, response) {
    let uiConfig = {
        banner: config.banner,
        uploads: config.uploads
    }
    response.send(uiConfig);
});

app.post('/api/upload', upload.any(), function(request, response, next) {
    if(config.uploads === true) {
        response.send("Upload successful");
    } else {
        response.status(403).send("File uploading has been locked");
    }
});

app.post('/api/upload/*', upload.any(), function(request, response, next) {
    if(config.uploads === true) {
        response.send("Upload successful");
    } else {
        response.status(403).send("File uploading has been locked");
    }
});


app.get('/api/download', function(request, response) {
    fs.stat(path.join(config.dir, request.query.file), function (error, stats) {
        if (stats === undefined) {
            response.status(404).send('File ' + request.query.file + ' not found');
        }
        else {
            if (stats.isDirectory()) {
                getZipFiles([request.query.file], function (error, results) {
                    response.zip(results, request.query.file.split('/').pop() + '.zip');
                });
            }
            else {
                response.download(path.join(config.dir, request.query.file));
            }
        }
    });
});

app.get('/api/downloadZip', function(request, response) {
    getZipFiles(JSON.parse(request.query.files), function(error, results) {
        response.zip(results, config.banner.replace(/ /gi, '-') + '.zip');
    });
});

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
