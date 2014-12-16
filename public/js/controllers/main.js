'use strict';

/**
 * @ngdoc function
 * @name maClefUsbApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the maClefUsbApp
 */
angular.module('maClefUsbApp')
  .controller('MainCtrl', ['$rootScope','$scope','fsLayer',function ($rootScope, $scope, fsLayer) {

    $scope.count_progress = 0;
    $scope.items_in_progress = {};
    $scope.breadcrumb = [];
    $scope.dir = {
      path:'/',
      type:'folder',
      name:'home'
    };

    var update_breadcrumb = function(path){
      $scope.breadcrumb = [];
      var c_path = '';
      var path_items = path.split('/');
      if( path == '/' ) path_items.shift();
      path_items[0] = '';
      path_items.forEach(function(path_item){
        if( path_item ){
          c_path+='/'+path_item;
        }
        $scope.breadcrumb.push({
          name:path_item==''?'home':path_item,
          path:path_item==''?'/':c_path,
          active:false,
          type:'folder',
          ext:'',
          size:''
        });
      });
      _($scope.breadcrumb).last().active = true;
    };
    var change_item = function(item){
      fsLayer.readdir(item.path,function(s,items){
        $scope.$apply(function(){
          if( !s ){
            $rootScope.$broadcast('failedRead', item);
          } else {
            $rootScope.$broadcast('pathChanged', item, items);
          }
        });
      });
    };

    $rootScope.$on('changePath', function(ev,item){
      if( item.type != 'file' ){
        change_item(item);
        $scope.dir = item;
      } else {
        $rootScope.$broadcast('previewPath', item);
      }
    });
    $rootScope.$on('refresh', function(ev){
      $rootScope.$broadcast('changePath', $scope.dir);
    });
    $rootScope.$on('pathChanged', function(ev, item){
      update_breadcrumb(item.path);
    });
    $rootScope.$on('uploadProgress',function(ev,upload){
      if( ! $scope.items_in_progress[upload.filename] ){
        $scope.count_progress++;
      }
      $scope.items_in_progress[upload.filename] = upload;
    });
    $rootScope.$on('uploadDone',function(ev,upload){
      delete $scope.items_in_progress[upload.filename];
      $scope.count_progress--;
    });

    var update_view = function(current_path){
      if( ! current_path ){
        current_path = "/";
        if( window.location.hash ){
          current_path = window.location.hash.match(/#(.+)/)[1];
          current_path = decodeURI(current_path);
        }
      }
      fsLayer.get(current_path,function(item){
        $scope.$apply(function(){
          if(!item){
            $rootScope.$broadcast('failedRead', current_path);
            if ( current_path == "/" ) {
              throw "Root folder not found !";
            }
            window.location.hash = "#/";
            update_view();
          }else{
            if( item.type == 'file' ){
              $rootScope.$broadcast('changePath', {path:item.dirname,type:'folder'});
            }
            $rootScope.$broadcast('changePath', item);
          }
        });
      });
    };
    setTimeout(function(){
      update_view();
    },250)
  }]);
