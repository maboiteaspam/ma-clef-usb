'use strict';

var fs = require('fs-extra');
var pathExtra = require('path-extra');
var glob = require("glob");
var mime = require('mime');
var express = require('express');
var http = require('http');
var busboy = require('connect-busboy');
var bodyParser = require('body-parser');
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
    readfile: function(filePath, done){
      filePath = pathExtra.normalize(filePath);
      var rPath = pathExtra.join(storagePath, filePath);
      rPath = pathExtra.resolve(storagePath, rPath);
      if( rPath.match(new RegExp("^"+storagePath)) ){
        if( fs.existsSync(rPath) ){
          return done(null,fs.createReadStream(rPath));
        }
      }
      done('not-found');
    },
    readdir: function(dirPath, done){
      dirPath = pathExtra.normalize(dirPath);
      var rPath = pathExtra.join(storagePath, dirPath);
      rPath = pathExtra.resolve(storagePath, rPath);
      if( rPath.match(new RegExp("^"+storagePath)) ){
        glob("*", {cwd:rPath}, function (er, files) {
          var items = [];
          files.forEach(function(file){
            var filePath = pathExtra.join(rPath, file);
            var stat = fs.lstatSync( filePath );
            items.push({
              type: stat.isFile()?'file':'folder',
              path: '/'+pathExtra.relative(storagePath, filePath),
              name: file,
              ext: pathExtra.extname(file),
              size: stat.size,
              contentType: mime.lookup(filePath),
              mtime: stat.mtime
            })
          });
          done(items);
        });
      }else{
        done('not-found');
      }
    },
    readmeta: function(itemPath, done){
      itemPath = pathExtra.normalize(itemPath);
      var rPath = pathExtra.join(storagePath, itemPath);
      rPath = pathExtra.resolve(storagePath, rPath);
      if( rPath.match(new RegExp("^"+storagePath)) ){
        if( fs.existsSync(rPath) ){
          var stat = fs.lstatSync( rPath );
          var meta = {
            type: stat.isFile()?'file':'folder',
            path: '/'+pathExtra.relative(storagePath, rPath),
            name: pathExtra.basename(rPath),
            ext: pathExtra.extname(rPath),
            size: stat.size,
            contentType: mime.lookup(rPath),
            mtime: stat.mtime
          };
          return done(meta);
        }
      }
      done('not-found');
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
      if( fs.existsSync(newPath) == false ){
        if( done ) done('not-found')
      } else{
        storagePath = pathExtra.resolve(newPath);
        if( done ) done(true)
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
  app.use(bodyParser.urlencoded({ extended: false }));
  app.post('/change-home', function(req, res){
    var newPath = req.body.newPath;
    maClefUsb.changeHome(newPath,function(ok){
      res.status(ok?200:404).send()
    });
  });
  app.post('/readdir', function(req, res){
    var dirPath = req.body.dirPath;
    maClefUsb.readdir(dirPath,function(list){
      res.send( list );
    });
  });
  app.get(/\/readfile\/(.+)/, function(req, res){
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
  });
  app.get(/\/download\/(.+)/, function(req, res){
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
  });
  app.post('/readmeta', function(req, res){
    var itemPath = req.body.itemPath;
    maClefUsb.readmeta(itemPath,function(list){
      res.send( list );
    });
  });
  app.post('/rename', function(req, res){
    var oldPath = req.body.oldPath;
    var newPath = req.body.newPath;
    maClefUsb.rename(oldPath, newPath,function(success){
      var ok = success == 'not-found';
      res.status(ok?200:404).send()
    });
  });
  app.post('/remove', function(req, res){
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