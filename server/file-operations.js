'use strict';

var fs = require('fs').promises;
var path = require('path');

var config;

function initialize(currentConfig) {
    config = currentConfig;
}

async function getFiles(dir) {
    var files = [];

    let contents = await fs.readdir(dir, {withFileTypes: true});

    for(let file of contents) {
        let result = await getFile(dir, file);
        files.push(result);
    }

    return files;
};

async function getFile(dir, file) {
    if(file.isDirectory()) {
        let contents = await getFiles(path.join(dir, file.name));

        return {
            name: file.name, 
            size: getTotalSize(contents),
            type: 'directory', 
            files: contents
        };
    } else {
        let stats = await fs.stat(path.join(dir, file.name));

        return {
            name: file.name, 
            size: stats["size"], 
            type: 'file', 
            files: []
        };
    }
}

function getTotalSize(files) {
    let totalSize = 0;
    for(let f of files) {
        totalSize += f.size;
    }

    return totalSize;
}

async function renameFile(original, replacement) {
    await fs.rename(path.join(config.getConfig().dir, original), 
              path.join(config.getConfig().dir, replacement), 
    );
}

exports.initialize = initialize;
exports.getFiles = getFiles;
exports.renameFile = renameFile;