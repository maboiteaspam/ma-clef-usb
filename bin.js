#!/usr/bin/env node

var fs = require('fs-extra');
var pathExtra = require('path-extra');
var program = require('commander');
var cozyLight = require('cozy-light');
var maClefUsb = require('./ma-clef-usb');
var maClefUsbCozy = require('./cozy');
var symbols = require('symbolsjs');
var readlineToQuit = require('./readline_to_quit.js');

var pkg = require('./package.json');

// CLI

program
  .version(pkg.version);

program
    .option('-H, --home <homedirectory>', 'Home directory to use in ma clef usb')
    .option('-h, --host <hostname>', 'hostname on which ma clef usb is available')
    .option('-p, --port <port>', 'port number on which ma clef usb is available')
  .command('start')
  .description('start ma clef usb server')
  .action(function(){

    var home = program.home
      || pathExtra.join(pathExtra.homedir(), 'ma-clef-usb');
    var port = parseInt(program.port) || 8080;
    var hostname = program.hostname || '127.0.0.1';

    var opts = {
      hostname: hostname,
      getPort: function(){
        return /* ++ */port;
      }
    };


    maClefUsbCozy.start(opts,function(err, app, server){

      if (err) {
        console.error(err);
      }

      if ( fs.existsSync(home) === false ){
        fs.mkdirSync(home);
      }
      maClefUsb.changeHome(home);

      console.log('');
      console.log('\t   http://localhost:' + port + '/');
      console.log('\t   store location : ' + home);
      console.log('\t' + symbols.ok + '  ' + pkg.displayName + ' started ');
      console.log('');

      cozyLight.nodeHelpers.clearCloseServer(server);

      readlineToQuit('\t   Press enter to leave...\n',function(){
        maClefUsbCozy.stop(function(){
          server.close();
          console.log('\t   ..bye!');
          /*eslint-disable */
          process.exit(0);
          /*eslint-enable */
        });
      });
    });
  });


// Run CLI
program.parse(process.argv);


// If arguments doesn't match any of the one set, it displays help.
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
