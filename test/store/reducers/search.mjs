import tap from "tap"

import {
  createPinnedTabGroup,
  createTabGroup,
  createWindow,
} from "../../../src/store/helpers.mjs"
import {
  startWindowSearch,
  finishWindowSearch,
  updateWindowSearch,
  resetWindowSearch,
} from "../../../src/store/reducers/search.mjs"
import {
  createTestTab,
} from "../helpers.mjs"

tap.test( function testSingleWindowSearch( t ) {
  const window_id = 1
  const state0 = {
    config: {},
    windows: [
      createWindow( window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({ id: 4, title: "This is a test", url: "http://example.com" }),
          createTestTab({ id: 5, url: "http://example.com" }),
          createTestTab({ id: 6, title: "Another Test", url: "http://example.com" }),
        ]),
        createTabGroup( 3, [
          createTestTab({ id: 7, title: "Test at the start", url: "http://example.com" }),
          createTestTab({ id: 8, url: "http://example.com" }),
        ])
      ])
    ]
  }

  let search_text = "test"
  const total_tabs_count = 5
  const state1 = startWindowSearch( state0, { window_id, search_text } )

  t.same( state1.windows[ 0 ].search, { text: search_text, resolved: false, total_tabs_count, matched_tab_ids: [ 4, 6, 7 ], queued_tab_ids: [ 5, 8 ] } )

  let matched_tab_ids = [ 8 ]
  const state2 = finishWindowSearch( state1, { window_id, search_text, matched_tab_ids } )

  t.same( state2.windows[ 0 ].search, { text: search_text, resolved: true, total_tabs_count, matched_tab_ids: [ 4, 6, 7, 8 ], queued_tab_ids: [] } )

  t.end()
})

tap.test( function testSingleWindowSearchUpdate( t ) {
  const window_id = 1
  const state0 = {
    config: {},
    windows: [
      createWindow( window_id, [
        createPinnedTabGroup( [] ),
        createTabGroup( 2, [
          createTestTab({ id: 4, url: "http://example.com" }),
          createTestTab({ id: 5, url: "http://example.com" }),
          createTestTab({ id: 6, url: "http://example.com" }),
        ]),
        createTabGroup( 3, [
          createTestTab({ id: 7, url: "http://example.com" }),
          createTestTab({ id: 8, url: "http://example.com" }),
        ])
      ])
    ]
  }

  let search_text = "test"
  const total_tabs_count = 5
  const state1 = startWindowSearch( state0, { window_id, search_text } )
  t.same( state1.windows[ 0 ].search, { text: search_text, resolved: false, total_tabs_count, matched_tab_ids: [], queued_tab_ids: [ 4, 5, 6, 7, 8 ] } )

  let searched_tab_ids = [ 4, 5, 6 ]
  let matched_tab_ids = [ 5 ]
  const state2 = updateWindowSearch( state1, { window_id, search_text, searched_tab_ids, matched_tab_ids } )
  t.same( state2.windows[ 0 ].search, { text: search_text, resolved: false, total_tabs_count, matched_tab_ids: [ 5 ], queued_tab_ids: [ 7, 8 ] } )

  t.end()
})
