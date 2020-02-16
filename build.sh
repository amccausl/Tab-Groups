#!/bin/sh

if [ -d "dist" ]; then
  rm -r dist/*
else
  mkdir dist
fi
cp -r src/assets/* dist/
cp src/integrations/firefox/manifest.json dist/
./node_modules/.bin/ajv compile -s src/schemas/state.json -o src/schemas/validate_state.js
./node_modules/.bin/rollup -c rollup.config.js
cp node_modules/fira/woff/FiraSans-Light.woff \
   node_modules/fira/woff/FiraSans-LightItalic.woff \
   node_modules/fira/woff/FiraSans-Regular.woff \
   node_modules/fira/woff/FiraSans-Medium.woff \
   node_modules/fira/woff/FiraSans-MediumItalic.woff \
   node_modules/fira/woff/FiraSans-Bold.woff \
   node_modules/fira/woff/FiraSans-BoldItalic.woff \
   node_modules/fira/woff/FiraMono-Regular.woff \
   node_modules/fira/woff/FiraMono-Bold.woff \
   dist/fonts
