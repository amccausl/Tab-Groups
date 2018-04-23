
/**
 * Only run by the onMove event handler.  Intentionally prevents moving tabs
 * between groups, as that introduces some race conditions with other setters
 * and the interaction between events triggered by internal calls vs the events
 * triggered by external native moves
 */
export default function moveTab( state, { tab_id, window_id, index } ) {
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
