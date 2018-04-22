import {
  INIT,
  CONFIG_UPDATE,
  FEATURES_UPDATE,
  GROUP_CREATE,
  GROUP_REMOVE,
  GROUP_UPDATE,
  GROUP_MOVE,
  GROUP_MUTE,
  GROUP_UNMUTE,
  TABS_MOVE,
  TAB_ACTIVATE,
  TAB_ADD,
  TAB_REMOVE,
  TAB_UPDATE,
  TAB_UPDATE_IMAGE,
  TAB_MOVE,
  TAB_ATTACH,
  WINDOW_ADD,
  WINDOW_REMOVE,
  WINDOW_SEARCH_START,
  WINDOW_SEARCH_FINISH,
  WINDOW_SEARCH_RESET,
} from './action-types.mjs'

import {
  createWindow,
  createTabGroup,
  createPinnedTabGroup,
  default_config,
  findTab,
  getCreateTabTarget,
  getNewTabGroupId,
  getSourceTabGroupData,
  getTabMoveData,
  getTargetTabGroupData,
  omit,
} from './helpers.mjs'

// @todo remove dependency
import {
  TAB_GROUP_ID_KEY,
  getTabState,
} from '../integrations/index.mjs'

const initial_state = {
  config: default_config,
  contexts: {},
  windows: []
}

function findTabGroupId( tab_groups, tab_id ) {
  let tab_group = tab_groups.find( tab_group => tab_group.tabs.some( tab => tab.id === tab_id ) )
  if( tab_group ) {
    return tab_group.id
  }
  return null
}

function findTabWindowId( windows, tab_id ) {
  let window = windows.find( window => findTabGroupId( window.tab_groups, tab_id ) != null )
  if( window ) {
    return window.id
  }
  return null
}

function findWindowIndex( windows, window_id ) {
  return windows.findIndex( window => window.id === window_id )
}

function _removeTab( state, { tab_id, window_id, index } ) {
  // @todo use index to optimize the lookup process if set
  // @todo update active_tab_id if required

  const windows = state.windows.map( window => {
    if( window.id === window_id ) {
      let active_tab_id = window.active_tab_id
      let tab_groups = window.tab_groups.map( tab_group => {
        const tab_index = tab_group.tabs.findIndex( tab => tab.id === tab_id )
        if( tab_index > -1 ) {
          tab_group = Object.assign( {}, tab_group, {
            tabs: [ ...tab_group.tabs ],
            tabs_count: tab_group.tabs_count - 1
          })
          tab_group.tabs.splice( tab_index, 1 )[ 0 ]
          if( tab_group.active_tab_id === tab_id ) {
            if( tab_group.tabs_count > 0 ) {
              tab_group.active_tab_id = tab_group.tabs[ Math.min( tab_index, tab_group.tabs_count - 1 ) ].id
            } else {
              tab_group.active_tab_id = null
            }
            if( active_tab_id === tab_id ) {
              active_tab_id = tab_group.active_tab_id
            }
          }
        }
        return tab_group
      })

      window = Object.assign( {}, window, {
        active_tab_id,
        tab_groups,
      })
    }
    return window
  })

  const new_state = Object.assign( {}, state, {
    windows
  })

  return new_state
}

