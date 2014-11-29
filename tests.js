'use strict';
var fs = require('fs-extra');
var pathExtra = require('path-extra');
var express = require('express');
var bodyParser = require('body-parser');
var supertest = require('supertest');
var assert = require('assert');

var maClefUsb = require('./ma-clef-usb');

var workingDir = pathExtra.join( __dirname, '/.test-working_dir/');
var fixturesDir = pathExtra.join( __dirname, '/fixtures/');

if( fs.existsSync(workingDir) == false ){
  fs.mkdirSync(workingDir);
}
maClefUsb.changeHome(workingDir);

before(function(){
  fs.removeSync(workingDir);
  fs.mkdirSync(workingDir);
});


after(function(){
  //fs.removeSync(workingDir);
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
          'did not copy file');
        done();
      });
    });
    it('should answer readdir', function (done) {
      var fstream = fs.createReadStream( fixturesDir+'Bnw6oV6CEAAZjUE.jpg' );
      var storePath = '/';
      var fileName = 'test.jpeg';
      maClefUsb.write(storePath,fileName,fstream,function(items){
        assert.equal(items.length, 1,
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
  });

  describe('rename', function () {
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
      fs.unlinkSync( pathExtra.join(workingDir,'/test-renamed.jpeg') );
    });
    it('should rename file', function (done) {
      maClefUsb.rename('/test.jpeg','/test-renamed.jpeg',function(){
        assert(fs.existsSync(pathExtra.join(workingDir,'/test-renamed.jpeg')),
          'did not rename file');
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
        assert.equal(items.length, 1,
          'response is missing new file');
        assert.equal(items[0].name, 'test.jpeg',
          'response is missing new file');
        assert.equal(items[0].path, '/test.jpeg',
          'response is missing new file');
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


//describe('Controllers', function () {
//
//  var app = express();
//  var jsonParser = bodyParser.json();
//  var urlencodedParser = bodyParser.urlencoded({ extended: false });
//  app.use(urlencodedParser);
//  app.use(jsonParser);
//  app.use('/list-apps', controllers.listApps);
//
//  describe('install', function () {
//    it('should install app', function (done) {
//      this.timeout(10000);
//      supertest( app )
//        .post('/install-app')
//        .send({app:'cozy-labs/hello'})
//        .expect(200, done);
//    });
//  });
//});

