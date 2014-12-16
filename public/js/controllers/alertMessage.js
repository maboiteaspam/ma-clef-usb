'use strict';

/**
 * @ngdoc function
 * @name maClefUsbApp.controller:AlertMessageCtrl
 * @description
 * # AlertMessageCtrl
 * Controller of the maClefUsbApp
 */
angular.module('maClefUsbApp')
  .controller('AlertMessageCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
      $scope.title = '';
      $scope.message = '';

      $rootScope.$on('hidePopin', function(ev) {
        if( name == "alertMessage" ){
          $scope.title = '';
          $scope.message = '';
        }
      });
      $rootScope.$on('failedDelete', function(ev,path) {
        $scope.title = 'Delete failed !';
        $scope.message = 'Can not delete "'+path+'"';
        $rootScope.$broadcast('showPopin', 'alertMessage');
      });
      $rootScope.$on('failedRead', function(ev,path) {
        $scope.title = 'Read failed !';
        $scope.message = 'Can not read "'+path+'"';
        $rootScope.$broadcast('showPopin', 'alertMessage');
      });
      $rootScope.$on('failedRecord', function(ev,path) {
        $scope.title = 'Note creation has failed !';
        $scope.message = 'Can not create a new note at "'+path+'"';
        $rootScope.$broadcast('showPopin', 'alertMessage');
      });
      $rootScope.$on('failedCreateFolder', function(ev,path) {
        $scope.title = 'Folder was not created !';
        $scope.message = 'Can not create a new note at "'+path+'"';
        $rootScope.$broadcast('showPopin', 'alertMessage');
      });
      $rootScope.$on('failedFileDropped', function(ev,path) {
        $scope.title = 'File was not uploaded !';
        $scope.message = 'Could not upload file "'+path+'"';
        $rootScope.$broadcast('showPopin', 'alertMessage');
      });

    }]);
