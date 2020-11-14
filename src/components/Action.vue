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
        tab_groups: [],
        theme: null
      }
    },
    created() {
      let state0_window;
      onStateChange( state => {
        this.theme = state.config.theme || "system"
        document.body.classList.add( `action-body--theme-${ this.theme }` )
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

<template>
  <body :class="bem( 'action', { theme } )">
    <header>
      <tab-search :theme="theme"></tab-search>
    </header>

    <div class="action__content">
      <div v-for="tab_group in tab_groups" :key="tab_group.id" @click="onTabGroupClick( tab_group )" :class="[ bem( 'action__list-item', { 'active': tab_group.id === active_tab_group_id } ) ]">
        <div class="text">
          {{ tab_group.title }}
        </div>
        <svg v-if="tab_group.audible" :class="bem( `action__list-item-icon`, { 'audio': true } )" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <g>
            <path d="M8.587 2.354L5.5 5H4.191A2.191 2.191 0 0 0 2 7.191v1.618A2.191 2.191 0 0 0 4.191 11H5.5l3.17 2.717a.2.2 0 0 0 .33-.152V2.544a.25.25 0 0 0-.413-.19zm2.988.921a.5.5 0 0 0-.316.949 3.97 3.97 0 0 1 0 7.551.5.5 0 0 0 .316.949 4.971 4.971 0 0 0 0-9.449z"></path>
            <path d="M13 8a3 3 0 0 0-2.056-2.787.5.5 0 1 0-.343.939A2.008 2.008 0 0 1 12 8a2.008 2.008 0 0 1-1.4 1.848.5.5 0 0 0 .343.939A3 3 0 0 0 13 8z"></path>
          </g>
        </svg>
        <div>
          {{ is_searching ? getCountMessage( 'matched_tabs', tab_group.search_matched_tabs_count ) : getCountMessage( 'tabs', tab_group.tabs_count ) }}
        </div>
      </div>
    </div>

    <div class="action__footer">
      <div class="action__footer-button" @click="openTabGroupsPage()">
        <img class="action__footer-icon" src="/icons/tabulate-32.svg"/>
        <span class="action__footer-button-text" v-once>{{ __MSG_tab_group_manage__ }}</span>
      </div>
      <div class="action__footer-separator"></div>
      <div class="action__footer-button action__footer-button--options" @click="openOptionsPage()">
        <svg class="action__footer-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <path d="M15 7h-2.1a4.967 4.967 0 0 0-.732-1.753l1.49-1.49a1 1 0 0 0-1.414-1.414l-1.49 1.49A4.968 4.968 0 0 0 9 3.1V1a1 1 0 0 0-2 0v2.1a4.968 4.968 0 0 0-1.753.732l-1.49-1.49a1 1 0 0 0-1.414 1.415l1.49 1.49A4.967 4.967 0 0 0 3.1 7H1a1 1 0 0 0 0 2h2.1a4.968 4.968 0 0 0 .737 1.763c-.014.013-.032.017-.045.03l-1.45 1.45a1 1 0 1 0 1.414 1.414l1.45-1.45c.013-.013.018-.031.03-.045A4.968 4.968 0 0 0 7 12.9V15a1 1 0 0 0 2 0v-2.1a4.968 4.968 0 0 0 1.753-.732l1.49 1.49a1 1 0 0 0 1.414-1.414l-1.49-1.49A4.967 4.967 0 0 0 12.9 9H15a1 1 0 0 0 0-2zM5 8a3 3 0 1 1 3 3 3 3 0 0 1-3-3z"></path>
        </svg>
      </div>
    </div>
  </body>
</template>

<style lang="scss">
  @import "../styles/photon-colors";

  .action-body {
    &--theme-system {
      @media (prefers-color-scheme: dark) {
        background-color: #4a4a4f;
      }

      @media (prefers-color-scheme: light) {
        background-color: #ffffff;
      }
    }

    &--theme-light {
      background-color: #ffffff;
    }

    &--theme-dark {
      background-color: #4a4a4f;
    }
  }

  .action {
    @media (prefers-color-scheme: dark) {
      --action--primary-color: #f9f9fa;
      --action--secondary-color: #76767a;
      --action__ink--color: #76767a;
      --action__list-item--hover--background-color: #555559;
      --action__list-item--active--background-color: #5c5c61;
      --action__button-background-color--hover: #515155;
    }

    @media (prefers-color-scheme: light) {
      --action--primary-color: #0c0c0d;
      --action--secondary-color: #737373;
      --action__ink--color: #76767a;
      --action__list-item--hover--background-color: black;
      --action__list-item--active--background-color: #e5e5e5;
      --action__button-background-color--hover: #e2e2e2;
    }

    &.action--theme-dark {
      --action--primary-color: #f9f9fa;
      --action--secondary-color: #76767a;
      --action__ink--color: #76767a;
      --action__list-item--hover--background-color: #555559;
      --action__list-item--active--background-color: #5c5c61;
      --action__button-background-color--hover: #515155;
    }

    &.action--theme-light {
      --action--primary-color: #0c0c0d;
      --action--secondary-color: #737373;
      --action__ink--color: #76767a;
      --action__list-item--hover--background-color: #f0f0f0;
      --action__list-item--active--background-color: #e5e5e5;
      --action__button-background-color--hover: #e2e2e2;
    }

    color: var( --action--primary-color );
    overflow-x: hidden;
    width: 350px;
    display: flex;
    flex-direction: column;
    align-items: stretch;

    &__content {
      min-height: 100px;
      max-height: 200px;
      overflow-y: auto;
    }

    &__list-item {
      min-height: 24px;
      max-height: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 24px;
      padding: 0 16px;

      &:not(.disabled):hover {
        cursor: pointer;
        background-color: var( --action__list-item--hover--background-color );
      }

      &:not(.disabled):hover:active {
        background-color: var( --action__list-item--active--background-color );
      }

      &--active {
        background-color: var( --action__list-item--active--background-color );
      }
    }

    &__list-item-icon {
      height: 16px;
      width: 16px;
      margin-right: 4px;
      color: var( --action--primary-color );
      fill: var( --action--primary-color );
    }

    &__footer {
      display: flex;
      flex-direction: row;
      border-top: 1px solid var( --action__ink--color );
    }

    &__footer-separator {
      background-color: var( --action__ink--color );
      width: 2px;
    }

    &__footer-button {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      flex: 1 1 auto;
      margin: 0;
      padding: 12px;
      color: var( --action--primary-color );
      fill: var( --action--primary-color );
      cursor: pointer;

      &:hover {
        background-color: var( --action__button-background-color--hover );
      }

      &--options {
        flex: 0;
      }
    }

    &__footer-button-text {
      margin-left: 8px;
    }

    &__footer-icon {
      height: 16px;
      width: 16px;
    }
  }
</style>
