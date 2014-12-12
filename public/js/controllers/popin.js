'use strict';

/**
 * @ngdoc function
 * @name maClefUsbApp.controller:PopinCtrl
 * @description
 * # PopinCtrl
 * Controller of the maClefUsbApp
 */
angular.module('maClefUsbApp')
  .controller('PopinCtrl', ['$scope', '$rootScope','fsLayer',
    function ($scope, $rootScope, fsLayer) {
      $scope.name = '';
      $scope.dir = {};
      $scope.item = {};
      $scope.readfilepath = "#"; // required to pass angularjs@sce

      $rootScope.$on('pathChanged', function(ev,item){
        $scope.item = item;
        $scope.readfilepath = "readfile/"+(item.path+'');
        if( item.type == 'folder' ){
          $scope.dir = item;
        }
      });
      $rootScope.$on('showPopin', function(ev,name) {
        $scope.name = name;
      });
      $rootScope.$on('hidePopin', function(ev) {
        $scope.name = '';
        $scope.dir = {};
        $rootScope.$broadcast('refresh');
      });
      $rootScope.createNote = function(inpath,fileName,content) {
        fsLayer.addNote(inpath,fileName,content,function(s,item){
          $scope.$apply(function(){
            if( !s ){
              $rootScope.$broadcast('showPopin', 'wontBrowse');
            } else {
              $rootScope.$broadcast('hidePopin');
            }
          });
        });
      };
      $rootScope.createFolder = function(inpath,folderName) {
        fsLayer.addDir(inpath+'/'+folderName,function(s,item){
          $scope.$apply(function(){
            if( !s ){
              $rootScope.$broadcast('showPopin', 'wontBrowse');
            } else {
              $rootScope.$broadcast('hidePopin');
            }
          });
        });
      };
      $rootScope.fileDropped = function($files, $event, $rej, $dir) {
        console.log($rej)
        console.log($dir)
        if( !$dir || $dir.type !== 'folder' ) throw "must be directory";
        for (var i = 0; i < $files.length; i++) {
          var file = $files[i];
          $scope.upload = fsLayer.add($dir.path,file,function(s){
            $scope.$evalAsync(function(){
              if( !s ){
                $rootScope.$broadcast('showPopin', 'wontBrowse');
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
          $rootScope.$broadcast('hidePopin');
        }
      };

    }]);
