'use strict';

/**
 * @ngdoc function
 * @name maClefUsbApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the maClefUsbApp
 */
angular.module('maClefUsbApp')
  .controller('MainCtrl', function ($scope) {
    $scope.breadcrumb = [
      {
        name:'home',
        path:'/',
        active:false,
        type:'file',
        ext:'',
        size:'',
        readable:true,
        writable:true
      }
    ];
    _($scope.breadcrumb).last().active = true;
  });
