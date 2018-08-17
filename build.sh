#!/bin/sh

rm -r dist/*
cp -r src/assets/* dist/
cp src/integrations/firefox/manifest.json dist/
./node_modules/.bin/ajv compile -s src/schemas/state.json -o src/schemas/validate_state.js
./node_modules/.bin/rollup -c rollup.background.config.js
./node_modules/.bin/rollup -c rollup.main.config.js
cp -r bower_components/fira/woff dist/css/woff
