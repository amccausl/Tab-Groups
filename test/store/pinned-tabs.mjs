import {
  createBrowserTab,
  createTestTab,
  getInitialState,
} from "./helpers.mjs"

import {
  createTabGroup,
  createPinnedTabGroup,
  createWindow,
} from "../../src/store/helpers.mjs"
import init from "../../src/store/reducers/init.mjs"
import addTab from "../../src/store/reducers/add-tab.mjs"
import { updateTab } from "../../src/store/reducers/tab.mjs"
import { validateState } from "../../src/store/validators.mjs"

function testSingleWindowFreshInit( t ) {
  const browser_tabs = [
    createBrowserTab({
      id: 1,
      index: 0,
      windowId: 1,
      pinned: true
    }),
    createBrowserTab({
      id: 2,
      index: 1,
      windowId: 1
    })
  ]
  const window_tab_groups_map = new Map()

  let initial_state = init( null, { browser_tabs, window_tab_groups_map })
  t.equal( initial_state.windows.length, 1 )

  t.equal( initial_state.windows[ 0 ].tab_groups.length, 2 )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 0 ].pinned, true )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 1 ].pinned, undefined )
  t.equal( initial_state.windows[ 0 ].active_tab_group_id, 1 )
  t.end()
}

function testSingleWindowFreshPinnedInit( t ) {
  const browser_tabs = [
    createBrowserTab({
      id: 1,
      index: 0,
      windowId: 1
    }),
    createBrowserTab({
      id: 2,
      index: 1,
      windowId: 1
    })
  ]
  const window_tab_groups_map = new Map()

  // @todo toggle based on config
  t.end()
}

function testPinnedTabs( t ) {
  const browser_tabs = [
    createBrowserTab({
      id: 1,
      index: 0,
      windowId: 1,
      pinned: true
    }),
    createBrowserTab({
      id: 2,
      index: 1,
      windowId: 1
    }),
    createBrowserTab({
      id: 3,
      index: 2,
      windowId: 1
    }),
    createBrowserTab({
      id: 4,
      index: 3,
      windowId: 1
    })
  ]
  const window_tab_groups_map = new Map()

  // Initial state with 1 pinned + 3 normal tabs in 1 window
  let state = init( null, { browser_tabs, window_tab_groups_map })
  t.equal( state.windows.length, 1 )
  t.equal( state.windows[ 0 ].tab_groups.length, 2 )
  t.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 1 )
  t.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs[ 0 ].id, 1 )
  t.equal( state.windows[ 0 ].tab_groups[ 1 ].tabs.length, 3 )

  // Pin another tab
  let browser_tab = createBrowserTab({
    id: state.windows[ 0 ].tab_groups[ 1 ].tabs[ 1 ].id,
    index: 1,
    windowId: 1
  })
  state = updateTab( state, { browser_tab, change_info: { pinned: true } } )

  // Ensure added to pinned
  t.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 2 )
  t.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs[ 1 ].id, browser_tab.id )
  // Ensure removed from groups
  // t.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 2 )

  // Unpin a tab
  // browser_tab = Object.assign( {}, state.windows[ 0 ].pinned_tabs[ 0 ], { index: 1, pinned: false } )
  state = updateTab( state, { browser_tab, change_info: { pinned: false } } )

  t.equal( state.windows[ 0 ].tab_groups[ 0 ].tabs.length, 1 )

  t.end()
}

function testOpenerPinnedTab( t ) {
  const state0 = {
    config: {},
    windows: [
      createWindow( 1, [
        createPinnedTabGroup([
          createTestTab({ id: 1 }),
        ]),
        createTabGroup( 1, [
          createTestTab({ id: 2 })
        ])
      ])
    ]
  }

  const browser_tab = createBrowserTab({
    id: 3,
    index: 1,
    windowId: 1,
    openerTabId: 1
  })

  const state1 = addTab( state0, { browser_tab } )

  t.ok( validateState( state1 ), "state validates", validateState.errors )
  t.equal( state1.windows[ 0 ].tab_groups[ 0 ].tabs_count, 1 )
  t.equal( state1.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ].id, 3 )
  t.end()
}

function testReopenPinnedTab( t ) {
  const state0 = {
    config: {},
    windows: [
      createWindow( 1, [
        createPinnedTabGroup([
          createTestTab({ id: 1 }),
        ]),
        createTabGroup( 1, [
          createTestTab({ id: 2 })
        ])
      ])
    ]
  }

  const browser_tab = createBrowserTab({
    id: 3,
    index: 1,
    windowId: 1,
    pinned: true
  })

  const state1 = addTab( state0, { browser_tab } )

  t.ok( validateState( state1 ), "state validates", validateState.errors )
  t.equal( state1.windows[ 0 ].tab_groups[ 0 ].tabs_count, 2 )
  t.equal( state1.windows[ 0 ].tab_groups[ 0 ].tabs[ 1 ].id, 3 )
  t.end()
}

function testPinActiveTab( t ) {
  const state0 = getInitialState()

  let browser_tab = createBrowserTab({
    id: state0.windows[ 0 ].tab_groups[ 1 ].active_tab_id,
    index: 1,
    windowId: state0.windows[ 0 ].id
  })
  const state1 = updateTab( state0, { browser_tab, change_info: { pinned: true } } )

  t.ok( validateState( state1 ), "state validates", validateState.errors )

  t.end()
}

export default function( tap ) {
  // @todo move pinned tabs
  tap.test( testSingleWindowFreshInit )
  tap.test( testPinnedTabs )
  tap.test( testOpenerPinnedTab )
  tap.test( testReopenPinnedTab )
  tap.test( testPinActiveTab )
  tap.end()
}
