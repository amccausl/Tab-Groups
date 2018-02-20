import {
  getInitialState,
} from './helpers.mjs'

import {
  validateState,
} from '../../src/store/validators.mjs'

function testStateValidation( t ) {
  let state = getInitialState()

  t.equal( validateState( state ), true )

  state.windows[ 0 ].tab_groups[ 1 ].tabs.push( state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ] )

  t.equal( validateState( state ), false )

  t.end()
}

export default function( tap ) {
  tap.test( testStateValidation )
  tap.end()
}
