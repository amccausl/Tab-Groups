import tap from "tap"

import {
  createTabGroup,
  createPinnedTabGroup,
  createWindow,
} from "../../../src/store/helpers.mjs"
import { moveTab } from "../../../src/store/reducers/tab.mjs"
import { validateState } from "../../../src/store/validators.mjs"
import { createTestTab } from "../helpers.mjs"

tap.test( function testSingleWindowMove( t ) {
  const tab = createTestTab({ id: 2 })
  const window = createWindow( 1, [
    createPinnedTabGroup( [] ),
    createTabGroup( 1, [
      createTestTab({ id: 1 }),
      tab,
      createTestTab({ id: 3 })
    ]),
    createTabGroup( 2, [
      createTestTab({ id: 4 }),
      createTestTab({ id: 5 })
    ])
  ])
  const state0 = {
    windows: [ window ]
  }

  // Move middle tab of group1 to end of group1
  const state1 = moveTab( state0, { tab_id: tab.id, window_id: window.id, index: 2 } )
  t.equal( state1.windows[ 0 ].tab_groups[ 1 ].tabs_count, 3 )
  t.equal( state1.windows[ 0 ].tab_groups[ 1 ].tabs[ 2 ], tab )
  t.end()
})

tap.test( function testMoveToPinnedBoundary( t ) {
  const state0 = {
    config: {},
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        createTabGroup( 1, [
          createTestTab({ id: 1 }),
          createTestTab({ id: 2 }),
          createTestTab({ id: 3 })
        ])
      ])
    ]
  }

  const state1 = moveTab( state0, { tab_id: 3, window_id: 1, index: 0 } )
  t.ok( validateState( state1 ), "should pass validation", validateState.errors )
  t.equal( state1.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ].id, 3 )

  t.end()
})

tap.test( function testMoveToNewGroup( t ) {
  const state0 = {
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({ id: 4 }),
        ]),
        createTabGroup( 3, [
          createTestTab({ id: 5 }),
          createTestTab({ id: 6 }),
        ])
      ])
    ]
  }
  const state1 = moveTab( state0, { tab_id: 4, window_id: 1, index: 2 } )
  t.equal( state0, state1 )
  t.end()
})
