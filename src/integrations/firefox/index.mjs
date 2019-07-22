import {
  createDebug
} from "../../helpers.mjs"
import {
  moveTabsAction,
  activateGroupAction,
  createGroupAction,
  removeGroupAction,
  moveGroupAction,
  muteGroupAction,
  unmuteGroupAction,
} from "../../store/actions.mjs"
import {
  createTabGroup,
  default_config,
  findTabGroup,
  getNewTabGroupId,
  getTabMoveData,
  getWindow,
} from "../../store/helpers.mjs"

import {
  ignorePendingMove,
} from "./event-handlers.mjs"
import {
  TAB_GROUP_ID_KEY,
  getTabGroupId,
  setTabGroupId,
} from "./helpers.mjs"

const debug = createDebug( "tabulate:integrations" )
export const LOCAL_CONFIG_KEY = "config"
export const SYNC_CONFIG_KEY = "config"
export const WINDOW_TAB_GROUPS_KEY = "tab_groups"
export const TAB_PREVIEW_IMAGE_KEY = "preview_image"

export { runTabSearch } from "./search.mjs"

const EMPTY = {}

// LOCALIZATION

/**
 * Get a localized version of the message
 * @param message_name Key in the localizations file
 * @param substitutions
 */
export function getMessage( message_name, substitutions ) {
  return browser.i18n.getMessage( message_name, substitutions )
}

// BROWSER STATE

/**
 * Load the state of the browser to structure for reducers/init
 */
export async function loadBrowserState() {
  const window_ids = []

  const browser_config = getBrowserConfig()

  const [ browser_tabs, theme, contextual_identities ] = await Promise.all([
    browser.tabs.query( EMPTY ),
    // theme.getCurrent is available in firefox 58+
    browser.theme && browser.theme.getCurrent ? browser.theme.getCurrent().then( theme => theme || {} ) : {},
    browser.contextualIdentities.query( EMPTY ).then( contextual_identities => contextual_identities || [], console.error )
  ])

  const browser_tab_group_ids = []
  const browser_tab_preview_images = []

  const browser_window_tab_groups = []
  browser_tabs.forEach( browser_tab => {
    browser_tab_group_ids.push( getTabGroupId( browser_tab.id ) )
    browser_tab_preview_images.push( getTabPreviewState( browser_tab.id ) )
    if( window_ids.indexOf( browser_tab.windowId ) === -1 ) {
      window_ids.push( browser_tab.windowId )
      browser_window_tab_groups.push( browser.sessions.getWindowValue( browser_tab.windowId, WINDOW_TAB_GROUPS_KEY ) )
    }
  })

  const [ tab_group_ids, tab_preview_images, window_tab_groups, tabhide_enabled ] = await Promise.all( [
    Promise.all( browser_tab_group_ids ),
    Promise.all( browser_tab_preview_images ),
    Promise.all( browser_window_tab_groups ),
    isTabHideEnabled( browser_tabs )
  ] )

  const window_tab_groups_map = new Map()
  for( let i = 0; i < window_ids.length; i++ ) {
    window_tab_groups_map.set( window_ids[ i ], window_tab_groups[ i ] )
  }
  for( let i = 0; i < browser_tabs.length; i++ ) {
    browser_tabs[ i ].session = {
      tab_group_id: tab_group_ids[ i ],
      preview_image: tab_preview_images[ i ],
    }
  }

  // This is the same structure from reducers.init
  return {
    browser_tabs,
    config: await browser_config,
    contextual_identities,
    features: {
      contextual_identities: {
        enabled: isContextualIdentitiesEnabled( browser_tabs )
      },
      tab_succession: {
        enabled: browser.tabs.moveInSuccession != null
      },
      tabhide: {
        enabled: tabhide_enabled
      },
    },
    theme,
    window_tab_groups_map,
  }
}

export function isContextualIdentitiesEnabled( browser_tabs ) {
  return browser_tabs.some( browser_tab => browser_tab.cookieStoreId != null && browser_tab.cookieStoreId !== "firefox-default" )
}

export function isTabHideEnabled( browser_tabs ) {
  const browser_tab = browser_tabs.find( browser_tab => browser_tab.active )
  return browser.tabs.hide( [ browser_tab.id ] )
    .then(
      () => {
        // @todo show again
        return true
      },
      ( error ) => {
        if( error.fileName === "chrome://browser/content/ext-tabs.js" && error.lineNumber === 0 ) {
          debug( "detected tabhide disabled", error )
          return false
        }
        return true
      }
    )
}

