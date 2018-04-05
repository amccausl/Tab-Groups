import {
  moveTabsAction,
  createGroupAction,
  removeGroupAction,
  muteGroupAction,
  unmuteGroupAction,
  startSearchAction,
  finishSearchAction,
  resetSearchAction,
} from '../../store/actions.mjs'
import {
  createTabGroup,
  default_config,
  findTab,
  findTabGroup,
  getNewTabGroupId,
  getTabMoveData,
} from '../../store/helpers.mjs'

export const LOCAL_CONFIG_KEY = 'config'
export const WINDOW_TAB_GROUPS_KEY = 'tab_groups'
export const TAB_GROUP_ID_KEY = 'group_id'
export const TAB_PREVIEW_IMAGE_KEY = 'preview_image'

const EMPTY = {}

const TAB_GROUP_ID_MAP = new Map()

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
      config = storage[ LOCAL_CONFIG_KEY ] || default_config
      contextual_identities = _contextual_identities || []
      theme = _theme || {}

      const browser_tab_group_ids = []
      const browser_tab_preview_images = []

      let window_tab_groups = []
      browser_tabs.forEach( tab => {
        browser_tab_group_ids.push( getTabGroupId( tab.id ) )
        browser_tab_preview_images.push( getTabPreviewState( tab.id ) )
        if( window_ids.indexOf( tab.windowId ) === -1 ) {
          window_ids.push( tab.windowId )
          window_tab_groups.push( browser.sessions.getWindowValue( tab.windowId, WINDOW_TAB_GROUPS_KEY ) )
        }
      })

      return Promise.all( [ Promise.all( browser_tab_group_ids ), Promise.all( browser_tab_preview_images ), Promise.all( window_tab_groups ) ] )
    }
  ).then(
    ( [ tab_group_ids, tab_preview_images, window_tab_groups ] ) => {
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
      return { browser_tabs, config, contextual_identities, theme, window_tab_groups_map }
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
  return browser.sessions.removeTabValue( tab.id, TAB_GROUP_ID_KEY )
  return browser.sessions.removeTabValue( tab.id, TAB_PREVIEW_IMAGE_KEY )
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
  const state = store.getState()
  const tab_group = createTabGroup( getNewTabGroupId( state ), [] )
  const target_data = {
    window_id,
    tab_group
  }

  if( source_data ) {
    // @todo queue move?
    moveTabsToGroup( store, source_data, target_data )
    // @todo call process to activate the new group?  maybe in caller
    return Promise.resolve( tab_group )
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
 * @returns move_data
 *   source_data
 *     window_id
 *     tab_ids
 *     tabs
 *   target_data
 *     window_id
 */
export function moveTabsToGroup( store, source_data, target_data ) {
  console.info('moveTabsToGroup', source_data, target_data)
  let state = store.getState()
  const updates = []
  const move_data = getTabMoveData( state, source_data, target_data )

  if( ! move_data ) {
    console.info('error')
    return
  }

  source_data = move_data.source_data
  target_data = move_data.target_data
  const { tab_ids } = source_data

  store.dispatch( moveTabsAction( source_data, target_data ) )

  // Reload the state
  state = store.getState()

  if( target_data.tab_group_id ) {
    tab_ids.forEach( ( tab_id ) => {
      console.info(`browser.sessions.setTabValue( ${ tab_id }, ${ TAB_GROUP_ID_KEY }, ${ JSON.stringify( target_data.tab_group_id ) } )`)
      updates.push( browser.sessions.setTabValue( tab_id, TAB_GROUP_ID_KEY, target_data.tab_group_id ) )
    })
  }

  if( target_data.index != null ) {
    const move_properties = {
      index: target_data.index
    }

    if( source_data.window_id !== target_data.window_id ) {
      move_properties.windowId = target_data.window_id
    }
    console.info('browser.tabs.move', tab_ids, move_properties)
    updates.push( browser.tabs.move( tab_ids, move_properties ) )
  }

  return Promise.all( updates )
}

/**
 * Run a text search for tabs in a window and dispatch start and finish to the store
 * @param store
 * @param window_id
 * @param search_text
 */
export function runTabSearch( store, window_id, search_text ) {
  console.info('runSearch', window_id, search_text)
  const state = store.getState()
  const window = state.windows.find( _window => _window.id === window_id )

  if( ! window ) {
    // @todo error
    return
  }

  if( ! search_text ) {
    store.dispatch( resetSearchAction( window_id ) )
    return
  }

  // Update the store with the search
  store.dispatch( startSearchAction( window_id, search_text ) )

  const search_tabs = []
  const matching_tab_ids = []

  window.tab_groups.forEach( tab_group => {
    tab_group.tabs.forEach( tab => {
      search_tabs.push( browser.find.find( search_text, { tabId: tab.id } )
        .then(
          ( { count } ) => {
            if( count > 0 ) {
              matching_tab_ids.push( tab.id )
            }
          },
          ( err ) => {
            // @todo handle error
          }
        )
      )
    })
  })

  return Promise.all( search_tabs )
    .then(
      () => {
        console.info('finished', search_text, matching_tab_ids)
        store.dispatch( finishSearchAction( window_id, search_text, matching_tab_ids ) )
      }
    )
}
