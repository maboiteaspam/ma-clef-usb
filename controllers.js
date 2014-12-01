'use strict';


var formidable = require('formidable');

var pathExtra = require('path-extra');
var fs = require('fs-extra');
var mime = require('mime');

var maClefUsb = require('./ma-clef-usb');

var respondErrorCode = function( code, res ){
  if( code === 'not-found' ){
    res.status(404).send(code)
  } else if( code === 'not-acceptable' ){
    res.status(500).send(code)
  } else if( code === 'dir-exists' ){
    res.status(500).send(code)
  } else if( code === 'file-exists' ){
    res.status(500).send(code)
  } else {
    return false;
  }
  return true;
};

var controllers = {
  changeHome:function(req, res){
    var newPath = req.body.newPath;
    maClefUsb.changeHome(newPath,function(ok){
      res.status(ok?200:404).send()
    });
  },
  readdir:function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var dirPath = fields.dirPath || '/';
      maClefUsb.readdir(dirPath,function(list){
        if( !respondErrorCode(list,res) ){
          res.send( list );
        }
      });
    });
  },
  readfile:function(req, res){
    var filePath = req.params[0];
    if(!filePath){
      res.status(500).send('missing path param')
    }else{
      maClefUsb.readmeta(filePath,function(item){
        if( respondErrorCode(item, res) ){
        } else if(item.type!='file'){
          res.status(500).send('not-a-file')
        } else {
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
    }
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
  readmeta:function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var itemPath = fields.itemPath;
      if( ! itemPath ){
        res.status(500).send("missing itemPath param")
      }else{
        maClefUsb.readmeta(itemPath,function(list){
          if( !respondErrorCode(list,res) ){
            res.send( list );
          }
        });
      }
    });
  },
  rename:function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var oldPath = fields.oldPath;
      var newPath = fields.newPath;
      if( ! oldPath ){
        res.status(500).send("missing oldPath param")
      }else if( ! newPath ){
        res.status(500).send("missing newPath param")
      }else{
        maClefUsb.rename(oldPath, newPath,function(success){
          if( !respondErrorCode(success,res) ){
            res.send( success );
          }
        });
      }
    });
  },
  remove:function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var path = fields.path;
      if( ! path ){
        res.status(500).send("missing path param")
      }else{
        maClefUsb.remove(path,function(success){
          if( !respondErrorCode(success,res) ){
            res.send( success );
          }
        });
      }
    });
  },
  add:function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var path = fields.path;
      if( ! path ){
        res.status(500).send("missing path param")
      }else if( ! files.file ){
        res.status(500).send("missing file param")
      }else{
        maClefUsb.write(path, files.file.name, fs.createReadStream(files.file.path), function(success){
          if( !respondErrorCode(success,res) ){
            res.send( success );
          }
        });
      }
    });
  },
  addDir:function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var dirPath = fields.dirPath;
      if( ! dirPath ){
        res.status(500).send("missing dirPath param")
      }else{
        maClefUsb.addDir(dirPath,function(success){
          if( !respondErrorCode(success,res) ){
            maClefUsb.readdir(pathExtra.dirname(dirPath),function(list){
              if( !respondErrorCode(list,res) ){
                res.send( list );
              }
            });
          }
        });
      }
    });
  }
};

module.exports = {
  controllers:controllers,
  connect:function(app){
    app.post('/change-home', controllers.changeHome);
    app.post('/readdir', controllers.readdir);
    app.get(/\/readfile\/(.+)/, controllers.readfile);
    app.get(/\/download\/(.+)/, controllers.download);
    app.post('/readmeta', controllers.readmeta);
    app.post('/rename', controllers.rename);
    app.post('/remove', controllers.remove);
    app.post('/add-dir', controllers.addDir);
    app.post('/add', controllers.add);
  }
};