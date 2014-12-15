'use strict';

var fs = require('fs-extra');
var pathExtra = require('path-extra');
var express = require('express');
var http = require('http');
var maClefUsb = require('./ma-clef-usb');
var controllers = require('./controllers');

var cozyHandler = {
  start:function(options, done) {
    var app = express();

    controllers.connect(app);
    app.use(express.static(__dirname + '/public'));

    var server = http.createServer(app);
    server.listen( options.getPort(), options.hostname || '127.0.0.1' );

    cozyHandler.load();

    done(null, app, server);
  },
  stop:function(done) {
    if( done ) done();
  },
  load:function() {
    var home = pathExtra.join(pathExtra.homedir(), 'ma-clef-usb');
    if( fs.existsSync(home) == false ){
      fs.mkdirSync(home);
    }
    maClefUsb.changeHome(home);
  }
};

module.exports = cozyHandler;