// @todo remove dependency
import {
  getTabState,
} from "../../integrations/index.mjs"
import {
  createWindow,
  createTabGroup,
  createPinnedTabGroup,
  getCreateTabTarget,
  getNewTabGroupId,
  getTabMoveData,
} from "../helpers.mjs"

export function addTab( state, { browser_tab } ) {
  const target_window = state.windows.find( window => window.id === browser_tab.windowId )

  for( const tab_group of target_window.tab_groups ) {
    if( tab_group.tabs.some( tab => tab.id === browser_tab.id ) ) {
      return state
    }
  }

  const tab = getTabState( browser_tab )
  const target_info = getCreateTabTarget( state, browser_tab )

  if( target_window ) {
    if( target_info.tab_group_id != null ) {
      return Object.assign( {}, state, {
        windows: state.windows.map( window0 => {
          if( window0.id !== browser_tab.windowId ) {
            return window0
          }
          let index_offset = 0
          const window1 = Object.assign( {}, window0, {
            tab_groups: window0.tab_groups.map( tab_group => {
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
                if( browser_tab.active ) {
                  tab_group.active_tab_id = browser_tab.id
                }
              }
              index_offset += tab_group.tabs_count
              return tab_group
            })
          })

          if( browser_tab.active ) {
            if( browser_tab.session != null && browser_tab.session.tab_group_id ) {
              window1.active_tab_group_id = browser_tab.session.tab_group_id
            }
            window1.active_tab_id = browser_tab.id
          }

          return window1
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

export function attachTab( state, { tab_id, window_id, index } ) {
  const source_data = {
    window_id: null,
    tab_ids: [ tab_id ]
  }

  for( let window of state.windows ) {
    let index = 0
    for( let tab_group of window.tab_groups ) {
      for( let tab of tab_group.tabs ) {
        if( tab.id === tab_id ) {
          if( window.id === window_id ) {
            // Attach has already been handled, we can ignore
            return state
          }
          source_data.window_id = window.id
          source_data.window_index = index
        }
        index++
      }
    }
  }

  if( source_data.window_id == null ) {
    // @todo error
    return state
  }

  const move_data = getTabMoveData( state, source_data, { window_id, index, pinned: false } )
  return moveTabs( state, move_data )
}

export function activateTab( state, { tab_id, window_id } ) {
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
              active_tab_id,
              last_active: ( new Date() ).getTime(),
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

export function updateTab( state, { browser_tab, change_info } ) {
  if( change_info.hasOwnProperty( "pinned" ) ) {
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
 * Only run by the onMove event handler.  Intentionally prevents moving tabs
 * between groups, as that introduces some race conditions with other setters
 * and the interaction between events triggered by internal calls vs the events
 * triggered by external native moves
 *
 * @todo events triggered by internal calls are now blocked at the handler level
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
  // @todo if active tab is moved, update last active
  return Object.assign( {}, state, {
    windows: windows.map( window => {
      if( window.id !== source_data.window_id && window.id !== target_data.window_id ) {
        return window
      }

      let active_tab_group_id = window.active_tab_group_id
      let window_active_tab_id = window.active_tab_id || null
      let tab_groups = window.tab_groups.map( tab_group => {
        let { tabs, active_tab_id, last_active } = tab_group

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
            last_active = ( new Date() ).getTime()
          }
        }

        if( tabs !== tab_group.tabs ) {
          tab_group = Object.assign( {}, tab_group, {
            active_tab_id,
            last_active,
            tabs,
            tabs_count: tabs.length
          })
        }

        return tab_group
      })

      if( window.id === target_data.window_id && target_data.tab_group ) {
        const tab_group = { ...target_data.tab_group }

        if( tab_group.tabs.some( tab => tab.id === window_active_tab_id ) ) {
          tab_group.active_tab_id = window_active_tab_id
          tab_group.last_active = ( new Date() ).getTime()
          active_tab_group_id = tab_group.id
        }
        tab_groups.push( tab_group )
      }

      return Object.assign( {}, window, { tab_groups, active_tab_group_id, active_tab_id: window_active_tab_id } )
    })
  })
}

export function removeTab( state, { tab_id, window_id } ) {
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

export function highlightTabs( state, { window_id, tab_ids } ) {
  const windows = state.windows.map( window => {
    if( window.id !== window_id ) {
      return window
    }
    return Object.assign( {}, window, {
      highlighted_tab_ids: tab_ids,
    })
  })

  const new_state = Object.assign( {}, state, {
    windows
  })

  return new_state
}
