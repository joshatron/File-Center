'use strict';

var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var fs = require('fs');
var multer = require('multer');

var fileDir = "./files";
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

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride());

app.get('/api/files', function(request, response) {
    var files = [];
    fs.readdirSync(fileDir).foreach(function(result) {
        files.push({name: result});
    });
    response.json(files);
});

app.post('/api/upload', upload.any(), function(request, response, next) {
    response.send("Upload successful");
});

app.get('/', function(request, response) {
    response.sendfile('./public/index.html');
});

app.listen(8080);
console.log('App started on port 8080');
