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
    let path = request.baseUrl;
    let password = authentication.passwordFromHeader(request.header("Authorization"));
    let token = request.cookies['auth'];

    if(path.startsWith('/api/admin')) {
        if(authentication.checkAdminAuthenticated(password, token)) {
            response.cookie('auth', authentication.getAdminToken(), {maxAge: 900000, httpOnly: true, sameSite: "strict"});
            next();
        } else {
            response.status(401).send("You are unauthorized.");
        }
    } else if(path.startsWith('/api/web')) {
        if(authentication.checkWebAuthenticated(password, token)) {
            if(!authentication.checkAdminAuthenticated(password, token)) {
                response.cookie('auth', authentication.getWebToken(), {maxAge: 900000, httpOnly: true, sameSite: "strict"});
            }
            next();
        } else {
            response.status(401).send("You are unauthorized.");
        }
    } else {
        next();
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

app.get('/api/config/web', function(request, response) {
    let password = authentication.passwordFromHeader(request.header("Authorization"));
    let token = request.cookies['auth'];
    stats.addPageView(config.getConfig());
    let uiConfig = {
        banner: config.getConfig().banner,
        uploads: config.getConfig().uploads,
        darkMode: config.getConfig().darkMode,
        authenticated: authentication.checkWebAuthenticated(password, token)
    };
    response.send(uiConfig);
});

app.get('/api/config/admin', function(request, response) {
    let password = authentication.passwordFromHeader(request.header("Authorization"));
    let token = request.cookies['auth'];
    let uiConfig = {
        banner: config.getConfig().banner + " - Admin",
        darkMode: config.getConfig().darkMode,
        authenticated: authentication.checkAdminAuthenticated(password, token)
    };
    response.send(uiConfig);
});

app.get('/api/web/ping', function(request, response) {
    response.status(200).send('Ping received.');
})

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

app.post('/api/web/upload', function(request, response, next) {
    let password = authentication.passwordFromHeader(request.header("Authorization"));
    let token = request.cookies['auth'];

    if(config.getConfig().uploads || authentication.checkAdminAuthenticated(password, token)) {
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
    let password = authentication.passwordFromHeader(request.header("Authorization"));
    let token = request.cookies['auth'];

    if(config.getConfig().uploads || authentication.checkAdminAuthenticated(password, token)) {
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

app.get('/api/web/download', async function(request, response) {
    try {
        let files = Buffer.from(request.query.files, 'base64').toString('utf8');
        files = JSON.parse(files);

        if(files === undefined || files.length === 0) {
            response.status(400).send('Illegal file list.');
        } else if(files.length === 1) {
            let file = files[0];
            let isDirectory = await fileOperations.isDirectory(file);
            if (isDirectory) {
                let zipFiles = await fileOperations.getZipFiles(files);
                response.zip(zipFiles, file.split('/').pop() + '.zip');
            } else {
                response.download(path.join(config.getConfig().dir, file));
            }
            stats.addDownload(file);
        } else {
            let zipFiles = await fileOperations.getZipFiles(files);
            response.zip(zipFiles, config.getConfig().banner.replace(/ /gi, '-') + '.zip');
            files.forEach(f => stats.addDownload(f));
        }
    } catch(error) {
        console.log(error);
        response.status(409).send('The requested files are inaccessible');
    }
});

app.get('/api/admin/ping', function(request, response) {
    response.status(200).send('Ping received.');
})

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
