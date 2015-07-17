![Travis Badge](https://api.travis-ci.org/maboiteaspam/ma-clef-usb.svg)

# Ma Clef USB

![Cozy Logo](https://raw.github.com/cozy/cozy-setup/gh-pages/assets/images/happycloud.png)

Ma clef Usb, a webapp on top of cozy-light PAAS to transfer files between computers,
what we use to do with usb stick in old times !

### Use cases
- Transfer files
- Put down some notes
- Browse your files

### User interface capabilities
- HTML5 mobile compatible, UI is broken on mobile, needs to be fixed.
- upload / download large files with progression
- able to stream mp3/wav/webm/mp4
- if ffmpeg is available, it s able to encode on the fly then stream avi/flv/ogv
- preview files
- browse/search your files
- support multiple file drag and drop, not directories..

### Technical information
- Server build on top of nodeJS / expressJS
- UI built on top of angularJS / bootstrap
- no database, just a webserver and a file system

# Install with cozy-light
Install Node.js (>= 0.10),
Git and essential build tools to install cozy-light
```
npm i maboiteaspam/cozy-light -g 
cozy-light add-plugin maboiteaspam/cozy-homepage 
cozy-light install maboiteaspam/cozy-dashboard 
cozy-light install maboiteaspam/ma-clef-usb 
```

### Run the platform
```
cozy-light start
```
browse http://localhost:19104/


# Install as a stand alone
Install Node.js (>= 0.10)
```
npm i ma-clef-usb -g
```

### Run the standalone app
```
ma-clef-usb start [-p 8080] [-h 127.0.0.1] [-H ~/ma-clef-usb]
```
browse http://localhost:8080/

### Standalone CLI options

- -p --port default:8080 Port on which http server listens.
- -h --hostname default:127.0.0.1 Hostname on which http server listens.
- -H --home default:~/ma-clef-usb Home directory used by ma Clef USB.

### Configuration

None.

