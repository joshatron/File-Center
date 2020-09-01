'use strict';

var fs = require('fs').promises;
var path = require('path');
var rmfr = require('rmfr');

var basePath;

function initialize(baseDir) {
    basePath = baseDir;
}

function updateBaseDir(baseDir) {
    basePath = baseDir;
}

function fullPath(file) {
    return path.join(basePath, file);
}

async function getFiles() {
    return getFilesInDir(basePath);
}

async function getFilesInDir(dir) {
    let files = [];

    let contents = await fs.readdir(dir, {withFileTypes: true});

    for(let file of contents) {
        let result = await getFile(dir, file);
        files.push(result);
    }

    return files;
};

async function getFile(dir, file) {
    if(file.isDirectory()) {
        let contents = await getFilesInDir(path.join(dir, file.name));

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

async function getZipFiles(files) {
    let zipped = [];

    for(let file of files) {
        if(await isDirectory(file)) {
            let contents = await fs.readdir(fullPath(file));
            contents = contents.map((val) => path.join(file, val));
            contents = await getZipFiles(contents);
            zipped.push(...contents);
        } else {
            zipped.push({path: fullPath(file), name: file});
        }
    }

    return zipped;
}

async function isDirectory(file) {
    let fileStats = await fs.stat(fullPath(file));

    return fileStats.isDirectory();
}

async function renameFile(original, replacement) {
    await fs.rename(fullPath(original), 
              fullPath(replacement), 
    );
}

async function deleteFile(file) {
    if (await isDirectory(file)) {
        await rmfr(fullPath(file));
    } else {
        await fs.unlink(fullPath(file));
    }
}

async function mkdir(folder) {
    await fs.mkdir(fullPath(folder), {recursive: true});
}

exports.initialize = initialize;
exports.updateBaseDir = updateBaseDir;
exports.getFiles = getFiles;
exports.getZipFiles = getZipFiles;
exports.isDirectory = isDirectory;
exports.renameFile = renameFile;
exports.deleteFile = deleteFile;
exports.mkdir = mkdir;