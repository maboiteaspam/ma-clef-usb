'use strict';
var pathExtra = require('path-extra');
var Browser = require('zombie');
var spawn = require('child_process').spawn;

var workingDir = pathExtra.join( __dirname, '/../.test-working_dir/');
var fixturesDir = pathExtra.join( __dirname, '/../fixtures/');
workingDir = pathExtra.resolve(workingDir) + '/';
fixturesDir = pathExtra.resolve(fixturesDir) + '/';

describe('ma Clef USB', function () {
  this.timeout(600000);


  var openProcess = function (cmds, callback) {
    console.error('+ ' + cmds.join(' '));
    var bin = cmds.shift();
    var cozyProcess = spawn(bin, cmds);

    if (callback) {
      var output = '';
      var stdout = '';
      var stderr = '';
      cozyProcess.stdout.on('data', function (chunk) {
        output += chunk;
        stdout += chunk;
      });
      cozyProcess.stderr.on('data', function (chunk) {
        output += chunk;
        stderr += chunk;
      });
      cozyProcess.on('close', function (code) {
        callback(output, stdout, stderr, code);
      });
    }
    return cozyProcess;
  };

  var cozyProcess;
  before(function(done){
    this.timeout(50000);
    var cmd = [
      'cozy-light',
      'start',
      '--home',
      workingDir
    ];
    cozyProcess = openProcess(cmd);
    done();
  });
  after(function(done){
    this.timeout(50000);
    cozyProcess.kill();
    done();
  });



    it('should answer 200hh', function (done) {
// Global setting, applies to all browser instances
      Browser.localhost('localhost:19104');

// Browser instance for this test
      var browser = Browser.create();
      browser.visit('/apps/ma-clef-usb/', function() {
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
        }, 5500);
      });

    });

});
