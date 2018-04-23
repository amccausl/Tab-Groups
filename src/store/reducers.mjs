// @todo remove dependency
import {
  getTabState,
} from "../integrations/index.mjs"

import {
  INIT,
  CONFIG_UPDATE,
  FEATURES_UPDATE,
  GROUP_ADD,
  GROUP_REMOVE,
  GROUP_UPDATE,
  GROUP_MOVE,
  GROUP_MUTE,
  GROUP_UNMUTE,
  TABS_MOVE,
  TAB_ACTIVATE,
  TAB_ADD,
  TAB_REMOVE,
  TAB_UPDATE,
  TAB_UPDATE_IMAGE,
  TAB_MOVE,
  TAB_ATTACH,
  WINDOW_ADD,
  WINDOW_REMOVE,
  WINDOW_SEARCH_START,
  WINDOW_SEARCH_FINISH,
  WINDOW_SEARCH_RESET,
} from "./action-types.mjs"

import {
  createWindow,
  createTabGroup,
  createPinnedTabGroup,
  default_config,
  findTab,
  getCreateTabTarget,
  getNewTabGroupId,
  getSourceTabGroupData,
  getTabMoveData,
  getTargetTabGroupData,
  omit,
} from "./helpers.mjs"

import init from "./reducers/init.mjs"
import attachTab from "./reducers/attach-tab.mjs"
import moveTab from "./reducers/move-tab.mjs"
import moveTabs from "./reducers/move-tabs.mjs"
import addTab from "./reducers/add-tab.mjs"
import {
  updateConfig
} from "./reducers/config.mjs"
import {
  addContextualIdentity,
  updateContextualIdentity,
  removeContextualIdentity,
} from "./reducers/contextual-identity.mjs"
import {
  updateFeatures
} from "./reducers/feature.mjs"
import {
  addGroup,
  removeGroup,
  updateGroup,
  moveGroup,
  muteGroup,
  unmuteGroup,
} from "./reducers/group.mjs"
import {
  addWindow,
  removeWindow,
} from "./reducers/window.mjs"
import {
  startWindowSearch,
  finishWindowSearch,
  resetWindowSearch,
} from "./reducers/search.mjs"

function findTabGroupId( tab_groups, tab_id ) {
  let tab_group = tab_groups.find( tab_group => tab_group.tabs.some( tab => tab.id === tab_id ) )
  if( tab_group ) {
    return tab_group.id
  }
  return null
}

function findWindowIndex( windows, window_id ) {
  return windows.findIndex( window => window.id === window_id )
}

function _removeTab( state, { tab_id, window_id, index } ) {
  // @todo use index to optimize the lookup process if set
  // @todo update active_tab_id if required

  const windows = state.windows.map( window => {
    if( window.id === window_id ) {
      let active_tab_id = window.active_tab_id
      let tab_groups = window.tab_groups.map( tab_group => {
        const tab_index = tab_group.tabs.findIndex( tab => tab.id === tab_id )
        if( tab_index > -1 ) {
          tab_group = Object.assign( {}, tab_group, {
            tabs: [ ...tab_group.tabs ],
            tabs_count: tab_group.tabs_count - 1
          })
          tab_group.tabs.splice( tab_index, 1 )[ 0 ]
          if( tab_group.active_tab_id === tab_id ) {
            if( tab_group.tabs_count > 0 ) {
              tab_group.active_tab_id = tab_group.tabs[ Math.min( tab_index, tab_group.tabs_count - 1 ) ].id
            } else {
              tab_group.active_tab_id = null
            }
            if( active_tab_id === tab_id ) {
              active_tab_id = tab_group.active_tab_id
            }
          }
        }
        return tab_group
      })

      window = Object.assign( {}, window, {
        active_tab_id,
        tab_groups,
      })
    }
    return window
  })

  const new_state = Object.assign( {}, state, {
    windows
  })

  return new_state
}

export function activateTab( state, { tab_id, window_id } ) {
  // @todo activate the group the tab is in
  // @todo optimize to return existing state if tab already active
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id === window_id ) {
        let { active_tab_group_id } = window
        let active_tab_id = null
        const tab_groups = window.tab_groups.map( tab_group => {
          // If tab_group contains the tab_id, return a copy with active toggled
          if( tab_group.tabs.some( tab => tab.id === tab_id ) ) {
            if( tab_group.id ) {
              active_tab_group_id = tab_group.id
            }
            active_tab_id = tab_id
            tab_group = Object.assign( {}, tab_group, {
              active_tab_id
            })
          }
          return tab_group
        })

        if( active_tab_id ) {
          window = Object.assign( {}, window, {
            active_tab_group_id,
            active_tab_id,
            tab_groups
          })
        }
      }
      return window
    })
  })
}

