import tap from 'tap'

import {
  createTestTab,
} from "./helpers.mjs"

import {
  createWindow,
  createTabGroup,
  createPinnedTabGroup,
} from "../../src/store/helpers.mjs"
import {
  removeTab,
} from "../../src/store/reducers/tab.mjs"
import {
  validateState,
} from "../../src/store/validators.mjs"

function testRemoveFirstTab( t ) {
  const window_id = 1
  const tab_id = 3
  const state0 = {
    config: {},
    windows: [
      createWindow( window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({
            id: tab_id
          }),
          createTestTab({
            id: 4
          }),
          createTestTab({
            id: 5
          })
        ])
      ])
    ]
  }

  const state1 = removeTab( state0, { tab_id, window_id } )
  t.ok( validateState( state1 ), "state validates", validateState.errors )

  t.equal( state1.windows[ 0 ].tab_groups.length, 2 )
  t.equal( state1.windows[ 0 ].tab_groups[ 1 ].tabs.length, 2 )
  t.equal( state1.windows[ 0 ].active_tab_id, 4 )
  t.same( state1.windows[ 0 ].highlighted_tab_ids, [ 4 ] )
  t.end()
}

function testRemoveMiddleTab( t ) {
  const window_id = 1
  const state0 = {
    config: {},
    windows: [
      createWindow( window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( 1, [
          createTestTab({
            id: 1
          }),
          createTestTab({
            id: 2
          }),
          createTestTab({
            id: 3
          })
        ])
      ])
    ]
  }

  let tab_id = state0.windows[ 0 ].tab_groups[ 1 ].tabs[ 1 ].id

  const state1 = removeTab( state0, { tab_id, window_id } )
  t.ok( validateState( state1 ), "state validates", validateState.errors )

  t.equal( state1.windows[ 0 ].tab_groups.length, 2 )
  t.equal( state1.windows[ 0 ].tab_groups[ 1 ].tabs.length, 2 )
  t.end()
}

function testRemoveLastTab( t ) {
  let window_id = 1
  let tab_id = 5
  const state0 = {
    config: {},
    windows: [
      createWindow( window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({
            id: 3
          }),
          createTestTab({
            id: 4
          }),
          createTestTab({
            id: tab_id
          })
        ])
      ])
    ]
  }

  const state1 = removeTab( state0, { tab_id, window_id } )
  t.ok( validateState( state1 ), "state validates", validateState.errors )

  t.equal( state1.windows[ 0 ].tab_groups.length, 2 )
  t.equal( state1.windows[ 0 ].tab_groups[ 1 ].tabs.length, 2 )
  t.end()
}

tap.test( testRemoveFirstTab )
tap.test( testRemoveMiddleTab )
tap.test( testRemoveLastTab )
