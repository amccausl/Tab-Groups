import tap from "tap"

import {
  moveGroup
} from "../../../src/store/reducers/group.mjs"
import {
  validateState
} from "../../../src/store/validators.mjs"
import {
  createTabGroup,
  createPinnedTabGroup,
  createWindow,
} from "../../../src/store/helpers.mjs"
import {
  createTestTab
} from "../helpers.mjs"

tap.test( function toSameWindow( t ) {
  const window_id = 1
  const tab_group_id = 3
  const tab_group_index = 1
  const state0 = {
    config: {},
    windows: [
      createWindow( window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({ id: 4 })
        ]),
        createTabGroup( tab_group_id, [
          createTestTab({ id: 5 })
        ])
      ])
    ]
  }

  const source_data = { window_id, tab_group_id }
  const target_data = { window_id, tab_group_index }

  const state1 = moveGroup( state0, { source_data, target_data } )
  t.ok( validateState( state1 ), "should pass validation", validateState.errors )
  t.equal( state1.windows[ 0 ].tab_groups[ tab_group_index ].id, tab_group_id )

  t.end()
})

tap.test( function toSameWindowDropZone( t ) {
  const window_id = 1
  const tab_group_id = 3
  const state0 = {
    config: {},
    windows: [
      createWindow( window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({ id: 4 })
        ]),
        createTabGroup( tab_group_id, [
          createTestTab({ id: 5 })
        ])
      ])
    ]
  }

  const source_data = { window_id, tab_group_id }
  const target_data = { window_id, tab_group_index: null }

  const state1 = moveGroup( state0, { source_data, target_data } )
  t.ok( validateState( state1 ), "should pass validation", validateState.errors )
  t.equal( state1.windows[ 0 ].tab_groups[ 2 ].id, tab_group_id )

  t.end()
})

tap.test( function toDifferentWindow( t ) {
  const tab_group_id = 3
  const tab_group_index = 1
  const source_data = {
    window_id: 1,
    tab_group_id
  }
  const target_data = {
    window_id: 2,
    tab_group_index
  }

  const state0 = {
    config: {},
    windows: [
      createWindow( source_data.window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({ id: 6 })
        ]),
        createTabGroup( 3, [
          createTestTab({ id: 7 })
        ])
      ]),
      createWindow( target_data.window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( 4, [
          createTestTab({ id: 8 })
        ]),
        createTabGroup( 5, [
          createTestTab({ id: 9 })
        ])
      ])
    ]
  }

  const state1 = moveGroup( state0, { source_data, target_data } )

  t.ok( validateState( state1 ), "should pass validation", validateState.errors )
  t.equal( state1.windows[ 0 ].tab_groups.length, 2 )
  t.equal( state1.windows[ 1 ].tab_groups.length, 4 )
  t.equal( state1.windows[ 1 ].tab_groups[ tab_group_index ].id, tab_group_id )

  t.end()
})

tap.test( function activeGroupToDifferentWindow( t ) {
  const tab_group_id = 2
  const tab_group_index = 1
  const source_data = {
    window_id: 1,
    tab_group_id
  }
  const target_data = {
    window_id: 2,
    tab_group_index
  }

  const state0 = {
    config: {},
    windows: [
      createWindow( source_data.window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({ id: 6 })
        ]),
        createTabGroup( 3, [
          createTestTab({ id: 7 })
        ])
      ]),
      createWindow( target_data.window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( 4, [
          createTestTab({ id: 8 })
        ]),
        createTabGroup( 5, [
          createTestTab({ id: 9 })
        ])
      ])
    ]
  }

  const state1 = moveGroup( state0, { source_data, target_data } )

  t.ok( validateState( state1 ), "should pass validation", validateState.errors )
  t.equal( state1.windows[ 0 ].tab_groups.length, 2 )
  t.equal( state1.windows[ 0 ].active_tab_group_id, 3 )
  t.equal( state1.windows[ 1 ].tab_groups.length, 4 )
  t.equal( state1.windows[ 1 ].tab_groups[ tab_group_index ].id, tab_group_id )

  t.end()
})

tap.test( function lastGroupToDifferentWindow( t ) {
  const tab_group_index = 1
  const source_data = {
    window_id: 1,
    tab_group_id: 3
  }
  const target_data = {
    window_id: 2,
    tab_group_index
  }

  const state0 = {
    config: {},
    windows: [
      createWindow( source_data.window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( source_data.tab_group_id, [
          createTestTab({ id: 6 })
        ]),
      ]),
      createWindow( target_data.window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( 4, [
          createTestTab({ id: 8 })
        ]),
      ])
    ]
  }

  const state1 = moveGroup( state0, { source_data, target_data } )

  t.ok( validateState( state1 ), "should pass validation", validateState.errors )
  t.equal( state1.windows.length, 1, "should remove empty window" )

  t.end()
})

tap.test( function lastGroupToDifferentWindowWithPinned( t ) {
  const tab_group_index = 1
  const source_data = {
    window_id: 1,
    tab_group_id: 3
  }
  const target_data = {
    window_id: 2,
    tab_group_index
  }

  const state0 = {
    config: {},
    windows: [
      createWindow( source_data.window_id, [
        createPinnedTabGroup( [
          createTestTab({ id: 9 })
        ] ),
        createTabGroup( source_data.tab_group_id, [
          createTestTab({ id: 6 })
        ]),
      ]),
      createWindow( target_data.window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( 4, [
          createTestTab({ id: 8 })
        ]),
      ])
    ]
  }

  const state1 = moveGroup( state0, { source_data, target_data } )

  t.ok( validateState( state1 ), "should pass validation", validateState.errors )
  t.equal( state1.windows.length, 2, "should not remove source window" )
  t.equal( state1.windows[ 0 ].tab_groups.length, 2, "should add a new group" )

  t.end()
})
