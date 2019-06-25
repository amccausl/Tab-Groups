<template>
  <body :class="bem( 'action-panel', { theme } )">
    <div class="panel">
      <div class="panel-section panel-section-search">
        <tab-search :theme="theme"></tab-search>
      </div>

      <div class="panel-section panel-section-list panel-section-content">
        <div :class="[ bem( 'panel-list-item', { 'active': tab_group.id === active_tab_group_id } ) ]" v-for="tab_group in tab_groups" :key="tab_group.id">
          <div class="text" @click="onTabGroupClick( tab_group )">
            {{ tab_group.title }}
          </div>
          <svg v-if="tab_group.audible" :class="bem( `panel-list-item__icon`, { 'audio': true } )" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
              <path d="M8.587 2.354L5.5 5H4.191A2.191 2.191 0 0 0 2 7.191v1.618A2.191 2.191 0 0 0 4.191 11H5.5l3.17 2.717a.2.2 0 0 0 .33-.152V2.544a.25.25 0 0 0-.413-.19zm2.988.921a.5.5 0 0 0-.316.949 3.97 3.97 0 0 1 0 7.551.5.5 0 0 0 .316.949 4.971 4.971 0 0 0 0-9.449z"></path>
              <path d="M13 8a3 3 0 0 0-2.056-2.787.5.5 0 1 0-.343.939A2.008 2.008 0 0 1 12 8a2.008 2.008 0 0 1-1.4 1.848.5.5 0 0 0 .343.939A3 3 0 0 0 13 8z"></path>
            </g>
          </svg>
          <div @click="onTabGroupClick( tab_group )">
            {{ is_searching ? getCountMessage( 'matched_tabs', tab_group.search_matched_tabs_count ) : getCountMessage( 'tabs', tab_group.tabs_count ) }}
          </div>
        </div>
      </div>

      <div class="panel-section panel-section-footer">
        <div class="panel-section-footer-button" @click="openTabGroupsPage()">
          <img class="icon" src="/icons/tabulate.svg"/>
          <span class="text" v-once>{{ __MSG_tab_group_manage__ }}</span>
        </div>
        <div class="panel-section-footer-separator"></div>
        <div class="panel-section-footer-button panel-section-footer-button-options" @click="openOptionsPage()">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path d="M15 7h-2.1a4.967 4.967 0 0 0-.732-1.753l1.49-1.49a1 1 0 0 0-1.414-1.414l-1.49 1.49A4.968 4.968 0 0 0 9 3.1V1a1 1 0 0 0-2 0v2.1a4.968 4.968 0 0 0-1.753.732l-1.49-1.49a1 1 0 0 0-1.414 1.415l1.49 1.49A4.967 4.967 0 0 0 3.1 7H1a1 1 0 0 0 0 2h2.1a4.968 4.968 0 0 0 .737 1.763c-.014.013-.032.017-.045.03l-1.45 1.45a1 1 0 1 0 1.414 1.414l1.45-1.45c.013-.013.018-.031.03-.045A4.968 4.968 0 0 0 7 12.9V15a1 1 0 0 0 2 0v-2.1a4.968 4.968 0 0 0 1.753-.732l1.49 1.49a1 1 0 0 0 1.414-1.414l-1.49-1.49A4.967 4.967 0 0 0 12.9 9H15a1 1 0 0 0 0-2zM5 8a3 3 0 1 1 3 3 3 3 0 0 1-3-3z"></path>
          </svg>
        </div>
      </div>
    </div>
  </body>
</template>

<script>
import {
  cloneTabGroup,
  getWindow,
} from '../store/helpers.mjs'
import {
  openTabGroupsPage,
} from '../integrations/index.mjs'
import {
  bem,
  debounce,
  getCountMessage,
  getNewSelectedTabIds,
  onStateChange,
} from './helpers.mjs'

import TabSearch from './TabSearch.vue'

