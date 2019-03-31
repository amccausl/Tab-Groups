import tap from "tap"

import { getTabState } from "../../src/integrations/index.mjs"
import {
  createWindow,
  createTabGroup,
  createPinnedTabGroup,
} from "../../src/store/helpers.mjs"

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
  return {
    ...base_new_browser_tab,
    ...tab,
  }
}

export function createTestTab( tab ) {
  return {
    ...base_new_tab,
    ...tab,
  }
}

export function getInitialState() {
  const initial_state = {
    config: {},
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

if( process.argv[ 1 ].endsWith( "test/store/helpers.mjs" ) ) {
  tap.pass()
}
