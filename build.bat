rd /s /q dist
xcopy src\assets dist\
xcopy src\integrations\firefox\manifest.json dist\
node .\node_modules\adv-cli\index.js compile -s src\schemas\state.json -o src\schemas\validate_state.js
node .\node_modules\rollup\bin\rollup -c .\rollup.background.config.js
node .\node_modules\rollup\bin\rollup -c .\rollup.main.config.js
