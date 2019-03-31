import tap from "tap"

import {
  createPinnedTabGroup,
  createTabGroup,
  createWindow,
} from "../../../src/store/helpers.mjs"
import {
  startWindowSearch,
  finishWindowSearch,
  resetWindowSearch,
} from "../../../src/store/reducers/search.mjs"
import {
  createTestTab,
} from "../helpers.mjs"

function testSingleWindowSearch( t ) {
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
  const state1 = startWindowSearch( state0, { window_id, search_text } )

  t.same( state1.windows[ 0 ].search, { text: search_text, resolved: false, matched_tab_ids: [ 4, 6, 7 ], queued_tab_ids: [ 5, 8 ] } )

  let matched_tab_ids = [ 8 ]
  const state2 = finishWindowSearch( state1, { window_id, search_text, matched_tab_ids } )

  t.same( state2.windows[ 0 ].search, { text: search_text, resolved: true, matched_tab_ids: [ 4, 6, 7, 8 ], queued_tab_ids: [] } )

  t.end()
}

tap.test( testSingleWindowSearch )