export function init( state, { browser_tabs, config, contextual_identities, features, theme, window_tab_groups_map } ) {
  const window_tabs_map = new Map()

  // @todo use persist state from window_tab_groups_map

  // new_tab_group_id the largest id + 1
  let new_tab_group_id = 1
  // @todo iterate window_tab_groups_map to get id

  browser_tabs.forEach( browser_tab => {
    let window_tabs = window_tabs_map.get( browser_tab.windowId )
    if( ! window_tabs ) {
      window_tabs = []
      window_tabs_map.set( browser_tab.windowId, window_tabs )
    }
    window_tabs.push( browser_tab )
  })

  let contexts = {}
  if( contextual_identities ) {
    contextual_identities.forEach( contextual_identity => {
      contexts[ contextual_identity.cookieStoreId ] = {
        color: contextual_identity.colorCode,
        name: contextual_identity.name,
      }
    })
  }

  // @todo scan map to get max window id in case things are in awkward state

  const windows = []
  for( let [ window_id, window_tabs ] of window_tabs_map.entries() ) {
    // @todo ensure tabs are in index sorted order, with the pinned tabs first
    // @todo this should be based on config setting

    let active_tab_id = null
    let active_tab_group_id = null
    const window_tab_groups_state = window_tab_groups_map.get( window_id )
    const window_tab_group_map = new Map()
    if( window_tab_groups_state ) {
      for( let tab_group_state of window_tab_groups_state ) {
        window_tab_group_map.set( tab_group_state.id, {
          id: tab_group_state.id,
          title: tab_group_state.title,
          active_tab_id: null,
          tabs: [],
          tabs_count: tab_group_state.tabs_count
        })
      }
    }

    let pinned_tabs = []
    let ungrouped_tabs = []
    for( let browser_tab of window_tabs ) {
      if( browser_tab.active ) {
        active_tab_id = browser_tab.id
      }
      let tab = getTabState( browser_tab )
      if( browser_tab.pinned ) {
        pinned_tabs.push( tab )
      } else if( browser_tab.session != null && browser_tab.session[ TAB_GROUP_ID_KEY ] != null && window_tab_group_map.has( browser_tab.session[ TAB_GROUP_ID_KEY ] ) ) {
        window_tab_group_map.get( browser_tab.session[ TAB_GROUP_ID_KEY ] ).tabs.push( tab )
      } else {
        ungrouped_tabs.push( tab )
      }
    }

    const window_tab_groups = [ createPinnedTabGroup( pinned_tabs ) ]
    if( window_tab_groups_state ) {
      for( let tab_group of window_tab_group_map.values() ) {
        if( tab_group.tabs.length < tab_group.tabs_count ) {
          tab_group.tabs.push( ...ungrouped_tabs.splice( 0, tab_group.tabs_count - tab_group.tabs.length ) )
        }
        if( tab_group.tabs.length > 0 ) {
          if( tab_group.tabs.some( tab => tab.id === active_tab_id ) ) {
            tab_group.active_tab_id = active_tab_id
            active_tab_group_id = tab_group.id
          } else {
            tab_group.active_tab_id = tab_group.tabs[ 0 ].id
          }
        }
        tab_group.tabs_count = tab_group.tabs.length
        window_tab_groups.push( tab_group )
      }
      if( ungrouped_tabs.length > 0 ) {
        window_tab_groups[ window_tab_groups.length - 1 ].tabs.push( ...ungrouped_tabs )
        window_tab_groups[ window_tab_groups.length - 1 ].tabs_count = window_tab_groups[ window_tab_groups.length - 1 ].tabs.length
      }
    } else {
      // No state, assign all tabs to new groups
      window_tab_groups.push( createTabGroup( new_tab_group_id, ungrouped_tabs ) )
      new_tab_group_id++
    }

    windows.push({
      id: window_id,
      active_tab_group_id: active_tab_group_id || window_tab_groups[ 1 ].id,
      active_tab_id,
      tab_groups: window_tab_groups
    })
  }

  const init_state = {
    config,
    contexts,
    features,
    windows
  }

  // @todo compare with state to return optimized diff

  return init_state
}

export function addWindow( state, { browser_window } ) {
  // Only add if not already exists
  if( state.windows.some( window => window.id === browser_window.id ) ) {
    return state
  }

  return Object.assign( {}, state, {
    windows: [
      ...state.windows,
      createWindow( browser_window.id, [
        createPinnedTabGroup( [] ),
        createTabGroup( getNewTabGroupId( state ), [] )
      ])
    ]
  })
}

export function removeWindow( state, { window_id } ) {
  return Object.assign( {}, state, {
    windows: state.windows.filter( window => window.id !== window_id )
  })
}

export function startWindowSearch( state, { window_id, search_text } ) {
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }

      const matched_tab_ids = []
      const queued_tab_ids = []
      const search_regex = new RegExp( `${ search_text }`, 'i' )
      for( let tab_group of window.tab_groups ) {
        for( let tab of tab_group.tabs ) {
          if( tab.title && search_regex.test( tab.title ) ) {
            matched_tab_ids.push( tab.id )
          } else if( tab.url && search_regex.test( tab.url ) ) {
            matched_tab_ids.push( tab.id )
          } else {
            queued_tab_ids.push( tab.id )
          }
        }
      }

      return Object.assign( {}, window, {
        search: {
          text: search_text,
          resolved: ( queued_tab_ids.length === 0 ),
          matched_tab_ids,
          queued_tab_ids
        }
      })
    })
  })
}

