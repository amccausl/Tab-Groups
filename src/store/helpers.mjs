
export const default_config = {
  theme: 'dark',
  show_header: true,
  show_tabs_count: true,
  show_tabs: true,
  show_tab_context: true,
  show_tab_icon_background: true,
  use_sync_config: false,
}

export function createWindow( window_id, tab_groups, properties = {} ) {
  return {
    id: window_id,
    active_tab_group_id: tab_groups[ 1 ].id,
    active_tab_id: tab_groups[ 1 ].active_tab_id,
    highlighted_tab_ids: [ tab_groups[ 1 ].active_tab_id ].filter( id => id != null ),
    tab_groups: tab_groups,
    ...properties
  }
}

export function createTabGroup( tab_group_id, tabs, active_tab_id ) {
  return {
    id: tab_group_id,
    title: typeof browser != 'undefined' ? browser.i18n.getMessage( "tab_group_name_placeholder", [ tab_group_id ] ) : `Group ${ tab_group_id }`,
    active_tab_id: active_tab_id || ( tabs.length ? tabs[ 0 ].id : null ),
    tabs,
    tabs_count: tabs.length,
    last_active: undefined,
  }
}

export function createPinnedTabGroup( tabs, active_tab_id ) {
  if( ! active_tab_id && tabs.length ) {
    active_tab_id = tabs[ 0 ].id
  }

  return {
    id: 0,
    pinned: true,
    active_tab_id,
    tabs,
    tabs_count: tabs.length
  }
}

export function cloneWindow( window ) {
  return {
    ...window,
    tab_groups: window.tab_groups.map( cloneTabGroup ),
    highlighted_tab_ids: window.highlighted_tab_ids.slice( 0 ),
  }
}

export function cloneTabGroup( tab_group ) {
  return {
    ...tab_group,
    tabs: tab_group.tabs.map( cloneTab )
  }
}

export function cloneTab( tab ) {
  tab = { ...tab }
  if( tab.mutedInfo ) {
    tab.mutedInfo = { ...tab.mutedInfo }
  }
  if( tab.preview_image ) {
    tab.preview_image = { ...tab.preview_image }
  }
  return tab
}

/**
 * Find a tab in the state
 */
export function findTab( state, window_id, tab_id ) {
  for( let window of state.windows ) {
    if( window.id === window_id ) {
      for( let tab_group of window.tab_groups ) {
        for( let tab of tab_group.tabs ) {
          if( tab.id === tab_id ) {
            return tab
          }
        }
      }
    }
  }
  return null
}

export function findTabGroup( state, window_id, tab_group_id ) {
  for( let window of state.windows ) {
    if( window.id !== window_id ) {
      continue
    }
    for( let tab_group of window.tab_groups ) {
      if( tab_group.id === tab_group_id ) {
        return tab_group
      }
    }
  }
}

export function getCreateTabTarget( state, browser_tab ) {
  if( browser_tab.pinned ) {
    // Ignore pinned tabs
    return {
      index: browser_tab.index,
      tab_group_id: 0
    }
  }

  if( browser_tab.session != null && browser_tab.session.tab_group_id != null ) {
    return {
      index: browser_tab.index,
      tab_group_id: browser_tab.session.tab_group_id
    }
  }

  const window = state.windows.find( window => window.id === browser_tab.windowId )
  if( window != null ) {
    let total_tabs_count = 0
    window.tab_groups.forEach( tab_group => {
      total_tabs_count += tab_group.tabs_count
    })

    if( browser_tab.openerTabId != null ) {
      // Tab was opened by a pinned tab, move to start of active group instead
      if( window.tab_groups[ 0 ].tabs.some( tab => tab.id === browser_tab.openerTabId ) ) {
        let index_offset = 0
        for( let tab_group of window.tab_groups ) {
          if( tab_group.id === window.active_tab_group_id ) {
            return {
              index: index_offset,
              tab_group_id: tab_group.id
            }
          }
          index_offset += tab_group.tabs_count
        }
      }

      return {
        index: browser_tab.index,
        tab_group_id: window.active_tab_group_id
      }
    } else if( browser_tab.index === total_tabs_count ) {
      // This was probably created by native "New Tab" functionality
      let index_offset = 0
      for( let tab_group of window.tab_groups ) {
        if( tab_group.id === window.active_tab_group_id ) {
          return {
            index: index_offset + tab_group.tabs_count,
            tab_group_id: tab_group.id
          }
        }
        index_offset += tab_group.tabs_count
      }
    }
  }

  return { index: browser_tab.index }
}

/**
 * Scan the state for the next available tab_group_id
 */