/**
 * Map the browsers tab representation to the one stored on the state object
 * @param browser_tab The browser representation for a tab
 * @returns The tab representation that will be stored in the state
 */
export function getTabState( browser_tab ) {
  const tab = {
    id: browser_tab.id,
    title: browser_tab.title,
    status: browser_tab.status,
    url: browser_tab.url,
    icon_url: browser_tab.favIconUrl,
    preview_image: {
      width: browser_tab.width,
      height: browser_tab.height,
    },
    // @todo last_accessed
    // @todo discarded
    // @todo highlighted?
  }

  if( browser_tab.hasOwnProperty( "audible" ) && browser_tab.audible ) {
    tab.audible = true
  }

  if( browser_tab.mutedInfo.muted ) {
    tab.muted = true
  }

  // @todo store ancestry?
  if( browser_tab.openerTabId ) {
    tab.opener_tab_id = browser_tab.openerTabId
  }

  if( browser_tab.cookieStoreId ) {
    tab.context_id = browser_tab.cookieStoreId
  }

  return tab
}

/**
 * Save value to the window session
 */
export function setWindowTabGroupsState( window_id, tab_groups_state ) {
  return browser.sessions.setWindowValue( window_id, WINDOW_TAB_GROUPS_KEY, tab_groups_state )
}

/**
 * Fetch the preview image for a tab from session storage
 */
function getTabPreviewState( tab_id ) {
  return browser.sessions.getTabValue( tab_id, TAB_PREVIEW_IMAGE_KEY )
}

/**
 * Save the tab preview image and details to the
 */
function setTabPreviewState( tab_id, preview_image ) {
  return browser.sessions.setTabValue( tab_id, TAB_PREVIEW_IMAGE_KEY, preview_image )
}

async function getBrowserConfig() {
  const config = { ...default_config }

  if( typeof( browser.storage ) != "undefined" ) {
    const local_config = await getLocalConfig()
    Object.assign( config, local_config )

    // @todo check local config to see if sync is enabled
    if( typeof( browser.storage.sync ) != "undefined" ) {
      const sync_config = await getSyncConfig()
      Object.assign( config, sync_config )
    }
  }

  return config
}

/**
 * Load the config values
 */
function getLocalConfig() {
  return browser.storage.local.get( LOCAL_CONFIG_KEY )
    .then( local_storage => local_storage[ LOCAL_CONFIG_KEY ] || {} )
}

function getSyncConfig() {
  return browser.storage.sync.get( SYNC_CONFIG_KEY )
    .then( sync_storage => sync_storage[ SYNC_CONFIG_KEY ] || {} )
}

/**
 * Set the value for a key in the config
 * @todo should allow multiple key/value pairs
 * @todo is there a better async way of doing this?
 */
export async function setConfig( key, value ) {
  const config = await getLocalConfig()
  if( key === "use_sync_config" && value ) {
    // Pull value from remote and enable sync
    const sync_config = await getSyncConfig()
    Object.assign( config, sync_config )
  }
  config[ key ] = value
  const local_storage = {}
  local_storage[ LOCAL_CONFIG_KEY ] = config
  await browser.storage.local.set( local_storage )
  if( config.use_sync_config ) {
    const { use_sync_config, ...sync_config } = config
    const sync_storage = {}
    sync_storage[ SYNC_CONFIG_KEY ] = sync_config
    await browser.storage.sync.set( sync_storage )
  }
}

function resetWindowState( window ) {
  return browser.sessions.removeWindowValue( window.id, WINDOW_TAB_GROUPS_KEY )
}

function resetTabState( tab ) {
  return Promise.all([
    browser.sessions.removeTabValue( tab.id, TAB_GROUP_ID_KEY ),
    browser.sessions.removeTabValue( tab.id, TAB_PREVIEW_IMAGE_KEY ),
  ])
}

function moveBrowserTabs( tab_ids, move_properties ) {
  ignorePendingMove( tab_ids )
  debug(`browser.tabs.move( ${ JSON.stringify( tab_ids ) }, ${ JSON.stringify( move_properties ) } )`)
  return browser.tabs.move( tab_ids, move_properties )
}

/**
 * Remove all values stored in the browser
 * @todo should this return a promise?
 */
export function resetBrowserState( store ) {
  const state = store.getState()

  state.windows.forEach( window => {
    resetWindowState( window )

    window.tab_groups.forEach( tab_group => {
      tab_group.tabs.forEach( resetTabState )
    })
  })

  browser.storage.local.clear()
}

