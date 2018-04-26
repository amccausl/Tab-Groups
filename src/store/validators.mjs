import validateStateSchema from '../schemas/validate_state'

export function validateState( state ) {
  const tab_ids_map = new Set()

  // @todo ensure tab_group_ids are unique
  const errors = []

  // @todo ensure window active tab is in pinned or active group

  const windows_length = state.windows.length
  for( let window_index = 0; window_index < windows_length; window_index++ ) {
    const window = state.windows[ window_index ]
    const tab_groups_length = window.tab_groups.length

    // Ensure that the active tab is in active group or pinned
    if( window.hasOwnProperty( 'active_tab_id' ) && window.active_tab_id != null ) {
      let is_window_active_tab_valid = false
      for( let tab_group_index = 0; tab_group_index < tab_groups_length; tab_group_index++ ) {
        const tab_group = window.tab_groups[ tab_group_index ]
        for( let tab of tab_group.tabs ) {
          if( tab.id === window.active_tab_id ) {
            is_window_active_tab_valid = true
            if( tab_group.id !== 0 && window.active_tab_group_id !== tab_group.id ) {
              errors.push({
                keyword: 'link',
                dataPath: `window[${ window_index }].active_tab_group_id`,
                message: `Active tab "${ window.active_tab_id }" isn't in the active tab group`
              })
            } else if( tab.id !== tab_group.active_tab_id ) {
              errors.push({
                keyword: 'link',
                dataPath: `window[${ window_index }].tab_groups[${ tab_group_index }].active_tab_id`,
                message: `Window active tab "${ window.active_tab_id }" isn't active in tab group`
              })
            }
          }
        }
      }

      if( ! is_window_active_tab_valid ) {
        errors.push({
          keyword: 'link',
          dataPath: `window[${ window_index }].active_tab_id`,
          message: `Active tab "${ window.active_tab_id }" isn't in tabs array`
        })
      }
    }

    for( let tab_group_index = 0; tab_group_index < tab_groups_length; tab_group_index++ ) {
      const tab_group = window.tab_groups[ tab_group_index ]
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

      let is_active_tab_valid = ! tab_group.hasOwnProperty( 'active_tab_id' ) || tab_group.active_tab_id == null
      const tabs_length = tab_group.tabs.length
      for( let tab_index = 0; tab_index < tabs_length; tab_index++ ) {
        const tab_id = tab_group.tabs[ tab_index ].id
        if( tab_ids_map.has( tab_id ) ) {
          errors.push({
            keyword: 'duplicate',
            dataPath: `window[${ window_index }].tab_groups[${ tab_group_index }].tabs[${ tab_index }]`,
            message: `Tab "${ tab_id }" is duplicated`
          })
        }
        tab_ids_map.add( tab_id )

        if( ! is_active_tab_valid && tab_group.active_tab_id === tab_id ) {
          is_active_tab_valid = true
        }
      }

      if( ! is_active_tab_valid ) {
        errors.push({
          keyword: 'link',
          dataPath: `window[${ window_index }].tab_groups[${ tab_group_index }].active_tab_id`,
          message: `Active tab "${ tab_group.active_tab_id }" isn't in tabs array`
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
  validateState.errors = null
  return true
}
