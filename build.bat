rd /s /q dist
xcopy src\assets dist\
xcopy src\integrations\firefox\manifest.json dist\
node .\node_modules\rollup\bin\rollup -c .\rollup.background.config.js
node .\node_modules\rollup\bin\rollup -c .\rollup.main.config.js
