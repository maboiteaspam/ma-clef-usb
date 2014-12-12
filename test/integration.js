'use strict';
var fs = require('fs-extra');
var pathExtra = require('path-extra');
var express = require('express');
var request = require('request');
var assert = require('assert');
var Browser = require('zombie');
var cozyLight = require('cozy-light');

var workingDir = pathExtra.join( __dirname, '/../.test-working_dir/');
var fixturesDir = pathExtra.join( __dirname, '/../fixtures/');
workingDir = pathExtra.resolve(workingDir)+'/';
fixturesDir = pathExtra.resolve(fixturesDir)+'/';

before(function(done){
  this.timeout(50000);
  cozyLight.configHelpers.init(workingDir, {});
  cozyLight.actions.noExpressLog = true;
  cozyLight.actions.start({},function(){
    cozyLight.actions.installApp(__dirname+'/../',function(){
      done();
    })
  })
});
after(function(done){
  this.timeout(50000);
  cozyLight.actions.stop(done)
});
describe('ma Clef USB', function () {
  this.timeout(600000);

    it('should answer 200hh', function (done) {
      console.error(done)
// Global setting, applies to all browser instances
      Browser.localhost('localhost:19104');

// Browser instance for this test
      var browser = Browser.create();
      browser.visit('/apps/ma-clef-usb/',function() {
        browser.assert.url('http://localhost:19104/apps/ma-clef-usb/');
        try{
          var s = browser.query(".add-items");
          console.error(s) // null
          console.error(s) // null
        }catch(ex){
          console.error(ex)
          //[TypeError: Cannot use 'in' operator to search for 'compareDocumentPosition' in null]
        }
        try{
          var s = browser.query(".add-items .dropdown-toggle");
          console.error(s) // null
          console.error(s) // null
        }catch(ex){
          console.error(ex)
          //Uncaught AssertionError:
          //No target element (note: call with selector/element, event name and callback)
          //[TypeError: Cannot use 'in' operator to search for 'compareDocumentPosition' in null]
        }
        console.error('browse http://localhost:19104/apps/ma-clef-usb/')
        done();
        /*
         browser.click(".add-items .dropdown-toggle", function(e, browser, status) {
         browser.click(".add-items ul > li:nth-child(3) > a", function(e, browser, status) {
         browser.assert.url('http://localhost:19104/apps/ma-clef-usb/');
         });
         });
         */
      });

    });

});

