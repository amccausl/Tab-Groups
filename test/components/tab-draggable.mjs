import tap from "tap"

import {
  getTransferData,
  onTabDragStart,
  onTabDragEnter,
} from "../../src/components/tab-draggable.mjs"
import {
  createTabGroup,
} from "../../src/store/helpers.mjs"
import {
  createTestTab,
} from "../store/helpers.mjs"

function createTestComponent( window_id ) {
  const component = {
    window_id,
    selected_tab_ids: [],
    drag_state: {
      is_dragging: false,
      source: {},
      target: {},
    },
    isSelected( tab ) {
      return component.selected_tab_ids.includes( tab.id )
    }
  }

  return component
}

function createTestEvent( event_type ) {
  const event_data = {}

  const dataTransfer = {
    effectAllowed: "none",
    setData( type, data ) {
      if( ! event_data.hasOwnProperty( type ) ) {
        dataTransfer.mozItemCount++
      }
      event_data[ type ] = data
    },
    getData( type ) {
      return event_data[ type ]
    },
    mozItemCount: 0,
    types: {
      includes( type ) {
        return event_data.hasOwnProperty( type )
      }
    },
    mozTypesAt( index ) {
      // @todo
    },
    mozGetDataAt( type, index ) {
      // @todo
    }
  }

  return {
    dataTransfer
  }
}

function draggingLocalTab( t ) {
  const window_id = 1
  const component = createTestComponent( window_id )
  const source_tab_id = 2
  const source_tab = createTestTab({ id: source_tab_id })

  let event = createTestEvent( "dragstart" )
  onTabDragStart.call( component, event, source_tab )

  t.same( component.selected_tab_ids, [ source_tab_id ] )
  t.same( component.drag_state, {
    is_dragging: true,
    source: {
      type: "tab",
      window_id,
      tab_ids: [ source_tab_id ]
    },
    target: {}
  })

}

function getTransferDataFromBookmark( t ) {
  const { dataTransfer } = createTestEvent()
  dataTransfer.setData( "text/x-moz-place", JSON.stringify({ title: "Form Input Bindings - vue.js", id: 23, instanceId: "tZs5c2LkrbEw", itemGuid: "6DOtb-vmPSoP", parent: 16, parentGuid: "-vT2uwGSD6NZ", dateAdded: 1523984481255000, lastModified: 0, type: "text/x-moz-place", uri: "https://v1.vuejs.org/guide/forms.html" }) )
  dataTransfer.setData( "text/x-moz-url", "https://v1.vuejs.org/guide/forms.html\r\nForm Input Bindings - vue.js" )
  const event_data = getTransferData( dataTransfer )

  t.same( event_data, { type: "moz-place", links: [ { url: "https://v1.vuejs.org/guide/forms.html", title: "Form Input Bindings - vue.js" } ] } )
}

function getTransferDataFromBookmarkFolder( t ) {
  const { dataTransfer } = createTestEvent()
  dataTransfer.setData( "text/x-moz-place", JSON.stringify({ title: "New Folder", id: 16, instanceId: "tZs5c2LkrbEw", itemGuid: "-vT2uwGSD6NZ", parent: 3, parentGuid: "toolbar_____", dateAdded: 1523984341977000, lastModified: 1523984389474000, annos: [{ name: "bookmarkPropertiesDialog/folderLastUsed", flags: 0, expires: 4, value: 1523984389473 }], type: "text/x-moz-place-container" }) )
  dataTransfer.setData( "text/x-moz-url", "https://support.mozilla.org/en-US/kb/get-started-firefox-overview-main-features\r\nGet started with Firefox\r\nhttps://v1.vuejs.org/guide/forms.html\r\nForm Input Bindings - vue.js" )
  const event_data = getTransferData( dataTransfer )

  t.same( event_data, { type: "moz-place", title: "New Folder", links: [
    { url: "https://support.mozilla.org/en-US/kb/get-started-firefox-overview-main-features", title: "Get started with Firefox" },
    { url: "https://v1.vuejs.org/guide/forms.html", title: "Form Input Bindings - vue.js" }
  ]})
}

function getTransferDataFromLibraryLink( t ) {
}

function getTransferDataFromLocationBar( t ) {
}

function getTransferDataFromLink( t ) {
  const { dataTransfer } = createTestEvent()
}

tap.test( draggingLocalTab )
tap.test( getTransferDataFromBookmark )
tap.test( getTransferDataFromBookmarkFolder )