export function getNewTabGroupId( state ) {
  let new_tab_group_id = 1
  state.windows.forEach( window => {
    window.tab_groups.forEach( tab_group => {
      if( tab_group.id >= new_tab_group_id ) {
        new_tab_group_id = tab_group.id + 1
      }
    })
  })
  return new_tab_group_id
}

export function getWindow( state, window_id ) {
  return state.windows.find( _window => _window.id === window_id )
}

export function getTargetIndex( target_window, target_data, ignored_tabs ) {
  function isIncludedGroup( tab ) {
    return ! ignored_tabs.includes( tab )
  }

  let is_first_match = true
  function isIncludedGlobal( tab ) {
    if( is_first_match && ignored_tabs.includes( tab ) ) {
      is_first_match = false
      return false
    }
    return true
  }
  let target_tab_group_index = target_data.tab_group_index
  let index_offset = 0
  for( let tab_group of target_window.tab_groups ) {
    if( target_data.tab_group_id === tab_group.id ) {
      let tab_group_index = 0
      for( let tab of tab_group.tabs ) {
        if( target_tab_group_index === tab_group_index ) {
          return {
            index: index_offset + target_tab_group_index,
            tab_group_index: target_tab_group_index
          }
        }
        if( isIncludedGroup( tab ) ) {
          tab_group_index++
        } else {
          target_tab_group_index--
        }
      }
      return {
        index: index_offset + tab_group_index,
        tab_group_index
      }
    }
    index_offset += tab_group.tabs.filter( isIncludedGlobal ).length
  }
  // @todo should this add to the last group?
  return { index: index_offset, tab_group_index: 0 }
}

export function getSourceTabGroupData( source_window, source_data ) {
  let index_offset = 0
  for( let tab_group of source_window.tab_groups ) {
    let tab_group_index = tab_group.tabs.findIndex( tab => tab.id === source_data.tab_id )
    if( tab_group_index > -1 ) {
      return {
        index: index_offset + tab_group_index,
        tab_group_id: tab_group.id,
        tab_group_index,
        tab_group_last: ( tab_group_index === tab_group.tabs_count - 1 )
      }
    }
    index_offset += tab_group.tabs_count
  }
  return null
}

export function getTargetTabGroupData( target_window, target_data, ignored_tabs = [] ) {
  let index_offset = 0
  for( let tab_group of target_window.tab_groups ) {
    let { tabs_count } = tab_group
    if( ignored_tabs.length ) {
      tabs_count = tab_group.tabs.filter( tab => ! ignored_tabs.includes( tab ) ).length
    }
    if( ! target_data.hasOwnProperty( 'pinned' ) || ( target_data.pinned && tab_group.pinned || ! tab_group.hasOwnProperty( 'pinned' ) ) ) {
      // @todo can be more efficient
      const next_tab_group = target_window.tab_groups[ target_window.tab_groups.indexOf( tab_group ) + 1 ]
      if( target_data.index - index_offset === tabs_count && next_tab_group != null && next_tab_group.id === target_window.active_tab_group_id ) {
        // return {
        //   tab_group_id: tab_group.id,
        //   tab_group_index: target_data.index - index_offset
        // }
      } else if( target_data.index - index_offset <= tabs_count ) {
        return {
          tab_group_id: tab_group.id,
          tab_group_index: target_data.index - index_offset
        }
      }
    }
    index_offset += tabs_count
  }
  const last_tab_group = target_window.tab_groups[ target_window.tab_groups.length - 1 ]
  return {
    tab_group_id: last_tab_group.id,
    tab_group_index: last_tab_group.tabs_count
  }
}

/**
 * Get normalized copy of source and target data for move
 * @param state
 * @param source_data
 *   window_id
 *   tab_ids
 * @param target_data
 */
