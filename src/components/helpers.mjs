
import {
  getMessage
} from '../integrations/index.mjs'

/**
 * Delay execution of function, use only most recent args.  Works to wrap method on component
 * @param fn Function to delay
 * @param delay MS to delay
 */
export function debounce( fn, delay ) {
  let timeout_id = null
  return function() {
    clearTimeout( timeout_id )
    const args = arguments
    timeout_id = setTimeout(
      () => fn.apply( this, args ),
      delay
    )
  }
}

/**
 * Helper to pull the plural/singular version of a key
 * @param key The base localization key for the message
 * @param count The count for the property
 */
export function getCountMessage( key, count ) {
  return getMessage( `${ key }_count_${ count === 1 ? 'singular' : 'plural' }`, [ count ] )
}

/**
 * Subscribe to changes from the store and add cleanup on window
 * @param fn
 */
export function onStateChange( fn ) {
  fn( window.store.getState() )

  // Attach listener to background state changes so we can update the data
  const unsubscribe = window.store.subscribe( () => {
    fn( window.store.getState() )
  })
  window.addEventListener( 'unload', ( event ) => {
    unsubscribe()
  })
}
