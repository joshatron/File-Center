'use strict';

var fileCenter = angular.module('fileCenter', ['smart-table']);

fileCenter.controller('mainController', ['$scope', '$http', function ($scope, $http) {
    $scope.selectedFiles = {};
    $scope.files = [];

    $scope.getFiles = function() {
        $http.get('api/files').then(function (result) {
            $scope.files = result.data;
            console.log("Successfully found files:");
            console.log($scope.files);
        });
    };
    $scope.getFiles();

    $scope.getFile = function(file) {
        console.log("Downloading: " + file);
        return $http.get('api/download/' + file).then(function (result) {
            return result.data;
        });
    };

    $scope.downloadFile = function(file) {
        $scope.getFile(file).then(function (result) {
            download(result, file);
        })
    };

    $scope.downloadSelectedFiles = function() {
        var toDownload = $scope.files.filter(function(result) {
            return $scope.selectedFiles[result.name];
        }).map(function(result) {
            return result.name;
        });
        console.log("Downloading selected:");
        console.log(toDownload);

        var zip = JSZip();
        var processed = 0;
        toDownload.forEach(function(file) {
            $scope.getFile(file).then(function (result) {
                zip.file(file, result);
                processed++;
                if(processed === toDownload.length) {
                    zip.generateAsync({type: 'blob'}).then(function (blob) {
                        saveAs(blob, 'file-center-download.zip');
                    });
                }
            });
        });
    };

    $scope.isAllSelected = function () {
        return $scope.files.every(function (result) {
            return $scope.selectedFiles[result.name];
        });
    };

    $scope.selectAll = function () {
        var selectAll = !$scope.isAllSelected();
        $scope.files.forEach(function (result) {
            $scope.selectedFiles[result.name] = selectAll;
        });
    };
}])