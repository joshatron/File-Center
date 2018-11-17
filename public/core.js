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

    $scope.downloadFile = function(file) {
        console.log("Downloading: " + file);
        $http.get('api/download/' + file).then(function (result) {
            download(result.data, file);
        });
    };

    $scope.downloadSelectedFiles = function() {
        var toDownload = $scope.files.filter(function(result) {
            return $scope.selectedFiles[result.name];
        }).map(function(result) {
            return result.name;
        });
        console.log("Downloading selected:");
        console.log(toDownload);

        toDownload.forEach(function(result) {
            $scope.downloadFile(result);
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