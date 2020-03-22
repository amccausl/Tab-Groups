import tap from "tap"

import { createTestTab } from "../helpers"
import {
  createPinnedTabGroup,
  createTabGroup,
  createWindow,
  getTabMoveData,
} from "../../../src/store/helpers.mjs"
import { validateState } from "../../../src/store/validators.mjs"

import { moveTabs } from "../../../src/store/reducers/tab.mjs"

tap.test( function testSingleWindowMoveOne( t ) {
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

  t.ok( validateState( initial_state ), "should pass validation", validateState.errors )

  let source_data = {
    window_id: 1,
    tab_ids: [ 4, 5 ]
  }
  let target_data = {
    window_id: 1
  }

  let tab_move_data = getTabMoveData( initial_state, source_data, target_data )

  const state1 = moveTabs( initial_state, tab_move_data )
  t.ok( validateState( state1 ), "should pass validation", validateState.errors )
  t.end()
})

tap.test( function testMoveActiveTab( t ) {
  const last_active = ( new Date() ).getTime() - 10
  const initial_state = {
    config: {},
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        {
          ...createTabGroup( 2, [
            createTestTab({ id: 4 }),
            createTestTab({ id: 5 }),
            createTestTab({ id: 6 })
          ]),
          last_active
        },
        createTabGroup( 3, [
          createTestTab({ id: 7 }),
          createTestTab({ id: 8 })
        ])
      ])
    ]
  }

  t.ok( validateState( initial_state ), "should pass validation", validateState.errors )

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
  t.ok( validateState( state1 ), "should pass validation", validateState.errors )
  t.equal( state1.windows[ 0 ].active_tab_group_id, inactive_tab_group.id, "activate new group on move of active tab" )
  t.type( state1.windows[ 0 ].tab_groups[ 2 ].last_active, "number" )
  t.ok( state1.windows[ 0 ].tab_groups[ 2 ].last_active > last_active, `${ state1.windows[ 0 ].tab_groups[ 2 ].last_active } > ${ last_active }` )
  t.end()
})

tap.test( function testMoveTabsToNewGroup( t ) {
  const last_active = ( new Date() ).getTime() - 10
  const state0 = {
    config: {},
    windows: [
      {
        id: 3,
        active_tab_group_id: 1,
        active_tab_id: 7,
        tab_groups: [
          createPinnedTabGroup( [] ),
          {
            ...createTabGroup( 1, [
              createTestTab({ id: 4 }),
              createTestTab({ id: 5 }),
              createTestTab({ id: 6 }),
              createTestTab({ id: 7 }),
            ], 7),
            last_active
          }
        ]
      }
    ]
  }

  let source_data = {
    window_id: 3,
    tab_ids: [ 6, 7 ]
  }
  let target_data = {
    window_id: 3,
    tab_group_id: null,
  }

  let tab_move_data = getTabMoveData( state0, source_data, target_data )

  const state1 = moveTabs( state0, tab_move_data )

  t.ok( validateState( state1 ), "should pass validation", validateState.errors )
  const target_tab_group = state1.windows[ 0 ].tab_groups[ 2 ]
  t.equal( state1.windows[ 0 ].tab_groups.length, 3 )
  t.same( target_tab_group.tabs.map( tab => tab.id ), source_data.tab_ids )
  t.type( target_tab_group.last_active, "number" )
  t.ok( target_tab_group.last_active > last_active, `${ target_tab_group.last_active } > ${ last_active }` )
  t.equal( state1.windows[ 0 ].active_tab_id, 7 )
  t.equal( state1.windows[ 0 ].active_tab_group_id, tab_move_data.target_data.tab_group_id )
  t.end()
})
