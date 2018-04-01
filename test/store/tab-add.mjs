import {
  createBrowserTab,
  createTestTab,
  getInitialState,
  getMultiWindowInitialState,
} from './helpers.mjs'

import {
  default_config,
  createTabGroup,
  createPinnedTabGroup,
  createWindow,
} from '../../src/store/helpers.mjs'
import { addTab } from '../../src/store/reducers.mjs'
import { validateState } from '../../src/store/validators.mjs'

function testSingleWindowAdd( t ) {
  let state = getInitialState()

  let tab_group_id = state.windows[ 0 ].tab_groups[ 0 ].id
  let browser_tab = createBrowserTab({
    id: 3,
    index: 2,
    windowId: state.windows[ 0 ].id
  })

  state = addTab( state, { tab_group_id, browser_tab } )
  t.ok( validateState( state ), "state validates", validateState.errors )

  t.equal( state.windows[ 0 ].tab_groups.length, 2 )
  t.equal( state.windows[ 0 ].tab_groups[ 1 ].tabs.length, 3 )
  t.end()
}

function testMultiWindowAdd( t ) {
  let state = getMultiWindowInitialState()

  // let tab_group_id = state.tab_groups[ 1 ].id
  let browser_tab = createBrowserTab({
    id: 5,
    index: 2,
    windowId: state.windows[ 1 ].id
  })

  state = addTab( state, { browser_tab } )
  t.ok( validateState( state ), "state validates", validateState.errors )

  t.equal( state.windows[ 0 ].tab_groups[ 1 ].tabs.length, 2 )
  t.equal( state.windows[ 0 ].tab_groups[ 1 ].tabs_count, state.windows[ 0 ].tab_groups[ 1 ].tabs.length )
  t.equal( state.windows[ 1 ].tab_groups[ 1 ].tabs.length, 3 )
  t.equal( state.windows[ 1 ].tab_groups[ 1 ].tabs_count, state.windows[ 1 ].tab_groups[ 1 ].tabs.length )
  t.end()
}

function testAddToNewWindow( t ) {
  let state = getInitialState()

  let browser_tab = createBrowserTab({
    id: 5,
    index: 0,
    windowId: 100
  })

  state = addTab( state, { browser_tab } )
  t.ok( validateState( state ), "state validates", validateState.errors )

  t.equal( state.windows.length, 2 )
  t.equal( state.windows[ 1 ].tab_groups[ 1 ].tabs[ 0 ].id, 5 )
  t.end()
}

function testReopenClosedPinnedTab( t ) {
  const state0 = {
    config: default_config,
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [
          createTestTab({
            id: 3
          }),
        ]),
        createTabGroup( 2, [
          createTestTab({
            id: 4
          })
        ])
      ])
    ]
  }

  let browser_tab = createBrowserTab({
    id: 5,
    index: 1,
    windowId: 1,
    pinned: true,
  })

  const state1 = addTab( state0, { browser_tab } )
  t.ok( validateState( state1 ), "state validates", validateState.errors )

  t.equal( state1.windows[ 0 ].tab_groups[ 0 ].tabs.length, 2 )
  t.equal( state1.windows[ 0 ].tab_groups[ 0 ].tabs[ 1 ].id, 5 )

  t.end()
}

export default function( tap ) {
  tap.test( testSingleWindowAdd )
  tap.test( testMultiWindowAdd )
  tap.test( testAddToNewWindow )
  tap.test( testReopenClosedPinnedTab )
  tap.end()
}
