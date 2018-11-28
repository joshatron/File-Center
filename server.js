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

app.get('/api/files', function(request, response) {
    var files = [];
    fs.readdir(fileDir, function(error, contents) {
        var processed = 0;
        contents.forEach(function (file) {
            fs.stat(path.join(fileDir, file), function (error, stats) {
                files.push({name: file, size: stats["size"]});
                processed++;

                if(processed === contents.length) {
                    response.json(files);
                }
            });
        });
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
    response.download(path.join(fileDir, request.params.name));
});

app.post('/api/downloadzip', function(request, response) {
    var toZip = JSON.parse(request.body.files).map(function(result) {
        return {path: path.join(fileDir, result), name: result};
    });
    response.zip(toZip, 'file-center-download.zip');
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
