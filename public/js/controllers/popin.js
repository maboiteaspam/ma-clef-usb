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
      $rootScope.$on('showPopin', function(ev,name) {
        $scope.name = name;
      });
      $rootScope.$on('hidePopin', function(ev,name) {
        $scope.name = '';
      });
    }]);
