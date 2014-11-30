'use strict';
var fs = require('fs-extra');
var pathExtra = require('path-extra');
var express = require('express');
var request = require('request');
var assert = require('assert');

var maClefUsb = require('./ma-clef-usb');
var controllers = require('./controllers');
