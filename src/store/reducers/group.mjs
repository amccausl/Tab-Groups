import {
  createTabGroup,
  getNewTabGroupId,
  omit,
} from "../helpers.mjs"

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

export function addGroup( state, { window_id, new_tab_group } ) {
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
