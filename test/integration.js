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

    it('should answer 200', function (done) {
// Global setting, applies to all browser instances
      Browser.localhost('localhost:19104');

// Browser instance for this test
      var browser = Browser.create();
      browser.visit('/apps/ma-clef-usb/', function() {
        browser.assert.url('http://localhost:19104/apps/ma-clef-usb/');
        done();
      });

    });

});