export function finishWindowSearch( state0, { window_id, search_text, matched_tab_ids } ) {
  let is_updated = false

  const state1 = Object.assign( {}, state0, {
    windows: state0.windows.map( window => {
      if( window.id !== window_id || window.search != null && window.search.text !== search_text ) {
        return window
      }
      is_updated = true
      return Object.assign( {}, window, {
        search: Object.assign( {}, window.search, {
          resolved: true,
          matched_tab_ids: window.search.matched_tab_ids.concat( matched_tab_ids ),
          queued_tab_ids: []
        })
      })
    })
  })

  if( is_updated ) {
    return state1
  }
  return state0
}

export function resetWindowSearch( state0, { window_id } ) {
  let is_updated = false
  const state1 = Object.assign( {}, state0, {
    windows: state0.windows.map( window => {
      if( window.id !== window_id || window.search == null ) {
        return window
      }
      is_updated = true
      return omit( window, 'search' )
    })
  })

  if( is_updated ) {
    return state1
  }
  return state0
}

function mapTabGroup( state, window_id, tab_group_id, fn ) {
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }
      return Object.assign( {}, window, {
        tab_groups: window.tab_groups.map( tab_group => {
          if( tab_group.id !== tab_group_id ) {
            return tab_group
          }
          return fn( tab_group )
        })
      })
    })
  })
}

export function createGroup( state, { window_id, new_tab_group } ) {
  if( ! new_tab_group ) {
    new_tab_group = createTabGroup( getNewTabGroupId( state ), [] )
  }
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }
      return Object.assign( {}, window, {
        tab_groups: [ ...window.tab_groups, new_tab_group ]
      })
    })
  })
}

export function removeGroup( state, { tab_group_id, window_id } ) {
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }
      return Object.assign( {}, window, {
        tab_groups: window.tab_groups.filter( tab_group => tab_group.id !== tab_group_id )
      })
    })
  })
}

export function updateGroup( state, { tab_group_id, window_id, change_info } ) {
  return mapTabGroup( state, window_id, tab_group_id,
    tab_group => {
      if( change_info.title && change_info.title !== tab_group.title ) {
        // @todo validation
      }
      return Object.assign( {}, tab_group, change_info )
    }
  )
}

export function moveGroup( state, { source_data, target_data } ) {
  const windows = [ ...state.windows ]

  const source_window_index = windows.findIndex( window => window.id === source_data.window_id )
  const target_window_index = windows.findIndex( window => window.id === target_data.window_id )

  let source_tab_group = null
  let source_tab_group_index = null
  windows[ source_window_index ] = Object.assign( {}, windows[ source_window_index ], {
    tab_groups: windows[ source_window_index ].tab_groups.filter( ( tab_group, index ) => {
      if( tab_group.id === source_data.tab_group_id ) {
        source_tab_group = tab_group
        source_tab_group_index = index
        return false
      }
      return true
    })
  })
  if( ! source_tab_group ) {
    // @todo error
    return state
  }
  const target_tab_groups = [ ...windows[ target_window_index ].tab_groups ]
  let target_tab_group_index = target_data.tab_group_index
  if( target_tab_group_index == null ) {
    target_tab_group_index = target_tab_groups.length
  } else if( source_window_index === target_window_index && source_tab_group_index < target_tab_group_index ) {
    target_tab_group_index--
  }
  target_tab_groups.splice( target_tab_group_index, 0, source_tab_group )
  windows[ target_window_index ] = Object.assign( {}, windows[ target_window_index ], {
    tab_groups: target_tab_groups
  })

  return Object.assign( {}, state, { windows } )
}

// @todo consider merging these with updateGroup

export function muteGroup( state, { tab_group_id, window_id } ) {
  return mapTabGroup( state, window_id, tab_group_id,
    tab_group => Object.assign( {}, tab_group, { muted: true } )
  )
}

export function unmuteGroup( state, { tab_group_id, window_id } ) {
  return mapTabGroup( state, window_id, tab_group_id,
    tab_group => omit( tab_group, 'muted')
  )
}

export function activateTab( state, { tab_id, window_id } ) {
  // @todo activate the group the tab is in
  // @todo optimize to return existing state if tab already active
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id === window_id ) {
        let { active_tab_group_id } = window
        let active_tab_id = null
        const tab_groups = window.tab_groups.map( tab_group => {
          // If tab_group contains the tab_id, return a copy with active toggled
          if( tab_group.tabs.some( tab => tab.id === tab_id ) ) {
            if( tab_group.id ) {
              active_tab_group_id = tab_group.id
            }
            active_tab_id = tab_id
            tab_group = Object.assign( {}, tab_group, {
              active_tab_id
            })
          }
          return tab_group
        })

        if( active_tab_id ) {
          window = Object.assign( {}, window, {
            active_tab_group_id,
            active_tab_id,
            tab_groups
          })
        }
      }
      return window
    })
  })
}

