/**
 * Each of these functions require a `this` context with:
 *   - selected_tab_ids: int[]
 *   - tab_groups array
 */

export function toggleTabSelection( tab_id ) {
  let selected_tab_index = 0
  for( const tab_group of this.tab_groups ) {
    for( const tab of tab_group.tabs ) {
      if( tab.id === tab_id ) {
        if( this.selected_tab_ids[ selected_tab_index ] === tab_id ) {
          if( this.selected_tab_ids.length > 1 ) {
            this.selected_tab_ids.splice( selected_tab_index, 1 )
          }
        } else {
          this.selected_tab_ids.splice( selected_tab_index, 0, tab_id )
        }
        // No further action needed
        return
      }
      if( tab.id === this.selected_tab_ids[ selected_tab_index ] ) {
        selected_tab_index++
      }
    }
  }

  // @todo error
}

export function toggleTabBatchSelection( tab_id ) {
  // @todo parallel scan of selected_tab_ids & tab_groups to match
  let selected_tab_index = 0
  for( const tab_group of this.tab_groups ) {
    let delete_start_index = selected_tab_index
    let selected_group_tab_ids
    let tab_group_selection_start_index = null
    let tab_group_index = 0
    for( const tab of tab_group.tabs ) {
      if( tab.id === tab_id ) {
        selected_group_tab_ids = tab_group.tabs.slice( tab_group_selection_start_index || 0, tab_group_index + 1 ).map( _tab => _tab.id )
      }

      if( tab.id === this.selected_tab_ids[ selected_tab_index ] ) {
        if( tab_group_selection_start_index == null ) {
          tab_group_selection_start_index = tab_group_index
        }
        selected_tab_index++
      }
      tab_group_index++
    }
    const delete_count = selected_tab_index
    if( selected_group_tab_ids != null ) {
      this.selected_tab_ids.splice( delete_start_index, delete_count, ...selected_group_tab_ids )
    }
  }
}
