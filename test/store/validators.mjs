import {
  getInitialState,
} from './helpers.mjs'

import {
  validateState,
} from '../../src/store/validators.mjs'

function testStateValidation( t ) {
  const state = getInitialState()

  t.ok( validateState( state ), "state validates", validateState.errors )

  state.windows[ 0 ].tab_groups[ 1 ].tabs.push( state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ] )

  t.equal( validateState( state ), false )

  t.end()
}

function testStateAudibleValidation( t ) {
  const state = getInitialState()

  state.windows[ 0 ].tab_groups[ 1 ].audible = true
  t.equal( validateState( state ), false )
  t.equal( validateState.errors[ 0 ].keyword, 'audible' )

  state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ].audible = true
  t.equal( validateState( state ), true )

  delete state.windows[ 0 ].tab_groups[ 1 ].audible
  t.equal( validateState( state ), false )
  t.equal( validateState.errors[ 0 ].keyword, 'audible' )

  t.end()
}

export default function( tap ) {
  tap.test( testStateValidation )
  tap.test( testStateAudibleValidation )
  tap.end()
}
