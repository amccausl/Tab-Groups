import { createDebug } from "./helpers"
import { createStore } from "./store/dispatcher.mjs"

import { initAction } from "./store/actions.mjs"
import init from "./store/reducers/init.mjs"
import App from "./store/reducers.mjs"
import { getTabGroupsPersistState } from "./store/helpers.mjs"
import {
  bindBrowserEvents,
  closeTab,
  muteTab,
  unmuteTab,
  createGroup,
  closeTabGroup,
  muteTabGroup,
  unmuteTabGroup,
  getMessage,
  loadBrowserState,
  moveTabsToGroup,
  moveTabGroup,
  openOptionsPage,
  openSidebarPage,
  openTabGroup,
  openWelcomePage,
  resetBrowserState,
  runTabSearch,
  setConfig,
  setHighlightedTabIds,
  setTabActive,
  setWindowTabGroupsState,
} from "./integrations/index.mjs"

function onError( error ) {
  console.error( error )
}

const debug = createDebug( "tabulate:background" )

// Need to add this handler syncronously to trigger on install
browser.runtime.onInstalled.addListener( function handleInstalled( { reason } ) {
  debug( "runtime.onInstalled", reason )
  switch( reason ) {
    case "install":
      openWelcomePage()
      break
    case "update":
      // @todo open release notes?
      // @todo should be config settings
      break
    case "browser_update":
      // @todo update features
      break
    case "shared_module_update":
      break
  }
})

browser.commands.onCommand.addListener( function handleCommand( command ) {
  debug( "handleCommand", command )
  if( command === "toggle-feature-sidebar" ) {
    if( browser.sidebarAction.toggle ) {
      browser.sidebarAction.toggle()
    } else {
      browser.sidebarAction.isOpen()
        .then( is_open => {
          if( is_open ) {
            browser.sidebarAction.close()
          } else {
            browser.sidebarAction.open()
          }
        })
    }
  }
})

const store_promise = loadBrowserState()
  .then( browser_state => {
    const { window_tab_groups_map } = browser_state
    const store = createStore( App, init( null, browser_state ) )

    window.event_handler = bindBrowserEvents( browser, browser_state, store )

    store.subscribe( () => {
      const state = store.getState()

      for( let i = 0; i < state.windows.length; i++ ) {
        let saved_tab_groups_state = window_tab_groups_map.get( state.windows[ i ].id )
        let new_tab_groups_state = getTabGroupsPersistState( state.windows[ i ] )
        if( JSON.stringify( saved_tab_groups_state ) !== JSON.stringify( new_tab_groups_state ) ) {
          // Write state to map cache and session
          window_tab_groups_map.set( state.windows[ i ].id, new_tab_groups_state )
          setWindowTabGroupsState( state.windows[ i ].id, new_tab_groups_state )
        }
      }
    })

    return store
  }).catch( err => {
    onError( err )
    return Promise.reject( err )
  })

/**
 * Load the store and browser_state to dispatch init with fresh data
 */
window.reloadState = () => {
  debug( "reloadState" )
  return Promise.all( [ window.getStore(), loadBrowserState() ] )
    .then( ( [ store, browser_state ] ) => {
      if( debug.enabled ) {
        debug( "browser_state", JSON.stringify( browser_state ) )
      }
      store.dispatch( initAction( browser_state ) )
    })
}

window.getStore = function() {
  return store_promise
}

// Proxy public methods from integrations to reduce duplication in app js
// @todo standardize naming
window.setHighlightedTabIds = setHighlightedTabIds
window.moveTabsToGroup = moveTabsToGroup
window.moveTabGroup = moveTabGroup
window.closeTab = closeTab
window.muteTab = muteTab
window.unmuteTab = unmuteTab
window.createGroup = createGroup
window.closeTabGroup = closeTabGroup
window.muteTabGroup = muteTabGroup
window.unmuteTabGroup = unmuteTabGroup
window.getMessage = getMessage
window.openOptionsPage = openOptionsPage
window.openSidebarPage = openSidebarPage
window.openTabGroup = openTabGroup
window.resetBrowserState = resetBrowserState
window.runTabSearch = runTabSearch
window.setConfig = setConfig
window.setTabActive = setTabActive
