import init from "../../../src/store/reducers/init.mjs"
import { validateState } from "../../../src/store/validators.mjs"
import { default_config } from "../../../src/store/helpers.mjs"

import { createBrowserTab } from "../helpers.mjs"

function freshInitWithSingleWindow( t ) {
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

  let initial_state = init( null, { browser_tabs, config: default_config, window_tab_groups_map })

  t.ok( validateState( initial_state ), "initial state validates", validateState.errors )

  t.equal( initial_state.windows[ 0 ].tab_groups.length, 2 )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 1 ].id, 1 )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 1 ].title, "Group 1" )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 1 ].tabs.length, 2 )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 1 ].tabs_count, initial_state.windows[ 0 ].tab_groups[ 1 ].tabs.length )
  t.equal( initial_state.windows.length, 1 )
  t.equal( initial_state.windows[ 0 ].active_tab_group_id, initial_state.windows[ 0 ].tab_groups[ 1 ].id )
  t.end()
}

function freshInitWithMultipleWindows( t ) {
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
    config: default_config,
    window_tab_groups_map: new Map()
  }

  let state0 = init( null, browser_state )

  t.ok( validateState( state0 ), "initial state validates", validateState.errors )

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
}

function testSingleWindowMultiGroupDetectActive( t ) {
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
        id: 4,
        index: 3,
        windowId: 1
      })
    ],
    config: default_config,
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

  t.ok( validateState( state0 ), "initial state validates", validateState.errors )
  t.equal( state0.windows[ 0 ].active_tab_group_id, 2 )

  t.end()
}

function testSingleWindowSessionLoad( t ) {
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
        id: 4,
        index: 3,
        windowId: 1,
        session: {
          group_id: 1
        }
      })
    ],
    config: default_config,
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

  t.ok( validateState( state0 ), "initial state validates", validateState.errors )

  t.equal( state0.windows[ 0 ].tab_groups[ 1 ].tabs_count, 3 )
  t.equal( state0.windows[ 0 ].tab_groups[ 2 ].tabs_count, 1 )

  t.end()
}

// @todo if one window not included in saved state, ensure IDs not duplicated

export default function testInit( tap ) {
  tap.test( freshInitWithSingleWindow )
  tap.test( freshInitWithMultipleWindows )
  tap.test( testSingleWindowMultiGroupDetectActive )
  tap.test( testSingleWindowSessionLoad )
  tap.end()
}
