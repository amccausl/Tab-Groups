import tap from "tap"

import init from "../../../src/store/reducers/init.mjs"
import { validateState } from "../../../src/store/validators.mjs"

import { createBrowserTab } from "../helpers.mjs"

// @todo if one window not included in saved state, ensure IDs not duplicated

tap.test( function freshInitWithSingleWindow( t ) {
  const browser_tabs = [
    createBrowserTab({
      id: 1,
      index: 0,
      windowId: 1
    }),
    createBrowserTab({
      id: 2,
      index: 1,
      windowId: 1,
      highlighted: true,
      active: true
    }),
    createBrowserTab({
      id: 3,
      index: 2,
      windowId: 1
    })
  ]
  const window_tab_groups_map = new Map()

  let initial_state = init( null, { browser_tabs, config: {}, window_tab_groups_map })

  t.ok( validateState( initial_state ), "initial should pass validation", validateState.errors )

  t.equal( initial_state.windows[ 0 ].tab_groups.length, 2 )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 1 ].id, 1 )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 1 ].title, "Group 1" )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 1 ].tabs.length, 3 )
  t.equal( initial_state.windows.length, 1 )
  t.equal( initial_state.windows[ 0 ].active_tab_group_id, initial_state.windows[ 0 ].tab_groups[ 1 ].id )
  t.end()
})

tap.test( function freshInitWithMultipleWindows( t ) {
  const browser_state = {
    browser_tabs: [
      createBrowserTab({
        id: 1,
        index: 0,
        windowId: 1
      }),
      createBrowserTab({
        id: 2,
        index: 1,
        windowId: 1
      }),
      createBrowserTab({
        id: 3,
        index: 0,
        windowId: 2
      }),
      createBrowserTab({
        id: 4,
        index: 1,
        windowId: 2
      })
    ],
    config: {},
    window_tab_groups_map: new Map()
  }

  let state0 = init( null, browser_state )

  t.ok( validateState( state0 ), "initial should pass validation", validateState.errors )

  t.equal( state0.windows.length, 2 )

  t.equal( state0.windows[ 0 ].tab_groups[ 1 ].id, 1 )
  t.equal( state0.windows[ 0 ].tab_groups[ 1 ].title, "Group 1" )
  t.equal( state0.windows[ 0 ].tab_groups[ 1 ].tabs.length, 2 )
  t.equal( state0.windows[ 0 ].active_tab_group_id, state0.windows[ 0 ].tab_groups[ 1 ].id )

  t.equal( state0.windows[ 1 ].tab_groups[ 1 ].id, 2 )
  // @todo may want to use Group 1 instead
  t.equal( state0.windows[ 1 ].tab_groups[ 1 ].title, "Group 2" )
  t.equal( state0.windows[ 1 ].tab_groups[ 1 ].tabs.length, 2 )
  t.equal( state0.windows[ 1 ].active_tab_group_id, state0.windows[ 1 ].tab_groups[ 1 ].id )
  t.end()
})

tap.test( function testSingleWindowMultiGroupDetectActive( t ) {
  const browser_state = {
    browser_tabs: [
      createBrowserTab({
        id: 1,
        index: 0,
        windowId: 1
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
        active: true,
        highlighted: true,
        id: 4,
        index: 3,
        windowId: 1
      })
    ],
    config: {},
    contextual_identities: [],
    theme: {},
    window_tab_groups_map: new Map([[ 1, [
      {
        active_tab_id: null,
        id: 1,
        tabs_count: 2,
        title: "Group 1"
      },
      {
        active: true,
        active_tab_id: 4,
        id: 2,
        tabs_count: 2,
        title: "Group 2"
      }
    ]]])
  }

  const state0 = init( null, browser_state )

  t.ok( validateState( state0 ), "initial should pass validation", validateState.errors )
  t.equal( state0.windows[ 0 ].active_tab_group_id, 2 )

  t.end()
})

tap.test( function testSingleWindowSessionLoad( t ) {
  const browser_state = {
    browser_tabs: [
      createBrowserTab({
        id: 1,
        index: 0,
        windowId: 1,
        session: {
          group_id: 1
        }
      }),
      createBrowserTab({
        id: 2,
        index: 1,
        windowId: 1,
        session: {
          group_id: 2
        }
      }),
      createBrowserTab({
        id: 3,
        index: 2,
        windowId: 1,
        session: {
          group_id: 1
        }
      }),
      createBrowserTab({
        active: true,
        highlighted: true,
        id: 4,
        index: 3,
        windowId: 1,
        session: {
          group_id: 1
        }
      })
    ],
    config: {},
    contextual_identities: [],
    theme: {},
    window_tab_groups_map: new Map([[ 1, [
      {
        active_tab_id: 1,
        id: 1,
        tabs_count: 2,
        title: "Group 1"
      },
      {
        active_tab_id: 2,
        id: 2,
        tabs_count: 2,
        title: "Group 2"
      }
    ]]])
  }

  const state0 = init( null, browser_state )

  t.ok( validateState( state0 ), "initial should pass validation", validateState.errors )

  t.equal( state0.windows[ 0 ].tab_groups[ 1 ].tabs_count, 3 )
  t.equal( state0.windows[ 0 ].tab_groups[ 2 ].tabs_count, 1 )

  t.end()
})

tap.test( function testUnsetActiveTab( t ) {
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
    }),
    createBrowserTab({
      id: 3,
      index: 2,
      windowId: 1,
      highlighted: true,
      active: true,
    })
  ]
  const window_tab_groups_map = new Map()
  window_tab_groups_map.set( 1, [
    {
      active: true,
      active_tab_id: null,
      id: 10,
      tabs_count: 2,
      title: "Group",
    }
  ])

  let initial_state = init( null, { browser_tabs, config: {}, window_tab_groups_map })

  t.ok( validateState( initial_state ), "initial should pass validation", validateState.errors )
  // console.info( initial_state.windows[ 0 ] )

  t.end()
})
