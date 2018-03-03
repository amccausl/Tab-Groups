import validateStateSchema from '../schemas/validate_state'

export function validateState( state ) {
  const tab_ids_map = new Map()

  // @todo ensure tab_group_ids are unique
  const errors = []

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
          errors.push({
            keyword: 'link',
            dataPath: `window[${ state.windows.indexOf( window ) }].tab_groups[${ window.tab_groups.indexOf( tab_group ) }].active_tab_id`,
            message: `Active tab "${ tab_group.active_tab_id }" isn't in tabs array`
          })
        }
      }

      let is_active_tab_valid = false
      for( let tab of tab_group.tabs ) {
        if( tab_ids_map.has( tab.id ) ) {
          let { window_id, tab_group_id } = tab_ids_map.get( tab.id )
          errors.push({
            keyword: 'duplicate',
            dataPath: `window[${ state.windows.findIndex( window => window.id === window_id ) }].tab_groups[${ window.tab_groups.findIndex( tab_group => tab_group.id === tab_group_id ) }].tabs`,
            message: `Tab "${ tab.id }" is duplicated`
          })
        }

        tab_ids_map.set( tab.id, { window_id: window.id, tab_group_id: tab_group.id } )
      }
    }
  }

  if( ! validateStateSchema( state ) ) {
    errors.push( ...validateStateSchema.errors )
  }
  if( errors.length ) {
    validateState.errors = errors
    return false
  }
  return true
}