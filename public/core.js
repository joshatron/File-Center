'use strict';

var fileCenter = angular.module('fileCenter', ['smart-table', 'ngFileUpload']);

fileCenter.controller('mainController', ['$scope', "$http", 'Upload', function ($scope, $http, Upload) {
    $scope.message = 'File Center';
    $scope.selectedFiles = {};
    $scope.files = [];
    $scope.displayedFiles = [];
    $scope.filesToUpload = [];

    $http.get('api/banner').then(function (result) {
        $scope.message = result.data;
    });

    $scope.getFiles = function() {
        $http.get('api/files').then(function (result) {
            $scope.files = result.data;
            console.log("Successfully found files:");
            console.log($scope.files);
        });
    };
    $scope.getFiles();

    $scope.$watch('filesToUpload', function () {
        $scope.uploadFiles($scope.filesToUpload);
    });

    $scope.uploadFiles = function(toUpload) {
        console.log(toUpload);
        var processed = 0;
        toUpload.forEach(function(file) {
            Upload.upload({
                url: '/api/upload',
                data: {
                    file: file
                }
            }).then(function (result) {
                processed++;
                if(processed === toUpload.length) {
                    $scope.getFiles();
                }
            });
        });
    };

    $scope.getFile = function(file) {
        console.log("Downloading: " + file);
        return $http.get('api/download/' + file, {responseType: 'blob'}).then(function (result) {
            return result.data;
        });
    };

    $scope.downloadCall = function(file) {
        return "api/download/" + file;
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
