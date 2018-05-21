<template>
  <body :class="bem( 'action-panel', { theme } )">
    <div class="panel">
      <div class="panel-section panel-section-search">
        <tab-search :theme="theme"></tab-search>
      </div>

      <div class="panel-section panel-section-list panel-section-content">
        <div class="panel-list-item" v-for="tab_group in tab_groups" :key="tab_group.id" :class="{ 'active': tab_group.id === active_tab_group_id }">
          <div class="text" @click="onTabGroupClick( tab_group )">
            {{ tab_group.title }}
          </div>
          <div @click="onTabGroupClick( tab_group )">
            <!-- @todo hover effect -->
            {{ getCountMessage( 'tabs', tab_group.tabs_count ) }}
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
      search_text: '',
      search_resolved: true,
      tab_groups: [
      ],
      theme: null
    }
  },
  created() {
    onStateChange( state => {
      const state_window = getWindow( state, this.window_id )
      if( state_window ) {
        this.active_tab_group_id = state_window.active_tab_group_id

        this.search_text = state_window.search_text
        this.search_resolved = state_window.search_resolved

        // Use the extended splice to trigger change detection
        Object.getPrototypeOf( this.tab_groups ).splice.apply( this.tab_groups, [ 0, this.tab_groups.length ] )

        // Need to deep clone the objects because Vue extends prototypes when state added to the vm
        const tab_groups_length = state_window.tab_groups.length
        for( let i = 1; i < tab_groups_length; i++ ) {
          this.tab_groups.push( cloneTabGroup( state_window.tab_groups[ i ] ) )
        }

        this.theme = state.config.theme
      } else {
        // @todo error
      }
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
      openTabGroupsPage()
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
      if( tab_group.active_tab_id && tab_group.tabs.length ) {
        this.openTab( tab_group.active_tab_id || tab_group.tabs[ 0 ].id )
      }
      console.info('tab_group', tab_group.active_tab_id)
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

@each $theme, $colors in $action__theme {
  .action-panel--theme-#{$theme} {
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

    .panel-list-item:not(.disabled):hover {
      background-color: rgba( map-get( $colors, __list-item--hover--background-color ), 0.06 );
      border-bottom: 1px solid rgba( map-get( $colors, __list-item--hover--background-color ), 0.1 );
      border-top: 1px solid rgba( map-get( $colors, __list-item--hover--background-color ), 0.1 );
    }

    .panel-list-item:not(.disabled):hover:active {
      background-color: rgba( map-get( $colors, __list-item--hover--background-color ), 0.1 );
    }

    .panel-section-footer-button:hover {
      background-color: rgba( map-get( $colors, __list-item--hover--background-color ), 0.06 );
    }
  }
}
</style>
