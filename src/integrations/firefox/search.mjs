import {
  startSearchAction,
  updateSearchAction,
  finishSearchAction,
  resetSearchAction,
} from '../../store/actions.mjs'
import {
  getWindow,
} from '../../store/helpers.mjs'

/**
 * Run a text search for tabs in a window and dispatch start and finish to the store
 * @todo consider storing window => search info map locally
 * @todo search active group first
 */
export async function runTabSearch( store, window_id, search_text ) {
  console.info('runSearch', window_id, search_text)
  if( ! search_text ) {
    store.dispatch( resetSearchAction( window_id ) )
    return
  }

  // Update the store with the search
  store.dispatch( startSearchAction( window_id, search_text ) )

  let window = getWindow( store.getState(), window_id )
  if( ! window ) {
    // @todo error
    return
  }

  const { search } = window

  const queued_tab_ids = [ ...( search.queued_tab_ids || [] ) ]
  let matched_tab_ids = []
  let searched_tab_ids = []

  let p1 = performance.now()

  while( queued_tab_ids.length > 0 ) {
    window = getWindow( store.getState(), window_id )
    // Abort if search is no longer active
    if( window.search == null || window.search.text !== search.text ) {
      return Promise.reject()
    }
    const tab_id = queued_tab_ids.shift()
    // @todo skip tabs "about:addons", "about:debugging"
    console.info(`browser.find.find( "${ search.text }", { tabId: ${ tab_id } } )`)

    const p2 = performance.now()

    // Update status of search every 100ms
    if( p2 - 100 > p1 ) {
      store.dispatch( updateSearchAction( window_id, search_text, searched_tab_ids, matched_tab_ids ) )
      matched_tab_ids = []
      searched_tab_ids = []
      p1 = p2
    }

    const find_result = await browser.find.find( search.text, { tabId: tab_id } )
      .catch( ( err ) => {
        // @todo handling
        console.error('browser.find.find error', err, tab_id)
      })

    searched_tab_ids.push( tab_id )
    if( find_result && find_result.count > 0 ) {
      matched_tab_ids.push( tab_id )
    }
  }

  store.dispatch( finishSearchAction( window_id, search_text, matched_tab_ids ) )
}
