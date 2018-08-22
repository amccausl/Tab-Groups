/**
 * Each of these functions require a `this` context with:
 *   - selected_tab_ids: int[]
 *   - tab_groups array
 */

export function toggleTabSelection( tab_id ) {
  const tab_index = this.selected_tab_ids.indexOf( tab_id )
  if( tab_index > -1 ) {
    this.selected_tab_ids.splice( tab_index, 1 )
  } else {
    this.selected_tab_ids.push( tab_id )
  }
}

export function toggleTabBatchSelection( tab_id ) {
  // @todo parallel scan of selected_tab_ids & tab_groups to match
  let selected_tab_index = 0
  for( const tab_group of this.tab_groups ) {
    let delete_count = 0
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
        // could do this with 1 counter, but might be harder to read
        delete_count++
        selected_tab_index++
      }
      tab_group_index++
    }
    if( selected_group_tab_ids != null ) {
      this.selected_tab_ids.splice( delete_start_index, delete_count, ...selected_group_tab_ids )
    }
  }
}
