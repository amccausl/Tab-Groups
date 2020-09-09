
import {
  getMessage
} from "../integrations/index.mjs"

export function bem( base, modifiers ) {
  const classes = [ base ]

  for( let [ modifier, value ] of Object.entries( modifiers ) ) {
    if( typeof value === "string" ) {
      classes.push( `${ base }--${ modifier }-${ value }` )
    } else if( value ) {
      classes.push( `${ base }--${ modifier }` )
    }
  }

  return classes
}

export function bootstrap() {
  return Promise.all([
    browser.windows.getCurrent(),
    browser.runtime.getBackgroundPage()
      .then( background => {
        // Save a reference to the background script so it can be accessed syncronously
        window.background = background

        // Sometimes this is reached before the background script has run it's initializer, check for that
        if( background.getStore ) {
          return background.getStore()
        }

        console.info('deferring load')
        return new Promise( ( resolve ) => {
          background.addEventListener( "load", () => {
            console.info('load event', background.getStore)
            resolve( background.getStore() )
          })
        })
      })
  ])
}

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
  return getMessage( `${ key }_count_${ count === 1 ? "singular" : "plural" }`, [ count ] )
}

/**
 * Helper to get a more user-friendly url
 */
export function getFriendlyUrlText( uri_string ) {
  try {
    const url = new URL( uri_string )
    let url_text = ""

    // Return full path for about pages
    if( url.protocol === "about:" ) {
      return url.href
    }

    // Ignore common protocols
    if( ! [ "https:", "http:" ].includes( url.protocol ) ) {
      url_text += url.protocol + "//"
    }

    // Strip leading www. (not really helpful)
    url_text += url.host.startsWith( "www." ) ? url.host.substr( 4 ) : url.host

    // @todo add as much of url and args as makes sense
    if( url.pathname !== "/" ) {
      url_text += "/…"
    }
    return url_text
  } catch( ex ) {
    // @todo error handling
    console.error( "getFriendlyUrlText exception", ex )
    return null
  }
}

export function getNewSelectedTabs( old_selected_tab_ids, tab_groups ) {
  if( old_selected_tab_ids.length === 0 ) {
    return []
  }
  const selected_tab_ids_set = new Set( old_selected_tab_ids )
  const new_selected_tabs = []
  for( const tab_group of tab_groups ) {
    for( const tab of tab_group.tabs ) {
      if( selected_tab_ids_set.has( tab.id ) ) {
        new_selected_tabs.push( tab )
      }
    }
  }
  return new_selected_tabs
}

export function getNewSelectedTabIds( old_selected_tab_ids, tab_groups ) {
  return getNewSelectedTabs( old_selected_tab_ids, tab_groups ).map( tab => tab.id )
}

function isLoadingIssueMessage( tab_title ) {
  // @todo add localization
  if( tab_title === "Problem loading page" ) {
    return true
  }
  if( tab_title === "Server Not Found" ) {
    return true
  }
  return false
}

export function getTabHoverText( tab ) {
  if( isLoadingIssueMessage( tab.title ) ) {
    return getFriendlyUrlText( tab.url )
  }
  return tab.title
}

/**
 * Get a markdown string rendering for a tab group
 */
export function getTabGroupCopyText( tab_group ) {
  let copy_text = `## ${ tab_group.title }`
  tab_group.tabs.forEach( tab => {
    copy_text += `\n- [${ tab.title }](${ tab.url })`
  })
  return copy_text
}

/**
 * Subscribe to changes from the store and add cleanup on window
 */
export function onStateChange( fn ) {
  fn( window.store.getState() )

  // Attach listener to background state changes so we can update the data
  const unsubscribe = window.store.subscribe( () => {
    fn( window.store.getState() )
  })
  window.addEventListener( "unload", ( event ) => {
    unsubscribe()
  })
}
