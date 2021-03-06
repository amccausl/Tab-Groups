import tap from "tap"

import {
  createBrowserTab,
  createTestTab,
  getInitialState,
  getMultiWindowInitialState,
} from "../helpers.mjs"

import {
  createTabGroup,
  createPinnedTabGroup,
  createWindow,
} from "../../../src/store/helpers.mjs"
import { addTab } from "../../../src/store/reducers/tab.mjs"
import { validateState } from "../../../src/store/validators.mjs"

tap.test( async function testSingleWindowAdd( t ) {
  let state = getInitialState()

  let tab_group_id = state.windows[ 0 ].tab_groups[ 0 ].id
  let browser_tab = createBrowserTab({
    id: 3,
    index: 2,
    windowId: state.windows[ 0 ].id
  })

  state = addTab( state, { tab_group_id, browser_tab } )
  t.ok( validateState( state ), "should pass validation", validateState.errors )

  t.equal( state.windows[ 0 ].tab_groups.length, 2 )
  t.equal( state.windows[ 0 ].tab_groups[ 1 ].tabs.length, 3 )
})

tap.test( async function testMultiWindowAdd( t ) {
  let state = getMultiWindowInitialState()

  // let tab_group_id = state.tab_groups[ 1 ].id
  let browser_tab = createBrowserTab({
    id: 5,
    index: 2,
    windowId: state.windows[ 1 ].id
  })

  state = addTab( state, { browser_tab } )
  t.ok( validateState( state ), "should pass validation", validateState.errors )

  t.equal( state.windows[ 0 ].tab_groups[ 1 ].tabs.length, 2 )
  t.equal( state.windows[ 0 ].tab_groups[ 1 ].tabs_count, state.windows[ 0 ].tab_groups[ 1 ].tabs.length )
  t.equal( state.windows[ 1 ].tab_groups[ 1 ].tabs.length, 3 )
  t.equal( state.windows[ 1 ].tab_groups[ 1 ].tabs_count, state.windows[ 1 ].tab_groups[ 1 ].tabs.length )
})

tap.test( async function testAddToNewWindow( t ) {
  let state = getInitialState()

  let browser_tab = createBrowserTab({
    id: 5,
    index: 0,
    windowId: 100
  })

  state = addTab( state, { browser_tab } )
  t.ok( validateState( state ), "should pass validation", validateState.errors )

  t.equal( state.windows.length, 2 )
  t.equal( state.windows[ 1 ].tab_groups[ 1 ].tabs[ 0 ].id, 5 )
})

tap.test( async function testReopenClosedPinnedTab( t ) {
  const state0 = {
    config: {},
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
  t.ok( validateState( state1 ), "should pass validation", validateState.errors )

  t.equal( state1.windows[ 0 ].tab_groups[ 0 ].tabs.length, 2 )
  t.equal( state1.windows[ 0 ].tab_groups[ 0 ].tabs[ 1 ].id, 5 )

})

tap.test( async function testOpenNewTabWithOpenerId( t ) {
  const state0 = {
    config: {},
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [
          createTestTab({ id: 4 }),
        ]),
        createTabGroup( 2, [
          createTestTab({ id: 5 }),
          createTestTab({ id: 6 }),
        ], 5),
        createTabGroup( 3, [
          createTestTab({ id: 7 }),
          createTestTab({ id: 8 }),
        ], 7)
      ])
    ]
  }
  state0.windows[ 0 ].active_tab_group_id = 2
  state0.windows[ 0 ].active_tab_id = 5

  // Due to an upstream quirk, when creating a tab from another, the index will
  // be set to the end of window, then moved to the correct position
  let browser_tab = createBrowserTab({
    id: 9,
    index: 5,
    windowId: 1,
    openerTabId: 5
  })

  const state1 = addTab( state0, { browser_tab } )
  t.ok( validateState( state1 ), "should pass validation", validateState.errors )
  t.equal( state1.windows[ 0 ].tab_groups[ 1 ].tabs_count, 3 )

})

tap.test( async function testOpenNewTabInOtherGroup( t ) {
  const state0 = {
    config: {},
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({ id: 5 }),
          createTestTab({ id: 6 }),
        ], 5),
        createTabGroup( 3, [
        ])
      ])
    ]
  }
  state0.windows[ 0 ].active_tab_group_id = 2
  state0.windows[ 0 ].active_tab_id = 5

  let browser_tab = createBrowserTab({
    id: 9,
    index: 5,
    windowId: 1,
    openerTabId: 5,
    active: true,
    highlighted: true,
    session: {
      tab_group_id: 3
    },
  })

  const state1 = addTab( state0, { browser_tab } )
  const window1 = state1.windows[ 0 ]
  t.ok( validateState( state1 ), "should pass validation", validateState.errors )
  t.equal( window1.tab_groups[ 1 ].tabs_count, 2 )
  t.equal( window1.tab_groups[ 2 ].active_tab_id, 9 )
  t.equal( window1.active_tab_id, 9 )
  t.equal( window1.active_tab_group_id, 3 )
})

tap.test( async function testOpenActiveTabUndefinedGroup( t ) {
  const state0 = {
    config: {},
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({ id: 3 }),
        ], 3 ),
      ])
    ]
  }
  state0.windows[ 0 ].active_tab_group_id = 2
  state0.windows[ 0 ].active_tab_id = 3

  let browser_tab = createBrowserTab({
    id: 4,
    index: 1,
    windowId: 1,
    active: true,
  })

  const state1 = addTab( state0, { browser_tab, tab_group_id: undefined } )
  const window1 = state1.windows[ 0 ]
  t.ok( validateState( state1 ), "should pass validation", validateState.errors )
  t.equal( window1.active_tab_id, browser_tab.id )
})
