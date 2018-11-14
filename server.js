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

app.listen(8080);
console.log('App started on port 8080');

app.get('/api/files', function(request, response) {
    var files = fs.readdirSync(fileDir);
    response.json(files);
});

app.post('/api/upload', upload.any(), function(request, response, next) {
    console.log(request.file);
});

app.get('*', function(request, response) {
    response.sendfile('./public/index.html')
})