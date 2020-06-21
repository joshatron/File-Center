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
        config.dir = path.join(__dirname, 'files');
    }
    if(config.uploads === undefined) {
        config.uploads = true;
    }

    return config;
}

exports.getConfig = function(configString) {
    let config = JSON.parse(configString);
    config = addDefaults(config);

    return config;
}
