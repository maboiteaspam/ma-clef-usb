'use strict';

var fs = require('fs-extra');
var pathExtra = require('path-extra');
var glob = require("glob");
var mime = require('mime');

var storagePath = '';

var relativePath = function(p){
  var p = pathExtra.normalize(p);
  p = pathExtra.resolve(storagePath, p);
  return p;
};

var api = {
  write: function(storePath, fileName, file, done){
    var rstoreFilePath = relativePath( pathExtra.join(storePath, fileName) );
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
  addDir: function(dirPath, done){
    dirPath = pathExtra.normalize(dirPath);
    var rPath = pathExtra.resolve(storagePath, dirPath);
    if( rPath.match(new RegExp("^"+storagePath)) ){
      fs.mkdir( rPath, done)
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

module.exports = api;