// NAVIGATION

/**
 * Navigate to the options page
 */
export function openOptionsPage() {
  browser.runtime.openOptionsPage()
}

export function openSidebarPage() {
  const url = browser.extension.getURL( "sidebar.html" )

  browser.tabs.create( { url } )
    .then( () => {
      // We don't want to sync this URL ever nor clutter the users history
      if( browser.history != null ) {
        browser.history.deleteUrl( { url } )
      }
    })
}

/** Open the extension tab groups page in new tab */
export function openTabGroupsPage() {
  // Using sidebar for now
  // browser.sidebarAction.open()
  //   .then(
  //     () => {
  //       browser.sidebarAction.setPanel( { panel: browser.extension.getURL( "sidebar.html" ) } )
  //       window.close()
  //     }
  //   )

  const url = browser.extension.getURL( "sidebar.html" )

  debug( "browser.tabs.create", { url } )
  browser.tabs.create( { url } )
    .then( () => {
      // We don't want to sync this URL ever nor clutter the users history
      if( browser.history != null ) {
        browser.history.deleteUrl( { url } )
      }
    })
}

/** Open the onboarding page in a new tab */
export function openWelcomePage() {
  const url = "https://tabulate.app/welcome"

  debug( "browser.tabs.create", { url } )
  browser.tabs.create( { url } )
    .then( () => {
      // We don't want to sync this URL ever nor clutter the users history
      if( browser.history != null ) {
        browser.history.deleteUrl( { url } )
      }
    })
}

/** Open a given tab group */
export function openTabGroup( store, window_id, target_tab_group_id ) {
  const state0 = store.getState()
  const window0 = getWindow( state0, window_id )
  const target_tab_group = window0.tab_groups.find( tab_group => tab_group.id === target_tab_group_id )
  if( ! target_tab_group ) {
    // @todo error
    console.error( "Attempt to open tab group that doesn't exist", target_tab_group_id )
    return
  }

  const is_pinned_tab_active = window0.tab_groups[ 0 ].tabs.find( tab => tab.id === window.active_tab_id )
  if( is_pinned_tab_active ) {
    // Change active group without changing active tab
    store.dispatch( activateGroupAction( target_tab_group_id, window_id ) )
    return
  }

  if( window0.search && window0.search.matched_tab_ids ) {
    // Switching group while search active opens first match in group
    const tab = target_tab_group.tabs.find( tab => window0.search.matched_tab_ids.includes( tab.id ) )
    if( tab ) {
      setTabActive( window.store, window_id, tab.id )
      return
    }
  }

  if( target_tab_group.tabs.length === 0 ) {
    // If switching to empty group, create new tab
    let index = 0
    for( const tab_group of window0.tab_groups ) {
      if( tab_group.id === target_tab_group.id ) {
        break
      }
      index += tab_group.tabs_count
    }

    return browser.tabs.create({
      active: true,
      windowId: window_id,
      index,
    })
      .then( browser_tab => {
        setTabGroupId( browser_tab.id, target_tab_group_id )
      })
  }

  if( target_tab_group.active_tab_id ) {
    setTabActive( window.store, window_id, target_tab_group.active_tab_id )
  }
}

// TABS

/**
 * Activate the given tab in the window
 * @todo should this include the window_id?
 */
export function setTabActive( store, window_id, tab_id ) {
  return browser.tabs.update( tab_id, { active: true } )
}

/**
 * Close the given tab
 */
export function closeTab( store, tab_id ) {
  debug( "browser.tabs.remove", [ tab_id ] )
  return browser.tabs.remove( [ tab_id ] )
}

export function muteTab( store, window_id, tab_id ) {
  const change_info = { muted: true }
  debug( "browser.tabs.update", tab_id, change_info )
  return browser.tabs.update( tab_id, change_info )
}

export function unmuteTab( store, window_id, tab_id ) {
  const change_info = { muted: false }
  debug( "browser.tabs.update", tab_id, change_info )
  return browser.tabs.update( tab_id, change_info )
}

