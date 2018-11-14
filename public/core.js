var fileCenter = angular.module('fileCenter', []);

function mainController($scope, $http) {
    $http.get('api/files').success(function(data) {
        $scope.files = data;
        console.log("Successfully found files: " + data);
    }).error(function(data) {
        console.log("Error getting files: " + data);
    });
}