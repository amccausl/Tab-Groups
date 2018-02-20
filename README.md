# Tab Groups

This is a work in progress to port some basic functionality from tab groups to web-extensions

- https://github.com/dangvanthanh/vue-rollup-boilerplate
- https://addons.mozilla.org/en-US/firefox/addon/tab-center-redux/
- http://design.firefox.com/photon/welcome.html

# Building
```
npm run build
```

# Install Instructions

This is not ready for public consumption, but if you're curious you can load in firefox on linux/mac (`build.sh` in the root dir could be ported to windows bat file if you're interested).

1. Install [Node.js](https://nodejs.org/en/) for your platform
2. `git clone git@github.com:amccausl/Tab-Groups.git` and open directory in terminal
3. `npm run build`
4. Load [about:debugging](about:debugging) in Firefox and click "Load Temporary Add-on".  Open `dist/manifest.json`.

Will add a new "Tab Group" sidebar.  It should open when you load.

You can remove the original tab bar by [following these instructions](https://superuser.com/questions/1261660/firefox-quantum-ver-57-how-can-i-hide-the-horizontal-tab-bar-with-treesty/1261661)