export function createGroup( store, window_id, source_data ) {
  debug( `background.createGroup( ${ window_id } )`, source_data )
  const state = store.getState()
  const tab_group = createTabGroup( getNewTabGroupId( state ), [] )

  if( source_data ) {
    // If the source is a bookmark folder, we can use the title
    if( source_data.title != null ) {
      tab_group.title = source_data.title
    }
    // @todo call process to activate the new group?  maybe in caller
    return moveTabsToGroup( store, source_data, { window_id, tab_group } )
      .then( () => tab_group )
  }

  store.dispatch( createGroupAction( tab_group, window_id ) )

  return Promise.resolve( tab_group )

  /*
  return browser.tabs.create({ windowId: window_id })
    .then( browser_tab => {
      source_data = {
        window_id,
        tab_ids: [ browser_tab.id ]
      }
      // @todo call process to activate the new group?  maybe in caller
      return moveTabsToGroup( store, source_data, target_data )
    })
    .then( () => tab_group )
  */
}

export async function closeTabGroup( store, window_id, tab_group_id ) {
  debug( "closeTabGroup", window_id, tab_group_id )
  const state = store.getState()
  for( let window of state.windows ) {
    if( window.id !== window_id ) {
      continue
    }
    const tab_group = window.tab_groups.find( tab_group => tab_group.id === tab_group_id )
    if( tab_group ) {
      const tab_ids = tab_group.tabs.map( tab => tab.id )
      await browser.tabs.remove( tab_ids )
      return store.dispatch( removeGroupAction( tab_group_id, window.id ) )
    }
  }
  console.warn( "closeTabGroup: group not found" )
  // @todo return empty promise
}

export function muteTabGroup( store, window_id, tab_group_id ) {
  const state = store.getState()
  const tab_group = findTabGroup( state, window_id, tab_group_id )
  if( ! tab_group ) {
    // @todo error
    return
  }
  const change_info = { muted: true }
  debug( "browser.tabs.update", change_info )
  return Promise.all(
    tab_group.tabs
      .filter( tab => tab.audible && ! tab.muted )
      .map( tab => browser.tabs.update( tab.id, change_info ) )
  ).then( () => {
    store.dispatch( muteGroupAction( tab_group_id, window_id ) )
  })
}

export function unmuteTabGroup( store, window_id, tab_group_id ) {
  const state = store.getState()
  const tab_group = findTabGroup( state, window_id, tab_group_id )
  if( ! tab_group ) {
    // @todo error
    return
  }
  const change_info = { muted: false }
  debug( "browser.tabs.update", change_info )
  return Promise.all(
    tab_group.tabs
      .filter( tab => tab.hasOwnProperty( "muted" ) )
      .map( tab => browser.tabs.update( tab.id, change_info ) )
  ).then( () => {
    store.dispatch( unmuteGroupAction( tab_group_id, window_id ) )
  })
}

export function setHighlightedTabIds( store, window_id, tab_ids ) {
  const state0 = store.getState()
  const target_window = state0.windows.find( window => window.id === window_id )
  if( ! target_window ) {
    // @todo error
    return Promise.reject()
  }
  const tab_indices = []
  let tab_index = 0
  for( const tab_group of target_window.tab_groups ) {
    for( const tab of tab_group.tabs ) {
      if( tab_ids.includes( tab.id ) ) {
        // When calling the highlight API, will update active tab if another tab is first :(
        if( tab_group.active_tab_id === tab.id ) {
          tab_indices.unshift( tab_index )
        } else {
          tab_indices.push( tab_index )
        }
      }
      tab_index++
    }
  }
  debug( "browser.tabs.highlight", { windowId: window_id, tabs: tab_indices } )
  browser.tabs.highlight( { windowId: window_id, tabs: tab_indices } )
}

/**
 * Move tabs to a different group
 * @param store
 * @param source_data Object with properties window_id and tab_ids
 *   window_id
 *   tab_ids
 * @param target_data
 */
