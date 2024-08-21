'use strict';

var https = require('https');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser')
var app = express();
var morgan = require('morgan');
var methodOverride = require('method-override');
var fs = require('fs');
var Busboy = require('busboy')
var path = require('path');
var ip = require('ip');
const crypto = require("crypto");

// Initialize everything
var config = require('./server/config');
var fileOperations = require('./server/file-operations');
var authentication = require('./server/authentication');
var stats = require('./server/stats');

config.initializeConfig(path.join(__dirname, '..', 'config', 'config.json'));

if(!fs.existsSync(config.getConfig().dir)) {
    fs.mkdirSync(config.getConfig().dir);
}

fileOperations.initialize(config.getConfig().dir);
authentication.initialize(config.getConfig().webPassword, config.getConfig().adminPassword);
stats.initialize(config.getConfig().statsFile);

app.use(bodyParser.json())
app.use(morgan('dev'));
app.use(methodOverride());
app.use(session({
    secret: crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false
}))

// Static resources
app.use('/resources', express.static(path.join(__dirname, 'resources')));
app.use('/', express.static(path.join(__dirname, 'resources', 'html')));
app.use('/files', express.static(path.join(__dirname, 'resources', 'html')));
app.use('/files/*', express.static(path.join(__dirname, 'resources', 'html')));
app.use('/admin', express.static(path.join(__dirname, 'resources', 'html', 'admin')));
app.use('/admin/files', express.static(path.join(__dirname, 'resources', 'html', 'admin')));
app.use('/admin/files/*', express.static(path.join(__dirname, 'resources', 'html', 'admin')));

// Authenticate endpoints
app.use("*", function (request, response, next) {
    authentication.updateWebAccessPassword(config.getConfig().webPassword);
    authentication.updateAdminPassword(config.getConfig().adminPassword);
    let path = request.baseUrl;

    if (path === '/api/web/files' || path === '/api/web/download') {
        if((config.getConfig().downloads && authentication.checkWebAuthenticated(request)) || authentication.checkAdminAuthenticated(request)) {
            next();
        } else {
            response.status(401).send("You are unauthorized.");
        }
    } else if (path.startsWith('/api/web/upload')) {
        if((config.getConfig().uploads && authentication.checkWebAuthenticated(request)) || authentication.checkAdminAuthenticated(password, token)) {
            next();
        } else {
            response.status(401).send("You are unauthorized.");
        }
    } else if(path.startsWith('/api/admin')) {
        if(authentication.checkAdminAuthenticated(request)) {
            next();
        } else {
            response.status(401).send("You are unauthorized.");
        }
    } else {
        next();
    }
});

// API enpoints
app.get('/api/config/web', function(request, response) {
    stats.addPageView(config.getConfig());
    let uiConfig = {
        banner: config.getConfig().banner,
        uploads: config.getConfig().uploads,
        downloads: config.getConfig().downloads,
        darkMode: config.getConfig().darkMode,
        authenticated: authentication.checkWebAuthenticated(request)
    };
    response.send(uiConfig);
});

app.get('/api/config/custom.css', function(request, response) {
    response.setHeader('Content-Type', 'text/css');
    if(config.getConfig().customCssFile !== undefined && config.getConfig().customCssFile !== null && config.getConfig.customCssFile !== '') {
        response.send(fs.readFileSync(config.getConfig().customCssFile, 'utf8'));
    } else {
        response.send("");
    }
});

app.get('/api/config/admin', function(request, response) {
    let uiConfig = {
        banner: config.getConfig().banner + " - Admin",
        darkMode: config.getConfig().darkMode,
        authenticated: authentication.checkAdminAuthenticated(request)
    };
    response.send(uiConfig);
});

app.get('/api/login/web', function(request, response) {
    if(authentication.checkWebAuthenticated(request)) {
        request.session.regenerate(function(error) {
            if (error) {
                response.status(401).send("Failed to log in.");
            }
            request.session.user = "web";
            request.session.save(function(error) {
                if (error) {
                    response.status(401).send("Failed to log in.");
                }
                response.status(204).send();
            })
        })
    } else {
        response.status(401).send("Failed to log in.");
    }
});

app.get('/api/login/admin', function(request, response) {
    if(authentication.checkAdminAuthenticated(request)) {
        request.session.regenerate(function(error) {
            if (error) {
                response.status(401).send("Failed to log in.");
            }
            request.session.user = "admin";
            request.session.save(function(error) {
                if (error) {
                    response.status(401).send("Failed to log in.");
                }
                response.status(204).send();
            })
        })
    } else {
        response.status(401).send("Failed to log in.");
    }
});

app.get('/api/web/files', function(_request, response) {
    fileOperations.getFiles()
        .then(function(value) {
            response.json(value);
        })
        .catch(function (error) {
            console.log(error);
            response.status(500).send('Could not fetch files.');
        });
});

app.post('/api/web/upload', function(request, response) {
    handleUpload(request, response);
});
app.post('/api/web/upload/*', function(request, response) {
    handleUpload(request, response);
});

function handleUpload(request, response) {
    var busboy = Busboy({ headers: request.headers });
    let folder = path.join(config.getConfig().dir, request.url.substring(16));
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        fileOperations.pickNonConflictingName(path.join(folder, filename.filename))
            .then(function(f) {file.pipe(fs.createWriteStream(f))});
    });

    busboy.on('finish', function() {
        response.writeHead(200, { 'Connection': 'close' });
        response.end("That's all folks!");
    });

    return request.pipe(busboy);
}

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

// Start application
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
