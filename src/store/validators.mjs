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
      let is_group_audible = false
      for( let tab of tab_group.tabs ) {
        if( tab_ids_map.has( tab.id ) ) {
          let { window_id, tab_group_id } = tab_ids_map.get( tab.id )
          // @todo can clean up dataPath by using `in` loops
          errors.push({
            keyword: 'duplicate',
            dataPath: `window[${ state.windows.indexOf( window ) }].tab_groups[${ window.tab_groups.indexOf( tab_group ) }].tabs[${ tab_group.tabs.indexOf( tab ) }]`,
            message: `Tab "${ tab.id }" is duplicated`
          })
        }

        tab_ids_map.set( tab.id, { window_id: window.id, tab_group_id: tab_group.id } )

        if( tab.hasOwnProperty( 'audible' ) && ! tab.hasOwnProperty( 'muted') ) {
          is_group_audible = true
        }
      }

      // Ensure that the `audible` flag bubbles to the group properly
      if( is_group_audible && ! tab_group.hasOwnProperty( 'audible' ) ) {
        errors.push({
          keyword: 'audible',
          dataPath: `window[${ state.windows.indexOf( window ) }].tab_groups[${ window.tab_groups.indexOf( tab_group ) }]`,
          message: `The TabGroup "${ tab_group.id }" contains audible tabs, but is not audible`
        })
      } else if( ! is_group_audible && tab_group.hasOwnProperty( 'audible' ) ) {
        errors.push({
          keyword: 'audible',
          dataPath: `window[${ state.windows.indexOf( window ) }].tab_groups[${ window.tab_groups.indexOf( tab_group ) }].audible`,
          message: `The TabGroup "${ tab_group.id }" is audible, but doesn't contains audible tabs`
        })
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
