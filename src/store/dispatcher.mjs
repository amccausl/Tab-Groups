import { createDebug } from "../helpers.mjs"
import {
  validateState
} from "./validators.mjs"

const debug = createDebug( "tabulate:store:dispatcher" )

export function createStore( reducer, initial_state ) {
  const listeners = []
  let current_state = initial_state
  let dispatch_id = 0

  const store = {
    is_dispatching: false,
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
      listeners.splice( listeners.indexOf( listener ), 1 )
    }
  }

  function dispatch( action ) {
    const local_dispatch_id = ++dispatch_id
    let is_unchanged = false

    try {
      store.is_dispatching = true
      debug( `dispatch ${ action.type } start` )
      const new_state = reducer( current_state, action )
      debug( `dispatch ${ action.type } finish` )
      debug( 'action', action )
      if( current_state === new_state ) {
        debug( 'state is unchanged' )
        is_unchanged = true
      } else if( validateState( new_state ) ) {
        debug( 'state', new_state )
      } else {
        console.error( 'Validator failed on new state' )
        console.info( 'current_state', current_state )
        console.info( 'new_state', new_state )
        console.info( 'errors', validateState.errors )
      }
      current_state = new_state
    } finally {
      store.is_dispatching = false
    }

    if( ! is_unchanged ) {
      debug( 'listeners start' )
      for( let listener of listeners.slice() ) {
        if( dispatch_id !== local_dispatch_id ) {
          console.warn('parallel dispatch, early abort')
          break
        }
        listener()
      }
      debug( 'listeners finish' )
    }
    return action
  }

  return store
}
