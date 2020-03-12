import tap from "tap"

import {
  createWindow,
  createTabGroup,
  createPinnedTabGroup,
  getCreateTabTarget,
} from "../../../src/store/helpers.mjs"
import {
  createBrowserTab,
  createTestTab,
} from "../helpers.mjs"

tap.test( function testGetCreateTabIndexNewTabEnd( t ) {
  const state0 = {
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [
          createTestTab({ id: 4 }),
        ]),
        createTabGroup( 2, [
          createTestTab({ id: 5 }),
          createTestTab({ id: 6 }),
          createTestTab({ id: 7 })
        ]),
        createTabGroup( 3, [
          createTestTab({ id: 8 }),
          createTestTab({ id: 9 })
        ], 8)
      ])
    ]
  }
  state0.windows[ 0 ].active_tab_group_id = 3
  state0.windows[ 0 ].active_tab_id = 8

  // New tab opened from pinned tab
  let browser_tab = createBrowserTab({ id: 10, index: 6, windowId: 1 })

  let { index } = getCreateTabTarget( state0, browser_tab )
  t.equal( index, 6 )
  t.end()
})

tap.test( function testGetCreateTabIndexNewTabMiddle( t ) {
  const state0 = {
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [
          createTestTab({ id: 4 }),
        ]),
        createTabGroup( 2, [
          createTestTab({ id: 5 }),
          createTestTab({ id: 6 }),
          createTestTab({ id: 7 })
        ], 6),
        createTabGroup( 3, [
          createTestTab({ id: 8 }),
          createTestTab({ id: 9 })
        ], 8)
      ])
    ]
  }
  state0.windows[ 0 ].active_tab_group_id = 2
  state0.windows[ 0 ].active_tab_id = 6

  // New tab opened from pinned tab
  let browser_tab = createBrowserTab({ id: 10, index: 6, windowId: 1 })

  let { index } = getCreateTabTarget( state0, browser_tab )
  t.equal( index, 4 )
  t.end()
})

tap.test( function testGetCreateTabIndexNewFromPinned( t ) {
  const state0 = {
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [
          createTestTab({ id: 4 }),
        ]),
        createTabGroup( 2, [
          createTestTab({ id: 5 }),
          createTestTab({ id: 6 }),
          createTestTab({ id: 7 })
        ]),
        createTabGroup( 3, [
          createTestTab({ id: 8 }),
          createTestTab({ id: 9 })
        ], 8)
      ])
    ]
  }
  state0.windows[ 0 ].active_tab_group_id = 3
  state0.windows[ 0 ].active_tab_id = 8

  // New tab opened from pinned tab
  let browser_tab = createBrowserTab({ id: 10, openerTabId: 4, index: 1, windowId: 1 })

  let { index } = getCreateTabTarget( state0, browser_tab )
  t.equal( index, 4 )
  t.end()
})