export function moveTabsToGroup( store, source_data, target_data ) {
  debug( "background.moveTabsToGroup", source_data, target_data )
  const updates = []

  if( source_data.links != null ) {
    // @todo can skip dispatching create for tabs to optimize performance

    const state = store.getState()
    const move_data = getTabMoveData( state, source_data, target_data )
    if( ! move_data ) {
      console.error('error')
      return
    }

    let active = true
    updates.push( ...source_data.links.map( ( link, index_offset ) => {
      // @todo filter invalid URLs to prevent errors, add warning
      const create_properties = {
        windowId: move_data.target_data.window_id,
        url: link.url,
        index: move_data.target_data.index + index_offset,
        active
      }
      active = false
      debug(`browser.tabs.create( ${ JSON.stringify( create_properties ) } )`)
      return browser.tabs.create( create_properties )
    }))
  }

  return Promise.all( updates )
    .then( browser_tabs => {
      debug( "browser_tabs", browser_tabs )

      if( browser_tabs.length > 0 ) {
        source_data = {
          window_id: target_data.window_id,
          tab_ids: browser_tabs.map( browser_tab => browser_tab.id ),
          tabs: browser_tabs.map( getTabState ),
        }
      }

      const state = store.getState()
      const move_data = getTabMoveData( state, source_data, target_data )
      if( ! move_data ) {
        console.error('error')
        // @todo wait and try again
        return
      }

      source_data = move_data.source_data
      target_data = move_data.target_data

      // @todo if this was spawned with URLs, update source_data with new
      store.dispatch( moveTabsAction( source_data, target_data ) )

      const { tab_ids } = source_data
      if( target_data.tab_group_id ) {
        tab_ids.forEach( ( tab_id ) => {
          updates.push( setTabGroupId( tab_id, target_data.tab_group_id ) )
        })
      }

      if( target_data.index != null ) {
        const move_properties = {
          index: target_data.index
        }

        if( source_data.window_id !== target_data.window_id ) {
          move_properties.windowId = target_data.window_id
        }
        ignorePendingMove( tab_ids )
        debug( "browser.tabs.move", tab_ids, move_properties )
        updates.push( browser.tabs.move( tab_ids, move_properties ) )
      }

      return Promise.all( updates )
    })
}

/**
 * Move a tab group to a another window or index
 * @param store
 * @param source_data
 *   window_id
 *   tab_group_id
 * @param target_data
 *   window_id
 *   tab_group_index
 *   window_new
 */
export async function moveTabGroup( store, source_data, target_data ) {
  debug( "moveTabGroup", source_data, target_data )

  const state0 = store.getState()
  const source_window = state0.windows.find( window => window.id === source_data.window_id )
  if( ! source_window ) {
    // @todo error
    return Promise.reject()
  }
  const source_tab_group_index = source_window.tab_groups.findIndex( tab_group => tab_group.id === source_data.tab_group_id )
  const source_tab_group = source_window.tab_groups[ source_tab_group_index ]
  const source_tab_ids = source_tab_group.tabs.map( tab => tab.id )

  if( target_data.window_new ) {
    // @todo can optimize this branch
    if( source_tab_ids.length === 0 ) {
      // @todo need better handling for this error
      return Promise.reject()
    }

    // @todo prevent temp state by seeding with tab from the source_tab_ids
    const new_window = await browser.windows.create( {} )
    await moveTabGroup( store, source_data, { window_id: new_window.id, tab_group_index: 1 } )

    const state1 = store.getState()

    const target_window = state1.windows.find( window => window.id === new_window.id )
    if( ! target_window ) {
      // @todo error
      return Promise.reject()
    }

    // Remove the temporary group created by the window create process
    await closeTabGroup( store, new_window.id, target_window.tab_groups[ 2 ].id )
  } else {
    // Dispatch the update first to prevent move event handlers from getting confused
    store.dispatch( moveGroupAction( source_data, target_data ) )

    if( source_tab_ids.length === 0 ) {
      return Promise.resolve()
    }

    const state1 = store.getState()

    const target_window = state1.windows.find( window => window.id === target_data.window_id )
    if( ! target_window ) {
      // @todo error
      return Promise.reject()
    }

    let index_offset = 0
    const tab_groups_length = target_window.tab_groups.length
    for( let tab_group_index = 0; tab_group_index < tab_groups_length; tab_group_index++ ) {
      const tab_group = target_window.tab_groups[ tab_group_index ]

      // If this is the new index of the tab group, move tabs here
      if( tab_group.id === source_tab_group.id ) {
        const move_properties = {
          index: index_offset
        }
        if( source_data.window_id !== target_data.window_id ) {
          move_properties.windowId = target_data.window_id
        }
        return moveBrowserTabs( source_tab_ids, move_properties )
      }
      // If move is local to window, and new index is after old index, move other tabs forward to prevent browser issue
      if( source_data.window_id === target_data.window_id && tab_group_index === source_tab_group_index ) {
        const tab_ids = []
        for( ; tab_group_index < tab_groups_length && target_window.tab_groups[ tab_group_index ].id !== source_tab_group.id; tab_group_index++ ) {
          tab_ids.push( ...target_window.tab_groups[ tab_group_index ].tabs.map( tab => tab.id ) )
        }
        if( tab_ids.length === 0 ) {
          return Promise.resolve()
        }
        return moveBrowserTabs( tab_ids, { index: index_offset } )
      }
      index_offset += tab_group.tabs_count
    }
    return Promise.reject()
  }
}
