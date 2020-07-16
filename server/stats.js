'use strict';

var fs = require('fs');

var currentStats;
var statsFile;

exports.initialize = function(config) {
    statsFile = config.statsFile;
    try {
        currentStats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
    } catch (err) {
        currentStats = {};
    }

    if(currentStats.pageViews === undefined) {
        currentStats.pageViews = 0;
    }
    if(currentStats.downloads === undefined) {
        currentStats.downloads = [];
    }
}

exports.addPageView = function() {
    currentStats.pageViews = currentStats.pageViews + 1;
    saveStats();
}

exports.addDownload = function(fileName) {
    let found = false;
    for(let file of currentStats.downloads) {
        if(file.name === fileName) {
            found = true;
            file.count = file.count + 1;
            break;
        }
    }

    if(!found) {
        let newFile = {
            name: fileName,
            count: 1
        };

        currentStats.downloads.push(newFile);
    }

    saveStats();
}

function saveStats() {
    fs.writeFile(statsFile, JSON.stringify(currentStats), function (err) {
        if(err) {
            console.log('Error saving stats: ', err);
        }
    }); 
}