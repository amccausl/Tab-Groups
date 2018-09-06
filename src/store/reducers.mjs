import {
  INIT,
  CONFIG_UPDATE,
  CONTEXTUAL_IDENTITY_CREATE,
  CONTEXTUAL_IDENTITY_UPDATE,
  CONTEXTUAL_IDENTITY_REMOVE,
  FEATURES_UPDATE,
  GROUP_ACTIVATE,
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
  THEME_UPDATE,
  WINDOW_ADD,
  WINDOW_REMOVE,
  WINDOW_SEARCH_START,
  WINDOW_SEARCH_FINISH,
  WINDOW_SEARCH_RESET,
} from "./action-types.mjs"

import init from "./reducers/init.mjs"
import {
  updateConfig
} from "./reducers/config.mjs"
import {
  addContextualIdentity,
  updateContextualIdentity,
  removeContextualIdentity,
} from "./reducers/contextual-identity.mjs"
import {
  updateFeatures,
} from "./reducers/features.mjs"
import {
  addTab,
  activateTab,
  attachTab,
  updateTab,
  updateTabImage,
  moveTab,
  moveTabs,
  removeTab,
} from "./reducers/tab.mjs"
import {
  activateGroup,
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
import {
  updateTheme,
} from "./reducers/theme.mjs"

export default function App( state, action ) {
  switch( action.type ) {
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
    case GROUP_ACTIVATE:
      return activateGroup( state, action )
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
    case INIT:
      return init( state, action )
    case CONFIG_UPDATE:
      return updateConfig( state, action )
    case CONTEXTUAL_IDENTITY_CREATE:
      return addContextualIdentity( state, action )
    case CONTEXTUAL_IDENTITY_UPDATE:
      return updateContextualIdentity( state, action )
    case CONTEXTUAL_IDENTITY_REMOVE:
      return removeContextualIdentity( state, action )
    case FEATURES_UPDATE:
      return updateFeatures( state, action )
    case THEME_UPDATE:
      return updateTheme( state, action )
    default:
      console.warn("unknown action type", action.type)
      return state
  }
}
