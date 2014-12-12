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
        'angular-underscore',
        'angularFileUpload'
    ])
  .directive('splitDragOver', function($timeout) {
    function link(scope, element, attrs) {
      element.on('$destroy', function() {
      });

      var inDragEnter = function(){
        element.addClass('drag-in');
      };
      var inDragLeave = function(){
        element.removeClass('drag-in');
      };

      var afterDragEnter = function(){
        if( ! element.next().hasClass('drop_el') ){
          var n = element[0].nodeName.toLowerCase();
          var drop_el = $("<"+n+">").addClass('drop_el');
          if( n == 'tr' ){
            element.children().each(function(k,v){
              drop_el.append(
                $('<td>').addClass($(v).attr('class'))
              );
            });
          }
          element.after(drop_el);
          setTimeout(function(){drop_el.addClass('in');},10)
        }else{
          element.next().addClass('in');
          element.next().removeClass('out');
        }
      };
      var afterDragLeave = function(){
        if( element.next().hasClass('drop_el') ){
          var drop_el = element.next();
          drop_el.removeClass('in');
          drop_el.addClass('out');
          $timeout(function(){
            if( drop_el.hasClass("out") ){
              drop_el.removeClass('out');
            }
          },750)
        }
      };

      scope.$watch(attrs.drop, function(value){
        if( attrs.drop == 'in' ){
          element[0].removeEventListener('dragenter', afterDragEnter);
          element[0].removeEventListener('dragleave', afterDragLeave);
          element[0].addEventListener('dragenter', inDragEnter, false);
          element[0].addEventListener('dragleave', inDragLeave, false);
        } else {
          element[0].removeEventListener('dragenter', inDragEnter);
          element[0].removeEventListener('dragleave', inDragLeave);
          element[0].addEventListener('dragenter', afterDragEnter, false);
          element[0].addEventListener('dragleave', afterDragLeave, false);
        }
      });
    }
    return {
      restrict: 'A',
      link: link
    };
  })
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
  .directive('autoFocus', function($timeout) {
    function link(scope, element, attrs) {
      $timeout(function(){
        element.focus();
      },250);
    }
    return {
      restrict: 'A',
      link: link
    };
  })
  .directive('confirmRefresh', function() {
    function link(scope, element, attrs) {
      var message = attrs.message;
      var d = false;
      attrs.$observe('enabled', function(enabled) {
        d = enabled;
      });
      $(window).on('beforeunload', function(e){
        if( d == "true" ){
          e = e || window.event;
          // For IE and Firefox prior to version 4
          if (e) {
            e.returnValue = message;
          }
          // For others
          return message + "" +d;
        }
      });
    }
    return {
      restrict: 'A',
      link: link
    };
  })
  .directive('clickOnHover', function() {
    function link(scope, element, attrs) {
      element.on('$destroy', function() {
        element.off('mouseenter');
      });
      element.on('mouseenter',function(){
        scope.$evalAsync(function(  ) {
            $(element).trigger('click');
          }
        );
      });
    }
    return {
      restrict: 'A',
      link: link
    };
  })
  .service('fsLayer', function($upload){
    var std_error = /err|not-found|dir-exists|file-exists/;
    this.get = function(path,then){
      return $.post("readmeta",{itemPath:path},function(item){
        if( (''+item).match(std_error) ){
          then(null);
        } else {
          then(item);
        }
      });
    };
    this.remove = function(path,then){
      return $.post("remove",{path:path},function(err){
        if( (''+err).match(std_error) ){
          then(false);
        } else {
          then(true);
        }
      });
    };
    this.addDir = function(path,then){
      return $.post("add-dir",{dirPath:path},function(item){
        if( (''+item).match(std_error) ){
          then(false);
        } else {
          then(true,item);
        }
      });
    };
    this.add = function(path,file,then){
      var that = this;
      console.log(file)
      return $upload.upload({
        url: 'add',
        method: 'POST',
        //headers: {'Authorization': 'xxx'}, // only for html5
        //withCredentials: true,
        data: {path: path || '/'},
        file: file // single file or a list of files. list is only for html5
        //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)        //fileFormDataName: myFile, // file formData name ('Content-Disposition'), server side request form name
        // could be a list of names for multiple files (html5). Default is 'file'
        //formDataAppender: function(formData, key, val){}  // customize how data is added to the formData.
        // See #40#issuecomment-28612000 for sample code
      }).success(function(data, status, headers, config) {
        then(true);
      }).error(function(data, status, headers, config) {
        then(false);
      });
    };
    this.addNote = function(path,fileName,content,then){
      return $.post("add-note",{path:path,fileName:fileName,content:content},function(item){
        if( (''+item).match(std_error) ){
          then(false);
        } else {
          then(true,item);
        }
      });
    };
    this.readdir = function(path,then){
      return $.post("readdir",{dirPath:path},function(items){
        if( (''+items).match(std_error) ){
          then(false,null);
        } else {
          then(true,items);
        }
      });
    };
  })

;