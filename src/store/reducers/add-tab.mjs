// @todo remove dependency
import {
  getTabState,
} from "../../integrations/index.mjs"
import {
  createWindow,
  createTabGroup,
  createPinnedTabGroup,
  getCreateTabTarget,
  getNewTabGroupId,
  getTabMoveData,
} from "../helpers.mjs"
import {
  moveTabs
} from "./tab.mjs"

export default function addTab( state, { browser_tab } ) {
  const target_window = state.windows.find( window => window.id === browser_tab.windowId )

  const tab = getTabState( browser_tab )
  const target_info = getCreateTabTarget( state, browser_tab )

  if( target_window ) {
    if( target_info.tab_group_id != null ) {
      return Object.assign( {}, state, {
        windows: state.windows.map( window => {
          if( window.id !== browser_tab.windowId ) {
            return window
          }
          let index_offset = 0
          return Object.assign( {}, window, {
            tab_groups: window.tab_groups.map( tab_group => {
              // We know what group we're targeting
              if( tab_group.id === target_info.tab_group_id ) {
                let tabs
                if( target_info.index <= index_offset ) {
                  tabs = [ tab, ...tab_group.tabs ]
                } else if( target_info.index >= index_offset + tab_group.tabs_count ) {
                  tabs = [ ...tab_group.tabs, tab ]
                } else {
                  tabs = tab_group.tabs.slice( 0 )
                  tabs.splice( target_info.index - index_offset, 0, tab )
                }
                tab_group = Object.assign( {}, tab_group, {
                  tabs,
                  tabs_count: tab_group.tabs_count + 1
                })
              }
              index_offset += tab_group.tabs_count
              return tab_group
            })
          })
        })
      })
    } else {
      const move_data = getTabMoveData(
        state,
        { tabs: [ tab ] },
        Object.assign(
          {
            window_id: browser_tab.windowId,
            pinned: browser_tab.pinned
          },
          getCreateTabTarget( state, browser_tab )
        )
      )

      return moveTabs( state, move_data )
    }
  } else {
    // Add tab event is fired before the window is created, so we have to stub it
    return Object.assign( {}, state, {
      windows: [ ...state.windows, createWindow( browser_tab.windowId, [
        createPinnedTabGroup( [] ),
        createTabGroup( getNewTabGroupId( state ), [ tab ] )
      ])]
    })
  }
}
