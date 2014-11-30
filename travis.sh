#/usr/bin/env/sh
set -e

npm test

npm i maboiteaspam/cozy-light -g
cozy-light add-plugin maboiteaspam/cozy-homepage
cozy-light install maboiteaspam/cozy-dashboard
cozy-light install maboiteaspam/ma-clef-usb
cozy-light start &
npm run integration