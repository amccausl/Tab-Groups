import { difference, omit } from "../helpers.mjs"

/** Start a new search */
export function startWindowSearch( state, { window_id, search_text } ) {
  return {
    ...state,
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }

      let search_tabs = []
      let total_tabs_count = 0
      for( let tab_group of window.tab_groups ) {
        search_tabs.push( ...tab_group.tabs )
        total_tabs_count += tab_group.tabs.length
      }

      // Can incrementally restrict search results
      if( window.search != null && search_text.startsWith( window.search.text ) ) {
        let search_tab_ids_set = new Set( window.search.matched_tab_ids.concat( window.search.queued_tab_ids || [] ) )
        if( search_tab_ids_set.size > 0 ) {
          search_tabs = search_tabs.filter( tab => search_tab_ids_set.has( tab.id ) )
        }
      }

      const search_regex = new RegExp( `${ search_text }`, "i" )
      const matched_tab_ids = []
      const queued_tab_ids = []
      for( let tab of search_tabs ) {
        if( tab.title && search_regex.test( tab.title ) ) {
          matched_tab_ids.push( tab.id )
        } else if( tab.url && search_regex.test( tab.url ) ) {
          matched_tab_ids.push( tab.id )
        } else if( ! tab.url || ! tab.url.startsWith( "about:" ) ) {
          queued_tab_ids.push( tab.id )
        }
      }

      return {
        ...window,
        search: {
          text: search_text,
          resolved: ( queued_tab_ids.length === 0 ),
          total_tabs_count,
          matched_tab_ids,
          queued_tab_ids,
        }
      }
    })
  }
}

/** Update the status of the current search */
export function updateWindowSearch( state0, { window_id, search_text, searched_tab_ids, matched_tab_ids } ) {
  let target_window = state0.windows.find( window => window.id === window_id )
  if( ! target_window || ( target_window.search != null && target_window.search.text !== search_text ) ) {
    return state0
  }

  target_window = {
    ...target_window,
    search: {
      ...target_window.search,
      matched_tab_ids: target_window.search.matched_tab_ids.concat( matched_tab_ids ),
      queued_tab_ids: difference( target_window.search.queued_tab_ids, searched_tab_ids )
    }
  }

  const state1 = {
    ...state0,
    windows: state0.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }
      return target_window
    })
  }

  return state1
}

/** Finish the current search */
export function finishWindowSearch( state0, { window_id, search_text, matched_tab_ids } ) {
  let is_updated = false

  const state1 = {
    ...state0,
    windows: state0.windows.map( window => {
      if( window.id !== window_id || window.search != null && window.search.text !== search_text ) {
        return window
      }
      is_updated = true
      return {
        ...window,
        search: {
          ...window.search,
          resolved: true,
          matched_tab_ids: window.search.matched_tab_ids.concat( matched_tab_ids ),
          queued_tab_ids: []
        }
      }
    })
  }

  if( is_updated ) {
    return state1
  }
  return state0
}

/** Remove the window's search */
export function resetWindowSearch( state0, { window_id } ) {
  let is_updated = false
  const state1 = {
    ...state0,
    windows: state0.windows.map( window => {
      if( window.id !== window_id || window.search == null ) {
        return window
      }
      is_updated = true
      return omit( window, "search" )
    })
  }

  if( is_updated ) {
    return state1
  }
  return state0
}
