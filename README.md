# Tab Groups

This is a work in progress to port some basic functionality from tab groups to web-extensions

- https://github.com/dangvanthanh/vue-rollup-boilerplate
- https://addons.mozilla.org/en-US/firefox/addon/tab-center-redux/
- http://design.firefox.com/photon/welcome.html

# Development
```
npm run build && npm run debug
```

# Install Instructions

This is not ready for public consumption, but if you're curious you can load in firefox.

1. Install [Node.js](https://nodejs.org/en/) for your platform
2. `git clone git@github.com:amccausl/Tab-Groups.git` and open directory in terminal
3. `npm install`
4. `npm run build` on linux/mac or `npm run build-windows` on windows
5. Load [about:debugging](about:debugging) in Firefox and click "Load Temporary Add-on" and open `dist/manifest.json` or run `npm run debug`

Will add a new "Tab Group" sidebar.  It should open when you load.

You can remove the original tab bar by [following these instructions](https://superuser.com/questions/1261660/firefox-quantum-ver-57-how-can-i-hide-the-horizontal-tab-bar-with-treesty/1261661)

Or, if you're using the latest firefox 59, you can update `extensions.webextensions.tabhide.enabled` property at about:config
