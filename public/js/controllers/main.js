'use strict';

/**
 * @ngdoc function
 * @name maClefUsbApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the maClefUsbApp
 */
angular.module('maClefUsbApp')
  .controller('MainCtrl', ['$rootScope','$scope',function ($rootScope, $scope) {

    $scope.breadcrumb = [];

    var update_breadcrumb = function(path){
      $scope.breadcrumb = [];
      var c_path = '/';
      var path_items = path.split('/');
      path_items[0] = '/';
      path_items.forEach(function(path_item){
        if( path_item ){
          c_path+=path_item+'/';
          $scope.breadcrumb.push({
            name:path_item=='/'?'home':path_item,
            path:c_path,
            active:false,
            type:'folder',
            ext:'',
            size:''
          });
        }
      });
      _($scope.breadcrumb).last().active = true;
    };
    var change_item = function(item){
      $.post("readdir",{dirPath:item.path},function(items){
        $scope.$apply(function(){
          if( items == 'err'
            || items == 'not-found' ){
            $rootScope.$broadcast('showPopin', 'wontBrowse');
          } else {
            $rootScope.$broadcast('pathChanged', item, items);
          }
        });
      })
    };

    $rootScope.$on('changePath', function(ev,item){
      change_item(item);
    });
    $rootScope.$on('pathChanged', function(ev, item, items){
      update_breadcrumb(item.path);
    });

    var current_path = "/";
    if( window.location.hash ){
      current_path = window.location.hash.match(/#(.+)/)[1];
    }
    change_item({path:current_path})

  }]);
