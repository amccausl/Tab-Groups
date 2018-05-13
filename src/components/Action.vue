<template>
  <body class="action" :class="theme">
    <div class="panel">
      <div class="panel-section panel-section-search">
        <tab-search :theme="'light'"></tab-search>
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
          <!-- @todo hi-res, context colours -->
          <img class="icon" src="/icons/action.png"/>
          <span class="text" v-once>{{ __MSG_tab_group_manage__ }}</span>
        </div>
        <div class="panel-section-footer-separator"></div>
        <div class="panel-section-footer-button panel-section-footer-button-options" @click="openOptionsPage()">
          <!-- @todo hi-res, context colours -->
          <img class="icon" src="/icons/options.png"/>
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

<style scoped>
/* @todo which of these styles are required? */
.panel {
  overflow-x: hidden;
  width: 350px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.panel-section-search {
  padding: 3px 8px 5px 5px;
}

.panel-section-search > input {
  width: 100%;
}

.panel-section-content {
  min-height: 100px;
  max-height: 200px;
  overflow: -moz-scrollbars-none;
}

.panel-list-item {
  min-height: 24px;
  max-height: 32px;
}

.light .panel-list-item.active {
  background-color: rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.panel-section-footer-button {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.panel-section-footer-button-options {
  flex: 0;
}

/* @todo should be moved to common css */
.icon {
  height: 16px;
  width: 16px;
  margin-right: 4px;
}
</style>
