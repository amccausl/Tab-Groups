import {
  createTestTab,
  getInitialState,
} from './helpers.mjs'

import {
  createWindow,
  createTabGroup,
  createPinnedTabGroup,
} from '../../src/store/helpers.mjs'
import {
  removeTab,
} from '../../src/store/reducers.mjs'
import {
  validateState,
} from '../../src/store/validators.mjs'

function testRemoveFirstTab( t ) {
  let state = getInitialState()

  let tab_id = state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ].id

  state = removeTab( state, { tab_id, window_id: state.windows[ 0 ].id } )
  t.ok( validateState( state ), "state validates", validateState.errors )

  t.equal( state.windows[ 0 ].tab_groups.length, 2 )
  t.equal( state.windows[ 0 ].tab_groups[ 1 ].tabs.length, 1 )
  t.equal( state.windows[ 0 ].tab_groups[ 1 ].tabs_count, state.windows[ 0 ].tab_groups[ 1 ].tabs.length )
  t.end()
}

function testRemoveMiddleTab( t ) {
  const window_id = 1
  let state = {
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

  let tab_id = state.windows[ 0 ].tab_groups[ 1 ].tabs[ 1 ].id

  state = removeTab( state, { tab_id, window_id } )
  t.ok( validateState( state ), "state validates", validateState.errors )

  t.equal( state.windows[ 0 ].tab_groups.length, 2 )
  t.equal( state.windows[ 0 ].tab_groups[ 1 ].tabs.length, 2 )
  t.equal( state.windows[ 0 ].tab_groups[ 1 ].tabs_count, state.windows[ 0 ].tab_groups[ 1 ].tabs.length )
  t.end()
}

function testRemoveLastTab( t ) {
  let window_id = 1
  let state = {
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

  let tab_id = state.windows[ 0 ].tab_groups[ 1 ].tabs[ state.windows[ 0 ].tab_groups[ 1 ].tabs.length - 1 ].id

  state = removeTab( state, { tab_id, window_id } )
  t.ok( validateState( state ), "state validates", validateState.errors )

  t.equal( state.windows[ 0 ].tab_groups.length, 2 )
  t.equal( state.windows[ 0 ].tab_groups[ 1 ].tabs.length, 2 )
  t.equal( state.windows[ 0 ].tab_groups[ 1 ].tabs_count, state.windows[ 0 ].tab_groups[ 1 ].tabs.length )
  t.end()
}

export default function( tap ) {
  tap.test( testRemoveFirstTab )
  tap.test( testRemoveMiddleTab )
  tap.test( testRemoveLastTab )
  tap.end()
}
