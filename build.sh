#!/bin/sh

rm -r dist/*
cp -r src/assets/* dist/
cp src/integrations/firefox/manifest.json dist/
./node_modules/.bin/ajv compile -s src/schemas/state.json -o src/schemas/validate_state.js
./node_modules/.bin/rollup -c rollup.background.config.js
./node_modules/.bin/rollup -c rollup.main.config.js
cp bower_components/fira/woff/FiraSans-Light.woff \
   bower_components/fira/woff/FiraSans-LightItalic.woff \
   bower_components/fira/woff/FiraSans-Regular.woff \
   bower_components/fira/woff/FiraSans-Medium.woff \
   bower_components/fira/woff/FiraSans-MediumItalic.woff \
   bower_components/fira/woff/FiraSans-Bold.woff \
   bower_components/fira/woff/FiraSans-BoldItalic.woff \
   bower_components/fira/woff/FiraMono-Regular.woff \
   bower_components/fira/woff/FiraMono-Bold.woff \
   dist/fonts
