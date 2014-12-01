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
      $scope.dir = {};
      $scope.item = {};
      $rootScope.$on('changePath', function(ev,item){
        $scope.item = item;
        if( item.type == 'folder' ){
          $scope.dir = item;
        }
      });
      $rootScope.$on('showPopin', function(ev,name) {
        $scope.name = name;
      });
      $rootScope.$on('hidePopin', function(ev) {
        $scope.name = '';
      });
      $rootScope.createNote = function(inpath,fileName,content) {
        $.post("add-note",{dirPath:inpath,fileName:fileName,content:content},function(item){
          $scope.$apply(function(){
            if( item == 'err'
              || item == 'not-found'
              || item == 'dir-exists'
              || item == 'file-exists' ){
              $rootScope.$broadcast('showPopin', 'wontBrowse');
            } else {
              $rootScope.$on('changePath',$scope.dir);
              $root.$broadcast('hidePopin');
            }
          });
        });
      };
      $rootScope.createFolder = function(inpath,folderName) {
        $.post("add-dir",{dirPath:inpath+folderName},function(item){
          $scope.$apply(function(){
            if( item == 'err'
              || item == 'not-found'
              || item == 'dir-exists' ){
              $rootScope.$broadcast('showPopin', 'wontBrowse');
            } else {
              $rootScope.$on('changePath',$scope.dir);
              $root.$broadcast('hidePopin');
            }
          });
        });
      };
      $rootScope.createFile = function() {
        $rootScope.$on('changePath',$scope.dir);
      };
    }]);
