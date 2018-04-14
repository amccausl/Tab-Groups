
let drag_target = null

function setTabTransferData( data_transfer, window_id, tab_ids ) {
  const event_data = { window_id, tab_ids }
  data_transfer.effectAllowed = 'move'
  data_transfer.setData( 'application/json', JSON.stringify( event_data ) )
}

function setTabGroupTransferData( data_transfer, window_id, tab_group ) {
  const event_data = { window_id, tab_group_id: tab_group.id }
  data_transfer.effectAllowed = 'move'
  data_transfer.setData( 'application/json', JSON.stringify( event_data ) )
}

function getTransferType( event_data ) {
  if( event_data ) {
    if( event_data.type === 'moz-tab' ) {
      return 'tab'
    }
    if( event_data.tab_ids != null ) {
      return 'tab'
    }
    if( event_data.tab_group_id != null ) {
      return 'tab_group'
    }
    if( event_data.type != null && event_data.type === 'moz-tab' ) {
      return 'tab'
    }
  }
  return null
}

function getTransferData( data_transfer ) {
  let event_data = null
  const count = data_transfer.mozItemCount

  /*
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
  */

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
      console.warn('problem parsing "application/json" type', data_transfer.getData( 'application/json' ))
    }
  }
  // From extension
  // @todo error guard

  return event_data
}

function getTabDragProperties( event, tab_group, tab ) {
  return {
    target: {
      tab_group_id: tab_group.id,
      tab_group_index: tab_group.tabs.indexOf( tab ),
      tab_id: tab.id,
    }
  }
}

function getTabGroupDragProperties( event, tab_group ) {
  return {
    target: {
      tab_group_new: ( tab_group == null ),
      tab_group_id: ( tab_group != null ? tab_group.id : null ),
      tab_group_index: null,
    }
  }
}

function resetDragState() {
  this.is_dragging = false
  Object.assign( this.drag_state, { source: {}, target: {} } )
  this.selected_tab_ids.splice( 0, this.selected_tab_ids.length )
}

export function onTabDragStart( event, tab ) {
  this.is_dragging = true

  // Use the selected tabs if the tab is selected
  let tab_ids
  if( this.isSelected( tab ) ) {
    tab_ids = [ ...this.selected_tab_ids ]
  } else {
    this.selected_tab_ids.splice( 0, this.selected_tab_ids.length, tab.id )
    tab_ids = [ tab.id ]
  }
  setTabTransferData( event.dataTransfer, this.window_id, tab_ids )

  this.drag_state.source = {
    type: "tab",
    window_id: this.window_id,
    tab_ids
  }
}

export function onTabDragEnd( event ) {
  resetDragState.call( this )
}

export function onTabDragEnter( event, tab_group, tab ) {
  const event_data = getTransferData( event.dataTransfer )
  const transfer_type = getTransferType( event_data )
  if( transfer_type === "tab" ) {
    drag_target = event.target
    event.dataTransfer.dropEffect = "move"
    Object.assign( this.drag_state, getTabDragProperties( event, tab_group, tab ) )
    event.preventDefault()
  } else {
    if( transfer_type === "tab_group" ) {
      Object.assign( this.drag_state.source, { type: "tab_group", tab_group_id: event_data.tab_group_id } )
    }
    event.dataTransfer.dropEffect = "none"
  }
}

export function onTabDragLeave( event, tab_group, tab ) {
  // Leave is fired after the new enter, so detect if this is still the active group
  if( drag_target === event.target ) {
    this.drag_state.target = {}
  }
}

export function onTabDrop( event, tab_group, tab ) {
  const event_data = getTransferData( event.dataTransfer )
  const transfer_type = getTransferType( event_data )
  if( transfer_type === "tab" ) {
    const target_data = {
      window_id: this.window_id,
      tab_group_id: tab_group.id,
      tab_group_index: tab_group.tabs.indexOf( tab )
    }

    window.background.moveTabsToGroup( window.store, event_data, target_data )
    this.selected_tab_ids.splice( 0, this.selected_tab_ids.length )
  }
  resetDragState.call( this )
}

export function onTabGroupDragStart( event, tab_group ) {
  this.is_dragging = true
  this.drag_state.source = {
    type: 'tab_group',
    tab_group_id: tab_group.id
  }
  setTabGroupTransferData( event.dataTransfer, this.window_id, tab_group )
}

export function onTabGroupDragEnd( event, tab_group ) {
  resetDragState.call( this )
}

export function onTabGroupDragEnter( event, tab_group, tab_group_index ) {
  const event_data = getTransferData( event.dataTransfer )
  const transfer_type = getTransferType( event_data )
  if( transfer_type != null ) {
    drag_target = event.target
    event.dataTransfer.dropEffect = 'move'
    switch( transfer_type ) {
      case 'tab_group':
        Object.assign( this.drag_state, getTabGroupDragProperties( event, tab_group ) )
        this.drag_state.source.type = 'tab_group'
        this.drag_state.tab_group_index = tab_group_index
        break
      case 'tab':
        Object.assign( this.drag_state, getTabGroupDragProperties( event, tab_group ) )
        this.drag_state.source.type = 'tab'
        break
    }
    event.preventDefault()
  }
}

export function onTabGroupDragLeave( event, tab_group, tab_group_index ) {
  // Leave is fired after the new enter, so detect if this is still the active group
  if( drag_target === event.target ) {
    Object.assign( this.drag_state, { target: {} } )
  }
}

export function onTabGroupDrop( event, tab_group, tab_group_index ) {
  const event_data = getTransferData( event.dataTransfer )
  const transfer_type = getTransferType( event_data )
  if( transfer_type != null ) {
    event.preventDefault()
    resetDragState.call( this )
    switch( transfer_type ) {
      case "tab_group":
        const target_data = {
          window_id: this.window_id,
          tab_group_index
        }
        return window.background.moveTabGroup( window.store, event_data, target_data )
      case "tab":
        if( tab_group == null ) {
          return window.background.createGroup( window.store, this.window_id, event_data )
            .then( tab_group => this.renameTabGroup( tab_group.id ) )
        } else {
          const target_data = {
            window_id: this.window_id,
            tab_group_id: tab_group ? tab_group.id : null
          }
          return window.background.moveTabsToGroup( window.store, event_data, target_data )
        }
    }
  }
}
