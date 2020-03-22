import tap from "tap"

import {
  getInitialState,
} from "../helpers.mjs"

import { addGroup } from "../../../src/store/reducers/group.mjs"
import { validateState } from "../../../src/store/validators.mjs"

tap.test( function testNormalCreate( t ) {
  let state = getInitialState()

  let tab_id = state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ].id

  state = addGroup( state, { tab_id, window_id: state.windows[ 0 ].id } )
  t.ok( validateState( state ), "should pass validation", validateState.errors )
  t.end()
})