export function addTab( state, { browser_tab } ) {
  const target_window = state.windows.find( window => window.id === browser_tab.windowId )

  const tab = getTabState( browser_tab )
  const target_info = getCreateTabTarget( state, browser_tab )

  if( target_window ) {
    if( target_info.tab_group_id != null ) {
      return Object.assign( {}, state, {
        windows: state.windows.map( window => {
          if( window.id !== browser_tab.windowId ) {
            return window
          }
          let index_offset = 0
          return Object.assign( {}, window, {
            tab_groups: window.tab_groups.map( tab_group => {
              // We know what group we're targeting
              if( tab_group.id === target_info.tab_group_id ) {
                let tabs
                if( target_info.index <= index_offset ) {
                  tabs = [ tab, ...tab_group.tabs ]
                } else if( target_info.index >= index_offset + tab_group.tabs_count ) {
                  tabs = [ ...tab_group.tabs, tab ]
                } else {
                  tabs = tab_group.tabs.slice( 0 )
                  tabs.splice( target_info.index - index_offset, 0, tab )
                }
                tab_group = Object.assign( {}, tab_group, {
                  tabs,
                  tabs_count: tab_group.tabs_count + 1
                })
              }
              index_offset += tab_group.tabs_count
              return tab_group
            })
          })
        })
      })
    } else {
      const move_data = getTabMoveData(
        state,
        { tabs: [ tab ] },
        Object.assign(
          {
            window_id: browser_tab.windowId,
            pinned: browser_tab.pinned
          },
          getCreateTabTarget( state, browser_tab )
        )
      )

      return moveTabs( state, move_data )
    }
  } else {
    // Add tab event is fired before the window is created, so we have to stub it
    return Object.assign( {}, state, {
      windows: [ ...state.windows, createWindow( browser_tab.windowId, [
        createPinnedTabGroup( [] ),
        createTabGroup( getNewTabGroupId( state ), [ tab ] )
      ])]
    })
  }
}

export function removeTab( state, { tab_id, window_id } ) {
  return _removeTab( state, { tab_id, window_id } )
}

export function updateTab( state, { browser_tab, change_info } ) {
  if( change_info.hasOwnProperty( 'pinned' ) ) {
    const window_id = browser_tab.windowId
    const target_window = state.windows.find( window => window.id === window_id )
    const tab_group_id = change_info.pinned ? 0 : target_window.active_tab_group_id
    const move_data = getTabMoveData(
      state,
      {
        window_id,
        tab_ids: [ browser_tab.id ]
      },
      {
        window_id,
        tab_group_id,
        tab_group_index: change_info.pinned ? null : 0
      }
    )

    return moveTabs( state, move_data )
  }
  // @todo change use the nature of change_info to ignore changes
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== browser_tab.windowId ) {
        return window
      }
      return Object.assign( {}, window, {
        tab_groups: window.tab_groups.map( tab_group => {
          const tab_index = tab_group.tabs.findIndex( _tab => _tab.id === browser_tab.id )
          if( tab_index > -1 ) {
            tab_group = Object.assign( {}, tab_group, {
              tabs: [ ...tab_group.tabs ]
            })
            tab_group.tabs[ tab_index ] = getTabState( browser_tab )
          }
          return tab_group
        })
      })
    })
  })
}

export function updateTabImage( state, { tab_id, window_id, preview_image_uri } ) {
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }
      return Object.assign( {}, window, {
        tab_groups: window.tab_groups.map( tab_group => {
          const tab_index = tab_group.tabs.findIndex( _tab => _tab.id === tab_id )
          if( tab_index > -1 ) {
            tab_group = Object.assign( {}, tab_group, {
              tabs: [ ...tab_group.tabs ]
            })

            const preview_image = {
              width: tab_group.tabs[ tab_index ].width,
              height: tab_group.tabs[ tab_index ].height,
              uri: preview_image_uri
            }

            // Clone tab, update image
            tab_group.tabs[ tab_index ] = Object.assign( {}, tab_group.tabs[ tab_index ], {
              preview_image
            })
          }
          return tab_group
        })
      })
    })
  })
}

