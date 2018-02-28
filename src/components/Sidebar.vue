<template>
  <body class="sidebar" :class="theme">
    <div class="sidebar-header">
      <div class="sidebar-header-new_group"
          @click.left="createTabGroup()" @click.right.prevent
          @dragenter="onTabGroupDragEnter( $event )" @dragover="onTabGroupDragOver( $event )" @drop="onTabGroupDrop( $event )" @dragend="onTabGroupDragEnd( $event )"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <path :fill="context_fill" d="M14 7H9V2a1 1 0 0 0-2 0v5H2a1 1 0 1 0 0 2h5v5a1 1 0 0 0 2 0V9h5a1 1 0 0 0 0-2z"></path>
        </svg>
        <span class="sidebar-header-new_group-text">{{ __MSG_tab_group_new__ }}</span>
      </div>
      <!-- <input class="sidebar-header-search" type="search" @input="onUpdateSearchText( search_text )" v-model="search_text" :placeholder="__MSG_tab_search_placeholder__"/> -->
      <div class="sidebar-header-config" @click="openOptionsPage()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <path :fill="context_fill" d="M15 7h-2.1a4.967 4.967 0 0 0-.732-1.753l1.49-1.49a1 1 0 0 0-1.414-1.414l-1.49 1.49A4.968 4.968 0 0 0 9 3.1V1a1 1 0 0 0-2 0v2.1a4.968 4.968 0 0 0-1.753.732l-1.49-1.49a1 1 0 0 0-1.414 1.415l1.49 1.49A4.967 4.967 0 0 0 3.1 7H1a1 1 0 0 0 0 2h2.1a4.968 4.968 0 0 0 .737 1.763c-.014.013-.032.017-.045.03l-1.45 1.45a1 1 0 1 0 1.414 1.414l1.45-1.45c.013-.013.018-.031.03-.045A4.968 4.968 0 0 0 7 12.9V15a1 1 0 0 0 2 0v-2.1a4.968 4.968 0 0 0 1.753-.732l1.49 1.49a1 1 0 0 0 1.414-1.414l-1.49-1.49A4.967 4.967 0 0 0 12.9 9H15a1 1 0 0 0 0-2zM5 8a3 3 0 1 1 3 3 3 3 0 0 1-3-3z"></path>
        </svg>
      </div>
    </div>
    <div class="sidebar-tabs-pinned-list" @click.right.prevent>
      <div class="sidebar-tabs-pinned-list-item"
          v-for="tab in pinned_tabs" :key="tab.id"
          :class="{ active: tab.active, selected: isSelected( tab ) }" :title="tab.title"
          @click.ctrl="toggleTabSelection( tab )" @click.exact="openTab( tab )" @click.middle="closeTab( tab )"
      >
        <!-- @todo fade styling for pinned tabs if search -->
        <img class="sidebar-tabs-pinned-list-item-icon" :src="tab.icon_url"/>
        <!-- @todo context bar -->
        <!-- https://design.firefox.com/favicon.ico -->
      </div>
    </div>
    <div class="sidebar-tab-group-list" @click.right.prevent>
      <div class="sidebar-tab-group-list-item"
          v-for="tab_group in tab_groups" :key="tab_group.id"
      >
        <div class="sidebar-tab-group-list-item-header"
            v-on:click="toggleTabGroupOpen( tab_group )"
            @dragenter="onTabGroupDragEnter( $event, tab_group )" @dragover="onTabGroupDragOver( $event, tab_group )" @drop="onTabGroupDrop( $event, tab_group )" @dragend="onTabGroupDragEnd( $event, tab_group )"
        >
          <div v-if="! tab_group.open && active_tab_group_id === tab_group.id" class="active-bar"></div>
          <svg class="carat-icon" :class="{ open: tab_group.open }" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
            <path d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"></path>
          </svg>
          <span class="text" contenteditable="true" spellcheck="false" @click.stop @blur="onTabGroupNameUpdate( $event, tab_group )" @keyup.enter="onTabGroupNamePressEnter">{{ tab_group.title }}</span>

          <span class="sidebar-tab-group-list-item-header-tab-count">{{ getCountMessage( 'tabs', tab_group.tabs_count ) }}</span>
          <button class="browser-style more" @click.stop="openTabGroupMore( $event, tab_group )">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
              <path :fill="context_fill" d="M2 6a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm6 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm6 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"></path>
            </svg>
          </button>
        </div>
        <div v-if="tab_group.open" class="sidebar-tab-group-tabs-list">
          <div class="sidebar-tab-group-tabs-list-item"
              v-for="tab in tab_group.tabs" :key="tab.id" :tab="tab"
              v-if="! search_text || ! search_resolved || tab.matched" :title="tab.title"
              :class="{ active: tab_group.active_tab_id === tab.id, selected: isSelected( tab ), source: isSelected( tab ) && is_dragging, target: target_tab_id === tab.id && ! isSelected( tab ) }"
              @click.ctrl="toggleTabSelection( tab )" @click.exact="openTab( tab )" @click.middle="closeTab( tab )"
              draggable="true" @dragstart="onTabDragStart( $event, tab )" @dragend="onTabDragEnd( $event )" @drop="onTabDrop( $event, tab )"
              @dragover="onTabDragOver( $event, tab_group, tab )"
          >
            <div class="sidebar-tab-view-item" :class="{ active: tab_group.active_tab_id === tab.id }">
              <div class="sidebar-tab-view-item-icon">
                <div></div>
                <img :src="tab.icon_url"/>
              </div>
              <div class="sidebar-tab-view-item-text">
                <span class="sidebar-tab-view-item-title">{{ tab.title }}</span>
                <br>
                <span class="sidebar-tab-view-item-url">{{ tab.url | url }}</span>
              </div>
              <div v-if="tab.context_id" class="sidebar-tab-view-item-context" :style="context_styles[ tab.context_id ]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</template>

