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
  THEME_UPDATE,
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

export function initAction({ browser_tabs, config, contextual_identities, theme, window_tab_groups_map }) {
  return {
    type: INIT,
    browser_tabs,
    config,
    contextual_identities,
    theme,
    window_tab_groups_map
  }
}

export function updateConfigAction( config ) {
  return {
    type: CONFIG_UPDATE,
    config
  }
}

export function createContextualIdentityAction( contextual_identity ) {
  return {
    type: CONTEXTUAL_IDENTITY_CREATE,
    contextual_identity
  }
}

export function updateContextualIdentityAction( contextual_identity ) {
  return {
    type: CONTEXTUAL_IDENTITY_UPDATE,
    contextual_identity
  }
}

export function removeContextualIdentityAction( contextual_identity ) {
  return {
    type: CONTEXTUAL_IDENTITY_REMOVE,
    contextual_identity
  }
}

export function updateFeaturesAction( features ) {
  return {
    type: FEATURES_UPDATE,
    features
  }
}

export function updateThemeAction( theme ) {
  return {
    type: THEME_UPDATE,
    theme
  }
}

export function addWindowAction( browser_window ) {
  return {
    type: WINDOW_ADD,
    browser_window
  }
}

export function removeWindowAction( window_id ) {
  return {
    type: WINDOW_REMOVE,
    window_id
  }
}

export function createGroupAction( new_tab_group, window_id ) {
  return {
    type: GROUP_ADD,
    new_tab_group,
    window_id
  }
}

export function activateGroupAction( tab_group_id, window_id ) {
  return {
    type: GROUP_ACTIVATE,
    tab_group_id,
    window_id
  }
}

export function removeGroupAction( tab_group_id, window_id ) {
  return {
    type: GROUP_REMOVE,
    tab_group_id,
    window_id
  }
}

export function updateGroupAction( tab_group_id, window_id, change_info ) {
  return {
    type: GROUP_UPDATE,
    tab_group_id,
    window_id,
    change_info
  }
}

export function moveGroupAction( source_data, target_data ) {
  return {
    type: GROUP_MOVE,
    source_data,
    target_data
  }
}

export function muteGroupAction( tab_group_id, window_id ) {
  return {
    type: GROUP_MUTE,
    tab_group_id,
    window_id
  }
}

export function unmuteGroupAction( tab_group_id, window_id ) {
  return {
    type: GROUP_UNMUTE,
    tab_group_id,
    window_id
  }
}

export function activateTabAction( tab_id, window_id ) {
  return {
    type: TAB_ACTIVATE,
    tab_id,
    window_id
  }
}

export function addTabAction( browser_tab, tab_group_id ) {
  return {
    type: TAB_ADD,
    browser_tab,
    tab_group_id
  }
}

export function removeTabAction( tab_id, window_id ) {
  return {
    type: TAB_REMOVE,
    tab_id,
    window_id
  }
}

export function updateTabAction( browser_tab, change_info ) {
  return {
    type: TAB_UPDATE,
    browser_tab,
    change_info
  }
}

export function updateTabImageAction( tab_id, window_id, preview_image_uri ) {
  return {
    type: TAB_UPDATE_IMAGE,
    tab_id,
    window_id,
    preview_image_uri
  }
}

export function moveTabsAction( source_data, target_data ) {
  return {
    type: TABS_MOVE,
    source_data,
    target_data,
  }
}

export function moveTabAction( tab_id, window_id, index ) {
  return {
    type: TAB_MOVE,
    tab_id,
    window_id,
    index
  }
}

export function moveTabToGroupAction( tab_id, window_id, tab_group_id ) {
  return {
    type: TAB_MOVE,
    tab_id,
    window_id,
    tab_group_id
  }
}

export function attachTabAction( tab_id, window_id, index ) {
  return {
    type: TAB_ATTACH,
    tab_id,
    window_id,
    index
  }
}

export function startSearchAction( window_id, search_text ) {
  return {
    type: WINDOW_SEARCH_START,
    window_id,
    search_text
  }
}

export function finishSearchAction( window_id, search_text, matched_tab_ids ) {
  return {
    type: WINDOW_SEARCH_FINISH,
    window_id,
    search_text,
    matched_tab_ids
  }
}

export function resetSearchAction( window_id ) {
  return {
    type: WINDOW_SEARCH_RESET,
    window_id
  }
}
