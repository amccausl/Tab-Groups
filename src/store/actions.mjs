import {
  INIT,
  TAB_ADD,
  TAB_REMOVE,
  TAB_UPDATE,
} from './action-types.mjs'

export function init({ tabs, tab_groups, tab_group_id_map, window_active_tab_group_id_map }) {
  return {
    type: INIT,
    tabs,
    tab_groups,
    tab_group_id_map,
    window_active_tab_group_id_map
  }
}

export function addTab( tab, tab_group_id ) {
  return {
    type: TAB_ADD,
    tab,
    tab_group_id
  }
}

export function removeTab( tab_id ) {
  return {
    type: TAB_REMOVE,
    tab_id
  }
}

export function updateTab( tab, change_info ) {
  return {
    type: TAB_UPDATE,
    tab,
    change_info
  }
}
