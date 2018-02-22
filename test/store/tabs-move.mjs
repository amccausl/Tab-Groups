import { createTestTab } from './helpers'
import {
  createPinnedTabGroup,
  createTabGroup,
  createWindow,
  getTabMoveData,
} from '../../src/store/helpers.mjs'
import { validateState } from '../../src/store/validators.mjs'

import { moveTabs } from '../../src/store/reducers'

function testSingleWindowMoveOne( t ) {
  const initial_state = {
    config: {},
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

  console.info('initial_state', initial_state)
  t.ok( validateState( initial_state ), "state validates", validateState.errors )

  let source_data = {
    window_id: 1,
    tab_ids: [ 4, 5 ]
  }
  let target_data = {
    window_id: 1
  }

  let tab_move_data = getTabMoveData( initial_state, source_data, target_data )

  const state1 = moveTabs( initial_state, tab_move_data.source_data, tab_move_data.target_data )
  t.ok( validateState( state1 ), "state validates", validateState.errors )
  t.end()
}

export default function( tap ) {
  tap.test( testSingleWindowMoveOne )
  tap.end()
}
