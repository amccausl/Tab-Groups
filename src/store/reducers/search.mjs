import { omit } from "../helpers.mjs"

export function startWindowSearch( state, { window_id, search_text } ) {
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }

      let search_tabs = []
      for( let tab_group of window.tab_groups ) {
        search_tabs.push( ...tab_group.tabs )
      }

      // Can incrementally restrict search results
      if( window.search != null && search_text.startsWith( window.search.text ) ) {
        let search_tab_ids_set = new Set( window.search.matched_tab_ids.concat( window.search.queued_tab_ids || []) )
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
        } else {
          queued_tab_ids.push( tab.id )
        }
      }

      return Object.assign( {}, window, {
        search: {
          text: search_text,
          resolved: ( queued_tab_ids.length === 0 ),
          matched_tab_ids,
          queued_tab_ids
        }
      })
    })
  })
}

export function finishWindowSearch( state0, { window_id, search_text, matched_tab_ids } ) {
  let is_updated = false

  const state1 = Object.assign( {}, state0, {
    windows: state0.windows.map( window => {
      if( window.id !== window_id || window.search != null && window.search.text !== search_text ) {
        return window
      }
      is_updated = true
      return Object.assign( {}, window, {
        search: Object.assign( {}, window.search, {
          resolved: true,
          matched_tab_ids: window.search.matched_tab_ids.concat( matched_tab_ids ),
          queued_tab_ids: []
        })
      })
    })
  })

  if( is_updated ) {
    return state1
  }
  return state0
}

export function resetWindowSearch( state0, { window_id } ) {
  let is_updated = false
  const state1 = Object.assign( {}, state0, {
    windows: state0.windows.map( window => {
      if( window.id !== window_id || window.search == null ) {
        return window
      }
      is_updated = true
      return omit( window, "search" )
    })
  })

  if( is_updated ) {
    return state1
  }
  return state0
}
