#!/bin/sh

rm -r dist/*
cp -r src/assets/* dist/
cp src/integrations/firefox/manifest.json dist/
./node_modules/rollup/bin/rollup -c rollup.background.config.js
./node_modules/rollup/bin/rollup -c rollup.main.config.js