export function removeTab( state, { tab_id, window_id } ) {
  return _removeTab( state, { tab_id, window_id } )
}

export function updateTab( state, { browser_tab, change_info } ) {
  if( change_info.hasOwnProperty( 'pinned' ) ) {
    const window_id = browser_tab.windowId
    const target_window = state.windows.find( window => window.id === window_id )
    const tab_group_id = change_info.pinned ? 0 : target_window.active_tab_group_id
    const move_data = getTabMoveData(
      state,
      {
        window_id,
        tab_ids: [ browser_tab.id ]
      },
      {
        window_id,
        tab_group_id,
        tab_group_index: change_info.pinned ? null : 0
      }
    )

    return moveTabs( state, move_data )
  }
  // @todo change use the nature of change_info to ignore changes
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== browser_tab.windowId ) {
        return window
      }
      return Object.assign( {}, window, {
        tab_groups: window.tab_groups.map( tab_group => {
          const tab_index = tab_group.tabs.findIndex( _tab => _tab.id === browser_tab.id )
          if( tab_index > -1 ) {
            tab_group = Object.assign( {}, tab_group, {
              tabs: [ ...tab_group.tabs ]
            })
            tab_group.tabs[ tab_index ] = getTabState( browser_tab )
          }
          return tab_group
        })
      })
    })
  })
}

export function updateTabImage( state, { tab_id, window_id, preview_image_uri } ) {
  return Object.assign( {}, state, {
    windows: state.windows.map( window => {
      if( window.id !== window_id ) {
        return window
      }
      return Object.assign( {}, window, {
        tab_groups: window.tab_groups.map( tab_group => {
          const tab_index = tab_group.tabs.findIndex( _tab => _tab.id === tab_id )
          if( tab_index > -1 ) {
            tab_group = Object.assign( {}, tab_group, {
              tabs: [ ...tab_group.tabs ]
            })

            const preview_image = {
              width: tab_group.tabs[ tab_index ].width,
              height: tab_group.tabs[ tab_index ].height,
              uri: preview_image_uri
            }

            // Clone tab, update image
            tab_group.tabs[ tab_index ] = Object.assign( {}, tab_group.tabs[ tab_index ], {
              preview_image
            })
          }
          return tab_group
        })
      })
    })
  })
}

export default function App( state, action ) {
  switch( action.type ) {
    case INIT:
      return init( state, action )
    case CONFIG_UPDATE:
      return updateConfig( state, action )
    case FEATURES_UPDATE:
      return updateFeatures( state, action )
    case WINDOW_ADD:
      return addWindow( state, action )
    case WINDOW_REMOVE:
      return removeWindow( state, action )
    case WINDOW_SEARCH_START:
      return startWindowSearch( state, action )
    case WINDOW_SEARCH_FINISH:
      return finishWindowSearch( state, action )
    case WINDOW_SEARCH_RESET:
      return resetWindowSearch( state, action )
    case GROUP_ADD:
      return addGroup( state, action )
    case GROUP_REMOVE:
      return removeGroup( state, action )
    case GROUP_UPDATE:
      return updateGroup( state, action )
    case GROUP_MOVE:
      return moveGroup( state, action )
    case GROUP_MUTE:
      return muteGroup( state, action )
    case GROUP_UNMUTE:
      return unmuteGroup( state, action )
    case TABS_MOVE:
      return moveTabs( state, action )
    case TAB_ACTIVATE:
      return activateTab( state, action )
    case TAB_ADD:
      return addTab( state, action )
    case TAB_REMOVE:
      return removeTab( state, action )
    case TAB_UPDATE:
      return updateTab( state, action )
    case TAB_UPDATE_IMAGE:
      return updateTabImage( state, action )
    case TAB_MOVE:
      return moveTab( state, action )
    case TAB_ATTACH:
      return attachTab( state, action )
    default:
      console.warn('unknown action type', action.type)
      return state
  }
}
