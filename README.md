# Tabulate

https://addons.mozilla.org/en-US/firefox/addon/tabulate/

This is a work in progress to port some basic functionality from tab groups to
web-extensions, along with some ideas of my own.

It currently includes:
- tab grouping with drag and drop
- mute groups of tabs to prevent unexpected audio
- search tabs across all groups
- copy group tabs as text
- support for multi-account containers
- dark and light themes

# Development
```
npm run build && npm run debug
```

When debugging in firefox, can enable log messages in console with:
```
localStorage.debug = 'tabulate*'
```

# Install Instructions

This is still experimental, but if you're curious you can load in firefox.

1. Follow instructions to [install `web-ext`](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext)
2. `git clone git@github.com:amccausl/Tabulate.git` and open directory in terminal
3. `npm install`
4. `npm run build` on linux/mac or `npm run build-windows` on windows
5. Load [about:debugging](about:debugging) in Firefox and click "Load Temporary Add-on" and open `dist/manifest.json` or run `npm run debug`

Will add a new "Tabulate" sidebar and action.

# Specific Versions

## Firefox 67
Added support for `prefers-color-scheme` media queries.  To support on linux, you can create a new key `ui.systemUsesDarkTheme` with value of integer `1` at [about:config](about:config) to enable

## Firefox 59
Hiding tabs in the header is behind a feature flag.  You can update `extensions.webextensions.tabhide.enabled` property at [about:config](about:config) to enable

## Firefox 57, 58
Not possible to hide tabs in header, but can remove header and use sidebar for browsing by [following these instructions](https://superuser.com/questions/1261660/firefox-quantum-ver-57-how-can-i-hide-the-horizontal-tab-bar-with-treesty/1261661)