export function getTabMoveData( state, source_data, target_data ) {
  let { windows } = state
  source_data = { ...source_data }
  target_data = { ...target_data }

  if( source_data.tabs == null && source_data.type !== "moz-place" && source_data.type !== "moz-url" ) {
    if( source_data.tab_ids ) {
      source_data.tabs = Array( source_data.tab_ids ).fill( null )
      const scanTabGroup = ( tab_group ) => {
        tab_group.tabs.forEach( tab => {
          const tab_index = source_data.tab_ids.indexOf( tab.id )
          if( tab_index > -1 ) {
            source_data.tabs[ tab_index ] = tab
          }
        })
      }

      for( let window of windows ) {
        if( window.id !== source_data.window_id ) {
          continue
        }

        const { tab_groups } = window
        if( source_data.tab_group_id != null ) {
          const tab_group_index = tab_groups.findIndex( _tab_group => _tab_group.id === source_data.tab_group_id )
          if( tab_group_index !== -1 ) {
            scanTabGroup( tab_groups[ tab_group_index ] )
          }
        } else {
          tab_groups.forEach( scanTabGroup )
        }
        break
      }
    } else if( source_data.type === 'moz-tab' ) {
      // @todo scan target_data group, then window first
      const urls = ( source_data.url ? [ source_data.url ] : source_data.urls )
      source_data.tab_ids = Array( urls.length ).fill( null )
      source_data.tabs = Array( urls.length ).fill( null )
      for( let window of windows ) {
        if( window.highlighted_tab_ids.length !== urls.length ) {
          continue
        }
        for( let tab_group of window.tab_groups ) {
          for( let tab of tab_group.tabs ) {
            if( ! window.highlighted_tab_ids.includes( tab.id ) ) {
              continue
            }
            let url_index = urls.indexOf( tab.url )
            // Check if url is duplicate,
            while( url_index > -1 && source_data.tabs[ url_index ] != null ) {
              url_index = urls.indexOf( tab.url, url_index + 1 )
            }
            if( url_index > -1 ) {
              source_data.window_id = window.id
              source_data.tab_ids[ url_index ] = tab.id
              source_data.tabs[ url_index ] = tab
            }
          }
        }
        if( ! source_data.tabs.includes( null ) ) {
          // Pinned tabs shouldn't be moved to a group
          for( const tab of window.tab_groups[ 0 ].tabs ) {
            const index = source_data.tab_ids.indexOf( tab.id )
            if( index > -1 ) {
              source_data.tab_ids.splice( index, 1 )
              source_data.tabs.splice( index, 1 )
            }
          }
          break
        }
        // Reset the state, try again
        source_data.fill( null )
      }
      // @todo if scan doesn't find anything, dragging from another instance of firefox, can process as URL
    } else {
      console.warn( "Problem loading source tab", source_data )
      return null
    }
  }

  if( source_data.tabs != null && source_data.tabs.includes( null ) ) {
    console.warn( "Problem loading source tab", source_data.tabs )
    return null
  }

  let target_window = windows.find( window => window.id === target_data.window_id )
  if( ! target_window ) {
    // This can trigger on window creation (the tab create is called before window create)
    // Create a new window as a placeholder
    target_data.tab_group_id = getNewTabGroupId( state )
    target_data.tab_group_index = target_data.index
    target_window = createWindow( target_data.window_id, [
      createPinnedTabGroup( [] ),
      createTabGroup( target_data.tab_group_id, [] )
    ])
    target_data.window = target_window
  }

  if( target_data.index == null ) {
    if( target_data.tab_group_id == null ) {
      if( target_data.tab_group != null ) {
        target_data.tab_group_id = target_data.tab_group.id
        if( source_data.tabs != null ) {
          target_data.tab_group.tabs = source_data.tabs
          target_data.tab_group.tabs_count = source_data.tabs.length
          target_data.tab_group.active_tab_id = target_data.tab_group.tabs[ 0 ].id
        }
      } else {
        target_data.tab_group_id = getNewTabGroupId( state )
        if( source_data.tabs != null ) {
          target_data.tab_group = createTabGroup( target_data.tab_group_id, source_data.tabs, source_data.tabs[ 0 ].id )
        } else {
          target_data.tab_group = createTabGroup( target_data.tab_group_id, [] )
        }
      }
    }

    // Load the global index for the target
    target_data = {
      ...target_data,
      ...getTargetIndex( target_window, target_data, source_data.tabs || [] )
    }
    // @todo check result
  } else if( target_data.tab_group_id == null ) {
    target_data = {
      ...target_data,
      ...getTargetTabGroupData( target_window, target_data )
    }
  }

  return {
    source_data,
    target_data,
  }
}

/**
 * Load the state of a window to store on the session
 * @param window the window from the state
 */
export function getTabGroupsPersistState( window ) {
  return window.tab_groups.filter( tab_group => tab_group.id ).map( tab_group => {
    const tab_group_state = {
      id: tab_group.id,
      title: tab_group.title,
      active_tab_id: tab_group.active_tab_id,
      tabs_count: tab_group.tabs_count,
    }

    if( tab_group.id === window.active_tab_group_id ) {
      tab_group_state.active = true
    }

    return tab_group_state
  })
}

export function omit( obj, ...properties ) {
  const new_obj = {}

  for( let key in obj ) {
    if( ! properties.includes( key ) ) {
      new_obj[ key ] = obj[ key ]
    }
  }

  return new_obj
}

export function difference( arr, others ) {
  return arr.filter( item => ! others.includes( item ) )
}
