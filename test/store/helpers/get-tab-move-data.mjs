import {
  getTabState
} from "../../../src/integrations/index.mjs"
import {
  createWindow,
  createTabGroup,
  createPinnedTabGroup,
  getTabMoveData,
} from "../../../src/store/helpers.mjs"
import {
  createBrowserTab,
  createTestTab,
} from "../helpers.mjs"

function testGetTabMoveData( t ) {
  const initial_state = {
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

  let source_data = {
    window_id: 1,
    tab_ids: [ 4, 5 ]
  }
  let target_data = {
    window_id: 1,
    tab_group_id: 3
  }

  let tab_move_data = getTabMoveData( initial_state, source_data, target_data )

  t.equal( tab_move_data.source_data.window_id, 1 )
  t.equal( tab_move_data.source_data.tabs.filter( tab => tab ).length, 2, "no missing tabs" )
  t.same( tab_move_data.source_data.tabs.map( tab => tab.id ), [ 4, 5 ], "tabs match ids and order" )
  t.equal( tab_move_data.source_data.tabs[ 0 ], initial_state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ], "copy tab 4 by reference" )
  t.equal( tab_move_data.source_data.tabs[ 1 ], initial_state.windows[ 0 ].tab_groups[ 1 ].tabs[ 1 ], "copy tab 5 by reference" )
  t.same( tab_move_data.target_data, {
    window_id: 1,
    index: 3,
    tab_group_id: 3,
    tab_group_index: 2
  })

  t.end()
}

function testGetTabMoveDataMiddle( t ) {
  const initial_state = {
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({ id: 5 }),
          createTestTab({ id: 6 }),
          createTestTab({ id: 7 })
        ]),
        createTabGroup( 3, [
          createTestTab({ id: 8 })
        ]),
        createTabGroup( 4, [
          createTestTab({ id: 9 })
        ])
      ])
    ]
  }

  let source_data = {
    window_id: 1,
    tab_ids: [ 5 ]
  }
  let target_data = {
    window_id: 1,
    tab_group_id: 3
  }

  let tab_move_data = getTabMoveData( initial_state, source_data, target_data )

  t.equal( tab_move_data.source_data.window_id, 1 )
  t.equal( tab_move_data.source_data.tabs.filter( tab => tab ).length, 1, "no missing tabs" )
  t.same( tab_move_data.source_data.tabs.map( tab => tab.id ), [ 5 ], "tabs match ids and order" )
  t.equal( tab_move_data.source_data.tabs[ 0 ], initial_state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ], "copy tab 5 by reference" )
  t.same( tab_move_data.target_data, {
    window_id: 1,
    index: 3,
    tab_group_id: 3,
    tab_group_index: 1
  })

  t.end()
}

function testGetTabMoveDataReopenPinned( t ) {
  // Reopened pinned tabs are opened at the end of the
  const state0 = {
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [
          createTestTab({ id: 3 })
        ] ),
        createTabGroup( 2, [
          createTestTab({ id: 4 }),
          createTestTab({ id: 5 })
        ])
      ])
    ]
  }

  const browser_tab = createBrowserTab({
    id: 6,
    index: 1,
    windowId: 1,
    pinned: true
  })
  const tab = getTabState( browser_tab )

  const move_data = getTabMoveData(
    state0,
    { tabs: [ tab ] },
    {
      window_id: browser_tab.windowId,
      index: browser_tab.index,
      pinned: browser_tab.pinned
    }
  )

  t.end()
}

function testGetTabMoveDataNewGroup( t ) {
  const initial_state = {
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({ id: 4 }),
          createTestTab({ id: 5 })
        ])
      ])
    ]
  }

  let source_data = {
    window_id: 1,
    tab_ids: [ 4 ]
  }
  let target_data = {
    window_id: 1,
    tab_group_id: null
  }

  let tab_move_data = getTabMoveData( initial_state, source_data, target_data )

  t.equal( tab_move_data.source_data.window_id, 1 )
  t.equal( tab_move_data.source_data.tabs.filter( tab => tab ).length, 1, "no missing tabs" )
  t.equal( tab_move_data.source_data.tabs[ 0 ], initial_state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ], "copy tab 4 by reference" )
  t.same( tab_move_data.target_data.tab_group, {
    id: 3,
    title: "Group 3",
    active_tab_id: 4,
    tabs: tab_move_data.source_data.tabs,
    tabs_count: tab_move_data.source_data.tabs.length
  })

  t.end()
}

function testMoveFromUrl( t ) {
  const state0 = {
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

  let source_data = {
    type: "moz-url",
    url: 'https://google.ca'
  }
  let target_data = {
    window_id: 1,
    tab_group_id: 3
  }

  let tab_move_data = getTabMoveData( state0, source_data, target_data )

  // t.equal( tab_move_data.source_data.window_id, 1 )
  // t.equal( tab_move_data.source_data.tabs.filter( tab => tab ).length, 2, "no missing tabs" )
  // t.same( tab_move_data.source_data.tabs.map( tab => tab.id ), [ 4, 5 ], "tabs match ids and order" )
  // t.equal( tab_move_data.source_data.tabs[ 0 ], state0.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ], "copy tab 4 by reference" )
  // t.equal( tab_move_data.source_data.tabs[ 1 ], state0.windows[ 0 ].tab_groups[ 1 ].tabs[ 1 ], "copy tab 5 by reference" )
  // t.same( tab_move_data.target_data, {
  //   window_id: 1,
  //   index: 3,
  //   tab_group_id: 3,
  //   tab_group_index: 2
  // })

  t.end()
}

function testNativeDragToStartOfSecondGroup( t ) {
  const state0 = {
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        createTabGroup( 3, [
          createTestTab({ id: 6 }),
          createTestTab({ id: 7 }),
        ]),
        createTabGroup( 4, [
          createTestTab({ id: 8 }),
          createTestTab({ id: 9 }),
        ])
      ]),
      createWindow( 2, [
        createPinnedTabGroup( [] ),
        createTabGroup( 5, [
          createTestTab({ id: 10 }),
          createTestTab({ id: 11 }),
        ])
      ])
    ]
  }

  state0.windows[ 0 ].active_tab_group_id = 4
  state0.windows[ 0 ].active_tab_id = 9

  let source_data = {
    window_id: 2,
    tab_ids: [ 10 ]
  }
  let target_data = {
    window_id: 1,
    index: 2,
  }

  let tab_move_data = getTabMoveData( state0, source_data, target_data )

  t.same( tab_move_data.target_data, {
    window_id: 1,
    index: 2,
    tab_group_id: 4,
    tab_group_index: 0,
  })

  t.end()
}

export default function( tap ) {
  // tap.test( testGetTabMoveData )
  // tap.test( testGetTabMoveDataMiddle )
  // tap.test( testGetTabMoveDataNewGroup )
  // tap.test( testGetTabMoveDataReopenPinned )
  tap.test( testMoveFromUrl )
  tap.test( testNativeDragToStartOfSecondGroup )
  tap.end()
}