export default {
  name: 'action',
  components: {
    TabSearch,
  },
  data() {
    return {
      window_id: window.current_window_id,
      active_tab_group_id: null,
      is_searching: false,
      is_tab_group_open: {},
      rename_tab_group_id: null,
      search_resolved: true,
      search_matched_tab_ids: [],
      search_missed_tab_ids: [],
      selected_tab_ids: [],
      show_tabs: true,
      show_tabs_count: true,
      tab_size: "sm",
      pinned_tabs: [],
      tab_groups: [],
      theme: null
    }
  },
  created() {
    let state0_window;
    onStateChange( state => {
      switch( state.config.theme ) {
        case "dark":
        case "light":
        case "system":
          this.theme = state.config.theme
          break
        default:
          this.theme = null
      }
      this.show_tabs_count = state.config.show_tabs_count
      this.show_tabs = state.config.show_tabs

      const state_window = getWindow( state, this.window_id )

      if( ! state_window ) {
        // @todo error
        return
      }

      if( state_window === state0_window ) {
        return
      }

      // @todo if active_tab_group_id has changed, open the new active group
      this.active_tab_group_id = state_window.active_tab_group_id

      if( state_window.search != null ) {
        this.is_searching = true
        // @todo only update if this doesn't have focus
        this.search_resolved = state_window.search.resolved
        Object.getPrototypeOf( this.search_matched_tab_ids ).splice.apply( this.search_matched_tab_ids, [ 0, this.search_matched_tab_ids.length, ...state_window.search.matched_tab_ids ] )
      } else {
        this.is_searching = false
      }

      // @todo translate from search
      // @todo add matched tabs to selected
      // @todo bind styles
      // @todo optimize translation

      // @todo this could be done more efficiently
      const new_selected_tab_ids = getNewSelectedTabIds( this.selected_tab_ids, state_window )
      const search_missed_tab_ids = []

      // Need to deep clone the objects because Vue extends prototypes when state added to the vm
      let tab_groups = state_window.tab_groups.map( cloneTabGroup )
      // Use the extended splice to trigger change detection
      tab_groups.forEach( tab_group => {
        // Copy the `open` flag from original data
        const orig_tab_group = this.tab_groups.find( _tab_group => _tab_group.id === tab_group.id )
        if( orig_tab_group ) {
          tab_group.open = orig_tab_group.open
        } else {
          tab_group.open = ( tab_group.id === state_window.active_tab_group_id )
        }

        let is_group_audible = false
        if( this.is_searching ) {
          tab_group.search_matched_tabs_count = 0
        }
        tab_group.tabs.forEach( tab => {
          if( this.is_searching ) {
            if( this.search_matched_tab_ids.includes( tab.id ) ) {
              tab_group.search_matched_tabs_count++
            }
            if( ! state_window.search.queued_tab_ids.includes( tab.id ) ) {
              search_missed_tab_ids.push( tab.id )
            }
          }
          if( tab.id === state_window.active_tab_id ) {
            tab.active = true
          }
          if( tab.audible && ! tab.muted ) {
            is_group_audible = true
          }
        })

        if( is_group_audible ) {
          tab_group.audible = true
        }
      })
      // Use the extended splice to trigger change detection
      Object.getPrototypeOf( this.search_missed_tab_ids ).splice.apply( this.search_missed_tab_ids, [ 0, this.search_missed_tab_ids.length, ...search_missed_tab_ids ] )
      Object.getPrototypeOf( this.selected_tab_ids ).splice.apply( this.selected_tab_ids, [ 0, this.selected_tab_ids.length, ...new_selected_tab_ids ] )
      // Object.getPrototypeOf( this.pinned_tabs ).splice.apply( this.pinned_tabs, [ 0, this.pinned_tabs.length, ...tab_groups[ 0 ].tabs ] )
      Object.getPrototypeOf( this.tab_groups ).splice.apply( this.tab_groups, [ 0, this.tab_groups.length, ...tab_groups.slice( 1 ) ] )

      state0_window = state_window
    })
  },
  computed: {
    __MSG_tab_group_manage__: function() {
      return window.background.getMessage( "tab_group_manage" )
    },
  },
  methods: {
    bem,
    getCountMessage,
    onUpdateSearchText: debounce( function( search_text ) {
      console.info('runSearch', search_text)
      runTabSearch( window.store, this.window_id, search_text )
    }, 250 ),
    openOptionsPage() {
      window.background.openOptionsPage()
      window.close()
    },
    openTabGroupsPage() {
      // @todo only show if browser.sidebarAction.isOpen({})
      browser.sidebarAction.open()
      window.close()
    },
    openTab( tab_id ) {
      console.info('openTab', tab_id)
      window.background.setTabActive( window.store, this.window_id, tab_id )
    },
    selectTabGroup( tab_group ) {
      console.info('@todo selectTabGroup')
      window.close()
    },
    onTabGroupClick( tab_group ) {
      window.background.openTabGroup( window.store, this.window_id, tab_group.id )
      window.close()
    },
    viewTabGroupTabs( tab_group ) {
      console.info('@todo viewTabGroupTabs')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../styles/photon-colors";

.panel {
  overflow-x: hidden;
  width: 350px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  &-section-search {
    padding: 3px 8px 5px 5px;
  }

  &-section-content {
    min-height: 100px;
    max-height: 200px;
    overflow-y: auto;
  }

  &-list-item {
    min-height: 24px;
    max-height: 32px;
  }

  &-section-footer-button {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }

  &-section-footer-button-options {
    flex: 0;
  }
}

.icon {
  height: 16px;
  width: 16px;
  margin-right: 4px;
}

$action__theme: (
  dark: (
    --background-color: $grey-60,
    --primary-color: $grey-10,
    --secondary-color: #76767a,
    __ink--color: #76767a,
    __list-item--hover--background-color: white,
  ),
  light: (
    --background-color: #ffffff,
    --primary-color: $grey-90,
    --secondary-color: $grey-50,
    __ink--color: #76767a,
    __list-item--hover--background-color: black,
  ),
);

@mixin action( $theme ) {
  $colors: map-get( $map: $action__theme, $key: $theme );

  background-color: map-get( $colors, --background-color );

  .panel {
    color: map-get( $colors, --primary-color );
  }

  .panel-section-footer-separator {
    background-color: map-get( $colors, __ink--color );
  }

  .panel-section-footer {
    border-top: 1px solid rgba( map-get( $colors, __ink--color ), 0.1 );
    border-color: rgba( map-get( $colors, __ink--color ), 0.1 );
  }

  .panel-section-footer-button {
    color: map-get( $colors, --primary-color );
    fill: map-get( $colors, --primary-color );
  }

  .panel-list-item {
    &:not(.disabled):hover {
      background-color: rgba( map-get( $colors, __list-item--hover--background-color ), 0.06 );
      border-bottom: 1px solid rgba( map-get( $colors, __list-item--hover--background-color ), 0.1 );
      border-top: 1px solid rgba( map-get( $colors, __list-item--hover--background-color ), 0.1 );
    }

    &:not(.disabled):hover:active {
      background-color: rgba( map-get( $colors, __list-item--hover--background-color ), 0.1 );
    }

    &--active {
      background-color: rgba( map-get( $colors, __list-item--hover--background-color ), 0.1 );
    }

    &__icon {
      height: 16px;
      width: 16px;
      margin-right: 4px;
      color: map-get( $colors, --primary-color );
      fill: map-get( $colors, --primary-color );
    }
  }

  .panel-section-footer-button:hover {
    background-color: rgba( map-get( $colors, __list-item--hover--background-color ), 0.06 );
  }
}

@each $theme, $colors in $action__theme {
  .action-panel--theme-#{$theme} {
    @include action( $theme );
  }

  @media (prefers-color-scheme: $theme) {
    .action-panel--theme-system {
      @include action( $theme );
    }
  }
}
</style>
