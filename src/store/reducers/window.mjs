
import {
  createWindow,
  createTabGroup,
  createPinnedTabGroup,
  getNewTabGroupId,
} from "../helpers.mjs"

export function addWindow( state, { browser_window } ) {
  // Only add if not already exists
  if( state.windows.some( window => window.id === browser_window.id ) ) {
    return state
  }

  return {
    ...state,
    windows: [
      ...state.windows,
      createWindow( browser_window.id, [
        createPinnedTabGroup( [] ),
        createTabGroup( getNewTabGroupId( state ), [] )
      ])
    ]
  }
}

export function removeWindow( state, { window_id } ) {
  // Only remove if exists
  if( ! state.windows.some( window => window.id === window_id ) ) {
    return state
  }
  return {
    ...state,
    windows: state.windows.filter( window => window.id !== window_id )
  }
}
