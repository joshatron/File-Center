'use strict';

var path = require('path');
var fs = require('fs');

var currentConfig = {};
var configFile = "";

function fixCurrentConfig() {
    if(currentConfig === undefined) {
        currentConfig = {};
    }
    if(currentConfig.banner === undefined) {
        currentConfig.banner = "File Center";
    }
    if(currentConfig.port === undefined) {
        currentConfig.port = 8080;
    }
    if(currentConfig.dir === undefined) {
        currentConfig.dir = path.join(__dirname, '..', 'files');
    }
    if(currentConfig.uploads === undefined) {
        currentConfig.uploads = true;
    }
    if(currentConfig.https === undefined) {
        currentConfig.https = false;
    }
    if(currentConfig.https) {
        if(currentConfig.httpsCert === undefined) {
            currentConfig.httpsCert = path.join(__dirname, '..', 'config', 'cert.pem');
        }
        if(currentConfig.httpsKey === undefined) {
            currentConfig.httpsKey = path.join(__dirname, '..', 'config', 'key.pem');
        }
    }
    if(currentConfig.statsFile === undefined) {
        currentConfig.statsFile = path.join(__dirname, '..', 'config', 'stats.json');
    }
    if(currentConfig.webPassword === undefined) {
        currentConfig.webPassword = "";
    }
    if(currentConfig.darkMode === undefined) {
        currentConfig.darkMode = false;
    }

    if(!currentConfig.https && currentConfig.webPassword !== "") {
        console.warn("Warning: Using a password without HTTPS may lead to the password leaking.");
    }
}

function setConfig(configString) {
    currentConfig = JSON.parse(configString);
    fixCurrentConfig();
}

exports.initializeConfig = function(file) {
    configFile = file;
    setConfig(fs.readFileSync(configFile, 'utf8'));
    console.log("Config: ");
    console.log(currentConfig);
    //Using watchFile instead of watch because editting in vim was causing problems.
    fs.watchFile(configFile, (curr, prev) => {
        if(curr.mtime > prev.mtime) {
            fs.readFile(configFile, function(err, data) {
                if(err) {
                    console.log("Couldn't read config file change.");
                } else {
                    setConfig(fs.readFileSync(configFile, 'utf8'));

                    // stats.updateStatsFile(config.statsFile);
                    // authentication.updateWebAccessPassword(config.webPassword);
                    if(!fs.existsSync(currentConfig.dir)) {
                        fs.mkdirSync(currentConfig.dir);
                    }

                    console.log("Config changed. New config: ");
                    console.log(currentConfig);
                }
            });
        }
    });
}

exports.overrideConfig = function(newConfigString) {
    let newConfig = JSON.parse(newConfigString);
    let newKeys = Object.keys(newConfig);
    console.log(newKeys);
}

exports.getConfig = function() {
    return currentConfig;
}
