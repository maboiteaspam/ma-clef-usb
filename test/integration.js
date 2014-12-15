'use strict';
var pathExtra = require('path-extra');
var Browser = require('zombie');
var cozyLight = require('cozy-light');

var workingDir = pathExtra.join( __dirname, '/../.test-working_dir/');
var fixturesDir = pathExtra.join( __dirname, '/../fixtures/');
workingDir = pathExtra.resolve(workingDir) + '/';
fixturesDir = pathExtra.resolve(fixturesDir) + '/';

describe('ma Clef USB', function () {
  this.timeout(600000);

  before(function(done){
    this.timeout(50000);
    cozyLight.configHelpers.init(workingDir, {});
    cozyLight.actions.noExpressLog = !true;
    cozyLight.actions.start({},function(){
      var p = pathExtra.join(__dirname,'../');
      cozyLight.actions.installApp(p, function(){
        done();
      });
    });
  });
  after(function(done){
    this.timeout(50000);
    cozyLight.actions.exit(done);
  });



    it('should answer 200hh', function (done) {
// Global setting, applies to all browser instances
      Browser.localhost('localhost:19104');

// Browser instance for this test
      var browser = Browser.create();
      browser.visit('/apps/ma-clef-usb/',function() {
        browser.assert.url('http://localhost:19104/apps/ma-clef-usb/');
        setTimeout(function(){
          try {
            var s = browser.query('.add-items');
            console.error(s); // null
            console.error(s); // null
          } catch(ex) {
            console.error(ex);
            //[TypeError: Cannot use 'in'
            // operator to search for 'compareDocumentPosition' in null]
          }
          try {
            var sd = browser.query('.add-items .dropdown-toggle');
            console.error(sd); // null
            console.error(sd); // null
          } catch(ex) {
            console.error(ex);
            //Uncaught AssertionError:
            //No target element (note: call with selector/element,
            // event name and callback)
            //[TypeError: Cannot use 'in' operator to search for
            // 'compareDocumentPosition' in null]
          }
          console.error('browse http://localhost:19104/apps/ma-clef-usb/');
          done();
          /*
           browser.click('.add-items .dropdown-toggle',
           function(e, browser, status) {
           browser.click('.add-items ul > li:nth-child(3) > a',
           function(e, browser, status) {
           browser.assert.url('http://localhost:19104/apps/ma-clef-usb/');
           });
           });
           */
        },5500);
      });

    });

});
