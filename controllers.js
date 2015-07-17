'use strict';


var formidable = require('formidable');
var multiparty = require('multiparty');
var vidStreamer = require("vid-streamer");
var Transcoder = require('stream-transcoder');

var pathExtra = require('path-extra');
var fs = require('fs-extra');
var mime = require('mime');
var url = require('url');

var maClefUsb = require('./ma-clef-usb');

/*
monkey patching
 */
Transcoder.prototype.stream = function() {
  var a = this._compileArguments();
  a.push('pipe:1');
  this.child = this._exec(a)
  this.stream = this.child.stdout
  return this.stream
};

var currentStream;

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
      if( err ) throw err;
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
      if( err ) throw err;
      var itemPath = fields.itemPath;
      if( ! itemPath ){
        res.status(500).send("missing itemPath param")
      }else{
        maClefUsb.readmeta(itemPath,function(meta){
          if( !respondErrorCode(meta,res) ){
            res.send( meta );
          }
        });
      }
    });
  },
  rename:function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      if( err ) throw err;
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
      if( err ) throw err;
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
    var form = new multiparty.Form();
    form.on('error', function(err) {
      console.log('Error parsing form: ' + err.stack);
    });
    var path;
    var file;
    var c=0;
    form.on('field', function(name, value) {
      if (name === 'path') {
        path = value;
      }
    });
    form.on('part', function(part) {
      if( !path ){
        res.status(500).send("missing path param")
      }else{
        if (part.filename !== null) {
          if( !file ){
            file = maClefUsb.add(path, part.filename, part);
            //console.log(part.filename+" "+c);
          }else{
            c++;
            //console.log(part.filename+" "+c);
            part.pipe(file);
          }
        }
      }
      part.on('error', function(err) {
        res.status(500).send(err)
      });
    });

// Close emitted after form parsed
    form.on('close', function() {
      if( !file ){
        res.status(500).send("missing file param")
      }else{
        maClefUsb.readdir(path, function(success){
          if( !respondErrorCode(success,res) ){
            res.send( success );
          }
        });
      }
    });

// Parse req
    form.parse(req);
  },
  addNote:function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      if( err ) throw err;
      var path = fields.path;
      var fileName = fields.fileName;
      var content = fields.content;
      if( ! path ){
        res.status(500).send("missing path param")
      }else if( ! fileName ){
        res.status(500).send("missing fileName param")
      }else if( ! content ){
        res.status(500).send("missing content param")
      }else{
        maClefUsb.add(path, fileName, content, function(success){
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
      if( err ) throw err;
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
  },
  stream:function(req, res,next){
    var reqUrl = url.parse(req.url, true);
    var p = reqUrl.pathname || "";
    p = decodeURIComponent(p);
    p = p.replace('/stream','');
    p = p.match(/^[/]/)?p:"/"+p;
    maClefUsb.readmeta(p,function(meta){
      if( !respondErrorCode(meta, res) ){
        if(meta.contentType.match(/webm|ogg|mp4$/)){
          vidStreamer.settings({
            "mode": "development",
            "forceDownload": false,
            "random": false,
            "rootFolder": maClefUsb.getHome()+"/",
            "rootPath": "stream/",
            "server": "VidStreamer.js/0.1.4"
          });
          vidStreamer(req,res);
        }else{
          if (currentStream) {
            currentStream.kill('SIGHUP');
          }
          try{
            res.status(206)
            var transcoder = new Transcoder(maClefUsb.getHome()+"/"+p);
            transcoder
              .videoCodec('libx264')
              .audioCodec('mp3')
              .format('mp4')
              .on('error', function(e) {
                console.error(e)
              })
              .on('finish', function() {
                next();
              })
              .stream()
              .pipe(res);
            currentStream = transcoder.child;
          }catch(ex){
            respondErrorCode('not-found', res);
          }
        }
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
    app.post('/add-note', controllers.addNote);
    app.post('/add-dir', controllers.addDir);
    app.post('/add', controllers.add);
    app.get(/\/stream\/(.+)/, controllers.stream);
  }
};