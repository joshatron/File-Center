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

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'config.json'), 'utf8'));
if(config !== undefined) {
    console.log("Config: ");
    console.log(config);
}

var fileDir = path.join(__dirname, 'files');
if(config.dir !== undefined) {
    fileDir = config.dir;
}
if(!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir);
}

var storage = multer.diskStorage({
    destination: function (request, file, cb) {
        cb(null, fileDir)
    },
    filename: function (request, file, cb) {
        cb(null, file.originalname)
    }
});
var upload = multer({storage: storage});

app.use(express.static(path.join(__dirname,  'public')));
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
                        files.push({name: file, size: sum, type: 'directory', contents: dirContents});
                        processed++;

                        if (processed === contents.length) {
                            done(null, files);
                        }
                    });
                }
                else {
                    files.push({name: file, size: stats["size"], type: 'file'});
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
        fs.stat(path.join(fileDir, file), function(error, stats) {
            if(stats.isDirectory()) {
                fs.readdir(path.join(fileDir, file), function(error, contents) {
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
                toZip.push({path: path.join(fileDir, file), name: file});
                processed++;

                if (processed === files.length) {
                    done(null, toZip);
                }
            }
        });
    });
};

app.get('/api/files', function(request, response) {
    getFiles(fileDir, function(error, files) {
        response.json(files);
    });
});

app.get('/api/banner', function (request, response) {
    if(config.banner === undefined) {
        response.send("File Center");
    }
    else {
        response.send(config.banner);
    }
});

app.post('/api/upload', upload.any(), function(request, response, next) {
    response.send("Upload successful");
});

app.get('/api/download/:name', function(request, response) {
    fs.stat(path.join(fileDir, request.params.name), function (error, stats) {
        if(stats.isDirectory()) {
            getZipFiles([request.params.name], function(error, results) {
                response.zip(results, request.params.name + '.zip');
            });
        }
        else {
            response.download(path.join(fileDir, request.params.name));
        }
    });
});

app.post('/api/downloadzip', function(request, response) {
    getZipFiles(JSON.parse(request.body.files), function(error, results) {
        response.zip(results, 'file-center-download.zip');
    });
});

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if(config.port === undefined) {
    app.listen(8080);
    console.log('App started on port 8080');
}
else {
    app.listen(config.port);
    console.log('App started on port ' + config.port);
}