<script>
import {
  createGroupAction,
  updateGroupAction,
} from '../store/actions.mjs'
import {
  cloneTabGroup,
  cloneTab,
} from '../store/helpers.mjs'
import {
  getTransferData,
  isTabTransfer,
  onTabDragStart,
  onTabDragOver,
  onTabDragEnd,
  onTabDrop,
  onTabGroupDragEnter,
  onTabGroupDragOver,
  onTabGroupDrop,
  resetDragState,
  setTabTransferData,
} from './droppable.mjs'
import {
  debounce,
  getCountMessage,
  getFriendlyUrlText,
  onStateChange,
} from './helpers.mjs'
import {
  INK_90,
} from './photon-colors'

export default {
  name: 'sidebar',
  components: {
  },
  data() {
    return {
      window_id: window.current_window_id,
      active_tab_group_id: null,
      context_styles: {},
      is_dragging: false,
      is_tab_group_open: {},
      search_text: '',
      search_resolved: true,
      selected_tab_ids: [],
      pinned_tabs: [],
      tab_groups: [],
      target_tab_group_id: null,
      target_tab_group_index: null,
      target_tab_id: null,
      theme: null
    }
  },
  created() {
    onStateChange( state => {
      this.theme = state.config.theme

      for( let context_id in state.contexts || {} ) {
        this.context_styles[ context_id ] = {
          'background-color': state.contexts[ context_id ].color
        }
      }

      const state_window = state.windows.find( window => window.id === this.window_id )
      if( state_window ) {
        // @todo if active_tab_group_id has changed, open the new active group
        this.active_tab_group_id = state_window.active_tab_group_id

        this.search_text = state_window.search_text
        this.search_resolved = state_window.search_resolved

        // @todo this could be done more efficiently
        const new_selected_tab_ids = []

        // Need to deep clone the objects because Vue extends prototypes when state added to the vm
        let tab_groups = state_window.tab_groups.map( cloneTabGroup )
        // Use the extended splice to trigger change detection
        Object.getPrototypeOf( this.pinned_tabs ).splice.apply( this.pinned_tabs, [ 0, this.pinned_tabs.length, ...tab_groups[ 0 ].tabs ] )
        tab_groups = tab_groups.filter( tab_group => tab_group.id )
        tab_groups.forEach( tab_group => {
          // Copy the `open` flag from original data
          const orig_tab_group = this.tab_groups.find( _tab_group => _tab_group.id === tab_group.id )
          if( orig_tab_group ) {
            tab_group.open = orig_tab_group.open
          } else {
            tab_group.open = ( tab_group.id === state_window.active_tab_group_id )
          }

          tab_group.tabs.forEach( tab => {
            if( this.selected_tab_ids.includes( tab.id ) ) {
              new_selected_tab_ids.push( tab.id )
            }
          })
        })
        Object.getPrototypeOf( this.selected_tab_ids ).splice.apply( this.selected_tab_ids, [ 0, this.selected_tab_ids.length, ...new_selected_tab_ids ] )
        // Use the extended splice to trigger change detection
        Object.getPrototypeOf( this.tab_groups ).splice.apply( this.tab_groups, [ 0, this.tab_groups.length, ...tab_groups ] )
      } else {
        // @todo error
      }
    })
  },
  computed: {
    __MSG_tab_group_new__() {
      return window.background.getMessage( "tab_group_new" )
    },
    __MSG_tab_search_placeholder__() {
      return window.background.getMessage( "tab_search_placeholder" )
    },
    // This is a hack until context properties are better supported
    // https://developer.mozilla.org/en-US/docs/Web/CSS/-moz-context-properties
    context_fill() {
      switch( this.theme ) {
        case 'dark':
          return 'rgb(255, 255, 255)'
        default:
          return INK_90
      }
    }
  },
  filters: {
    url: getFriendlyUrlText
  },
  methods: {
    getCountMessage,
    createTabGroup() {
      // Create new group with default properties in the store
      window.store.dispatch( createGroupAction( this.window_id ) )
      // @todo create new tab in the new group
    },
    openTabGroupMore( event, tab_group ) {
      console.info('openTabGroupMore', event, tab_group )
    },
    openTab( tab ) {
      console.info('openTab', tab)
      this.selected_tab_ids.splice( 0, this.selected_tab_ids.length )
      window.background.setTabActive( window.store, this.window_id, tab.id )
    },
    closeTab( tab ) {
      console.info('closeTab', tab)
      window.background.closeTab( tab.id )
    },
    isSelected( tab ) {
      return this.selected_tab_ids.includes( tab.id )
    },
    onTabDragStart,
    onTabDragOver,
    onTabDragEnd,
    onTabDrop,
    onTabGroupDragEnter,
    onTabGroupDragOver,
    onTabGroupDrop,
    onTabGroupNamePressEnter( event ) {
      console.info('onTabGroupNamePressEnter', event)
      event.preventDefault()
      event.target.textContent = event.target.textContent.replace( /\n/g, '' )
      event.currentTarget.blur()
      window.getSelection().removeAllRanges()
    },
    onTabGroupNameUpdate( event, tab_group ) {
      console.info('onTabGroupNameUpdate', event, event.target.textContent)
      window.store.dispatch( updateGroupAction( tab_group.id, this.window_id, { title: event.target.textContent } ) )
    },
    onUpdateSearchText: debounce( function( search_text ) {
      console.info('runSearch', search_text)
      window.background.runTabSearch( window.store, this.window_id, search_text )
    }, 250 ),
    openOptionsPage() {
      window.background.openOptionsPage()
    },
    resetDragState,
    toggleTabGroupOpen( tab_group ) {
      tab_group.open = ! tab_group.open
    },
    toggleTabSelection( tab ) {
      console.info('toggleTabSelection', tab)
      const tab_index = this.selected_tab_ids.indexOf( tab.id )
      if( tab_index > -1 ) {
        this.selected_tab_ids.splice( tab_index, 1 )
      } else {
        this.selected_tab_ids.push( tab.id )
      }
      console.info('selected_tab_ids', this.selected_tab_ids)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'photon-colors';

$photon-border-radius: 2px;

// Imported from default firefox theme

$dark-header-background: #0c0c0d;
$dark-header-active-background: #323234;
$dark-header-hover-background: #252526;
$dark-awesome-bar-background: #474749;
$dark-border-color: #e0e0e1;

$light-header-background: #0c0c0d;
$light-header-active-background: #f5f6f7;
$light-header-hover-background: #cccdcf;
$light-awesome-bar-background: #474749; // @todo
$light-border-color: #e0e0e1;

.sidebar {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}

.sidebar-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header-new_group {
  flex: 1;
  display: flex;
  padding: 4px 8px;
  cursor: pointer;
}

.sidebar-header-new_group-text {
  padding-left: 4px;
}

.sidebar-header-search {
  flex: 0;
  padding: 4px 8px;
  margin: 4px;
  border-radius: $photon-border-radius;
  max-width: 50%;
}

.sidebar-header-config {
  width: 24px;
  height: 24px;
  padding: 4px;
  margin-right: 4px;
  cursor: pointer;
}

.sidebar-tabs-pinned-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, 28px);
  grid-auto-columns: min-content;
  grid-auto-rows: max-content;
  cursor: pointer;
}

.sidebar-tabs-pinned-list-item {
  padding: 2px;
}

.sidebar-tabs-pinned-list-item-icon {
  width: 24px;
  height: 24px;
}

.sidebar-tab-group-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow-y: auto;
}

