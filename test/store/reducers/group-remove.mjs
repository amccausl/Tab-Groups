import tap from "tap"

import {
  removeGroup
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

tap.test( function removeActiveGroup( t ) {
  const window_id = 1
  const tab_group_id = 3
  const state0 = {
    config: {},
    windows: [
      createWindow( window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( tab_group_id, [
          createTestTab({ id: 5 })
        ]),
        createTabGroup( 2, [
          createTestTab({ id: 4 })
        ])
      ])
    ]
  }

  const state1 = removeGroup( state0, { tab_group_id, window_id } )
  t.ok( validateState( state1 ), "state validates", validateState.errors )

  t.end()
})
