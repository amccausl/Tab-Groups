
import {
  onTabDragStart,
  onTabDragEnter,
} from '../../src/components/draggable.mjs'
import {
  createTabGroup,
} from '../../src/store/helpers.mjs'
import {
  createTestTab,
} from '../store/helpers.mjs'

function createTestComponent( window_id ) {
  const component = {
    window_id,
    is_dragging: false,
    selected_tab_ids: [],
    drag_state: {
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
    effectAllowed: 'none',
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

  let event = createTestEvent( 'dragstart' )
  onTabDragStart.call( component, event, source_tab )

  t.equal( component.is_dragging, true )
  t.same( component.selected_tab_ids, [ source_tab_id ] )
  t.same( component.drag_state, {
    source: {
      type: 'tab',
      window_id,
      tab_ids: [ source_tab_id ]
    },
    target: {}
  })

  t.end()
}

export default function( tap ) {
  tap.test( draggingLocalTab )
  tap.end()
}
