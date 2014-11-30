'use strict';

/**
 * @ngdoc overview
 * @name maClefUsbApp
 * @description
 * # maClefUsbApp
 *
 * Main module of the application.
 */
angular
    .module('maClefUsbApp', [
        'angularMoment',
        'angular-underscore'
    ])
  .directive('maxHeight', function() {

    function link(scope, element, attrs) {
      element.on('$destroy', function() {
      });
      element.one('load', function() {
        var w = angular.element(window);
        if( element.height() > w.height() ){
          element.css("max-height", w.height()-100 );
        }
        if( element.width() > w.width() ){
          element.css("max-width", w.width()-100 );
        }
      });
    }

    return {
      restrict: 'A',
      link: link
    };
  })

;