import {
  updateConfigAction,
  createContextualIdentityAction,
  updateContextualIdentityAction,
  removeContextualIdentityAction,
  updateFeaturesAction,
  updateThemeAction,
  addWindowAction,
  removeWindowAction,
  activateTabAction,
  addTabAction,
  removeTabAction,
  updateTabAction,
  // updateTabImageAction,
  highlightTabsAction,
  moveTabAction,
  attachTabAction,
} from "../../store/actions.mjs"
import {
  default_config,
  getCreateTabTarget,
} from "../../store/helpers.mjs"
import {
  getTabGroupId,
} from "./helpers.mjs"

// @todo pull to shared file
const LOCAL_CONFIG_KEY = "config"

const ignore_moves = []
export function ignorePendingMove( tab_ids ) {
  ignore_moves.push( ...tab_ids )
}

/**
 * Bind change events for the browser to dispatch operations on the store
 */
export function bindBrowserEvents( browser, browser_state, store ) {
  // @todo need way to turn off console
  const hide_tab_ids = new Set()
  const show_tab_ids = new Set()

  const queued_events = []
  let last_change = null
  const event_handlers = new Map([
    [ "sessions.onChanged", function onSessionChanged() {
      console.info('sessions.onChanged')
    }],
    [ "storage.onChanged", function onStorageChanged( store, changes, area ) {
      if( area === 'local' && changes[ LOCAL_CONFIG_KEY ] ) {
        const config = changes[ LOCAL_CONFIG_KEY ].newValue || {}
        for( let key of Object.keys( default_config ) ) {
          if( ! config.hasOwnProperty( key ) ) {
            config[ key ] = default_config[ key ]
          }
        }
        store.dispatch( updateConfigAction( config ) )
      }
    }],
    [ "windows.onCreated", function onWindowCreated( store, browser_window ) {
      if( browser_window.type === 'normal' ) {
        store.dispatch( addWindowAction( browser_window ) )
      }
    }],
    [ "windows.onRemoved", function onWindowRemoved( store, window_id ) {
      store.dispatch( removeWindowAction( window_id ) )
    }],
    [ "tabs.onCreated", async function onTabCreated( store, browser_tab ) {
      const state = store.getState()
      const tab_group_id = await getTabGroupId( browser_tab.id )
      if( tab_group_id != null ) {
        browser_tab.session = {
          tab_group_id: tab_group_id,
        }
      } else {
        const { index } = getCreateTabTarget( state, browser_tab )
        if( browser_tab.index !== index ) {
          console.info('browser.tabs.move', [ browser_tab.id ], { index })
          browser.tabs.move( [ browser_tab.id ], { index } )
        }
      }

      if( browser_tab.hidden ) {
        hide_tab_ids.add( browser_tab.id )
      } else {
        show_tab_ids.add( browser_tab.id )
      }

      if( browser_tab.cookieStoreId != null && browser_tab.cookieStoreId !== "firefox-default" && ! state.features.contextual_identities.enabled ) {
        store.dispatch( updateFeaturesAction( { contextual_identities: { enabled: true } } ) )
      }

      // @todo update succession if browser_tab.successorTabId is in different tab group
      return store.dispatch( addTabAction( browser_tab ) )
    }],
    [ "tabs.onUpdated", function onTabUpdated( store, tab_id, change_info, browser_tab ) {
      const state = store.getState()
      // If change_info.audible && tab_group.muted, mute tab
      if( change_info.hasOwnProperty( 'audible' ) ) {
        for( let window of state.windows ) {
          if( window.id !== browser_tab.windowId ) {
            continue
          }
          for( let tab_group of window.tab_groups ) {
            if( ! tab_group.tabs.some( tab => tab.id === tab_id ) ) {
              continue
            }
            if( change_info.audible && tab_group.muted ) {
              browser.tabs.update( tab_id, { muted: true } )
            }
            break
          }
          break
        }
      }
      // @todo should omit ignored properties and check if result is empty instead
      if( change_info.hasOwnProperty( "attention" ) ) {
        return
      }
      if( change_info.hasOwnProperty( "discarded" ) ) {
        return
      }
      if( change_info.hasOwnProperty( 'isArticle' ) ) {
        return
      }
      if( change_info.hasOwnProperty( 'sharingState' ) ) {
        return
      }
      const change_info_json = JSON.stringify( change_info )
      if( last_change && last_change.tab_id === tab_id && last_change.change_info_json === change_info_json ) {
        console.info(`onTabUpdated skipping duplicate change`)
        return
      }
      last_change = { tab_id, change_info_json }
      if( change_info.hasOwnProperty( 'hidden' ) ) {
        console.info(`onTabUpdated( tab_id=${ tab_id }, change_info=${ change_info_json } )`, browser_tab)
        if( change_info.hidden ) {
          hide_tab_ids.add( tab_id )
          show_tab_ids.delete( tab_id )
        } else {
          hide_tab_ids.delete( tab_id )
          show_tab_ids.add( tab_id )
        }
        if( ! state.features.tabhide.enabled ) {
          store.dispatch( updateFeaturesAction( { tabhide: { enabled: true } } ) )
        }
        return
      }
      console.info(`onTabUpdated( tab_id=${ tab_id }, change_info=${ change_info_json } )`, browser_tab)
      store.dispatch( updateTabAction( browser_tab, change_info ) )
    }],
    [ "tabs.onRemoved", function onTabRemoved( store, tab_id, { windowId, isWindowClosing } ) {
      hide_tab_ids.delete( tab_id )
      show_tab_ids.delete( tab_id )
      // @todo if this was the last tab in the group, activate the next group
      store.dispatch( removeTabAction( tab_id, windowId ) )
    }],
    [ "tabs.onMoved", function onTabMoved( store, tab_id, { windowId, fromIndex, toIndex } ) {
      const ignore_index = ignore_moves.indexOf( tab_id )
      if( ignore_index > -1 ) {
        ignore_moves.splice( ignore_index, 1 )
        console.info('ignoring')
      } else {
        store.dispatch( moveTabAction( tab_id, windowId, toIndex ) )
        // @todo update succession if required
      }
    }],
    [ "tabs.onAttached", function onTabAttached( store, tab_id, { newWindowId, newPosition } ) {
      store.dispatch( attachTabAction( tab_id, newWindowId, newPosition ) )
      // @todo update succession if required
    }],
    [ "tabs.onActivated", function onTabActivated( store, { tabId, windowId } ) {
      // @todo if previous tab.url == about:config, check features

      store.dispatch( activateTabAction( tabId, windowId ) )

      // Start background task to get preview image
      // NOTE: Not needed at the moment, disabled for now
      // browser.tabs.captureVisibleTab( windowId, TAB_PREVIEW_IMAGE_DETAILS )
      //   .then( preview_image_uri => {
      //     store.dispatch( updateTabImageAction( tabId, windowId, preview_image_uri ) )
      //     const tab = findTab( store.getState(), windowId, tabId )
      //     if( tab && tab.preview_image ) {
      //       setTabPreviewState( tab.id, tab.preview_image )
      //     }
      //   })
    }],
  ])

  let is_processing = false
  let is_paused = false
  function handleEvent( event_name ) {
    return async function( ...args ) {
      console.info( "handleEvent", event_name, args )
      if( ! event_handlers.has( event_name ) ) {
        console.warn( "no handler for event", event_name )
        return
      }
      queued_events.push( [ event_name, args ] )
      runQueuedEvents()
    }
  }

  async function runQueuedEvents() {
    if( is_processing || is_paused ) {
      return
    }
    is_processing = true
    while( queued_events.length > 0 ) {
      const [ queued_event_name, queued_args ] = queued_events.shift()
      console.info( "handleEvent running", queued_event_name, queued_args )
      try {
        await event_handlers.get( queued_event_name )( store, ...queued_args )
      } catch( ex ) {
        // @todo
        console.error( "handleEvent threw exception", ex )
      }
    }
    is_processing = false
  }

  if( browser_state.features.tabhide.enabled ) {
    for( const browser_tab of browser_state.browser_tabs ) {
      if( browser_tab.hidden ) {
        hide_tab_ids.add( browser_tab.id )
      } else {
        show_tab_ids.add( browser_tab.id )
      }
    }
  }

  // This would be required for integration with other extensions
  // browser.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {
  //   console.info('runtime.onMessage', message, sender, sendResponse)
  // })

  if( browser.contextualIdentities ) {
    event_handlers.set( "contextualIdentities.onCreated", function onContextualIdentityCreated( store, contextual_identity ) {
      store.dispatch( createContextualIdentityAction( contextual_identity ) )
    })
    event_handlers.set( "contextualIdentities.onUpdated", function onContextualIdentityUpdated( store, contextual_identity ) {
      store.dispatch( updateContextualIdentityAction( contextual_identity ) )
    })
    event_handlers.set( "contextualIdentities.onRemoved", function onContextualIdentityRemoved( store, contextual_identity ) {
      store.dispatch( removeContextualIdentityAction( contextual_identity ) )
    })
  }

  if( browser.tabs.onHighlighted != null ) {
    event_handlers.set( "tabs.onHighlighted", function onTabHighlighted( store, { windowId, tabIds } ) {
      store.dispatch( highlightTabsAction( windowId, tabIds ) )
    })
  }

  if( browser.theme ) {
    event_handlers.set( "theme.onUpdated", function onThemeUpdated( store, { theme, windowId } ) {
      store.dispatch( updateThemeAction( theme ) )
    })
  }

  for( const key of event_handlers.keys() ) {
    const [ context, method ] = key.split( "." )
    browser[ context ][ method ].addListener( handleEvent( key ) )
  }

  // @todo this should be moved somewhere else
  store.subscribe( () => {
    const state = store.getState()
    if( browser.tabs.hide && browser.tabs.show ) {
      console.info('updating tab show state')
      const show_ids = []
      const hide_ids = []
      const updates = []

      for( let window of state.windows ) {
        // @todo check for noop
        for( let tab_group of window.tab_groups ) {
          if( tab_group.hasOwnProperty( 'pinned' ) ) {
            continue
          }
          if( window.active_tab_group_id === tab_group.id ) {
            show_ids.push( ...tab_group.tabs.map( tab => tab.id ).filter( tab_id => ! show_tab_ids.has( tab_id ) ) )
          } else {
            // @todo pin tab if hide not possible
            hide_ids.push( ...tab_group.tabs.map( tab => tab.id ).filter( tab_id => ! hide_tab_ids.has( tab_id ) ) )
          }
        }
        break
      }
      if( hide_ids.length ) {
        console.info(`browser.tabs.hide( ${ JSON.stringify( hide_ids ) } )`)
        updates.push( browser.tabs.hide( hide_ids ) )
        // updates.push( ...hide_ids.map( tab_id => browser.tabs.update( tab_id, { autoDiscardable: true } ) ) )
      }
      if( show_ids.length ) {
        console.info(`browser.tabs.show( ${ JSON.stringify( show_ids ) } )`)
        updates.push( browser.tabs.show( show_ids ) )
        // updates.push( ...show_ids.map( tab_id => browser.tabs.update( tab_id, { autoDiscardable: false } ) ) )
      }
    }
  })

  return {
    pause() {
      is_paused = true
    },
    async resume() {
      is_paused = false
      return runQueuedEvents()
    },
  }
}
