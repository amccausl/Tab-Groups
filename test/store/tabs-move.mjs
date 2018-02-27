import { createTestTab } from './helpers'
import {
  createPinnedTabGroup,
  createTabGroup,
  createWindow,
  getTabMoveData,
} from '../../src/store/helpers.mjs'
import { validateState } from '../../src/store/validators.mjs'

import { moveTabs } from '../../src/store/reducers'

function testSingleWindowMoveOne( t ) {
  const initial_state = {
    config: {},
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({ id: 4 }),
          createTestTab({ id: 5 }),
          createTestTab({ id: 6 })
        ]),
        createTabGroup( 3, [
          createTestTab({ id: 7 }),
          createTestTab({ id: 8 })
        ])
      ])
    ]
  }

  t.ok( validateState( initial_state ), "state validates", validateState.errors )

  let source_data = {
    window_id: 1,
    tab_ids: [ 4, 5 ]
  }
  let target_data = {
    window_id: 1
  }

  let tab_move_data = getTabMoveData( initial_state, source_data, target_data )

  const state1 = moveTabs( initial_state, tab_move_data )
  t.ok( validateState( state1 ), "state validates", validateState.errors )
  t.end()
}

function testMoveActiveTab( t ) {
  const initial_state = {
    config: {},
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({ id: 4 }),
          createTestTab({ id: 5 }),
          createTestTab({ id: 6 })
        ]),
        createTabGroup( 3, [
          createTestTab({ id: 7 }),
          createTestTab({ id: 8 })
        ])
      ])
    ]
  }

  t.ok( validateState( initial_state ), "state validates", validateState.errors )

  let active_tab_group = initial_state.windows[ 0 ].tab_groups.find( tab_group => tab_group.id === initial_state.windows[ 0 ].active_tab_group_id )
  let inactive_tab_group = initial_state.windows[ 0 ].tab_groups.find( tab_group => tab_group.id && tab_group.id !== initial_state.windows[ 0 ].active_tab_group_id )
  let active_tab = active_tab_group.tabs.find( tab => tab.id === active_tab_group.active_tab_id )

  let source_data = {
    window_id: 1,
    tab_ids: [ active_tab.id ]
  }
  let target_data = {
    window_id: 1,
    tab_group_id: inactive_tab_group.id
  }

  let tab_move_data = getTabMoveData( initial_state, source_data, target_data )

  const state1 = moveTabs( initial_state, tab_move_data )
  t.ok( validateState( state1 ), "state validates", validateState.errors )
  t.equal( state1.windows[ 0 ].active_tab_group_id, inactive_tab_group.id, 'activate new group on move of active tab' )
  t.end()
}

export default function( tap ) {
  tap.test( testSingleWindowMoveOne )
  tap.test( testMoveActiveTab )
  tap.end()
}
