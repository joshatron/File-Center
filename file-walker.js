'use strict';

var fs = require('fs');

function getFiles(dir) {
    var files = [];

    fs.readdir(dir, function(error, contents) {
        contents.forEach(function (file) {
            files.push(getFile(file));
        });
    });

    return files;
};

function getFile(file) {
    fs.stat(path.join(dir, file), function (error, stats) {
        if(stats.isDirectory()) {
            getFiles(path.join(dir, file), function(error, dirContents) {
                var sum = 0;
                dirContents.forEach(function (f) {
                    sum += f.size;
                });
                files.push({name: file, size: sum, type: 'directory', files: dirContents});
                processed++;

                if (processed === contents.length) {
                    done(null, files);
                }
            });
        }
        else {
            files.push({name: file, size: stats["size"], type: 'file', files: []});
            processed++;

            if (processed === contents.length) {
                done(null, files);
            }
        }
    });
}
