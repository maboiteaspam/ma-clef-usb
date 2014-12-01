'use strict';
var fs = require('fs-extra');
var pathExtra = require('path-extra');
var express = require('express');
var request = require('request');
var assert = require('assert');

var maClefUsb = require('./ma-clef-usb');
var controllers = require('./controllers');

var workingDir = pathExtra.join( __dirname, '/.test-working_dir/');
var fixturesDir = pathExtra.join( __dirname, '/fixtures/');

before(function(){
  fs.removeSync(workingDir);
  fs.mkdirSync(workingDir);
  maClefUsb.changeHome(workingDir);
});


after(function(){
  fs.removeSync(workingDir);
});


describe('maClefUsb', function () {

  describe('addDir', function () {
    after(function(){
      fs.rmdirSync( pathExtra.join(workingDir,'/test2') );
    });
    it(' should work', function (done) {
      maClefUsb.addDir('/test2',function(){
        assert(fs.existsSync(pathExtra.join(workingDir,'/test2')),
          'did not create dir');
        done();
      });
    });
    it(' should not create directory outside home directory', function (done) {
      maClefUsb.addDir('../test2',function(err){
        assert.equal(fs.existsSync(pathExtra.join(workingDir,'..','test2')), false,
          'must not create directory');
        assert.equal(err,"not-acceptable",'must return correct answer');
        done();
      });
    });
    it(' should not create directory outside home directory', function (done) {
      maClefUsb.addDir('/../test4',function(){
        assert.equal(fs.existsSync(pathExtra.join(workingDir,'test4')), true,
          'must create directory inside home');
        done();
      });
    });
  });

  describe('write', function () {
    after(function(){
      fs.unlinkSync( pathExtra.join(workingDir,'/test.jpeg') );
    });
    it('should write file', function (done) {
      var fstream = fs.createReadStream( fixturesDir+'Bnw6oV6CEAAZjUE.jpg' );
      var storePath = '/';
      var fileName = 'test.jpeg';
      maClefUsb.write(storePath,fileName,fstream,function(items){
        assert.notEqual(items, 'not-found',
          'wrong storePath');
        assert(fs.existsSync(pathExtra.join(workingDir,storePath,fileName)),
          'did not write file');
        done();
      });
    });
    it('should answer readdir', function (done) {
      var fstream = fs.createReadStream( fixturesDir+'Bnw6oV6CEAAZjUE.jpg' );
      var storePath = '/';
      var fileName = 'test.jpeg';
      maClefUsb.write(storePath,fileName,fstream,function(items){
        assert.ok(items.length>1,
          'response is missing new file');
        assert.equal(items[0].name, 'test.jpeg',
          'name is wrong');
        assert.equal(items[0].path, '/test.jpeg',
          'path is wrong');
        done();
      });
    });
    it('should not write file in a non existent directory', function (done) {
      var fstream = fs.createReadStream( fixturesDir+'Bnw6oV6CEAAZjUE.jpg' );
      var storePath = '/test3';
      var fileName = 'test.jpeg';
      maClefUsb.write(storePath,fileName,fstream,function(items){
        assert.equal(items, 'not-found',
          'wrong storePath');
        done();
      });
    });
    it('should write another file', function (done) {
      var fstream = fs.createReadStream( fixturesDir+'Bnw6oV6CEAAZjUE.jpg' );
      var storePath = '/test3';
      var fileName = 'test5.jpeg';
      maClefUsb.addDir(storePath,function(){
        maClefUsb.write(storePath,fileName,fstream,function(items){
          assert.notEqual(items, 'not-found',
            'wrong storePath');
          assert(fs.existsSync(pathExtra.join(workingDir,storePath,fileName)),
            'did not copy file');
          fs.unlinkSync( pathExtra.join(workingDir,'/test3/test5.jpeg') );
          fs.rmdirSync( pathExtra.join(workingDir,'/test3') );
          done();
        });
      });
    });
    it('should not write file outside home directory', function (done) {
      var fstream = fs.createReadStream( fixturesDir+'Bnw6oV6CEAAZjUE.jpg' );
      var storePath = '../';
      var fileName = 'test.jpeg';
      maClefUsb.write(storePath,fileName,fstream,function(items){
        assert.equal(items, 'not-acceptable', 'wrong storePath');
        assert.equal(fs.existsSync(pathExtra.join(workingDir,storePath,'../',fileName)), false,
          'must not write file');
        done();
      });
    });
  });

  describe('rename', function () {
    before(function(done){
      var fstream = fs.createReadStream( fixturesDir+'Bnw6oV6CEAAZjUE.jpg' );
      var storePath = '/';
      var fileName = 'test.jpeg';
      maClefUsb.write(storePath,fileName,fstream,function(){
        assert(fs.existsSync(pathExtra.join(workingDir,storePath,fileName)),
          'did not copy file');
        fstream = fs.createReadStream( fixturesDir+'Bnw6oV6CEAAZjUE.jpg' );
        var fileName2 = 'test22.jpeg';
        maClefUsb.write(storePath,fileName2,fstream,function(){
          assert(fs.existsSync(pathExtra.join(workingDir,storePath,fileName2)),
            'did not copy file');
          done();
        });
      });
    });
    after(function(){
      try{
        fs.unlinkSync( pathExtra.join(workingDir,'/test-renamed.jpeg') );
      }catch(ex){}
      try{
        fs.unlinkSync( pathExtra.join(workingDir,'/test22.jpeg') );
      }catch(ex){}
    });
    it('should rename file', function (done) {
      maClefUsb.rename('/test.jpeg','/test-renamed.jpeg',function(){
        assert(fs.existsSync(pathExtra.join(workingDir,'/test-renamed.jpeg')),
          'did not rename file');
        done();
      });
    });
    it('should not rename non existent file', function (done) {
      maClefUsb.rename('/no-file.jpeg','/no-file-renamed.jpeg',function(err){
        assert.equal(err, 'not-found', 'wrong storePath');
        assert.equal(fs.existsSync(pathExtra.join(workingDir,'/no-file-renamed.jpeg')),
          false, 'must not rename file');
        done();
      });
    });
    it('should not rename as an existent file', function (done) {
      maClefUsb.rename('/test-renamed.jpeg','/test22.jpeg',function(err){
        assert.notEqual(err,null,"must throw error")
        assert.equal(err,"file-exists","must throw correct error")
        assert(fs.existsSync(pathExtra.join(workingDir,'test-renamed.jpeg')),
          'must not rename file');
        done();
      });
    });
  });

  describe('readfile', function () {
    before(function(done){
      var fstream = fs.createReadStream( fixturesDir+'Bnw6oV6CEAAZjUE.jpg' );
      var storePath = '/';
      var fileName = 'test.jpeg';
      maClefUsb.write(storePath,fileName,fstream,function(){
        assert(fs.existsSync(pathExtra.join(workingDir,storePath,fileName)),
          'did not copy file');
        done();
      });
    });
    after(function(){
      fs.unlinkSync( pathExtra.join(workingDir,'/test.jpeg') );
    });
    it('returns a stream file', function (done) {
      maClefUsb.readfile('/test.jpeg',function(err, stream){
        assert.equal(err, null, 'err must be empty');
        var length = 0;
        stream.on('data', function(chunk) {
          length += chunk.length;
          stream.read();
        });
        stream.on('error', function(err) {
          assert(err==null,
            'error occurred');
        });
        stream.on('end', function() {
          assert(length>0,
            'file is empty');
          done();
        });
        stream.read();
      });
    });
    it('can not read file outside home directory', function (done) {
      maClefUsb.readfile('../package.json',function(err, stream){
        assert.equal(err, 'not-acceptable', 'err must be correct');
        assert.equal(stream, null, 'stream must be null');
        done();
      });
    });
  });

  describe('readdir', function () {
    before(function(done){
      var fstream = fs.createReadStream( fixturesDir+'Bnw6oV6CEAAZjUE.jpg' );
      var storePath = '/';
      var fileName = 'test.jpeg';
      maClefUsb.write(storePath,fileName,fstream,function(){
        assert(fs.existsSync(pathExtra.join(workingDir,storePath,fileName)),
          'did not copy file');
        done();
      });
    });
    after(function(){
      fs.unlinkSync( pathExtra.join(workingDir,'/test.jpeg') );
    });
    it('list directory items', function (done) {
      maClefUsb.readdir('/',function(items){
        assert.ok(items.length>1,
          'response is missing new file');
        assert.equal(items[0].name, 'test.jpeg',
          'response is missing new file');
        assert.equal(items[0].path, '/test.jpeg',
          'response is missing new file');
        done();
      });
    });
    it('can not read dir outside home directory', function (done) {
      maClefUsb.readfile('../',function(err){
        assert.equal(err, 'not-acceptable', 'err must be correct');
        done();
      });
    });
  });

  describe('readmeta', function () {
    before(function(done){
      var fstream = fs.createReadStream( fixturesDir+'Bnw6oV6CEAAZjUE.jpg' );
      var storePath = '/';
      var fileName = 'test.jpeg';
      maClefUsb.write(storePath,fileName,fstream,function(){
        assert(fs.existsSync(pathExtra.join(workingDir,storePath,fileName)),
          'did not copy file');
        done();
      });
    });
    after(function(){
      fs.unlinkSync( pathExtra.join(workingDir,'/test.jpeg') );
    });
    it(' from file', function (done) {
      maClefUsb.readmeta('/test.jpeg',function(meta){
        assert.equal(meta.name, 'test.jpeg',
          'name is wrong');
        assert.equal(meta.path, '/test.jpeg',
          'path is wrong');
        done();
      });
    });
    it(' from dir', function (done) {
      maClefUsb.readmeta('/',function(meta){
        assert.equal(meta.name, '.test-working_dir',
          'name is wrong');
        assert.equal(meta.path, '/',
          'path is wrong');
        done();
      });
    });
    it('can not get meta outside home directory', function (done) {
      maClefUsb.readfile('../package.json',function(err){
        assert.equal(err, 'not-acceptable', 'err must be correct');
        done();
      });
    });
  });

  describe('remove', function () {
    before(function(done){
      var fstream = fs.createReadStream( fixturesDir+'Bnw6oV6CEAAZjUE.jpg' );
      var storePath = '/';
      var fileName = 'test.jpeg';
      maClefUsb.write(storePath,fileName,fstream,function(){
        assert(fs.existsSync(pathExtra.join(workingDir,storePath,fileName)),
          'did not copy file');
        done();
      });
    });
    it(' a file', function (done) {
      maClefUsb.remove('/test.jpeg',function(){
        assert(!fs.existsSync(pathExtra.join(workingDir,'/test.jpeg')),
          'did not remove file');
        done();
      });
    });
    it(' a dir', function (done) {
      fs.mkdirSync(pathExtra.join(workingDir,'/test2'));
      maClefUsb.remove('/test2',function(){
        assert(!fs.existsSync(pathExtra.join(workingDir,'/test.jpeg')),
          'did not remove file');
        done();
      });
    });
    it('can not delete item outside home directory', function (done) {
      maClefUsb.readfile('../package.json',function(err){
        assert.equal(err, 'not-acceptable', 'err must be correct');
        done();
      });
    });
  });

  describe('changeHome', function () {
    it('does not change home if directory does not exist', function (done) {
      maClefUsb.changeHome('non-sense',function(success){
        assert.equal(success, 'not-found',
          'must not change home');
        done();
      });
    });
    it('does change home if directory does exist', function (done) {
      fs.mkdirSync( pathExtra.join(workingDir,'/test2') );
      maClefUsb.changeHome(pathExtra.join(workingDir,'/test2'),function(success){
        assert.ok(success,
          'must change home');
        maClefUsb.addDir('/test3',function(){
          assert(fs.existsSync(pathExtra.join(workingDir,'/test2','/test3')),
            'did not create dir');
          done();
        });
      });
    });
  });

});


