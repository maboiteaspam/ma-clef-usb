'use strict';

var express = require('express');
var http = require('http');
var maClefUsb = require('./ma-clef-usb');
var controllers = require('./controllers');


module.exports.start = function(options, done) {
  var app = express();

  controllers.connect(app);
  app.use(express.static(__dirname + '/public'));

  var server = http.createServer(app);
  server.listen( options.getPort(), options.hostname||'127.0.0.1' );
  done(null, app, server);
};
module.exports.stop = function(done) {
  done();
};
module.exports.controllers = controllers; // testing purpose
