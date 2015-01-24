'use strict';

var fs = require('fs-extra');
var pathExtra = require('path-extra');
var glob = require('glob');
var mime = require('mime');
var Stream = require('stream');

var storagePath = '';

var relativePath = function(p){
  p = pathExtra.normalize(p);
  p = pathExtra.join(storagePath, p);
  p = pathExtra.resolve(p);
  return p;
};

var isAcceptablePath = function(p){
  return !!p.match(new RegExp('^' + storagePath));
};

var forgeFileMeta = function(f){
  if ( fs.existsSync(f) ){
    var stat = fs.lstatSync( f );
    var d = pathExtra.dirname(f.replace(storagePath, ''));
    return {
      type: stat.isFile() ? 'file' : 'folder',
      path: pathExtra.join('/', pathExtra.relative(storagePath, f)),
      dirname: d === '.' ? '/' : d,
      name: pathExtra.basename(f),
      ext: pathExtra.extname(f),
      size: stat.size,
      contentType: mime.lookup(f),
      mtime: stat.mtime
    };
  }
};

var api = {
  rename: function(oldPath, newPath, done){
    var roldPath = relativePath( oldPath );
    var rnewPath = relativePath( newPath );
    if (!isAcceptablePath(roldPath) ){
      done('not-acceptable');
    }else if (!isAcceptablePath(rnewPath) ){
      done('not-acceptable');
    }else if ( fs.existsSync(rnewPath) ){
      done('file-exists');
    }else if ( fs.existsSync(roldPath) ){
      fs.rename(roldPath, rnewPath, done);
    } else {
      done('not-found');
    }
  },
  readfile: function(filePath, done){
    filePath = relativePath( filePath );
    if (!isAcceptablePath(filePath) ){
      return done('not-acceptable');
    }else if ( fs.existsSync(filePath) ){
      return done(null, fs.createReadStream(filePath));
    }
    done('not-found');
  },
  readdir: function(dirPath, done){
    var rstoreFilePath = relativePath( dirPath );
    if (!isAcceptablePath(rstoreFilePath) ){
      done('not-acceptable');
    }else if ( fs.existsSync(rstoreFilePath) ){
      glob('*', {cwd: rstoreFilePath}, function (er, files) {
        var items = [];
        files.forEach(function(file){
          var filePath = pathExtra.join(rstoreFilePath, file);
          items.push(forgeFileMeta(filePath));
        });
        done(items);
      });
    } else {
      done('not-found');
    }
  },
  readmeta: function(itemPath, done){
    itemPath = relativePath( itemPath );
    if (!isAcceptablePath(itemPath) ){
      done('not-acceptable');
    } else {
      var meta = forgeFileMeta(itemPath);
      done(meta ? meta : 'not-found');
    }
  },
  remove: function(filePath, done){
    filePath = relativePath( filePath );
    if (!isAcceptablePath(filePath) ){
      done('not-acceptable');
    } else if ( fs.existsSync(filePath) ){
      fs.remove( filePath, done);
    } else {
      done('not-found');
    }
  },
  addDir: function(dirPath, done){
    dirPath = relativePath( dirPath );
    if (!isAcceptablePath(dirPath) ){
      done('not-acceptable');
    } else if ( fs.existsSync(dirPath) ) {
      done('dir-exists');
    } else {
      fs.mkdir( dirPath, done);
    }
  },
  add: function(storePath, fileName, file, done){
    var astorePath = relativePath(storePath) + '/';
    if (!isAcceptablePath(astorePath) ){
      done('not-acceptable');
    } else if ( fs.existsSync(astorePath) ){
      var rstoreFilePath = relativePath( pathExtra.join(storePath, fileName) );
      if ( file instanceof Stream.Readable ){
        var fstream = fs.createWriteStream( rstoreFilePath );
        file.pipe(fstream);
        file.on('close', function () {
          api.readdir(storePath, done);
        });
        return fstream;
      } else {
        fs.writeFileSync(rstoreFilePath, file);
        api.readdir(storePath, done);
      }
    } else {
      done('not-found');
    }
  },
  changeHome: function(newPath, done){
    if ( fs.existsSync(newPath) === false ) {
      if ( done ) {
        done('not-found');
      }
    } else {
      storagePath = pathExtra.resolve(newPath);
      if ( done ) {
        done(true);
      }
    }
  },
  getHome: function(){
    return storagePath;
  }
};

module.exports = api;