describe('Controllers', function () {
  var app;

  before(function(){
    fs.removeSync(workingDir);
    fs.mkdirSync(workingDir);
    maClefUsb.changeHome(workingDir);
    app = express();
    controllers.connect(app);
    app.listen(3000)
  });

  describe('readdir', function () {
    it('should answer 200', function (done) {
      request.post({url:'http://localhost:3000/readdir',form:{dirPath:'/'}},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null')
          assert.equal(response.statusCode,200,'must respond 200')
          assert.ok(body.match(/\[\]/),'must respond []')
          done();
        });
    });
    it('should answer 500', function (done) {
      request.post({url:'http://localhost:3000/readdir',form:{dirPath:'../'}},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null')
          assert.equal(response.statusCode,500,'must respond 500')
          assert.ok(body.match(/not-acceptable/),'must respond not-acceptable')
          done();
        });
    });
    it('should answer 404', function (done) {
      request.post({url:'http://localhost:3000/readdir',form:{dirPath:'/not-found'}},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null')
          assert.equal(response.statusCode,404,'must respond 404')
          assert.ok(body.match(/not-found/),'must respond not-found')
          done();
        });
    });
    it('should answer 200', function (done) {
      request.post({url:'http://localhost:3000/readdir',form:{}},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null')
          assert.equal(response.statusCode,200,'must respond 200')
          assert.ok(body.match(/\[\]/),'must respond missing dirPath param')
          done();
        });
    });
  });

  describe('addDir', function () {
    it('should answer 200', function (done) {
      request.post({url:'http://localhost:3000/add-dir',form:{dirPath:'/test2'}},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null')
          assert.equal(response.statusCode,200,'must respond 200')
          assert.ok(body.match(/path":"\/test2","name":"test2"/),'must respond items')
          done();
        });
    });
    it('should answer 500', function (done) {
      request.post({url:'http://localhost:3000/add-dir',form:{dirPath:'/test2'}},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null')
          assert.equal(response.statusCode,500,'must respond 500')
          assert.ok(body.match(/dir-exists/),'must respond dir-exists')
          done();
        });
    });
    it('should answer 500', function (done) {
      request.post({url:'http://localhost:3000/add-dir',form:{dirPath:'../test2'}},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null')
          assert.equal(response.statusCode,500,'must respond 500')
          assert.ok(body.match(/not-acceptable/),'must respond not-acceptable')
          done();
        });
    });
    it('should answer 500', function (done) {
      request.post({url:'http://localhost:3000/add-dir'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null')
          assert.equal(response.statusCode,500,'must respond 500')
          assert.ok(body.match(/missing dirPath param/),'must respond testupload')
          done();
        });
    });
  });

  describe('add', function () {
    it('should answer 200', function (done) {
      var r = request.post({url:'http://localhost:3000/add'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,200,'must respond 200');
          assert.ok(body.match(/testupload/),'must respond testupload');
          assert.ok(fs.existsSync(workingDir+'testupload.jpg'),'file must exists');
          done();
        });
      var form = r.form();
      form.append('path', '/');
      form.append('file',
        fs.createReadStream(fixturesDir + '/Bnw6oV6CEAAZjUE.jpg'),
        {filename: 'testupload.jpg'});
    });
    it('should answer 200', function (done) {
      var r = request.post({url:'http://localhost:3000/add'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,200,'must respond 200');
          assert.ok(body.match(/testupload/),'must respond testupload');
          assert.ok(fs.existsSync(workingDir+'test2/testupload.jpg'),'file must exists');
          done();
        });
      var form = r.form();
      form.append('path', 'test2/');
      form.append('file',
        fs.createReadStream(fixturesDir + '/Bnw6oV6CEAAZjUE.jpg'),
        {filename: 'testupload.jpg'});
    });
    it('should answer 500', function (done) {
      var r = request.post({url:'http://localhost:3000/add'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,500,'must respond 500');
          assert.ok(body.match(/missing path param/),'must respond "missing path param"');
          done();
        });
      var form = r.form();
      form.append('file',
        fs.createReadStream(fixturesDir + '/Bnw6oV6CEAAZjUE.jpg'),
        {filename: 'testupload.jpg'});
    });
    it('should answer 500', function (done) {
      var r = request.post({url:'http://localhost:3000/add'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,500,'must respond 500');
          assert.ok(body.match(/missing file param/),'must respond "missing file param"');
          done();
        });
      var form = r.form();
      form.append('path', '/');
    });
  });

  describe('rename', function () {
    it('should answer 200', function (done) {
      var r = request.post({url:'http://localhost:3000/rename'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,200,'must respond 200');
          assert.equal(fs.existsSync(workingDir+'testupload.jpg'),false,'file must not exists');
          assert.equal(fs.existsSync(workingDir+'text_file'),true,'file must exists');
          done();
        });
      var form = r.form();
      form.append('oldPath', 'testupload.jpg');
      form.append('newPath', 'text_file');
    });
    it('should answer 200', function (done) {
      var r = request.post({url:'http://localhost:3000/rename'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,200,'must respond 200');
          assert.equal(fs.existsSync(workingDir+'test2'),false,'file must not exists');
          assert.equal(fs.existsSync(workingDir+'test3'),true,'file must exists');
          done();
        });
      var form = r.form();
      form.append('oldPath', 'test2');
      form.append('newPath', 'test3');
    });
    it('should answer 500', function (done) {
      var r = request.post({url:'http://localhost:3000/rename'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,500,'must respond 500');
          assert.ok(body.match(/missing newPath param/),'must respond "missing newPath param"');
          done();
        });
      var form = r.form();
      form.append('oldPath', 'test2');
    });
    it('should answer 500', function (done) {
      var r = request.post({url:'http://localhost:3000/rename'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,500,'must respond 500');
          assert.ok(body.match(/missing oldPath param/),'must respond "missing oldPath param"');
          done();
        });
      var form = r.form();
      form.append('newPath', 'test2');
    });
    it('should answer 500', function (done) {
      var r = request.post({url:'http://localhost:3000/rename'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,500,'must respond 500');
          assert.ok(body.match(/file-exists/),'must respond "file-exists"');
          done();
        });
      var form = r.form();
      form.append('oldPath', 'test3');
      form.append('newPath', 'text_file');
    });
    it('should answer 500', function (done) {
      var r = request.post({url:'http://localhost:3000/rename'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,500,'must respond 500');
          assert.ok(body.match(/file-exists/),'must respond "file-exists"');
          done();
        });
      var form = r.form();
      form.append('oldPath', 'text_file');
      form.append('newPath', 'test3');
    });
  });

  describe('readmeta', function () {
    it('should answer 200', function (done) {
      var r = request.post({url:'http://localhost:3000/readmeta'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,200,'must respond 200');
          assert.ok(body.match(/name":"text_file/),'must respond file meta');
          done();
        });
      var form = r.form();
      form.append('itemPath', 'text_file');
    });
    it('should answer 500', function (done) {
      var r = request.post({url:'http://localhost:3000/readmeta'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,500,'must respond 500');
          assert.ok(body.match(/missing itemPath param/),'must respond "missing itemPath param"');
          done();
        });
      var form = r.form();
    });
    it('should answer 404', function (done) {
      var r = request.post({url:'http://localhost:3000/readmeta'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,404,'must respond 404');
          assert.ok(body.match(/not-found/),'must respond "not-found"');
          done();
        });
      var form = r.form();
      form.append('itemPath', 'not-a-file');
    });
  });

  describe('readfile', function () {
    it('should answer 200', function (done) {
      request.get({url:'http://localhost:3000/readfile/text_file'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,200,'must respond 200');
          assert.ok(body.match(/is is not a picture/),'must respond file content');
          done();
        });
    });
    it('should answer 404', function (done) {
      var r = request.get({url:'http://localhost:3000/readfile'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,404,'must respond 404');
          done();
        });
      var form = r.form();
    });
    it('should answer 404', function (done) {
      var r = request.get({url:'http://localhost:3000/readfile/'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,404,'must respond 404');
          done();
        });
      var form = r.form();
    });
    it('should answer 500', function (done) {
      var r = request.get({url:'http://localhost:3000/readfile/test3'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,500,'must respond 500');
          assert.ok(body.match(/not-a-file/),'must respond "not-a-file"');
          done();
        });
      var form = r.form();
    });
    it('should answer 404', function (done) {
      var r = request.get({url:'http://localhost:3000/readfile/not-a-file'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,404,'must respond 404');
          assert.ok(body.match(/not-found/),'must respond "not-found"');
          done();
        });
      var form = r.form();
      form.append('itemPath', 'not-a-file');
    });
  });

  describe.skip('download', function () {
  });

  describe('remove', function () {
    it('should answer 200', function (done) {
      var r = request.post({url:'http://localhost:3000/remove'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,200,'must respond 200');
          assert.equal(fs.existsSync(workingDir+'text_file'),false,'file must not exists');
          done();
        });
      var form = r.form();
      form.append('path', 'text_file');
    });
    it('should answer 200', function (done) {
      var r = request.post({url:'http://localhost:3000/remove'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,200,'must respond 200');
          assert.equal(fs.existsSync(workingDir+'test3'),false,'directory must not exists');
          done();
        });
      var form = r.form();
      form.append('path', 'test3');
    });
    it('should answer 500', function (done) {
      var r = request.post({url:'http://localhost:3000/remove'},
        function optionalCallback(error, response, body) {
          assert.equal(error,null,'error must be null');
          assert.equal(response.statusCode,500,'must respond 500');
          assert.ok(body.match(/missing path param/),'must respond "missing path param"');
          done();
        });
      var form = r.form();
    });
  });

});

