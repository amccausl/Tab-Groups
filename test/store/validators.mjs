import {
  createTabGroup,
  createPinnedTabGroup,
  createWindow,
} from "../../src/store/helpers.mjs"
import {
  validateState,
} from "../../src/store/validators.mjs"
import {
  createTestTab,
  getInitialState,
} from "./helpers.mjs"

function testStateValidation( t ) {
  const state = getInitialState()

  t.ok( validateState( state ), "state validates", validateState.errors )

  state.windows[ 0 ].tab_groups[ 1 ].tabs.push( state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ] )

  t.equal( validateState( state ), false )

  t.end()
}

function shouldFailWhenActiveTabNotInActiveGroup( t ) {
  const state0 = {
    config: {},
    windows: [
      createWindow( 1, [
        createPinnedTabGroup( [
          createTestTab({ id: 4 }),
        ]),
        createTabGroup( 2, [
          createTestTab({ id: 5 }),
          createTestTab({ id: 6 }),
        ], 5),
        createTabGroup( 3, [
          createTestTab({ id: 7 }),
          createTestTab({ id: 8 }),
        ], 7)
      ])
    ]
  }
  state0.windows[ 0 ].active_tab_group_id = 2
  state0.windows[ 0 ].active_tab_id = 7

  t.equal( validateState( state0 ), false )
  t.same( validateState.errors, [
    {
      keyword: "link",
      dataPath: `window[0].active_tab_group_id`,
      message: `Active tab "7" isn't in the active tab group`
    }
  ])

  t.end()
}

export default function( tap ) {
  tap.test( testStateValidation )
  tap.test( shouldFailWhenActiveTabNotInActiveGroup )
  tap.end()
}
