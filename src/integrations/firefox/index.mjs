import {
  moveTabsAction,
  createGroupAction,
  removeGroupAction,
  moveGroupAction,
  muteGroupAction,
  unmuteGroupAction,
  startSearchAction,
  finishSearchAction,
  resetSearchAction,
} from '../../store/actions.mjs'
import {
  createTabGroup,
  default_config,
  findTabGroup,
  getNewTabGroupId,
  getTabMoveData,
  getWindow,
} from '../../store/helpers.mjs'

import {
  ignorePendingMove,
} from "./event-handlers.mjs"

export const LOCAL_CONFIG_KEY = 'config'
export const WINDOW_TAB_GROUPS_KEY = 'tab_groups'
export const TAB_GROUP_ID_KEY = 'group_id'
export const TAB_PREVIEW_IMAGE_KEY = 'preview_image'

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
export function loadBrowserState() {
  const window_ids = []
  let browser_tabs, config, contextual_identities, theme

  return Promise.all([
    browser.storage ? browser.storage.local.get( LOCAL_CONFIG_KEY ) : null,
    browser.tabs.query( EMPTY ),
    // theme.getCurrent is available in firefox 58+
    browser.theme && browser.theme.getCurrent ? browser.theme.getCurrent() : null,
    browser.contextualIdentities.query( EMPTY ).then( null, console.error )
  ]).then(
    ( [ storage, _browser_tabs, _theme, _contextual_identities ] ) => {
      browser_tabs = _browser_tabs
      config = storage[ LOCAL_CONFIG_KEY ] || {}
      for( const [ key, value ] of Object.entries( default_config ) ) {
        if( ! config.hasOwnProperty( key ) ) {
          config[ key ] = value
        }
      }

      contextual_identities = _contextual_identities || []
      theme = _theme || {}

      const browser_tab_group_ids = []
      const browser_tab_preview_images = []

      let window_tab_groups = []
      browser_tabs.forEach( browser_tab => {
        browser_tab_group_ids.push( getTabGroupId( browser_tab.id ) )
        browser_tab_preview_images.push( getTabPreviewState( browser_tab.id ) )
        if( window_ids.indexOf( browser_tab.windowId ) === -1 ) {
          window_ids.push( browser_tab.windowId )
          window_tab_groups.push( browser.sessions.getWindowValue( browser_tab.windowId, WINDOW_TAB_GROUPS_KEY ) )
        }
      })

      return Promise.all( [ Promise.all( browser_tab_group_ids ), Promise.all( browser_tab_preview_images ), Promise.all( window_tab_groups ), isTabHideEnabled( browser_tabs ) ] )
    }
  ).then(
    ( [ tab_group_ids, tab_preview_images, window_tab_groups, tabhide_enabled ] ) => {
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

      const features = {
        contextual_identities: {
          enabled: isContextualIdentitiesEnabled( browser_tabs )
        },
        tabhide: {
          enabled: tabhide_enabled
        }
      }

      // This is the same structure from reducers.init
      return { browser_tabs, config, contextual_identities, features, theme, window_tab_groups_map }
    }
  )
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
          console.info('detected tabhide disabled', error)
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

  if( browser_tab.hasOwnProperty( 'audible' ) && browser_tab.audible ) {
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
 * @param window_id
 * @param tab_groups_state
 */
export function setWindowTabGroupsState( window_id, tab_groups_state ) {
  return browser.sessions.setWindowValue( window_id, WINDOW_TAB_GROUPS_KEY, tab_groups_state )
}

/**
 * Fetch the preview image for a tab from session storage
 * @param tab_id
 */
function getTabGroupId( tab_id ) {
  console.info(`browser.sessions.getTabValue( ${ tab_id }, ${ TAB_GROUP_ID_KEY } )`)
  return browser.sessions.getTabValue( tab_id, TAB_GROUP_ID_KEY )
}

/**
 * Save the tab preview image and details to the
 * @param tab_id
 * @param group_id
 */
function setTabGroupId( tab_id, group_id ) {
  console.info(`browser.sessions.setTabValue( ${ tab_id }, ${ TAB_GROUP_ID_KEY }, ${ group_id } )`)
  return browser.sessions.setTabValue( tab_id, TAB_GROUP_ID_KEY, group_id )
}

/**
 * Fetch the preview image for a tab from session storage
 * @param tab_id
 */
function getTabPreviewState( tab_id ) {
  return browser.sessions.getTabValue( tab_id, TAB_PREVIEW_IMAGE_KEY )
}

/**
 * Save the tab preview image and details to the
 * @param tab_id
 * @param preview_image
 */
function setTabPreviewState( tab_id, preview_image ) {
  return browser.sessions.setTabValue( tab_id, TAB_PREVIEW_IMAGE_KEY, preview_image )
}

/**
 * Load the config values
 */
function getConfig() {
  return browser.storage.local.get( LOCAL_CONFIG_KEY )
    .then( local_storage => local_storage[ LOCAL_CONFIG_KEY ] || {} )
}

/**
 * Set the value for a key in the config
 * @param key
 * @param value
 * @todo should allow multiple key/value pairs
 * @todo is there a better async way of doing this?
 */
export function setConfig( key, value ) {
  return getConfig()
    .then(
      ( config ) => {
        config[ key ] = value
        const local_storage = {}
        local_storage[ LOCAL_CONFIG_KEY ] = config
        return browser.storage.local.set( local_storage )
      }
    )
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
  console.info(`browser.tabs.move( ${ JSON.stringify( tab_ids ) }, ${ JSON.stringify( move_properties ) } )`)
  return browser.tabs.move( tab_ids, move_properties )
}

/**
 * Remove all values stored in the browser
 * @param store
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

  browser.tabs.create({ url })
    .then( () => {
      // We don't want to sync this URL ever nor clutter the users history
      if( browser.history != null ) {
        browser.history.deleteUrl({ url })
      }
    })
}

/**
 * Open the extension tab groups page in new tab
 */
export function openTabGroupsPage() {
  // Using sidebar for now
  // browser.sidebarAction.open()
  //   .then(
  //     () => {
  //       browser.sidebarAction.setPanel( { panel: browser.extension.getURL( "sidebar.html" ) } )
  //       window.close()
  //     }
  //   )

  const url = browser.extension.getURL( "tab-groups.html" )

  console.info('browser.tabs.create', { url })
  browser.tabs.create({ url })
    .then( () => {
      // We don't want to sync this URL ever nor clutter the users history
      browser.history.deleteUrl({ url })
    })
}

// TABS

/**
 * Activate the given tab in the window
 * @param tab_id
 * @todo should this include the window_id?
 */
export function setTabActive( store, window_id, tab_id ) {
  return browser.tabs.update( tab_id, { active: true } )
}

/**
 * Close the given tab
 * @param tab_id
 */
export function closeTab( store, tab_id ) {
  console.info('browser.tabs.remove', [ tab_id ])
  return browser.tabs.remove( [ tab_id ] )
}

export function muteTab( store, window_id, tab_id ) {
  const change_info = { muted: true }
  console.info('browser.tabs.update', tab_id, change_info)
  return browser.tabs.update( tab_id, change_info )
}

export function unmuteTab( store, window_id, tab_id ) {
  const change_info = { muted: false }
  console.info('browser.tabs.update', tab_id, change_info)
  return browser.tabs.update( tab_id, change_info )
}

export function createGroup( store, window_id, source_data ) {
  console.info(`background.createGroup( ${ window_id } )`, source_data)
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

export function closeTabGroup( store, window_id, tab_group_id ) {
  const state = store.getState()
  for( let window of state.windows ) {
    if( window.id !== window_id ) {
      continue
    }
    const tab_group = window.tab_groups.find( tab_group => tab_group.id === tab_group_id )
    if( tab_group ) {
      const tab_ids = tab_group.tabs.map( tab => tab.id )
      return browser.tabs.remove( tab_ids )
        .then( () => {
          store.dispatch( removeGroupAction( tab_group_id, window.id ) )
        })
    }
  }
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
  console.info('browser.tabs.update', change_info)
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
  console.info('browser.tabs.update', change_info)
  return Promise.all(
    tab_group.tabs
      .filter( tab => tab.hasOwnProperty( 'muted' ) )
      .map( tab => browser.tabs.update( tab.id, change_info ) )
  ).then( () => {
    store.dispatch( unmuteGroupAction( tab_group_id, window_id ) )
  })
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
  console.info('background.moveTabsToGroup', source_data, target_data)
  const updates = []

  if( source_data.links != null ) {
    // @todo can skip dispatching create for tabs to optimize performance

    const state = store.getState()
    const move_data = getTabMoveData( state, source_data, target_data )
    if( ! move_data ) {
      console.info('error')
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
      console.info(`browser.tabs.create( ${ JSON.stringify( create_properties ) } )`)
      return browser.tabs.create( create_properties )
    }))
  }

  return Promise.all( updates )
    .then( browser_tabs => {
      console.info('browser_tabs', browser_tabs)

      if( browser_tabs.length > 0 ) {
        source_data = {
          window_id: target_data.window_id,
          tab_ids: browser_tabs.map( browser_tab => browser_tab.id )
        }
      }

      const state = store.getState()
      const move_data = getTabMoveData( state, source_data, target_data )
      if( ! move_data ) {
        console.info('error')
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
        console.info('browser.tabs.move', tab_ids, move_properties)
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
 */
export function moveTabGroup( store, source_data, target_data ) {
  console.info('moveTabGroup', source_data, target_data)

  const state0 = store.getState()
  const source_window = state0.windows.find( window => window.id === source_data.window_id )
  if( ! source_window ) {
    // @todo error
    return Promise.reject()
  }
  const source_tab_group_index = source_window.tab_groups.findIndex( tab_group => tab_group.id === source_data.tab_group_id )
  const source_tab_group = source_window.tab_groups[ source_tab_group_index ]
  const source_tab_ids = source_tab_group.tabs.map( tab => tab.id )

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

/**
 * Run a text search for tabs in a window and dispatch start and finish to the store
 * @param store
 * @param window_id
 * @param search_text
 *
 * @todo consider storing window => search info map locally
 */
export function runTabSearch( store, window_id, search_text ) {
  console.info('runSearch', window_id, search_text)
  if( ! search_text ) {
    store.dispatch( resetSearchAction( window_id ) )
    return
  }

  // Update the store with the search
  store.dispatch( startSearchAction( window_id, search_text ) )

  let window = getWindow( store.getState(), window_id )
  if( ! window ) {
    // @todo error
    return
  }

  const { search } = window

  const matched_tab_ids = []
  const queued_tab_ids = [ ...( search.queued_tab_ids || [] ) ]

  const nextFind = () => {
    if( queued_tab_ids.length > 0 ) {
      window = getWindow( store.getState(), window_id )
      // Abort if search is no longer active
      if( window.search == null || window.search.text !== search.text ) {
        return Promise.reject()
      }
      const tab_id = queued_tab_ids.shift()
      // @todo skip tabs "about:addons", "about:debugging"
      console.info(`browser.find.find( "${ search.text }", { tabId: ${ tab_id } } )`)
      return browser.find.find( search.text, { tabId: tab_id } )
        .then(
          ( { count } ) => {
            if( count > 0 ) {
              matched_tab_ids.push( tab_id )
            }
          },
          ( err ) => {
            // @todo handling
            console.error('browser.find.find error', err, tab_id)
          }
        )
        .finally( nextFind )
    }
    return Promise.resolve()
  }

  return nextFind()
    .then( () => {
      store.dispatch( finishSearchAction( window_id, search_text, matched_tab_ids ) )
    })
}
