'use strict';

/**
 * @ngdoc function
 * @name maClefUsbApp.controller:PreviewFileCtrl
 * @description
 * # PreviewFileCtrl
 * Controller of the maClefUsbApp
 */
angular.module('maClefUsbApp')
  .controller('PreviewFileCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
      $scope.item = null;
      $rootScope.$on('pathChanged', function(ev,item){
        if( item.type == 'file' ){
          $scope.item = item;
          $rootScope.$broadcast('showPopin', 'previewFile');
        }
      });
      $rootScope.$on('previewPath', function(ev,item){
        $scope.item = item;
        $rootScope.$broadcast('showPopin', 'previewFile');
      });
      $rootScope.$on('hidePopin', function(){
        $scope.item = null;
      });
      $scope.getMediaType = function(){
        var ext = $scope.item.ext || "" ;
        var contentType = $scope.item.contentType || "" ;
        if( ext.match(/(jpeg|jpg|png|gif|bmp)$/) ){
          return "picture";
        }else if( ext.match(/(mp3|wav)$/) ){
          return "sound";
        }else if( ext.match(/(mp4|avi|webm|ogg)$/) ){
          return "video";
        }else if( contentType.match(/^(text)/) ){
          return "text";
        }
      };
    }]);
