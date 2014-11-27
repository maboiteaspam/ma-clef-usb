'use strict';

var fs = require('fs-extra');
var pathExtra = require('path-extra');
var express = require('express');
var http = require('http');
var busboy = require('connect-busboy');
var server;

var pkg = require(__dirname+'/package.json');

var maClefUsbPath = pathExtra.join(pathExtra.homedir(), 'ma-clef-usb');

var maClefUsb = (function(storagePath){

  if( fs.existsSync(storagePath) == false ){
    fs.mkdirSync(storagePath);
  }

  var api = {
    list: function( path, done ){
      path = path || '';

      done([
        {
          fileName: '',
          path: '',
          size: '',
          mtime: ''
        }
      ]);
    },
    write: function(path, fileName, file, done){
      var fstream = fs.createWriteStream( storagePath + path + fileName );
      file.pipe(fstream);
      fstream.on('close', function () {
        done({
          fileName: '',
          path: '',
          size: '',
          mtime: ''
        });
      });
    },
    remove: function(filePath, done){
      done(true);
    }
  };
  return api;
})(maClefUsbPath);


var start = function(options, done) {
  var app = express();
  app.use(busboy());
  app.get('/list', function(req, res){
    var filePath = req.body.filePath;
    maClefUsb.list(filePath,function(list){
      res.send( list );
    });
  });
  app.get('/remove', function(req, res){
    var filePath = req.body.filePath;
    maClefUsb.remove(filePath,function(success){
      res.send( success );
    });
  });
  app.post('/add', function(req, res){
    var path = req.body.path;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldName, file, fileName) {
      console.log("Uploading fieldName " + fieldName);
      console.log("Uploading fileName " + fileName);
      maClefUsb.write(path, fileName, file, function(success){
        res.send( success );
      });
    });
  });

  app.use(express.static(__dirname + '/public'));
  server = http.createServer(app);
  server.listen( options.getPort() );
  done(null, app, server);
};

var stop = function(done) {
  done();
};



module.exports.start = start;
module.exports.stop = stop;

if( !module.parent ){
  var port = 8080;
  var opts = {
    getPort:function(){
      return ++port;
    }
  };

  start(opts,function(){
    console.log(pkg.displayName +' started http://localhost:'+port+'/');
    console.log('ready')
  });
}