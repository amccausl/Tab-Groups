import validateStateSchema from '../schemas/validate_state'

export function validateState( state ) {
  const tab_ids_map = new Map()

  for( let window of state.windows ) {
    for( let tab_group of window.tab_groups ) {
      // Validate first group against pinned, rest as normal
      if( tab_group === window.tab_groups[ 0 ] ) {
        // if( ! validatePinnedTabGroupStateSchema( tab_group ) ) {
        //   // @todo populate error
        //   return false
        // }
      } else {
        // if( ! validateTabGroupStateSchema( tab_group ) ) {
        //   // @todo populate error
        //   return false
        // }
      }

      if( tab_group.hasOwnProperty( 'active_tab_id' ) && tab_group.active_tab_id) {
        if( ! tab_group.tabs.some( tab => tab.id === tab_group.active_tab_id ) ) {
          // @todo populate error
          return false
        }
      }

      let is_active_tab_valid = false
      for( let tab of tab_group.tabs ) {
        if( tab_ids_map.has( tab.id ) ) {
          // @todo populate error
          return false
        }

        tab_ids_map.set( tab.id, { window_id: window.id, tab_group_id: tab_group.id } )
      }
    }
  }

  if( ! validateStateSchema( state ) ) {
    validateState.errors = validateStateSchema.errors
    return false
  }
  return true
}
