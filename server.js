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
var fileOperations = require('./server/file-operations');
var authentication = require('./server/authentication');
var stats = require('./server/stats');

config.initializeConfig(path.join(__dirname, 'config', 'config.json'));

if(!fs.existsSync(config.getConfig().dir)) {
    fs.mkdirSync(config.getConfig().dir);
}

fileOperations.initialize(config.getConfig().dir);
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
app.post("/api/authenticate/web", function(request, response, next) {
    let newCookie = authentication.getWebAccessToken(request.body.password);

    if(newCookie !== "") {
        response.cookie('auth', newCookie, {maxAge: 900000, httpOnly: true, sameSite: "strict"});
        response.status(200).send("Successfully Authenticated.");
    } else {
        response.status(401).send("Incorrect password.");
    }
});
app.post("/api/authenticate/admin", function(request, response, next) {
    let newCookie = authentication.getAdminToken(request.body.password);

    if(newCookie !== "") {
        response.cookie('auth', newCookie, {maxAge: 900000, httpOnly: true, sameSite: "strict"});
        response.status(200).send("Successfully Authenticated.");
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

app.get('/api/web/files', function(request, response) {
    fileOperations.getFiles()
        .then(function(value) {
            response.json(value);
        })
        .catch(function (error) {
            console.log(error);
            response.status(500).send('Could not fetch files.');
        });
});

app.get('/api/config/web', function(request, response) {
    stats.addPageView(config.getConfig());
    let uiConfig = {
        banner: config.getConfig().banner,
        uploads: config.getConfig().uploads,
        darkMode: config.getConfig().darkMode,
        authenticated: authentication.checkWebAuthenticated(request)
    };
    response.send(uiConfig);
});

app.get('/api/config/admin', function(request, response) {
    stats.addPageView(config.getConfig());
    let uiConfig = {
        banner: config.getConfig().banner,
        uploads: config.getConfig().uploads,
        darkMode: config.getConfig().darkMode,
        authenticated: authentication.checkAdminAuthenticated(request)
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
    fileOperations.isDirectory(request.query.file)
        .then(function(result) {
            if (fileStats.isDirectory()) {
                stats.addDownload(request.query.file + '/');
                fileOperations.getZipFiles([request.query.file])
                    .then(function(results) {
                        response.zip(results, request.query.file.split('/').pop() + '.zip');
                    })
                    .catch(function (error) {
                        console.log(error);
                        response.status(409).send('Could not retrieve files for download.');
                    });
            }
            else {
                stats.addDownload(request.query.file);
                response.download(path.join(config.getConfig().dir, request.query.file));
            }
        })
        .catch(function(error) {
            console.log(error);
            response.status(404).send('Error accessing ' + request.query.file);
        });
});

app.get('/api/web/downloadZip', function(request, response) {
    fileOperations.getZipFiles(JSON.parse(request.query.files))
        .then(function(results) {
            response.zip(results, config.getConfig().banner.replace(/ /gi, '-') + '.zip');
        })
        .catch(function (error) {
            console.log(error);
            response.status(409).send('Could not retrieve files for download.');
        });
});

app.post('/api/admin/rename', function(request, response) {
    fileOperations.renameFile(request.body.original, request.body.replacement)
        .then(function () {
            response.status(200).send('File renamed.');
        })
        .catch(function (error) {
            console.log(error);
            response.status(409).send('Could not rename file.');
        });
});

app.delete('/api/admin/delete', function(request, response) {
    fileOperations.deleteFile(request.body.file)
        .then(function () {
            response.status(200).send('File deleted.');
        })
        .catch(function (error) {
            console.log(error);
            response.status(409).send('Could not delete file.');
        });
});

app.put('/api/admin/mkdir', function(request, response) {
    fileOperations.mkdir(request.body.folder)
        .then(function () {
            response.status(200).send('Folder created.');
        })
        .catch(function (error) {
            console.log(error);
            response.status(409).send('Could not create folder.');
        });
});

app.post('/api/admin/config/set', function(request, response) {
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
