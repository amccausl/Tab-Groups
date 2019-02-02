import tap from "tap"

import {
  attachTab
} from "../../../src/store/reducers/tab.mjs"
import {
  validateState
} from "../../../src/store/validators.mjs"
import {
  createTabGroup,
  createPinnedTabGroup,
  createWindow,
} from "../../../src/store/helpers.mjs"
import {
  createTestTab,
} from "../helpers.mjs"

function shouldValidateNativeTabDragToNativeTabBar( t ) {
  const window_id = 1
  const state0 = {
    config: {},
    windows: [
      createWindow( window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( 3, [
          createTestTab({ id: 5 }),
          createTestTab({ id: 6 }),
        ])
      ]),
      createWindow( 2, [
        createPinnedTabGroup( [] ),
        createTabGroup( 4, [
          createTestTab({ id: 7 })
        ])
      ])
    ]
  }

  const state1 = attachTab( state0, { tab_id: 7, window_id, index: 2 } )

  t.ok( validateState( state1 ), "state validates", validateState.errors )
  t.end()
}

tap.test( shouldValidateNativeTabDragToNativeTabBar )