.sidebar-tab-group-list-item {
  flex: 1;
}

.sidebar-tab-group-list-item-header {
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1;

  > .active-bar {
    height: 46px;
    width: 4px;
    margin: -11px 10px -11px -10px;
  }
}

button.browser-style.more {
  display: flex;
  margin: 0 0 0 4px;
}

.sidebar-tab-group-list-item-header > span {
  flex: 1;
}

.sidebar-tab-group-list-item-header > .sidebar-tab-group-list-item-header-tab-count {
  text-align: right;
}

.sidebar-tab-group-tabs-list {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}

.sidebar-tab-group-tabs-list-item {
  width: 100%;
  flex: 0;
  overflow-x: hidden;

  &.selected {
    /* @todo themed */
    background-color: purple;
  }

  &.source .sidebar-tab-view-item {
    margin-left: 8px;
  }

  &.target {
    background-color: red;

    .sidebar-tab-view-item {
      margin-top: 54px;
    }
  }
}

.sidebar-tab-view-item {
  transition-property: margin-top, margin-left;
  transition-duration: 250ms;
  transition-timing-function: cubic-bezier(.07,.95,0,1);
}

.sidebar-tab-view-item {
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: clip;
  cursor: pointer;
}

.sidebar-tab-view-item-icon {
  position: relative;
  min-width: 32px;
  height: 32px;
  margin: 0 4px;

  > div {
    position: absolute;
    padding: 16px;
    border-radius: 16px;
  }

  > img {
    position: absolute;
    width: 24px;
    height: 24px;
    margin: 4px;
  }
}

