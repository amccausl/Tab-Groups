import tap from 'tap'

import {
  toggleTabSelection,
  toggleTabBatchSelection,
} from "../../src/components/tab-selectable.mjs"
import {
  createTabGroup,
} from "../../src/store/helpers.mjs"
import {
  createTestTab,
} from "../store/helpers.mjs"

function createContext( tab_groups ) {
  const context = {
    selected_tab_ids: [],
    tab_groups,
  }

  return context
}

function createTestContext() {
  return createContext([
    createTabGroup( 1, [
      createTestTab({
        id: 2
      }),
      createTestTab({
        id: 3
      }),
      createTestTab({
        id: 4
      }),
      createTestTab({
        id: 5
      }),
      createTestTab({
        id: 6
      })
    ]),
    createTabGroup( 7, [
      createTestTab({
        id: 8
      }),
      createTestTab({
        id: 9
      })
    ]),
  ])
}

function testToggleTabSelection( t ) {
  const context = createTestContext()

  context.selected_tab_ids = []
  toggleTabSelection.call( context, 2 )
  t.same( context.selected_tab_ids, [ 2 ], "should select an item" )

  context.selected_tab_ids = [ 2 ]
  toggleTabSelection.call( context, 9 )
  t.same( context.selected_tab_ids, [ 2, 9 ], "should allow multiple groups" )

  context.selected_tab_ids = [2, 9 ]
  toggleTabSelection.call( context, 2 )
  t.same( context.selected_tab_ids, [ 9 ], "should remove an item" )

  context.selected_tab_ids = [ 9 ]
  toggleTabSelection.call( context, 4 )
  t.same( context.selected_tab_ids, [ 4, 9 ], "should maintain group order" )

  // @todo should throw error if not found

  t.end()
}

function testToggleTabBatchSelection( t ) {
  const context = createTestContext()

  context.selected_tab_ids = []
  toggleTabBatchSelection.call( context, 4 )
  t.same( context.selected_tab_ids, [ 2, 3, 4 ], "should use start of group if none selected" )

  context.selected_tab_ids = [ 2, 3, 4 ]
  toggleTabBatchSelection.call( context, 3 )
  t.same( context.selected_tab_ids, [ 2, 3 ], "should reduce selection" )

  context.selected_tab_ids = [ 2, 3 ]
  toggleTabBatchSelection.call( context, 8 )
  t.same( context.selected_tab_ids, [ 2, 3, 8 ], "should keep groups separate" )

  context.selected_tab_ids = [ 2, 3, 8 ]
  toggleTabBatchSelection.call( context, 4 )
  t.same( context.selected_tab_ids, [ 2, 3, 4, 8 ], "should keep groups separate" )

  t.end()
}

tap.test( testToggleTabSelection )
tap.test( testToggleTabBatchSelection )
