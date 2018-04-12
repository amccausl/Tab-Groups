import {
  getInitialState,
} from '../helpers.mjs'

import { createGroup } from '../../../src/store/reducers.mjs'
import { validateState } from '../../../src/store/validators.mjs'

function testNormalCreate( t ) {
  let state = getInitialState()

  let tab_id = state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ].id

  state = createGroup( state, { tab_id, window_id: state.windows[ 0 ].id } )
  t.ok( validateState( state ), "state validates", validateState.errors )
  t.end()
}

export default function testGroupCreate( tap ) {
  tap.test( testNormalCreate )
  tap.end()
}
