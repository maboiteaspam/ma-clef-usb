#!/usr/bin/env node

var fs = require('fs-extra');
var pathExtra = require('path-extra');
var program = require('commander');
var cozyLight = require('cozy-light');
var maClefUsb = require('./ma-clef-usb');
var maClefUsbCozy = require('./cozy');

var pkg = require('./package.json');

// CLI

program
  .version(pkg.version);

program
  .command('start')
  .option('-H, --home <homedirectory>', 'Home directory to use in ma clef usb')
  .option('-h, --host <hostname>', 'hostname on which ma clef usb is available')
  .option('-p, --port <port>', 'port number on which ma clef usb is available')
  .description('start ma clef usb server')
  .action(function(){

    var home = program.home || pathExtra.join(pathExtra.homedir(), 'ma-clef-usb');
    var port = parseInt(program.port) || 8080;
    var hostname = program.hostname || '127.0.0.1';

    var opts = {
      hostname:hostname,
      getPort:function(){
        return /* ++ */port;
      }
    };


    var s;
    maClefUsbCozy.start(opts,function(err, app, server){

      if( fs.existsSync(home) == false ){
        fs.mkdirSync(home);
      }
      maClefUsb.changeHome(home);

      console.log(pkg.displayName +' started http://localhost:'+port+'/');
      console.log('ready')
      s = server;
      cozyLight.nodeHelpers.clearCloseServer(server);
    });

    readline_toquit(function(){
      console.log('bye..')
      maClefUsbCozy.stop(function(){
        s.close();
        process.exit(0)
      });
    });

    function readline_toquit( end_handler ){

      var readline = require('readline');
      var rl = readline.createInterface(process.stdin, process.stdout);

      rl.question('Press enter to leave...\n', function(answer) {
        rl.close();
        if( end_handler != null ){
          end_handler();
        }
      });
    }

  });



// Run CLI
program.parse(process.argv);


// If arguments doesn't match any of the one set, it displays help.
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
