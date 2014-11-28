'use strict';

/**
 * @ngdoc function
 * @name maClefUsbApp.controller:PopinCtrl
 * @description
 * # PopinCtrl
 * Controller of the maClefUsbApp
 */
angular.module('maClefUsbApp')
  .controller('PopinCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
      $scope.name = '';
      $scope.item = {};
      $rootScope.$on('changePath', function(ev,item){
        $scope.item = item;
      });
      $rootScope.$on('showPopin', function(ev,name) {
        $scope.name = name;
      });
      $rootScope.$on('hidePopin', function(ev) {
        $scope.name = '';
      });
    }]);
