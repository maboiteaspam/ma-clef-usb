'use strict';

var fs = require('fs-extra');
var pathExtra = require('path-extra');
var mime = require('mime');

var express = require('express');
var http = require('http');
var busboy = require('connect-busboy');
var bodyParser = require('body-parser');
var server;
var maClefUsb = require('./ma-clef-usb');

var pkg = require(__dirname+'/package.json');

var maClefUsbPath = pathExtra.join(pathExtra.homedir(), 'ma-clef-usb');

if( fs.existsSync(maClefUsbPath) == false ){
  fs.mkdirSync(maClefUsbPath);
}
maClefUsb.changeHome(maClefUsbPath);

var controllers = {
  changeHome:function(req, res){
    var newPath = req.body.newPath;
    maClefUsb.changeHome(newPath,function(ok){
      res.status(ok?200:404).send()
    });
  },
  readdir:function(req, res){
    var dirPath = req.body.dirPath;
    maClefUsb.readdir(dirPath,function(list){
      res.send( list );
    });
  },
  readfile:function(req, res){
    var filePath = req.params[0];
    maClefUsb.readmeta(filePath,function(item){
      if( item == 'not-found' ){
        res.status(404).send()
      }else if(item.type!='file'){
        res.status(300).send()
      }else{
        var type = item.contentType;
        if (!res.getHeader('content-type')) {
          var charset = mime.charsets.lookup(type);
          res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
        }
        maClefUsb.readfile(filePath,function(err, stream){
          stream.pipe(res);
        });
      }
    });
  },
  readmeta:function(req, res){
    var itemPath = req.body.itemPath;
    maClefUsb.readmeta(itemPath,function(list){
      res.send( list );
    });
  },
  download:function(req, res){
    var filePath = req.params[0];
    maClefUsb.readmeta(filePath,function(item){
      if( item == 'not-found' ){
        res.status(404).send()
      }else if(item.type!='file'){
        res.status(300).send()
      }else{
        res.setHeader('Content-disposition', 'attachment; filename=' + item.name);
        var type = item.contentType;
        if (!res.getHeader('content-type')) {
          var charset = mime.charsets.lookup(type);
          res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
        }
        maClefUsb.readfile(filePath,function(err, stream){
          stream.pipe(res);
        });
      }
    });
  },
  rename:function(req, res){
    var oldPath = req.body.oldPath;
    var newPath = req.body.newPath;
    maClefUsb.rename(oldPath, newPath,function(success){
      var ok = success == 'not-found';
      res.status(ok?200:404).send()
    });
  },
  remove:function(req, res){
    var filePath = req.body.filePath;
    maClefUsb.remove(filePath,function(success){
      var ok = success == 'not-found';
      res.status(ok?200:404).send()
    });
  },
  add:function(req, res){
    var path = req.body.path;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldName, file, fileName) {
      console.log("Uploading fieldName " + fieldName);
      console.log("Uploading fileName " + fileName);
      maClefUsb.write(path, fileName, file, function(success){
        res.send( success );
      });
    });
  },
  addDir:function(req, res){
    var dirPath = req.body.dirPath;
    maClefUsb.addDir(dirPath,function(success){
      var ok = success == 'not-found';
      res.status(ok?200:404).send()
    });
  }
};

var start = function(options, done) {
  var app = express();

  app.use(busboy());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.post('/change-home', controllers.changeHome);
  app.post('/readdir', controllers.readdir);
  app.get(/\/readfile\/(.+)/, controllers.readfile);
  app.get(/\/download\/(.+)/, controllers.download);
  app.post('/readmeta', controllers.readmeta);
  app.post('/rename', controllers.rename);
  app.post('/remove', controllers.remove);
  app.post('/add', controllers.add);
  app.post('/add-dir', controllers.addDir);

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
module.exports.controllers = controllers; // testing purpose

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