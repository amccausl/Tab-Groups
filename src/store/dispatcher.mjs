import { createDebug } from "../helpers.mjs"
import {
  validateState
} from "./validators.mjs"

const debug = createDebug( "tabulate:store:dispatcher" )

export function createStore( reducer, initial_state ) {
  const listeners = []
  let current_state = initial_state
  let is_dispatching = false
  let dispatch_id = 0

  const store = {
    is_dispatching,
    dispatch,
    subscribe,
    getState,
  }

  function getState() {
    return current_state
  }

  function subscribe( listener ) {
    listeners.push( listener )

    return function unsubscribe() {
      var index = listeners.indexOf( listener )
      listeners.splice( index, 1 )
    }
  }

  function dispatch( action ) {
    let local_dispatch_id = ++dispatch_id

    try {
      // @todo put profiling behind debug flag
      store.is_dispatching = true
      debug( `dispatch start ${ action.type }` )
      const new_state = reducer( current_state, action )
      debug( `dispatch finished ${ action.type }` )
      if( validateState( new_state ) ) {
        debug( 'action', action )
        debug( 'state', new_state )
      } else {
        console.error( 'Validator failed on new state' )
        console.info( 'current_state',current_state )
        console.info( 'action', action )
        console.info( 'new_state', new_state )
        console.info( 'errors', validateState.errors )
      }
      current_state = new_state
    } finally {
      store.is_dispatching = false
    }

    for( let listener of listeners.slice() ) {
      if( dispatch_id !== local_dispatch_id ) {
        console.warn('parallel dispatch, early abort')
        break
      }
      listener()
    }
    return action
  }

  return store
}
