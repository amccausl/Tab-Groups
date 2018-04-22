
// @todo remove dependency
import {
  TAB_GROUP_ID_KEY,
  getTabState,
} from "../../integrations/index.mjs"
import {
  createTabGroup,
  createPinnedTabGroup,
  default_config,
} from "../helpers.mjs"

export default function init( state, { browser_tabs, config, contextual_identities, features, theme, window_tab_groups_map } ) {
  const window_tabs_map = new Map()

  // @todo use persist state from window_tab_groups_map

  // new_tab_group_id the largest id + 1
  let new_tab_group_id = 1
  // @todo iterate window_tab_groups_map to get id

  browser_tabs.forEach( browser_tab => {
    let window_tabs = window_tabs_map.get( browser_tab.windowId )
    if( ! window_tabs ) {
      window_tabs = []
      window_tabs_map.set( browser_tab.windowId, window_tabs )
    }
    window_tabs.push( browser_tab )
  })

  const contexts = {}
  if( contextual_identities ) {
    contextual_identities.forEach( contextual_identity => {
      contexts[ contextual_identity.cookieStoreId ] = {
        color: contextual_identity.colorCode,
        name: contextual_identity.name,
      }
    })
  }

  // @todo scan map to get max window id in case things are in awkward state

  const windows = []
  for( let [ window_id, window_tabs ] of window_tabs_map.entries() ) {
    // @todo ensure tabs are in index sorted order, with the pinned tabs first
    // @todo this should be based on config setting

    let active_tab_id = null
    let active_tab_group_id = null
    const window_tab_groups_state = window_tab_groups_map.get( window_id )
    const window_tab_group_map = new Map()
    if( window_tab_groups_state ) {
      for( let tab_group_state of window_tab_groups_state ) {
        // @todo validate input state, normalize if issue
        // @todo set the active tab_id to either the window global
        window_tab_group_map.set( tab_group_state.id, {
          id: tab_group_state.id,
          title: tab_group_state.title,
          active_tab_id: null,
          tabs: [],
          tabs_count: tab_group_state.tabs_count
        })
      }
    }

    let pinned_tabs = []
    let ungrouped_tabs = []
    for( let browser_tab of window_tabs ) {
      if( browser_tab.active ) {
        active_tab_id = browser_tab.id
      }
      let tab = getTabState( browser_tab )
      if( browser_tab.pinned ) {
        pinned_tabs.push( tab )
      } else if( browser_tab.session != null && browser_tab.session[ TAB_GROUP_ID_KEY ] != null && window_tab_group_map.has( browser_tab.session[ TAB_GROUP_ID_KEY ] ) ) {
        window_tab_group_map.get( browser_tab.session[ TAB_GROUP_ID_KEY ] ).tabs.push( tab )
      } else {
        ungrouped_tabs.push( tab )
      }
    }

    const window_tab_groups = [ createPinnedTabGroup( pinned_tabs ) ]
    if( window_tab_groups_state && window_tab_groups_state.length > 0 ) {
      for( let tab_group of window_tab_group_map.values() ) {
        if( tab_group.tabs.length < tab_group.tabs_count ) {
          tab_group.tabs.push( ...ungrouped_tabs.splice( 0, tab_group.tabs_count - tab_group.tabs.length ) )
        }
        if( tab_group.tabs.length > 0 ) {
          if( tab_group.tabs.some( tab => tab.id === active_tab_id ) ) {
            tab_group.active_tab_id = active_tab_id
            active_tab_group_id = tab_group.id
          } else {
            tab_group.active_tab_id = tab_group.tabs[ 0 ].id
          }
        }
        tab_group.tabs_count = tab_group.tabs.length
        window_tab_groups.push( tab_group )
      }
      if( ungrouped_tabs.length > 0 ) {
        window_tab_groups[ window_tab_groups.length - 1 ].tabs.push( ...ungrouped_tabs )
        window_tab_groups[ window_tab_groups.length - 1 ].tabs_count = window_tab_groups[ window_tab_groups.length - 1 ].tabs.length
      }
    } else {
      // No state, assign all tabs to new groups
      window_tab_groups.push( createTabGroup( new_tab_group_id, ungrouped_tabs ) )
      new_tab_group_id++
    }

    windows.push({
      id: window_id,
      // error
      active_tab_group_id: active_tab_group_id || window_tab_groups[ 1 ].id,
      active_tab_id,
      tab_groups: window_tab_groups
    })
  }

  const init_state = {
    config,
    contexts,
    features,
    windows
  }

  // @todo compare with state to return optimized diff

  return init_state
}
