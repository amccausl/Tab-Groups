
export function setTabTransferData( data_transfer, window_id, tab_ids ) {
  const event_data = { window_id, tab_ids }
  console.info('setTabTransferData', event_data)
  data_transfer.dropEffect = 'move'
  data_transfer.effectAllowed = 'move'
  data_transfer.setData( 'application/json', JSON.stringify( event_data ) )
}

// @todo extract helper to pull data transfer type
export function isTabTransfer( event_data ) {
  if( event_data ) {
    if( event_data.hasOwnProperty( 'tab_ids' ) ) {
      return true
    }
    if( event_data.type === 'moz-tab' ) {
      return true
    }
  }
  return false
}

export function getTransferData( data_transfer ) {
  let event_data = null
  const count = data_transfer.mozItemCount

  for( let i = 0; i < count; i++ ) {
    const types = data_transfer.mozTypesAt( i )
    for( let t = 0; t < types.length; t++ ) {
      // console.info("  " + types[ t ] + ": ")
      try {
        const data = data_transfer.mozGetDataAt( types[ t ], i )
        // console.info("(" + (typeof data) + ") : <" + data + ">\n")
      } catch( ex ) {
        // console.info("<>\n")
        dump( ex )
      }
    }
  }

  // From bookmarks
  if( data_transfer.types.includes( 'text/x-moz-place' ) ) {
    console.info('text/x-moz-place', data_transfer.getData( 'text/x-moz-place' ) )
  }
  if( data_transfer.types.includes( 'text/x-moz-url' ) ) {
    console.info('text/x-moz-url', data_transfer.getData( 'text/x-moz-url' ) )
  }
  // From Native Tab
  // if( data_transfer.types.includes( 'application/x-moz-tabbrowser-tab' ) ) {
  //   console.info('application/x-moz-tabbrowser-tab', data_transfer.getData( 'application/x-moz-tabbrowser-tab' ) )
  // }
  if( data_transfer.types.includes( 'text/x-moz-text-internal' ) ) {
    event_data = { type: 'moz-tab', url: data_transfer.getData( 'text/x-moz-text-internal' ) }
  }
  if( data_transfer.types.includes( 'application/json' ) ) {
    try {
      event_data = JSON.parse( data_transfer.getData( 'application/json' ) )
    } catch( ex ) {
      console.info('problem parsing "application/json" type', data_transfer.getData( 'application/json' ))
    }
  }
  // From extension
  // @todo error guard
  // console.info('getTransferData', event_data)

  return event_data
}

export function resetDragState() {
  this.is_dragging = false
  this.target_tab_group_new = false
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

function getTabGroupDragProperties( tab_group ) {
  return {
    target_tab_group_new: ( tab_group == null ),
    target_tab_group_id: ( tab_group != null ) ? tab_group.id : null,
    target_tab_group_index: null,
  }
}

const tab_group_drag_properties_reset = {
  target_tab_group_new: false,
  target_tab_group_id: null,
  target_tab_group_index: null,
}

let tab_group_drag_target = null

export function onTabGroupDragEnter( event, tab_group ) {
  console.info('onTabGroupDragEnter', tab_group ? tab_group.id : null, event)
  tab_group_drag_target = event.target
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
  Object.assign( this, getTabGroupDragProperties( tab_group ) )
  event.preventDefault()
}

export function onTabGroupDragLeave( event, tab_group ) {
  console.info('onTabGroupDragLeave', tab_group ? tab_group.id : null, event)

  // Leave is fired after the new enter, so detect if this is still the active group
  if( tab_group_drag_target === event.target ) {
    Object.assign( this, tab_group_drag_properties_reset )
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
      tab_group_id: tab_group ? tab_group.id : null
    }
    window.background.moveTabsToGroup( window.store, source_data, target_data )
    this.resetDragState()
  }
}
