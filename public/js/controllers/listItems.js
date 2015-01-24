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

    $scope.dir = {
      type:'folder',
      path:'/',
      name:'home',
      ext:'',
      size:''
    };
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
      return Math.round(s)+' '+u;
    };
    var set_items = function(items){
      $scope.items = $filter('orderBy')(items, ['-type','name']);
    };
    $rootScope.$on('pathChanged', function(ev, item, items){
      $scope.item = item;
      if( item.type == 'folder' ){
        $scope.dir = item;
        set_items(items);
      }
    });
    $scope.delete = function(item){
      fsLayer.remove(item.path,function(s){
        $scope.$apply(function(){
          if( !s ){
            $rootScope.$broadcast('failedDelete', item.path);
          } else {
            $rootScope.$broadcast('refresh');
          }
        });
      });
    };

      $rootScope.fileDropped = function($files, $event, $rej, $dir) {
        if( !$dir || $dir.type !== 'folder' ) throw "must be directory";
        for (var i = 0; i < $files.length; i++) {
          var file = $files[i];
          if( file.type !== "directory" ) {
            $scope.upload = fsLayer.add($dir.path,file,function(s){
              $scope.$evalAsync(function(){
                if( !s ){
                  $rootScope.$broadcast('failedFileDropped', $dir.path+'/'+file.name);
                }
              });
            }).progress(function(evt) {
              $rootScope.$broadcast('uploadProgress', {
                filename:evt.config.file.name,
                lastModifiedDate:evt.config.file.lastModifiedDate,
                type:evt.config.file.type,
                percent:parseInt(100.0 * evt.loaded / evt.total),
                loaded:evt.loaded,
                total:evt.total
              });
            }).success(function(data, status, headers, config) {
              $rootScope.$broadcast('uploadDone', {
                filename:config.file.name
              });
              $rootScope.$broadcast('refresh');
            });
          }
        }
      };


  }]);