.sidebar-tab-view-item-text {
  flex: 1;
  padding-top: 10px;
  padding-bottom: 10px
}

.sidebar-tab-view-item-context {
  flex: 0;
  min-width: 4px;
  height: 52px;
}

/* @todo should be moved to common css */
.icon {
  height: 16px;
  width: 16px;
  margin-right: 4px;
}

.carat-icon {
  width: 6px;
  margin-right: 4px;
  margin-bottom: 1px;
  transition-property: transform;
  transition-duration: 250ms;
  transition-timing-function: cubic-bezier(.07,.95,0,1);
}

.carat-icon.open {
  transform: rotate(90deg);
}

.light {
  &.sidebar {
    color: $ink-90;
    background-color: $white-100;
  }

  .sidebar-header {
    background-color: $light-header-active-background;
    border-bottom: $light-border-color 1px solid;
  }

  .sidebar-header-new_group:hover {
    background-color: $light-header-hover-background;
  }

  .sidebar-header-search {
    background-color: $white-100;
    color: $ink-90;
    border: 1px solid #ccc;
  }

  .sidebar-header-config:hover {
    background-color: $light-header-hover-background;
  }

  .sidebar-tab-group-tabs-list {
    border-bottom: $light-border-color 1px solid;
  }

  .sidebar-tab-group-tabs-list-item.source .sidebar-tab-view-item {
    background-color: blue;
  }

  .sidebar-tab-group-tabs-list-item.target .sidebar-tab-view-item {
    background-color: $white-100;
  }

  .sidebar-tabs-pinned-list-item.active {
    background-color: $light-header-active-background;
  }

  .sidebar-tabs-pinned-list-item:hover {
    background-color: $light-header-hover-background;
  }

  .sidebar-tabs-pinned-list-item.active:hover {
    background-color: $light-header-active-background;
  }

  .sidebar-tab-group-list-item-header {
    background-color: $white-100;
    border-bottom: $light-border-color 1px solid;

    > .active-bar {
      background-color: blue;
    }
  }

  button.more {
    // @todo
  }

  .sidebar-tab-view-item.active {
    background-color: $light-header-active-background;
  }

  .sidebar-tab-view-item:hover {
    background-color: $light-header-hover-background;
  }

  .sidebar-tab-view-item.active:hover {
    background-color: $light-header-active-background;
  }

  .sidebar-tab-view-item-title {
    color: black;
  }

  .sidebar-tab-view-item-url {
    color: $grey-50;
  }

  .carat-icon {
    fill: black;
  }
}