/**
 * Return a copy of state with tab identified by source_data moved to the target
 * @todo what if source location doesn't match info
 * @param state
 * @param source_data
 *   { window_id, tab_ids }
 *   { window_id, index, pinned }
 *   { window_id, tabs }
 *   // @todo { browser_tabs }
 * @param target_data
 *   { window_id, index, pinned }
 *   { window_id, tab_group_id }
 *   { window_id, tab_group_id, tab_group_index }
 *   { window_id, tab_group }
 */
export function moveTabs( state, { source_data, target_data } ) {
  let { windows } = state

  // Target is new window
  if( target_data.window ) {
    windows = [ ...windows, target_data.window ]
  }

  // @todo If source is same as target, noop
  // @todo if active tab is moved, switch to next one
  return Object.assign( {}, state, {
    windows: windows.map( window => {
      if( window.id !== source_data.window_id && window.id !== target_data.window_id ) {
        return window
      }

      let active_tab_group_id = window.active_tab_group_id
      let window_active_tab_id = window.active_tab_id || null
      let tab_groups = window.tab_groups.map( tab_group => {
        let { tabs, active_tab_id } = tab_group

        if( tabs.some( tab => source_data.tabs.includes( tab ) ) ) {
          const filtered_tabs = []

          for( let tab of tabs ) {
            if( ! source_data.tabs.includes( tab ) ) {
              filtered_tabs.push( tab )
              if( active_tab_id == null ) {
                active_tab_id = tab.id
                if( window_active_tab_id == null ) {
                  window_active_tab_id = tab.id
                }
              }
            } else {
              if( tab.id === active_tab_id && tab_group.id !== target_data.tab_group_id ) {
                active_tab_id = null
                // If the active tab in the active group is moving, activate new group
                if( active_tab_group_id === tab_group.id && target_data.tab_group_id !== 0 ) {
                  active_tab_group_id = target_data.tab_group_id
                }
              }

              if( tab.id === window_active_tab_id && source_data.window_id !== target_data.window_id ) {
                window_active_tab_id = null
              }
            }
          }

          if( active_tab_id == null && filtered_tabs.length ) {
            active_tab_id = filtered_tabs[ filtered_tabs.length - 1 ].id
          }

          if( window_active_tab_id == null && filtered_tabs.length ) {
            window_active_tab_id = filtered_tabs[ filtered_tabs.length - 1 ].id
          }

          tabs = filtered_tabs
        }

        if( target_data.tab_group_id === tab_group.id ) {
          tabs = [ ...tabs ]
          if( target_data.tab_group_index == null ) {
            tabs.push( ...source_data.tabs )
          } else {
            tabs.splice( target_data.tab_group_index, 0, ...source_data.tabs )
          }
          if( window_active_tab_id && tabs.some( tab => tab.id === window_active_tab_id ) ) {
            active_tab_id = window_active_tab_id
          }
        }

        if( tabs !== tab_group.tabs ) {
          tab_group = Object.assign( {}, tab_group, {
            active_tab_id,
            tabs,
            tabs_count: tabs.length
          })
        }

        return tab_group
      })

      if( window.id === target_data.window_id && target_data.tab_group ) {
        tab_groups.push( target_data.tab_group )

        if( target_data.tab_group.tabs.some( tab => tab.id === window_active_tab_id ) ) {
          active_tab_group_id = target_data.tab_group.id
        }
      }

      return Object.assign( {}, window, { tab_groups, active_tab_group_id, active_tab_id: window_active_tab_id } )
    })
  })
}

/**
 * Only run by the onMove event handler.  Intentionally prevents moving tabs
 * between groups, as that introduces some race conditions with other setters
 * and the interaction between events triggered by internal calls vs the events
 * triggered by external native moves
 */
export function moveTab( state, { tab_id, window_id, index } ) {
  for( let window of state.windows ) {
    if( window.id !== window_id ) {
      continue
    }
    let index_offset = 0
    for( let tab_group of window.tab_groups ) {
      const tab_index = tab_group.tabs.findIndex( tab => tab.id === tab_id )
      if( tab_index === -1 ) {
        index_offset += tab_group.tabs_count
        continue
      }
      const group_index = Math.max( 0, Math.min( tab_group.tabs_count - 1, index - index_offset ) )
      if( tab_index === group_index ) {
        // No change is required, just return
        return state
      }

      return Object.assign( {}, state, {
        windows: state.windows.map( window => {
          if( window.id !== window_id ) {
            return window
          }
          return Object.assign( {}, window, {
            tab_groups: window.tab_groups.map( _tab_group => {
              if( _tab_group !== tab_group ) {
                return _tab_group
              }
              let tabs = tab_group.tabs.filter( tab => tab.id !== tab_id )
              tabs.splice( group_index, 0, tab_group.tabs[ tab_index ] )

              return Object.assign( {}, tab_group, {
                tabs
              })
            })
          })
        })
      })
    }
  }

  // No change is required, return original
  return state
}

