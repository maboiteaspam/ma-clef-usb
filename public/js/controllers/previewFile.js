'use strict';

/**
 * @ngdoc function
 * @name maClefUsbApp.controller:PreviewFileCtrl
 * @description
 * # PreviewFileCtrl
 * Controller of the maClefUsbApp
 */
angular.module('maClefUsbApp')
  .controller('PreviewFileCtrl', ['$scope', '$rootScope','fsLayer',
    function ($scope, $rootScope, fsLayer) {
      $scope.item = null;
      $scope.readfilepath = null;
      $scope.streamfilepath = null;
      $rootScope.$on('pathChanged', function(ev,item){
        if( item.type == 'file' ){
          $scope.item = item;
          $scope.readfilepath = "readfile"+item.path;
          $scope.streamfilepath = "stream/"+item.path;
          $scope.$broadcast('previewPath', item);
        }
      });
      $rootScope.$on('previewPath', function(ev,item){
        if( item.type == 'file' ){
          $scope.item = item;
          $scope.readfilepath = "readfile"+item.path;
          $scope.streamfilepath = "stream/"+item.path;
          $rootScope.$broadcast('showPopin', 'previewFile');
        }
      });
      $rootScope.$on('hidePopin', function(){
        $scope.item = null;
        $scope.readfilepath = "#";
        $scope.streamfilepath = "#";
      });
      $scope.getMediaType = function(){
        var ext = $scope.item.ext || "" ;
        var contentType = $scope.item.contentType || "" ;
        if( ext.match(/(jpeg|jpg|png|gif|bmp)$/) ){
          return "picture";
        }else if( ext.match(/(mp3|wav)$/) ){
          return "sound";
        }else if( ext.match(/(mp4|avi|webm|ogg|ogv|flv)$/) ){
          return "video";
        }else if( contentType.match(/^(text)/) ){
          return "text";
        }
      };
    }]);
