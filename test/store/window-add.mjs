import {
  getInitialState,
  getMultiWindowInitialState,
} from './helpers.mjs'

import { addWindow } from '../../src/store/reducers.mjs'

function testSingleWindowAdd( t ) {
  let state = {
    windows: []
  }

  state = addWindow( state, { browser_window: { id: 1 } } )

  t.equal( state.windows.length, 1 )
  t.equal( state.windows[ 0 ].id, 1 )

  state = addWindow( state, { browser_window: { id: 2 } } )

  t.equal( state.windows.length, 2 )
  t.equal( state.windows[ 1 ].id, 2 )
  t.end()
}

export default function( tap ) {
  tap.test( testSingleWindowAdd )
  tap.end()
}
