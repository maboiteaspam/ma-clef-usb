'use strict';

/**
 * @ngdoc function
 * @name maClefUsbApp.controller:ListItemsCtrl
 * @description
 * # ListItemsCtrl
 * Controller of the maClefUsbApp
 */
angular.module('maClefUsbApp')
  .controller('ListItemsCtrl', ['$scope', '$rootScope', '$filter','fsLayer',
    function($scope, $rootScope, $filter, fsLayer) {

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
    $scope.size = function(s){
      var u = 'o';
      if( s > 1024 ){
        u = 'kb';
        s = s/1024;
      }
      if( s > 1024 ){
        u = 'mb';
        s = s/1024;
      }
      if( s > 1024 ){
        u = 'gb';
        s = s/1024;
      }
      if( s > 1024 ){
        u = 'tb';
        s = s/1024;
      }
      return Math.round(s)+''+u;
    };
    var set_items = function(items){
      $scope.items = $filter('orderBy')(items, ['-type','name']);
    };
    $rootScope.$on('pathChanged', function(ev, item, items){
      $scope.item = item;
      if( item.type == 'file' ){
      } else if(items){
        set_items(items);
      }
    });
    $scope.delete = function(item){
      fsLayer.remove(item.path,function(s){
        $scope.$apply(function(){
          if( !s ){
            $rootScope.$broadcast('showPopin', 'wontBrowse');
          } else {
            $rootScope.$broadcast('refresh');
          }
        });
      });
    };
  }]);
