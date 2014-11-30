'use strict';
var fs = require('fs-extra');
var pathExtra = require('path-extra');
var express = require('express');
var request = require('request');
var assert = require('assert');


describe('Controllers', function () {
  before(function(){
  });
  describe('readdir', function () {
    it('should answer 200', function (done) {
      request.get('http://localhost:19104/ma-clef-usb',
        function(error, response, body) {
          assert.equal(error,null,'error must be null')
          assert.equal(response.statusCode,200,'must respond 200')
          assert.ok(body.match(/html/),'must respond html')
          done();
        });
    });
  });


});

