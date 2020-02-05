'use strict';

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

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'config.json'), 'utf8'));
if(config === undefined) {
    config = {};
}
if(config.banner === undefined) {
    config.banner = "File Center";
}
if(config.port === undefined) {
    config.port = 8080;
}
if(config.dir === undefined) {
    config.dir = path.join(__dirname, 'files');
}
if(config.uploads === undefined) {
    config.uploads = true;
}
console.log("Config: ");
console.log(config);

if(!fs.existsSync(config.dir)) {
    fs.mkdirSync(config.dir);
}

var storage = multer.diskStorage({
    destination: function (request, file, cb) {
        //TODO: do something here to upload to specific dir
        cb(null, config.dir);
    },
    filename: function (request, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({storage: storage});

app.use('/', express.static(path.join(__dirname, 'public', 'dist', 'file-center')));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:'true', limit: '1tb'}));
app.use(bodyParser.json({limit: '1tb'}));
app.use(bodyParser.json({type: 'application/vnd.api+json', limit: '1tb'}));
app.use(methodOverride());

var getFiles = function(dir, done) {
    var files = [];
    fs.readdir(dir, function(error, contents) {
        var processed = 0;
        contents.forEach(function (file) {
            fs.stat(path.join(dir, file), function (error, stats) {
                if(stats.isDirectory()) {
                    getFiles(path.join(dir, file), function(error, dirContents) {
                        var sum = 0;
                        dirContents.forEach(function (f) {
                            sum += f.size;
                        });
                        files.push({name: file, size: sum, type: 'directory', files: dirContents});
                        processed++;

                        if (processed === contents.length) {
                            done(null, files);
                        }
                    });
                }
                else {
                    files.push({name: file, size: stats["size"], type: 'file', files: []});
                    processed++;

                    if (processed === contents.length) {
                        done(null, files);
                    }
                }
            });
        });
    });
};

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
    getFiles(config.dir, function(error, files) {
        response.json(files);
    });
});

app.get('/api/config', function(request, response) {
    let uiConfig = {
        banner: config.banner,
        uploads: config.uploads
    }
    response.send(uiConfig);
});

if(config.uploads === true) {
    app.post('/api/upload', upload.any(), function(request, response, next) {
        response.send("Upload successful");
    });
}
else {
    app.post('/api/upload', function(request, response) {
        response.status(403).send("File uploading has been locked");
    });
}

app.get('/api/download', function(request, response) {
    if(request.query.file !== undefined) {
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
    }
    else if(request.query.files !== undefined) {
        getZipFiles(JSON.parse(request.query.files), function(error, results) {
            response.zip(results, 'file-center-download.zip');
        });
    }
});

app.listen(config.port);

console.log('Local address: ' + ip.address() + ':' + config.port);
