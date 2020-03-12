import {
  createTabGroup,
  getNewTabGroupId,
  omit,
} from "../helpers.mjs"

function mapTabGroup( state, window_id, tab_group_id, fn ) {
  return {
    ...state,
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }
      return {
        ...window,
        tab_groups: window.tab_groups.map( tab_group => {
          if( tab_group.id !== tab_group_id ) {
            return tab_group
          }
          return fn( tab_group )
        })
      }
    })
  }
}

export function activateGroup( state, { window_id, tab_group_id } ) {
  return {
    ...state,
    windows: state.windows.map( window => {
      if( window.id === window_id ) {
        const tab_group = window.tab_groups.find( _tab_group => _tab_group.id === tab_group_id )
        if( tab_group ) {
          return {
            ...window,
            active_tab_group_id: tab_group_id,
            active_tab_id: tab_group.active_tab_id,
          }
        }
      }
      return window
    })
  }
}

export function addGroup( state, { window_id, new_tab_group } ) {
  if( ! new_tab_group ) {
    new_tab_group = createTabGroup( getNewTabGroupId( state ), [] )
  }
  return {
    ...state,
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }
      return {
        ...window,
        tab_groups: [ ...window.tab_groups, new_tab_group ]
      }
    })
  }
}

export function removeGroup( state, { tab_group_id, window_id } ) {
  return {
    ...state,
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }

      const removed_tab_group = window.tab_groups.find( tab_group => tab_group.id === tab_group_id )
      const tab_groups = window.tab_groups.filter( tab_group => tab_group.id !== tab_group_id )
      let { active_tab_group_id, active_tab_id, highlighted_tab_ids } = window
      if( active_tab_group_id === tab_group_id ) {
        // @todo scan for largest active instead of first
        // @todo pull from highlighted tabs to get next group
        const tab_group = tab_groups[ 1 ]
        if( tab_group ) {
          active_tab_group_id = tab_group.id
          if( window.active_tab_id === removed_tab_group.active_tab_id ) {
            active_tab_id = tab_group.active_tab_id
            highlighted_tab_ids = [ active_tab_id ]
          }
        }
      }

      return {
        ...window,
        active_tab_group_id,
        active_tab_id,
        highlighted_tab_ids,
        tab_groups,
      }
    })
  }
}

export function updateGroup( state, { tab_group_id, window_id, change_info } ) {
  return mapTabGroup( state, window_id, tab_group_id, tab_group => {
    if( change_info.title && change_info.title !== tab_group.title ) {
      // @todo validation
    }
    return {
      ...tab_group,
      ...change_info
    }
  })
}

export function moveGroup( state, { source_data, target_data } ) {
  const windows = [ ...state.windows ]

  const source_window_index = windows.findIndex( window => window.id === source_data.window_id )
  const target_window_index = windows.findIndex( window => window.id === target_data.window_id )

  let source_tab_group = null
  let source_tab_group_index = null
  windows[ source_window_index ] = {
    ...windows[ source_window_index ],
    tab_groups: windows[ source_window_index ].tab_groups.filter( ( tab_group, index ) => {
      if( tab_group.id === source_data.tab_group_id ) {
        source_tab_group = tab_group
        source_tab_group_index = index
        return false
      }
      return true
    })
  }
  if( ! source_tab_group ) {
    // @todo error
    return state
  }

  // Replace active group info if active group was moved
  if( windows[ source_window_index ].active_tab_group_id === source_data.tab_group_id ) {
    const source_window1 = windows[ source_window_index ]
    let source_window_active_group1
    if( source_window1.tab_groups[ source_tab_group_index ] != null ) {
      source_window_active_group1 = source_window1.tab_groups[ source_tab_group_index ]
    } else if( source_window_index !== target_window_index && source_window1.tab_groups.length === 1 ) {
      if( source_window1.tab_groups[ 0 ].tabs_count > 0 ) {
        // There are pinned tabs, make a new group to take the source groups place
        const new_tab_group = createTabGroup( getNewTabGroupId( state ), [] )
        source_window1.tab_groups.push( new_tab_group )
        source_window1.active_tab_group_id = new_tab_group.id
        const pinned_tabs = source_window1.tab_groups[ 0 ].tabs
        source_window1.active_tab_id = pinned_tabs[ pinned_tabs.length - 1 ].id
        // @todo this could be better than resetting the highlighted if the new active tab was already highlighted
        source_window1.highlighted_tab_ids = [ source_window1.active_tab_id ]
      } else {
        // Window is empty, can be removed
        source_window1.remove = true
      }
    } else {
      source_window_active_group1 = source_window1.tab_groups[ source_tab_group_index - 1 ]
    }
    if( source_window_active_group1 ) {
      source_window1.active_tab_group_id = source_window_active_group1.id
      source_window1.active_tab_id = source_window_active_group1.active_tab_id
      source_window1.highlighted_tab_ids = [ source_window_active_group1.active_tab_id ]
    }
  }

  const target_tab_groups = [ ...windows[ target_window_index ].tab_groups ]
  let target_tab_group_index = target_data.tab_group_index
  if( target_tab_group_index == null ) {
    target_tab_group_index = target_tab_groups.length
  } else if( source_window_index === target_window_index && source_tab_group_index < target_tab_group_index ) {
    target_tab_group_index--
  }
  target_tab_groups.splice( target_tab_group_index, 0, source_tab_group )
  windows[ target_window_index ] = {
    ...windows[ target_window_index ],
    tab_groups: target_tab_groups
  }

  if( windows[ source_window_index ].remove ) {
    windows.splice( source_window_index, 1 )
  }

  return { ...state, windows }
}

// @todo consider merging these with updateGroup

export function muteGroup( state, { tab_group_id, window_id } ) {
  return mapTabGroup( state, window_id, tab_group_id, tab_group => ( { ...tab_group, muted: true } ) )
}

export function unmuteGroup( state, { tab_group_id, window_id } ) {
  return mapTabGroup( state, window_id, tab_group_id, tab_group => omit( tab_group, "muted" ) )
}
