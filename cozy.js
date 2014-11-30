'use strict';

var pathExtra = require('path-extra');
var express = require('express');
var http = require('http');
var maClefUsb = require('./ma-clef-usb');
var controllers = require('./controllers');


module.exports.load = function(options, done) {
  var home = pathExtra.join(pathExtra.homedir(), 'ma-clef-usb');
  if( fs.existsSync(home) == false ){
    fs.mkdirSync(home);
  }
  maClefUsb.changeHome(home);
};
module.exports.load();

module.exports.start = function(options, done) {
  var app = express();

  controllers.connect(app);
  app.use(express.static(__dirname + '/public'));

  var server = http.createServer(app);
  server.listen( options.getPort(), options.hostname||'127.0.0.1' );
  done(null, app, server);
};
module.exports.stop = function(done) {
  if( done ) done();
};
