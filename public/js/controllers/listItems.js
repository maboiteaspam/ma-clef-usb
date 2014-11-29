'use strict';

/**
 * @ngdoc function
 * @name maClefUsbApp.controller:ListItemsCtrl
 * @description
 * # ListItemsCtrl
 * Controller of the maClefUsbApp
 */
angular.module('maClefUsbApp')
  .controller('ListItemsCtrl', ['$scope', '$rootScope', '$filter', function($scope, $rootScope, $filter) {

    // see
    // http://html5demos.com/dnd-upload#view-source

    $scope.item = {
      type:'folder',
      path:'/',
      name:'home',
      ext:'',
      size:''
    };
    $scope.items = [];
    var set_items = function(items){
      $scope.items = $filter('orderBy')(items, ['-type','name']);
    };
    $rootScope.$on('changePath', function(ev,item){
    });
    $rootScope.$on('pathChanged', function(ev, item, items){
      $scope.item = item;
      if( item.type == 'file' ){
      } else {
        set_items(items);
      }
    });

  }]);