.dark {
  &.sidebar {
    color: $white-100;
    background-color: $dark-header-background;
  }

  .sidebar-header {
    background-color: $dark-header-active-background;
    border-bottom: $dark-border-color 1px solid;
  }

  .sidebar-header-new_group:hover {
    background-color: $dark-header-hover-background;
  }

  .sidebar-header-search {
    background-color: $dark-awesome-bar-background;
    color: $white-100;
    border: none;
  }

  .sidebar-header-config:hover {
    background-color: $dark-header-hover-background;
  }

  .sidebar-tab-group-tabs-list {
    border-bottom: $dark-border-color 1px solid;
  }

  .sidebar-tab-group-tabs-list-item.target {
    background-color: $dark-header-active-background;
  }

  .sidebar-tab-group-tabs-list-item.target .sidebar-tab-view-item {
    background-color: $dark-header-background;
  }

  .sidebar-tab-group-tabs-list-item.target .sidebar-tab-view-item.active {
    background-color: $dark-header-active-background;
  }

  .sidebar-tab-group-list-item-header {
    background-color: black;
    border-bottom: $light-border-color 1px solid;

    > .active-bar {
      background-color: blue;
    }
  }

  button.more {
    // @todo
    background-color: black;
  }

  .sidebar-tabs-pinned-list-item.active {
    background-color: $dark-header-active-background;
  }

  .sidebar-tabs-pinned-list-item:hover {
    background-color: $dark-header-hover-background;
  }

  .sidebar-tabs-pinned-list-item.active:hover {
    background-color: $dark-header-active-background;
  }

  .sidebar-tab-view-item.active {
    background-color: $dark-header-active-background;
  }

  .sidebar-tab-view-item:hover {
    background-color: $dark-header-hover-background;
  }

  .sidebar-tab-view-item.active:hover {
    background-color: $dark-header-active-background;
  }

  .sidebar-tab-view-item-icon > div {
    background-color: $grey-50;
  }

  .sidebar-tab-view-item-title {
    color: $white-100;
  }

  .sidebar-tab-view-item-url {
    color: $grey-50;
  }

  .carat-icon {
    fill: $white-100;
  }
}
</style>
