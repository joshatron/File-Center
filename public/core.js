'use strict';

var fileCenter = angular.module('fileCenter', []);

function mainController($scope, $http) {
    $scope.selectedFiles = {};
    $scope.files = [];
    $http.get('api/files').success(function(data) {
        $scope.files = data;
        console.log("Successfully found files:");
        console.log($scope.files);
    }).error(function(data) {
        console.log("Error getting files: " + data);
    });

    $scope.downloadFile = function(file) {
        console.log("Downloading: " + file);
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
}