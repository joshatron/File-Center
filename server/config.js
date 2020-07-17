'use strict';

var path = require('path');

var addDefaults = function(config) {
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
        config.dir = path.join(__dirname, '..', 'files');
    }
    if(config.uploads === undefined) {
        config.uploads = true;
    }
    if(config.https === undefined) {
        config.https = false;
    }
    if(config.https) {
        if(config.httpsCert === undefined) {
            config.httpsCert = path.join(__dirname, '..', 'config', 'cert.pem');
        }
        if(config.httpsKey === undefined) {
            config.httpsKey = path.join(__dirname, '..', 'config', 'key.pem');
        }
    }
    if(config.statsFile === undefined) {
        config.statsFile = path.join(__dirname, '..', 'config', 'stats.json');
    }
    if(config.webPassword === undefined) {
        config.webPassword = "";
    }

    return config;
}

exports.getConfig = function(configString) {
    let config = JSON.parse(configString);
    config = addDefaults(config);

    if(!config.https && config.webPassword !== "") {
        console.warn("Warning: Using a password without HTTPS may lead to the password leaking.");
    }

    return config;
}
