var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var fs = require('fs');

var fileDir = "./files";
if(!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir);
}

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