export function moveTabWithDelegate( state, { tab_id, window_id, index } ) {
  const target_window = state.windows.find( window => window.id === window_id )
  if( ! target_window ) {
    console.error( 'window missing' )
    return state
  }

  const source_tab_group_data = getSourceTabGroupData( target_window, { tab_id } )

  // No-op if index is not updated
  if( source_tab_group_data.index === index ) {
    console.info('no-op move')
    return state
  }

  const source_data = {
    window_id,
    tab_ids: [ tab_id ],
    tabs: [ findTab( state, window_id, tab_id ) ],
  }

  let target_data = {
    window_id,
    index,
  }

  if( source_tab_group_data.group_id == null || source_tab_group_data.group_id !== 0 ) {
    target_data.pinned = false
  }

  target_data = Object.assign( {}, target_data,
    getTargetTabGroupData( target_window, target_data, source_data.tabs )
  )

  return moveTabs( state, { source_data, target_data } )
}

export function attachTab( state, { tab_id, window_id, index } ) {
  const tab_window_id = findTabWindowId( state.windows, tab_id )
  if( tab_window_id == null ) {
    // @todo error
    return state
  }

  const move_data = getTabMoveData( state, { window_id: tab_window_id, tab_ids: [ tab_id ] }, { window_id, index, pinned: false } )
  return moveTabs( state, move_data )
}

export function updateConfig( state, { config } ) {
  return Object.assign( {}, state, {
    config
  })
}

export function updateFeatures( state, { features } ) {
  return Object.assign( {}, state, {
    features: Object.assign( {}, state.features, features )
  })
}

export function addContext( state, { context } ) {
  let contexts = Object.assign( {}, state.contexts )

  contexts[ context.id ] = context

  return Object.assign( {}, state, {
    contexts
  })
}

export function updateContext( state, { context } ) {
  let contexts = Object.assign( {}, state.contexts )

  contexts[ context.id ] = context

  return Object.assign( {}, state, {
    contexts
  })
}

export function removeContext( state, { context } ) {
  let contexts = Object.assign( {}, state.contexts )

  delete contexts[ context.id ]

  return Object.assign( {}, state, {
    contexts
  })
}

export default function App( state = initial_state, action ) {
  switch( action.type ) {
    case INIT:
      return init( state, action )
    case CONFIG_UPDATE:
      return updateConfig( state, action )
    case FEATURES_UPDATE:
      return updateFeatures( state, action )
    case WINDOW_ADD:
      return addWindow( state, action )
    case WINDOW_REMOVE:
      return removeWindow( state, action )
    case WINDOW_SEARCH_START:
      return startWindowSearch( state, action )
    case WINDOW_SEARCH_FINISH:
      return finishWindowSearch( state, action )
    case WINDOW_SEARCH_RESET:
      return resetWindowSearch( state, action )
    case GROUP_CREATE:
      return createGroup( state, action )
    case GROUP_REMOVE:
      return removeGroup( state, action )
    case GROUP_UPDATE:
      return updateGroup( state, action )
    case GROUP_MOVE:
      return moveGroup( state, action )
    case GROUP_MUTE:
      return muteGroup( state, action )
    case GROUP_UNMUTE:
      return unmuteGroup( state, action )
    case TABS_MOVE:
      return moveTabs( state, action )
    case TAB_ACTIVATE:
      return activateTab( state, action )
    case TAB_ADD:
      return addTab( state, action )
    case TAB_REMOVE:
      return removeTab( state, action )
    case TAB_UPDATE:
      return updateTab( state, action )
    case TAB_UPDATE_IMAGE:
      return updateTabImage( state, action )
    case TAB_MOVE:
      return moveTab( state, action )
    case TAB_ATTACH:
      return attachTab( state, action )
    default:
      console.warn('unknown action type', action.type)
      return state
  }
}
