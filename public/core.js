'use strict';

var smartTable = require('angular-smart-table');

var fileCenter = angular.module('fileCenter', ['smart-table']);

function mainController($scope, $http) {
    $scope.selectedFiles = {};
    $scope.files = [];
    $http.get('api/files').success(function(data) {
        $scope.files = data;
        console.log("Successfully found files: " + data);
    }).error(function(data) {
        console.log("Error getting files: " + data);
    });

    $scope.downloadFile = function(file) {
        console.log("Downloading " + file);
    };

    $scope.downloadSelectedFiles = function() {
        var toDownload = $scope.files.filter(function(result) {
            return $scope.selectedFiles[result];
        });
        console.log("Downloading selected: " + toDownload);

        toDownload.forEach(function(result) {
            $scope.downloadFile(result);
        });
    };

    $scope.isAllSelected = function () {
        return $scope.files.every(function (result) {
            return $scope.selectedFiles[result];
        });
    };

    $scope.selectAll = function () {
        var selectAll = !$scope.isAllSelected();
        $scope.files.forEach(function (result) {
            $scope.selectedFiles[result] = selectAll;
        });
    };
}