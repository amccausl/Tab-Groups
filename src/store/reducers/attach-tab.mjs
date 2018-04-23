
import {
  getTabMoveData,
} from "../helpers.mjs"

import moveTabs from "./move-tabs.mjs"

export default function attachTab( state, { tab_id, window_id, index } ) {
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
