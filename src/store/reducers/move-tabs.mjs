
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
export default function moveTabs( state, { source_data, target_data } ) {
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
