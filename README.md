# Ma Clef USB


![Cozy Logo](https://raw.github.com/cozy/cozy-setup/gh-pages/assets/images/happycloud.png)

Ma clef Usb, a webapp on top of cozy-light PAAS to transfer files between computers,
what we use to do with usb  stick in old times !


# Install with cozy-light
Install Node.js (>= 0.10),
Git and essential build tools to install cozy-light
```
npm i maboiteaspam/cozy-light -g 
cozy-light add-plugin maboiteaspam/cozy-homepage 
cozy-light install maboiteaspam/cozy-dashboard 
cozy-light install maboiteaspam/ma-clef-usb 
```

# Run the platform
browse http://localhost:19104/
```
cozy-light start
```


# Install as a stand alone
Install Node.js (>= 0.10)
```
npm i maboiteaspam/ma-clef-usb -g
```

# Run the platform
browse http://localhost:8080/
```
ma-clef-usb start [-p 8080] [-h 127.0.0.1] [-H ~/ma-clef-usb]
```

# CLI options

- -p --port default:8080 Port on which http server listens.
- -h --hostname default:127.0.0.1 Hostname on which http server listens.
- -H --home default:~/ma-clef-usb Home directory used by ma Clef USB.

# Use cases

* Transfer files
* Put down some notes
* Browse your files

# Configuration

None.

