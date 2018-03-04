import { createTestTab } from './helpers.mjs'
import {
  createTabGroup,
  createPinnedTabGroup,
  createWindow,
} from '../../src/store/helpers.mjs'

import { moveTab } from '../../src/store/reducers.mjs'
import { validateState } from '../../src/store/validators.mjs'

function testSingleWindowMove( t ) {
  const initial_state = {
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        createTabGroup( 1, [
          createTestTab({ id: 1 }),
          createTestTab({ id: 2 }),
          createTestTab({ id: 3 })
        ]),
        createTabGroup( 2, [
          createTestTab({ id: 4 }),
          createTestTab({ id: 5 })
        ])
      ])
    ]
  }

  // Move middle tab of group1 to end of group1
  const state1 = moveTab( initial_state, { tab_id: 2, window_id: 1, index: 2 } )
  t.equal( state1.windows[ 0 ].tab_groups[ 1 ].tabs_count, 3 )

  // Move middle tab of group1 to end of group2
  const state2 = moveTab( initial_state, { tab_id: 2, window_id: 1, index: 4 } )
  // Counts are updated appropriately
  t.equal( state2.windows[ 0 ].tab_groups[ 1 ].tabs_count, 2 )
  t.equal( state2.windows[ 0 ].tab_groups[ 2 ].tabs_count, 3 )
  // Object is moved by reference
  t.equal( state2.windows[ 0 ].tab_groups[ 2 ].tabs[ 2 ], initial_state.windows[ 0 ].tab_groups[ 1 ].tabs[ 1 ] )
  t.end()
}

function testMoveToPinnedBoundary( t ) {
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
  t.ok( validateState( state1 ), "state validates", validateState.errors )
  t.equal( state1.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ].id, 3 )

  t.end()
}

function testMoveToNewGroup( t ) {
  const initial_state = {
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [] ),
        createTabGroup( 1, [
          createTestTab({ id: 1 }),
          createTestTab({ id: 2 }),
          createTestTab({ id: 3 })
        ]),
        createTabGroup( 2, [
        ])
      ])
    ]
  }
  // Move middle tab of group1 to group2
  const state1 = moveTab( initial_state, { tab_id: 2, window_id: 1, tab_group_id: 2 } )
  t.equal( state1.windows[ 0 ].tab_groups[ 1 ].tabs_count, 2 )
  t.equal( state1.windows[ 0 ].tab_groups[ 2 ].tabs_count, 1 )
  t.equal( initial_state.windows[ 0 ].tab_groups[ 1 ].tabs[ 1 ], state1.windows[ 0 ].tab_groups[ 2 ].tabs[ 0 ] )

  // Move middle tab of group1 to end of group2
  const state2 = moveTab( initial_state, { tab_id: 2, window_id: 1, index: 2 } )
  // There should be no update
  t.equal( state2.windows[ 0 ].tab_groups[ 1 ].tabs_count, 2 )
  t.equal( state2.windows[ 0 ].tab_groups[ 2 ].tabs_count, 1 )
  // Object reference is maintained
  t.equal( state2.windows[ 0 ].tab_groups[ 2 ], state1.windows[ 0 ].tab_groups[ 2 ] )
  t.end()
}

export default function( tap ) {
  tap.test( testSingleWindowMove )
  // tap.test( testMoveToNewGroup )
  tap.test( testMoveToPinnedBoundary )
  tap.end()
}
