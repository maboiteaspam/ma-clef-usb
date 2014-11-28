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
      size:'',
      readable:true,
      writable:true
    };
    $scope.items = [
      {
        type:'file',
        path:'/photos de vacances phuket 2014.jpeg',
        name:'photos de vacances phuket 2014.jpeg',
        ext:'jpeg',
        size:'569.2 Kb',
        readable:true,
        writable:true
      },
      {
        type:'file',
        path:'/file2.jpeg',
        name:'file2.jpeg',
        ext:'jpeg',
        size:'25.2kb',
        readable:true,
        writable:true
      },
      {
        type:'folder',
        path:'/Nouveau folder',
        name:'Nouveau folder',
        ext:'',
        size:'',
        readable:true,
        writable:true
      }
    ];
    $scope.items = $filter('orderBy')($scope.items, ['-type','name']);
    $rootScope.$on('changePath', function(ev,item){
      $scope.item = item;
      if( !$scope.item.readable ){
        $rootScope.$broadcast('showPopin', 'wontBrowse');
      }else{

      }
    });

  }]);
