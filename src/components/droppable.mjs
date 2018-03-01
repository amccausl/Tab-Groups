
export function setTabTransferData( data_transfer, window_id, tab_ids ) {
  const event_data = { window_id, tab_ids }
  console.info('setTabTransferData', event_data)
  data_transfer.dropEffect = 'move'
  data_transfer.effectAllowed = 'move'
  data_transfer.setData( 'application/json', JSON.stringify( event_data ) )
}

// @todo extract helper to pull data transfer type
export function isTabTransfer( event_data ) {
  return event_data && event_data.hasOwnProperty( 'tab_ids' )
}

export function getTransferData( data_transfer ) {
  const event_data = JSON.parse( data_transfer.getData( 'application/json' ) )
  // @todo error guard
  // console.info('getTransferData', event_data)

  return event_data
}

export function resetDragState() {
  this.is_dragging = false
  this.target_tab_group_id = null
  this.target_tab_group_index = null
  this.target_tab_id = null
  this.selected_tab_ids.splice( 0, this.selected_tab_ids.length )
}

export function onTabDragStart( event, tab ) {
  console.info('onTabDragStart', event, this.window_id, this.selected_tab_ids)
  this.is_dragging = true

  // Use the selected tabs if the tab is selected
  if( this.isSelected( tab ) ) {
    setTabTransferData( event.dataTransfer, this.window_id, [ ...this.selected_tab_ids ] )
  } else {
    this.selected_tab_ids.splice( 0, this.selected_tab_ids.length, tab.id )
    setTabTransferData( event.dataTransfer, this.window_id, [ tab.id ] )
  }
}

export function onTabDragOver( event, tab_group, tab ) {
  event.preventDefault()
  const event_data = getTransferData( event.dataTransfer )
  // console.info('onTabDragOver', event)
  if( isTabTransfer( event_data ) ) {
    this.target_tab_group_id = tab_group.id
    this.target_tab_group_index = tab_group.tabs.indexOf( tab )
    this.target_tab_id = tab.id
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'
  }
}

export function onTabDragEnd( event ) {
  console.info('onTabDragEnd', event)
  this.resetDragState()
}

export function onTabDrop( event, tab ) {
  const source_data = getTransferData( event.dataTransfer )
  console.info('onTabDrop', tab.id, event, source_data )

  const target_data = {
    window_id: this.window_id,
    tab_group_id: this.target_tab_group_id,
    tab_group_index: this.target_tab_group_index
  }

  window.background.moveTabsToGroup( window.store, source_data, target_data )
  this.selected_tab_ids.splice( 0, this.selected_tab_ids.length )
  this.resetDragState()
}

export function onTabGroupDragEnter( event, tab_group ) {
  console.info('onTabGroupDragEnter', tab_group, event)
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
  event.preventDefault()
}

export function onTabGroupDragOver( event, tab_group ) {
  event.preventDefault()
  const event_data = getTransferData( event.dataTransfer )
  // console.info('onTabGroupDragOver', tab_group, event)
  if( isTabTransfer( event_data ) ) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'
  }
}

export function onTabGroupDrop( event, tab_group ) {
  event.preventDefault()
  const source_data = getTransferData( event.dataTransfer )
  console.info('onTabGroupDrop', tab_group, event, source_data)
  if( isTabTransfer( source_data ) ) {
    console.info('detected tab drop', source_data)
    const target_data = {
      window_id: this.window_id,
      tab_group_id: tab_group.id
    }
    window.background.moveTabsToGroup( window.store, source_data, target_data )
    this.resetDragState()
  }
}
