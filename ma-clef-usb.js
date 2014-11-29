'use strict';

var fs = require('fs-extra');
var pathExtra = require('path-extra');
var glob = require("glob");
var mime = require('mime');

var storagePath = '';

var relativePath = function(p){
  var p = pathExtra.normalize(p);
  p = pathExtra.join(storagePath, p);
  return p;
};

var api = {
  write: function(storePath, fileName, file, done){
    var astorePath = relativePath(storePath);
    if( fs.existsSync(astorePath) ){
      var rstoreFilePath = relativePath( pathExtra.join(storePath, fileName) );
      var fstream = fs.createWriteStream( rstoreFilePath );
      file.pipe(fstream);
      file.on('readable', function() {
        var chunk;
        while (null !== (chunk = file.read())) {
        }
      });
      file.on('close', function () {
        api.readdir(storePath, done);
      });
    }else{
      done("not-found")
    }
  },
  rename: function(oldPath, newPath, done){
    var roldPath = relativePath( oldPath );
    var rnewPath = relativePath( newPath );
    if( fs.existsSync(rnewPath) ){
      done('file-exists');
    }else if( fs.existsSync(roldPath) ){
      fs.rename(roldPath, rnewPath, done);
    }else{
      done('not-found');
    }
  },
  readfile: function(filePath, done){
    filePath = relativePath( filePath );
    if( fs.existsSync(filePath) ){
      return done(null,fs.createReadStream(filePath));
    }
    done('not-found');
  },
  readdir: function(dirPath, done){
    var rstoreFilePath = relativePath( dirPath );
    if( fs.existsSync(rstoreFilePath) ){
      glob("*", {cwd:rstoreFilePath}, function (er, files) {
        var items = [];
        files.forEach(function(file){
          var filePath = pathExtra.join(rstoreFilePath, file);
          var stat = fs.lstatSync( filePath );
          items.push({
            type: stat.isFile()?'file':'folder',
            path: pathExtra.join('/',pathExtra.relative(storagePath, rstoreFilePath),file),
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
    itemPath = relativePath( itemPath );
    if( fs.existsSync(itemPath) ){
      var stat = fs.lstatSync( itemPath );
      return done({
        type: stat.isFile()?'file':'folder',
        path: pathExtra.join('/',pathExtra.relative(storagePath, itemPath)),
        name: pathExtra.basename(itemPath),
        ext: pathExtra.extname(itemPath),
        size: stat.size,
        contentType: mime.lookup(itemPath),
        mtime: stat.mtime
      });
    }
  },
  remove: function(filePath, done){
    filePath = relativePath( filePath );
    if( fs.existsSync(filePath) ){
      fs.remove( filePath, done)
    }else{
      done('not-found');
    }
  },
  addDir: function(dirPath, done){
    dirPath = relativePath( dirPath );
    if( fs.existsSync(dirPath) ) {
      done('dir-exists');
    }else{
      fs.mkdir( dirPath, done)
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