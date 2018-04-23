import { getTabState } from '../../src/integrations/index.mjs'
import {
  createWindow,
  createTabGroup,
  createPinnedTabGroup,
  default_config,
  findTab,
  getTabGroupsPersistState,
  getTabMoveData,
  getTargetIndex,
} from '../../src/store/helpers.mjs'

export const base_new_browser_tab = {
  id: null,
  // index: null,
  // windowId: null,
  highlighted: false,
  active: false,
  pinned: false,
  status: "complete",
  discarded: false,
  incognito: false,
  width: 1278,
  height: 968,
  lastAccessed: 1512330352266,
  audible: false,
  mutedInfo: { muted: false },
  isArticle: false,
  isInReaderMode: false,
  url: "about:blank",
  title: "New Tab"
}

export const base_new_tab = getTabState( base_new_browser_tab )

export function createBrowserTab( tab ) {
  return Object.assign( {}, base_new_browser_tab, tab )
}

export function createTestTab( tab ) {
  return Object.assign( {}, base_new_tab, tab )
}

export function getInitialState() {
  const initial_state = {
    config: default_config,
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        createTabGroup( 1, [
          createTestTab({
            id: 1
          }),
          createTestTab({
            id: 2
          })
        ])
      ])
    ]
  }

  return initial_state
}

export function getMultiWindowInitialState() {
  const initial_state = getInitialState()

  initial_state.windows.push(
    createWindow( 2, [
      createPinnedTabGroup( [] ),
      createTabGroup( 2, [
        createTestTab({
          id: 3
        }),
        createTestTab({
          id: 4
        })
      ])
    ])
  )

  return initial_state
}

function testFindTab( t ) {
  let state = getInitialState()
  let tab = findTab( state, state.windows[ 0 ].id, state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ].id )
  t.equal( tab, state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ] )
  t.end()
}

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
    index: 4, // Native index is only offset by 1, instead of 2.  Think this is an upstream bug
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

function testGetTargetIndex( t ) {
  t.test( moveToLaterIndex )
  t.end()
}

function moveToLaterIndex( t ) {
  const moving_tab = createTestTab({ id: 3 })
  const tab_group = createTabGroup( 2, [
    moving_tab,
    createTestTab({ id: 4 }),
    createTestTab({ id: 5 })
  ])
  const target_window = createWindow( 1, [
    createPinnedTabGroup( [] ),
    tab_group
  ])

  const target_data = { window_id: target_window.id, tab_group_id: tab_group.id, tab_group_index: 1 }
  const ignored_tabs = [ moving_tab ]

  let target_index_data = getTargetIndex( target_window, target_data, ignored_tabs )
  t.same( target_index_data, {
    index: 0,
    tab_group_index: 0
  })
  t.end()
}

function testPersistence( t ) {
  let state = getInitialState()
  let tab_groups_state = getTabGroupsPersistState( state.windows[ 0 ] )

  t.same( tab_groups_state, [
    {
      id: 1,
      title: 'Group 1',
      active: true,
      active_tab_id: 1,
      tabs_count: 2
    }
  ])

  t.end()
}

export default function( tap ) {
  tap.test( testFindTab )
  tap.test( testGetTabMoveData )
  tap.test( testGetTabMoveDataMiddle )
  tap.test( testGetTabMoveDataNewGroup )
  tap.test( testGetTargetIndex )
  tap.test( testPersistence )
  tap.end()
}
