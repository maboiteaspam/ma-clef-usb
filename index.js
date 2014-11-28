'use strict';

var fs = require('fs-extra');
var pathExtra = require('path-extra');
var glob = require("glob");
var mime = require('mime');
var express = require('express');
var http = require('http');
var busboy = require('connect-busboy');
var server;

var pkg = require(__dirname+'/package.json');

var maClefUsbPath = pathExtra.join(pathExtra.homedir(), 'ma-clef-usb');

var maClefUsb = (function(){

  var storagePath = '';

  var api = {
    write: function(storePath, fileName, file, done){
      var storeFilePath = pathExtra.normalize(storePath);
      storeFilePath = pathExtra.join(storeFilePath, fileName);
      var rstoreFilePath = pathExtra.resolve(storagePath, storeFilePath);
      if( rstoreFilePath.match(new RegExp("^"+storagePath)) ){
        var fstream = fs.createWriteStream( rstoreFilePath );
        file.pipe(fstream);
        fstream.on('close', function () {
          api.readdir(storePath, done);
        });
      }else{
        done('not-found');
      }
    },
    rename: function(oldPath, newPath, done){
      newPath = pathExtra.normalize(newPath);
      oldPath = pathExtra.normalize(oldPath);
      var roldPath = pathExtra.resolve(storagePath, oldPath);
      var rnewPath = pathExtra.resolve(storagePath, newPath);
      if( roldPath.match(new RegExp("^"+storagePath))
        && rnewPath.match(new RegExp("^"+storagePath)) ){
        fs.rename(roldPath, rnewPath, done);
      }else{
        done('not-found');
      }
    },
    readfile: function(dirPath, done){
      dirPath = pathExtra.normalize(dirPath);
      var rPath = pathExtra.resolve(storagePath, dirPath);
      if( rPath.match(new RegExp("^"+storagePath)) ){
        glob("/*", {cwd:rPath}, function (er, files) {
          var items = [];
          files.forEach(function(file){
            var filePath = pathExtra.join(filePath, file);
            var stat = fs.lstatSync(filePath);
            items.push({
              type: stat.isFile()?'file':'folder',
              path: filePath,
              name: file,
              ext: pathExtra.extname(file),
              size: stat.size,
              mtime: stat.mtime
            })
          });
          done(items);
        });
      }else{
        done('not-found');
      }
    },
    readdir: function(dirPath, done){
      dirPath = pathExtra.normalize(dirPath);
      var rPath = pathExtra.resolve(storagePath, dirPath);
      if( rPath.match(new RegExp("^"+storagePath)) ){
        glob("/*", {cwd:rPath}, function (er, files) {
          var items = [];
          files.forEach(function(file){
            var filePath = pathExtra.join(filePath, file);
            var stat = fs.lstatSync(filePath);
            items.push({
              type: stat.isFile()?'file':'folder',
              path: filePath,
              name: file,
              ext: pathExtra.extname(file),
              size: stat.size,
              mtime: stat.mtime
            })
          });
          done(items);
        });
      }else{
        done('not-found');
      }
    },
    remove: function(filePath, done){
      filePath = pathExtra.normalize(filePath);
      var rPath = pathExtra.resolve(storagePath, filePath);
      if( rPath.match(new RegExp("^"+filePath)) ){
        fs.remove( rPath, done)
      }else{
        done('not-found');
      }
    },
    changeHome: function(newPath, done){
      if( fs.existsSync(storagePath) == false ){
        done('not-found')
      } else{
        storagePath = path.resolve(newPath);
        done(true)
      }
    }
  };
  return api;
})();


if( fs.existsSync(maClefUsbPath) == false ){
  fs.mkdirSync(maClefUsbPath);
}
maClefUsb.changeHome(maClefUsbPath);

var start = function(options, done) {
  var app = express();
  app.use(busboy());
  app.get('/change-home', function(req, res){
    var newPath = req.body.newPath;
    maClefUsb.changeHome(newPath,function(ok){
      res.status(ok?200:404).send()
    });
  });
  app.get('/readdir', function(req, res){
    var filePath = req.body.filePath;
    maClefUsb.readdir(filePath,function(list){
      res.send( list );
    });
  });
  app.get('/readfile', function(req, res){
    var filePath = req.body.filePath;
    maClefUsb.readfile(filePath,function(err, stream){
      var type = mime.lookup(filePath);
      if (!res.getHeader('content-type')) {
        var charset = mime.charsets.lookup(type);
        res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
      }
      stream.pipe(res);
    });
  });
  app.get('/rename', function(req, res){
    var oldPath = req.body.oldPath;
    var newPath = req.body.newPath;
    maClefUsb.rename(oldPath, newPath,function(success){
      var ok = success == 'not-found';
      res.status(ok?200:404).send()
    });
  });
  app.get('/remove', function(req, res){
    var filePath = req.body.filePath;
    maClefUsb.remove(filePath,function(success){
      var ok = success == 'not-found';
      res.status(ok?200:404).send()
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