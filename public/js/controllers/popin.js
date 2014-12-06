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
      $scope.files = [];
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

      $scope.fileDropped = function($files) {
        for (var i = 0; i < $files.length; i++) {
          var file = $files[i];
          if(!$scope.dir.path){
            //debugger;
          }
          $scope.upload = fsLayer.add($scope.dir.path,file,function(s){
            $scope.$evalAsync(function(){
              if( !s ){
                $rootScope.$broadcast('showPopin', 'wontBrowse');
              } else {
                $rootScope.$broadcast('hidePopin');
              }
            });
          }).progress(function(evt) {
            console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :'+ evt.config.file.name);
          }).success(function(data, status, headers, config) {
            // file is uploaded successfully
            console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);
          });
        }
      };

    }]);
