'use strict';

var fileCenter = angular.module('fileCenter', ['smart-table', 'ngFileUpload']);

fileCenter.controller('mainController', ['$scope', "$http", 'Upload', function ($scope, $http, Upload) {
    $scope.message = 'File Center';
    $scope.selectedFiles = {};
    $scope.files = [];
    $scope.currentFiles = [];
    $scope.displayedFiles = [];
    $scope.filesToUpload = [];
    $scope.currentDirectory = [];

    $http.get('api/banner').then(function (result) {
        $scope.message = result.data;
    });

    $scope.getFiles = function() {
        $http.get('api/files').then(function (result) {
            $scope.files = result.data;
            $scope.currentFiles = $scope.files;
            $scope.currentDirectory = [];
            /*if($scope.currentDirectory.length > 0) {
                $scope.currentDirectory.forEach(function (folder) {
                    var found = $scope.currentFiles.find(function (element) {
                        return element.name === folder;
                    });
                    $scope.currentFiles = found.contents;
                });
            }*/
        });
    };
    $scope.getFiles();

    $scope.$watch('filesToUpload', function () {
        $scope.uploadFiles($scope.filesToUpload);
    });

    $scope.joinDirectory = function () {
        if($scope.currentDirectory.length > 0)
        {
            return $scope.currentDirectory.reduce(function (accumulator, element) {
                return accumulator + '/' + element;
            }) + '/';
        }
        else {
            return '';
        }
    };

    $scope.uploadFiles = function(toUpload) {
        var processed = 0;
        var dir = $scope.joinDirectory();
        toUpload.forEach(function(file) {
            Upload.upload({
                url: '/api/upload',
                data: {
                    file: file
                },
                params: {
                    dir: dir
                }
            }).then(function() {
                processed++;
                if(processed === toUpload.length) {
                    $scope.getFiles();
                }
            });
        });
    };

    $scope.downloadCall = function(file) {
        return $scope.joinDirectory() + file;
    };

    $scope.getToZip = function() {
        var toDownload = $scope.files.filter(function(result) {
            return $scope.selectedFiles[result.name];
        }).map(function(result) {
            return result.name;
        });

        return toDownload;
    };

    $scope.isAllSelected = function () {
        return $scope.displayedFiles.every(function (result) {
            return $scope.selectedFiles[result.name];
        });
    };

    $scope.selectAll = function () {
        var selectAll = !$scope.isAllSelected();
        $scope.displayedFiles.forEach(function (result) {
            $scope.selectedFiles[result.name] = selectAll;
        });
    };

    $scope.moveDir = function(file) {
        var found = $scope.currentFiles.find(function (element) {
            return element.name === file;
        });

        if (found.type === 'directory') {
            $scope.currentFiles = found.contents;
            $scope.currentDirectory.push(found.name);
        }
    };

    $scope.moveUpDir = function() {
        $scope.currentDirectory.pop();
        $scope.currentFiles = $scope.files;
        if($scope.currentDirectory.length > 0) {
            $scope.currentDirectory.forEach(function (folder) {
                var found = $scope.currentFiles.find(function (element) {
                    return element.name === folder;
                });
                $scope.currentFiles = found.contents;
            });
        }
    };

    $scope.printFileSize = function (size) {
        if(size >= 1000000000000) {
            return Math.round(size / 1000000000000) + " TB";
        }
        else if(size >= 1000000000) {
            return Math.round(size / 1000000000) + " GB";
        }
        else if(size >= 1000000) {
            return Math.round(size / 1000000) + " MB";
        }
        else if(size >= 1000) {
            return Math.round(size / 1000) + " KB";
        }
        else {
            return size + " B";
        }
    }
}])
