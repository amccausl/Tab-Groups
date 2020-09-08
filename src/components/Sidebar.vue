<script>
  import { nextTick } from 'vue'

  import {
    updateGroupAction,
  } from '../store/actions.mjs'
  import {
    cloneTabGroup,
    getWindow,
  } from '../store/helpers.mjs'
  import {
    onTabDragStart,
    onTabDragEnd,
    onTabDragEnter,
    onTabDragLeave,
    onTabDrop,
    onTabGroupDragStart,
    onTabGroupDragEnd,
    onTabGroupDragEnter,
    onTabGroupDragLeave,
    onTabGroupDrop,
  } from './tab-draggable.mjs'
  import {
    bem,
    debounce,
    getCountMessage,
    getFriendlyUrlText,
    getTabHoverText,
    getTabGroupCopyText,
    onStateChange,
  } from './helpers.mjs'
  import {
    INK_90,
  } from './photon-colors'
  import {
    toggleTabSelection,
    toggleTabBatchSelection,
  } from './tab-selectable.mjs'

  import Editable from './Editable.vue'
  import SidebarHeader from './SidebarHeader.vue'
  import TabGroupContextMenu from "./TabGroupContextMenu.vue"
  import TabIcon from './TabIcon.vue'
  import TabSearch from './TabSearch.vue'

  export default {
    name: 'sidebar',
    components: {
      Editable,
      SidebarHeader,
      TabGroupContextMenu,
      TabIcon,
      TabSearch,
    },
    data() {
      return {
        window_id: window.current_window_id,
        active_tab_group_id: null,
        context_styles: {},
        is_searching: false,
        is_tab_group_open: {},
        rename_tab_group_id: null,
        // @todo move this to it's own object
        search_resolved: true,
        search_matched_tab_ids: [],
        search_missed_tab_ids: [],
        selected_tab_ids: [],
        show_dropzone_icon: false,
        show_header: true,
        show_tabs: true,
        show_tabs_count: true,
        show_tab_context: true,
        show_tab_icon_background: true,
        tab_groups: [],
        drag_state: {
          is_dragging: false,
          source: {},
          target: {},
        },
        theme: null
      }
    },
    created() {
      let state0_window;
      onStateChange( state => {
        this.theme = state.config.theme || "system"
        this.show_header = state.config.show_header
        this.show_tabs_count = state.config.show_tabs_count
        this.show_tabs = state.config.show_tabs
        this.show_tab_context = this.show_tabs && state.config.show_tab_context
        this.show_tab_icon_background = this.show_tabs && state.config.show_tab_icon_background

        for( let context_id in state.contextual_identities_data || {} ) {
          this.context_styles[ context_id ] = {
            'background-color': state.contextual_identities_data[ context_id ].color
          }
        }

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
            tab_group.search_queued_tabs_count = 0
            tab_group.search_matched_tabs_count = 0
          }
          tab_group.tabs.forEach( tab => {
            if( this.is_searching ) {
              if( this.search_matched_tab_ids.includes( tab.id ) ) {
                tab_group.search_matched_tabs_count++
              }
              if( ! state_window.search.queued_tab_ids.includes( tab.id ) ) {
                search_missed_tab_ids.push( tab.id )
              } else {
                tab_group.search_queued_tabs_count++
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
        Object.getPrototypeOf( this.selected_tab_ids ).splice.apply( this.selected_tab_ids, [ 0, this.selected_tab_ids.length, ...state_window.highlighted_tab_ids ] )
        Object.getPrototypeOf( this.tab_groups ).splice.apply( this.tab_groups, [ 0, this.tab_groups.length, ...tab_groups.slice( 1 ) ] )

        state0_window = state_window
      })
    },
    computed: {
      __MSG_tab_group_new__() {
        return window.background.getMessage( "tab_group_new" )
      },
      __MSG_window_new__() {
        return window.background.getMessage( "window_new" )
      },
    },
    filters: {
      url: getFriendlyUrlText
    },
    methods: {
      bem,
      getCountMessage,
      getTabHoverText,
      async createTabGroup() {
        // Create new group with default properties in the store
        const tab_group = await window.background.createGroup( window.store, this.window_id )
        console.info('created group', tab_group)
        nextTick( () => {
          this.renameTabGroup( tab_group.id )
        })
      },
      openTabGroupMore( event, tab_group ) {
        let button_element = event.target
        // Detect if child element is clicked, find button parent
        while( button_element.tagName !== "BUTTON" && button_element.parentElement ) {
          button_element = button_element.parentElement
        }
        this.$refs.tab_group_context_menu.openContextMenu( button_element, tab_group )
      },
      openTab( tab_id ) {
        console.info('openTab', tab_id)
        this.selected_tab_ids.splice( 0, this.selected_tab_ids.length )
        window.background.setTabActive( window.store, this.window_id, tab_id )
      },
      closeTab( tab ) {
        console.info('closeTab', tab)
        window.background.closeTab( window.store, tab.id )
      },
      renameTabGroup( tab_group_id ) {
        console.info('renameTabGroup', tab_group_id)
        this.rename_tab_group_id = tab_group_id
      },
      isSelected( tab ) {
        return this.selected_tab_ids.includes( tab.id )
      },
      isTabGroupActive( tab_group ) {
        return ! tab_group.open && this.active_tab_group_id === tab_group.id
      },
      isTabGroupDragSource( tab_group ) {
        return this.drag_state.source.type === 'tab_group' && this.drag_state.source.tab_group_id === tab_group.id
      },
      isTabGroupDragTarget( tab_group ) {
        return ! this.isTabGroupDragSource( tab_group ) &&  this.drag_state.target.tab_group_id === tab_group.id && this.drag_state.target.tab_group_index == null
      },
      onTabDragStart,
      onTabDragEnd,
      onTabDrop,
      onTabDragEnter,
      onTabDragLeave,
      onTabGroupClick( tab_group ) {
        if( ! this.show_tabs ) {
          if( tab_group.active_tab_id && tab_group.tabs.length ) {
            this.openTab( tab_group.active_tab_id || tab_group.tabs[ 0 ].id )
          }
          console.info('tab_group', tab_group.active_tab_id)
        } else {
          tab_group.open = ! tab_group.open
        }
      },
      onTabGroupDragStart,
      onTabGroupDragEnter,
      onTabGroupDragLeave,
      onTabGroupDragEnd,
      onTabGroupDrop,
      onTabGroupTitleInput( title ) {
        console.info('onTabGroupTitleInput', title )
        // @todo skip if empty, reset
        // @todo should be moved to background
        window.store.dispatch( updateGroupAction( this.rename_tab_group_id, this.window_id, { title } ) )
        // Update interferes with the editable div if it happens too quickly
        this.rename_tab_group_id = null
      },
      getTabSearchState( tab ) {
        if( ! this.is_searching ) {
          return false
        }
        if( this.search_matched_tab_ids.includes( tab.id ) ) {
          return "matched"
        }
        if( this.search_missed_tab_ids.includes( tab.id ) ) {
          return "missed"
        }
      },
      toggleTabSelection( tab ) {
        console.info('toggleTabSelection', tab.id)
        toggleTabSelection.call( this, tab.id )
        const highlighted_tab_ids = this.selected_tab_ids.slice( 0, this.selected_tab_ids.length )
        window.background.setHighlightedTabIds( window.store, this.window_id, highlighted_tab_ids )
      },
      toggleTabBatchSelection( tab ) {
        console.info('toggleTabBatchSelection', tab)
        toggleTabBatchSelection.call( this, tab.id )
        const highlighted_tab_ids = this.selected_tab_ids.slice( 0, this.selected_tab_ids.length )
        window.background.setHighlightedTabIds( window.store, this.window_id, highlighted_tab_ids )
      },
      updateDropzoneHeight() {
        // Only display the icon if the dropzone is bigger than 35 height
        if( ! this.$refs.empty_dropzone ) {
          this.show_dropzone_icon = false
        } else if( this.$refs.empty_dropzone.clientHeight < 36 ) {
          this.show_dropzone_icon = false
        } else {
          this.show_dropzone_icon = true
        }
      },
    }
  }
</script>

<template>
  <div :class="bem( 'sidebar', { theme } )">
    <sidebar-header :theme="theme" v-if="show_header" />
    <div class="sidebar-tab_groups-list" @click.right.prevent>
      <div :class="bem( `sidebar-tab_groups-list__item-container`, { 'drag-source': isTabGroupDragSource( tab_group ), [`drag-${ drag_state.source.type }-target`]: ! isTabGroupDragSource( tab_group ) && isTabGroupDragTarget( tab_group ) } )"
          v-for="(tab_group, tab_group_index) in tab_groups" :key="tab_group.id"
      >
        <div class="sidebar-tab_groups-list__item">
          <div :class="bem( 'tab-groups-list-item-header', {
              'active': active_tab_group_id === tab_group.id,
              'open': show_tabs && tab_group.open,
              'drag-source': isTabGroupDragSource( tab_group ),
              [`drag-${ drag_state.source.type }-target`]: ! isTabGroupDragSource( tab_group ) && isTabGroupDragTarget( tab_group )
            } )"
            :title="tab_group.title"
            @dragenter="onTabGroupDragEnter( $event, tab_group, tab_group_index + 1 )"
            @dragover.prevent
            @dragleave="onTabGroupDragLeave( $event, tab_group, tab_group_index + 1 )"
            @drop="onTabGroupDrop( $event, tab_group, tab_group_index + 1 )"
            @click="onTabGroupClick( tab_group )"
            draggable="true"
            @dragstart="onTabGroupDragStart( $event, tab_group )"
            @dragend="onTabGroupDragEnd( $event, tab_group )"
          >
            <div class="tab-groups-list-item-header__container">
              <div class="tab-groups-list-item-header__drag-target-ink"></div>
              <div class="tab-groups-list-item-header__main">
                <svg v-if="show_tabs" :class="bem( `tab-groups-list-item-header__carat-icon`, { 'open': tab_group.open } )" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
                  <path d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"></path>
                </svg>
                <div :class="bem( `tab-groups-list-item-header__title`, { 'editing': rename_tab_group_id === tab_group.id } )">
                  <editable class="tab-groups-list-item-header__title-editable" :model-value="tab_group.title" @update:model-value="onTabGroupTitleInput( $event )" :active="rename_tab_group_id === tab_group.id"></editable>
                </div>

                <svg v-if="tab_group.muted" :class="bem( `tab-groups-list-item-header__icon`, { 'audio-mute': true } )" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                  <g>
                    <path d="M13 8a2.813 2.813 0 0 0-.465-1.535l-.744.744A1.785 1.785 0 0 1 12 8a2.008 2.008 0 0 1-1.4 1.848.5.5 0 0 0 .343.939A3 3 0 0 0 13 8z"></path>
                    <path d="M13.273 5.727A3.934 3.934 0 0 1 14 8a3.984 3.984 0 0 1-2.742 3.775.5.5 0 0 0 .316.949A4.985 4.985 0 0 0 15 8a4.93 4.93 0 0 0-1.012-2.988zm-4.603 7.99a.2.2 0 0 0 .33-.152V10l-2.154 2.154zm6.037-12.424a1 1 0 0 0-1.414 0L9 5.586V2.544a.25.25 0 0 0-.413-.19L5.5 5H4.191A2.191 2.191 0 0 0 2 7.191v1.618a2.186 2.186 0 0 0 1.659 2.118l-2.366 2.366a1 1 0 1 0 1.414 1.414l12-12a1 1 0 0 0 0-1.414z"></path>
                  </g>
                </svg>
                <svg v-else-if="tab_group.audible" :class="bem( `tab-groups-list-item-header__icon`, { 'audio': true } )" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                  <g>
                    <path d="M8.587 2.354L5.5 5H4.191A2.191 2.191 0 0 0 2 7.191v1.618A2.191 2.191 0 0 0 4.191 11H5.5l3.17 2.717a.2.2 0 0 0 .33-.152V2.544a.25.25 0 0 0-.413-.19zm2.988.921a.5.5 0 0 0-.316.949 3.97 3.97 0 0 1 0 7.551.5.5 0 0 0 .316.949 4.971 4.971 0 0 0 0-9.449z"></path>
                    <path d="M13 8a3 3 0 0 0-2.056-2.787.5.5 0 1 0-.343.939A2.008 2.008 0 0 1 12 8a2.008 2.008 0 0 1-1.4 1.848.5.5 0 0 0 .343.939A3 3 0 0 0 13 8z"></path>
                  </g>
                </svg>

                <span v-if="show_tabs_count" class="tab-groups-list-item-header__tabs-count">{{ is_searching ? getCountMessage( 'matched_tabs', tab_group.search_matched_tabs_count ) : getCountMessage( 'tabs', tab_group.tabs_count ) }}</span>
              </div>
              <button class="tab-groups-list-item-header__more-button" @click.stop="openTabGroupMore( $event, tab_group )">
                <svg class="tab-groups-list-item-header__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                  <path d="M2 6a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm6 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm6 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"></path>
                </svg>
              </button>
              <div v-if="is_searching" class="tab-groups-list-item-header__search-progress-ink" :style="{ width: `calc( ( ${ active_tab_group_id === tab_group.id ? '100vw - 5px' : '100vw' } ) * ${ 1 - tab_group.search_queued_tabs_count / tab_group.tabs.length } )` }"></div>
            </div>
          </div>
          <div v-if="tab_group.open && show_tabs && tab_group.tabs.length" :class="[ bem( 'list-flex-col', { theme, 'is-dragging': drag_state.is_dragging, 'is-searching': is_searching, 'is-max-height': true } ) ]">
            <div :class="bem( `list-flex-col__item`, {
                  'active': tab.active,
                  'drag-target-index': drag_state.target.tab_id === tab.id && ! isSelected( tab ),
                  'drag-selected': isSelected( tab ) && ( ! drag_state.is_dragging || drag_state.source.type === 'tab' ),
                  'drag-source': drag_state.is_dragging && drag_state.source.type === 'tab' && isSelected( tab ),
                  'search': getTabSearchState( tab )
                } )"
                v-for="tab in tab_group.tabs" :key="tab.id" :tab="tab"
                :title="getTabHoverText( tab )"
                @click.ctrl="toggleTabSelection( tab )" @click.shift="toggleTabBatchSelection( tab )" @click.middle.exact="closeTab( tab )" @click.exact="openTab( tab.id )"
                @dragenter="onTabDragEnter( $event, tab_group, tab )"
                @dragover.prevent
                @dragleave="onTabDragLeave( $event, tab_group, tab )"
                @drop="onTabDrop( $event, tab_group, tab )"
                draggable="true"
                @dragstart="onTabDragStart( $event, tab )"
                @dragend="onTabDragEnd( $event )"
            >
              <div class="list-flex-col__drag-target-ink"></div>
              <div :class="bem( 'tab-list-item', { theme, size: 'sm', active: tab.active } )">
                <div :class="bem( 'tab-list-item__icon', { 'show-background': show_tab_icon_background, 'loading': tab.status === 'loading' } )">
                  <tab-icon :theme="theme" :tab="tab" size="16"></tab-icon>
                </div>
                <div class="tab-list-item__text">
                  <span class="tab-list-item__title">{{ tab.title }}</span>
                </div>
                <div class="tab-list-item__close-button" @click.stop="closeTab( tab )">
                  <svg class="tab-list-item__close-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M9.061 8l3.47-3.47a.75.75 0 0 0-1.061-1.06L8 6.939 4.53 3.47a.75.75 0 1 0-1.06 1.06L6.939 8 3.47 11.47a.75.75 0 1 0 1.06 1.06L8 9.061l3.47 3.47a.75.75 0 0 0 1.06-1.061z"></path>
                  </svg>
                </div>
                <div v-if="show_tab_context && tab.context_id" class="tab-list-item__context" :style="context_styles[ tab.context_id ]"></div>
              </div>
            </div>
            <div class="list-flex-col__drag-target-ink list-flex-col__drag-target-ink--is-last"></div>
          </div>
        </div>
      </div>
    </div>
    <div :class="bem( 'empty-dropzone', { 'drag-tab-target': drag_state.source.type === 'tab' && drag_state.target.tab_group_new, 'drag-tab_group-target': drag_state.source.type === 'tab_group' && drag_state.target.tab_group_new } )"
        ref="empty_dropzone"
        @click.right.prevent
        @dragenter="updateDropzoneHeight() || onTabGroupDragEnter( $event, null, null, 'dropzone' )"
        @dragover.prevent
        @dragleave="onTabGroupDragLeave"
        @dragend="onTabDragEnd"
        @drop="onTabGroupDrop( $event, null, null, 'dropzone' )"
    >
      <div class="empty-dropzone__drag-target-ink"></div>
      <svg v-if="show_dropzone_icon" class="empty-dropzone__drag-target-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
        <path d="M14 7H9V2a1 1 0 0 0-2 0v5H2a1 1 0 1 0 0 2h5v5a1 1 0 0 0 2 0V9h5a1 1 0 0 0 0-2z"></path>
      </svg>
    </div>
    <div :class="bem( 'action-strip', { theme } )">
      <div :class="bem( `action-strip__button`, { 'drag-target': ( drag_state.target.tab_group_new && ! drag_state.target.tab_group_last ) || drag_state.target.window_new } )"
          @click.left="createTabGroup()"
          @click.right.prevent
          @dragenter="onTabGroupDragEnter( $event, null, null, 'action_new' )"
          @dragover.prevent
          @dragleave="onTabGroupDragLeave"
          @drop="onTabGroupDrop( $event, null, null, 'action_new' )"
          @dragend="onTabDragEnd"
      >
        <svg class="action-strip__button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <path d="M14 7H9V2a1 1 0 0 0-2 0v5H2a1 1 0 1 0 0 2h5v5a1 1 0 0 0 2 0V9h5a1 1 0 0 0 0-2z"></path>
        </svg>
        <span class="action-strip__button-text">{{ drag_state.is_dragging && drag_state.source.type === "tab_group" ? __MSG_window_new__ : __MSG_tab_group_new__ }}</span>
      </div>
    </div>
    <tab-group-context-menu
      ref="tab_group_context_menu"
      :theme="theme"
      :tab_groups="tab_groups"
      v-on:rename="renameTabGroup( $event )"
    />
  </div>
</template>

<style lang="scss">
  @import "../styles/photon-colors";
  @import "../styles/photon-typography";

  $photon-border-radius: 2px;
  $--drag-source--opacity: 0.3;

  /* Imported from default firefox theme */

  $dark-header-background: #0c0c0d;
  $dark-header-active-background: #323234;
  $dark-header-hover-background: #252526;
  $dark-awesome-bar-background: #474749;
  $dark-border-color: #e0e0e1;

  $light-header-background: #0c0c0d;
  $light-header-active-background: #f5f6f7;
  $light-header-hover-background: #cccdcf;
  $light-awesome-bar-background: #474749;
  $light-border-color: #e0e0e1;

  $--theme-light: (
    __primary-text--color: $grey-90,
    __secondary-text--color: $grey-50,
    --border-color: $light-border-color,
    --drag-target--background-color: $purple-50,
    --drag-target--color: $white-100,
    --drag-target--ink-color: $purple-50,
  );

  $--theme-dark: (
    __primary-text--color: $white-100,
    __secondary-text--color: $grey-10,
    --border-color: $light-border-color,
    --drag-target--background-color: $purple-50,
    --drag-target--color: $white-100,
    --drag-target--ink-color: $purple-50,
  );

  /* Helpers */

  %slow-transition {
    transition-duration: 250ms;
    transition-timing-function: cubic-bezier(.07,.95,0,1);
  }

  @mixin slow-transition {
    transition-duration: 250ms;
    transition-timing-function: cubic-bezier(.07,.95,0,1);
  }

  .empty-dropzone--drag-tab_group-target .empty-dropzone__drag-target-ink,
  .sidebar-tab_groups-list__drag-target-ink,
  .sidebar-tab-group-tabs-list__item-container--drag-target .sidebar-tab-group-tabs-list__drag-target-ink,
  .sidebar-tab_groups-list__item-container--drag-tab-target .list-flex-col__drag-target-ink--is-last,
  .tab-groups-list-item-header--drag-tab_group-target .tab-groups-list-item-header__drag-target-ink {
    position: absolute;
    top: -1px;
    height: 2px;
    width: 100%;
    background-color: var( --sidebar__drag-target--highlight-color );
    z-index: 10;

    &::before {
      content: "";
      width: 0px;
      height: 0px;
      border-radius: 50%;
      border: 5px solid var( --sidebar__drag-target--highlight-color );
      position: absolute;
      top: -4px;
      left: -6px;
    }
  }

  @import "../styles/list-flex-col";

  /* Sidebar */

  $sidebar__themes: (
    light: (
      --color: map-get( $--theme-light, __primary-text--color ),
      --background-color: $white-100,
      --drag-target--background-color: map-get( $--theme-light, --drag-target--background-color ),
    ),
    dark: (
      --color: map-get( $--theme-dark, __primary-text--color ),
      --background-color: black,
      --drag-target--background-color: map-get( $--theme-dark, --drag-target--background-color ),
    )
  );

  .sidebar {
    --sidebar__drag-target--highlight-color: #9400ff;
    --sidebar--border-color: #e0e0e1;

    &--theme-system {
      @media (prefers-color-scheme: dark) {
        --sidebar--color: #fff;
        --sidebar--background-color: #000;
        --sidebar__action-strip--background-color: #323234;
        --sidebar__action-strip--button-background-color: #323234;
        --sidebar__action-strip--button-hover-background-color: #5b5b5d;
        --sidebar__action-strip--text-color: #d0d0d0;
        --sidebar__dropzone--background-color: black;
        --sidebar__scrollbar--background-color: black;
        --sidebar__scrollbar--color: #5b5b5d;
        --sidebar__separator--color: #545455;
        --sidebar__tab-groups-list--active-background-color: #323234;
        --sidebar__tab-groups-list--background-color: #0c0c0d;
        --sidebar__tab-groups-list-item-header--hover-background-color: #5b5b5d;
        --sidebar__text--primary-color: #fff;
        --sidebar__text--secondary-color: #f9f9fa;
      }

      @media (prefers-color-scheme: light) {
        --sidebar--color: #0c0c0d;
        --sidebar--background-color: #fff;
        --sidebar__action-strip--background-color: #f5f6f7;
        --sidebar__action-strip--button-background-color: #f5f6f7;
        --sidebar__action-strip--button-hover-background-color: #d0d0d0;
        --sidebar__action-strip--text-color: rgba(12, 12, 13, 0.8);
        --sidebar__dropzone--background-color: #fff;
        --sidebar__scrollbar--background-color: #fff;
        --sidebar__scrollbar--color: #cccdcf;
        --sidebar__separator--color: #e0e0e1;
        --sidebar__tab-groups-list--active-background-color: #f5f6f7;
        --sidebar__tab-groups-list--background-color: #fff;
        --sidebar__tab-groups-list-item-header--hover-background-color: #cccdcf;
        --sidebar__text--primary-color: #0c0c0d;
        --sidebar__text--secondary-color: #737373;
      }
    }

    &--theme-dark {
      --sidebar--color: #fff;
      --sidebar--background-color: #000;
      --sidebar__action-strip--background-color: #323234;
      --sidebar__action-strip--button-background-color: #323234;
      --sidebar__action-strip--button-hover-background-color: #5b5b5d;
      --sidebar__action-strip--text-color: #d0d0d0;
      --sidebar__dropzone--background-color: black;
      --sidebar__scrollbar--background-color: black;
      --sidebar__scrollbar--color: #5b5b5d;
      --sidebar__separator--color: #545455;
      --sidebar__tab-groups-list--active-background-color: #323234;
      --sidebar__tab-groups-list--background-color: #0c0c0d;
      --sidebar__tab-groups-list-item-header--hover-background-color: #5b5b5d;
      --sidebar__text--primary-color: #fff;
      --sidebar__text--secondary-color: #f9f9fa;
    }

    &--theme-light {
      --sidebar--color: #0c0c0d;
      --sidebar--background-color: #fff;
      --sidebar__action-strip--background-color: #f5f6f7;
      --sidebar__action-strip--button-background-color: #f5f6f7;
      --sidebar__action-strip--button-hover-background-color: #d0d0d0;
      --sidebar__action-strip--text-color: rgba(12, 12, 13, 0.8);
      --sidebar__dropzone--background-color: #fff;
      --sidebar__scrollbar--background-color: #fff;
      --sidebar__scrollbar--color: #cccdcf;
      --sidebar__separator--color: #e0e0e1;
      --sidebar__tab-groups-list--active-background-color: #f5f6f7;
      --sidebar__tab-groups-list--background-color: #fff;
      --sidebar__tab-groups-list-item-header--hover-background-color: #cccdcf;
      --sidebar__text--primary-color: #0c0c0d;
      --sidebar__text--secondary-color: #737373;
    }

    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    color: var( --sidebar--color );
    background-color: var( --sidebar--background-color );
  }

  /* Empty Dropzone */

  .empty-dropzone {
    @include slow-transition;
    transition-property: background-color, margin-top;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    background-color: var( --sidebar__dropzone--background-color );
    position: relative;

    &__drag-target-icon {
      @include slow-transition;
      transition-property: fill, opacity;
      position: absolute;
    }

    &--drag-tab-target {
      background-color: var( --sidebar__drag-target--highlight-color );
      fill: var( --sidebar__drag-target--highlight-color );
    }
  }

  /* Action Strip */

  .action-strip {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: var( --sidebar__action-strip--background-color );

    &__button {
      @extend %slow-transition;
      transition-property: background-color;
      flex: 1;
      display: flex;
      align-items: center;
      padding: 0 8px;
      height: 32px;
      cursor: pointer;

      &:hover {
        background-color: var( --sidebar__action-strip--button-hover-background-color );
      }

      &--no-grow {
        flex: 0;
      }

      &--drag-target {
        background-color: var( --sidebar__drag-target--highlight-color );
      }
    }

    &__button-text {
      padding-left: 4px;
      color: var( --sidebar__action-strip--text-color );
    }

    &__button--drag-target &__button-text {
      color: $white-100;
    }

    &__button-icon {
      margin: 4px;
      fill: var( --sidebar__action-strip--text-color );
    }

    &__button--drag-target &__button-icon {
      fill: $white-100;
    }

    &__spacer {
      flex: 1;
      height: 32px;
      background-color: var( --sidebar__action-strip--button-background-color );
    }
  }

  /* Tab Groups List */

  .sidebar-tab_groups-list {
    @include slow-transition;
    transition-property: height;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    overflow-y: auto;
    border-top: solid 1px var( --sidebar__separator--color );
    scrollbar-color: var( --sidebar__scrollbar--color ) var( --sidebar__scrollbar--background-color );
    scrollbar-size: thin;

    &__item-container {
      @include slow-transition;
      transition-property: padding-top, padding-bottom, transform;
      flex: 0;

      &--drag-source {
        opacity: $--drag-source--opacity;
      }
    }

    &__item {
      @include slow-transition;
      transition-property: padding-top, padding-bottom, transform;
    }
  }

  /* Tab Groups List Item Header */

  .tab-groups-list-item-header {
    @include slow-transition;
    transition-property: background-color;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 2;
    border-bottom: $light-border-color 1px solid;
    background-color: var( --sidebar--background-color );
    cursor: pointer;

    &__container {
      @include slow-transition;
      position: relative;
      transition-property: background-color;
      flex: 1;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      &--drag-tab-target {
        background-color: $purple-50;
        color: $white-100;
      }
    }

    &--active &__container::before {
      content: '';
      background-color: $light-border-color;
      border-left: 1px solid var( --sidebar--background-color );
      height: 34px;
      min-width: 4px;
      margin-top: -1px;
      margin-bottom: -1px;
    }

    &--drag-tab-target {
      background-color: $purple-50;
      color: $white-100;
    }

    &__main {
      @include slow-transition;
      transition-property: background-color, opacity;
      padding: 8px 4px 8px 6px;
      flex: 1;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      background-color: transparent;
    }

    &__title {
      flex: 1;
      white-space: nowrap;
      text-overflow: clip;
      overflow-x: hidden;
      overflow-y: hidden;
      mask-image: linear-gradient( to right, rgba(0, 0, 0, 1.0), rgba(0, 0, 0, 1.0) calc(100% - 10px), transparent );

      /* Reset the fade out while the field is editing to prevent odd gradient display on long titles (scrollable) */
      &--editing {
        mask-image: none;
      }
    }

    &__title-editable {
      max-height: 16px;
      max-width: 10px;
    }

    &__tabs-count {
      max-height: 16px;
      padding-left: 4px;
      text-align: right;
      flex-grow: 0;
      white-space: nowrap;
      color: var( --sidebar__text--secondary-color );
    }

    &--drag-tab-target &__tabs-count {
      color: $white-100;
    }

    &__icon {
      height: 16px;
      width: 16px;
      fill: var( --sidebar__text--primary-color );
    }

    &__carat-icon {
      @include slow-transition;
      transition-property: transform;
      width: 6px;
      margin: 0 8px 0 4px;
      fill: var( --sidebar__text--primary-color );

      &--open {
        transform: rotate(90deg);
      }
    }

    &__more-button {
      @include slow-transition;
      transition-property: background-color;
      padding: 8px;
      display: flex;
      border: none;
      background-color: transparent;
      cursor: pointer;

      /* Remove the dotted outline inside the button on focus */
      &::-moz-focus-inner {
        border: 0;
      }
    }

    &--drag-tab-target &__carat-icon,
    &--drag-tab-target &__icon {
      fill: $white-100;
    }

    &__search-progress-ink {
      @include slow-transition;
      transition-property: width;
      width: 0;
      height: 2px;
      background-color: $magenta-50;
      position: absolute;
      bottom: -1px;
      left: 0;
    }

    &--active &__search-progress-ink {
      left: 5px;
    }

    /* Separate hover effect for doorhanger */
    &__main:hover,
    &__main:hover + &__more-button,
    &__more-button:hover {
      background-color: var( --sidebar__tab-groups-list-item-header--hover-background-color );
    }
  }

  /* Tabs List */

  .sidebar-tab-group-tabs-list {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    max-height: 80vh;
    overflow-y: auto;
    border-bottom: solid 1px var( --sidebar--border-color );
    padding-top: 1px;
    background-color: var( --sidebar__tab-groups-list--background-color );
    position: relative;

    &__item-container {
      @include slow-transition;
      transition-property: height, padding-top;
      width: 100%;
      flex: 0;
      min-height: 52px;
      background-color: transparent;
      position: relative;

      &--drag-source {
        opacity: $--drag-source--opacity;
      }
    }

    &__item {
      background-color: var( --sidebar__tab-groups-list--background-color );

      &--active {
        background-color: var( --sidebar__tab-groups-list--active-background-color );

        &::before {
          content: '';
          background-color: $blue-50;
          border-left: 1px solid var( --sidebar__tab-groups-list--background-color );
          height: 52px;
          min-width: 4px;
        }
      }
    }

    &__item-close {
      height: 24px;
      padding: 4px;
      margin-right: 4px;
    }

    &__item-close-icon {
      fill: var( --sidebar__text--primary-color );
    }
  }

  /* @todo should clean up this cross-component rule */
  .sidebar-tab_groups-list__item-container--drag-tab-target .list-flex-col__drag-target-ink--is-last {
    top: initial;
    bottom: 0;

    &::before {
      border-bottom: none;
    }
  }

  /* Tab List Item */

  @import "../styles/tab-list-item";

  .sidebar-tab-view-item {
    @extend %slow-transition;
    transition-property: margin-top, margin-left, background-color;
    display: flex;
    align-items: center;
    width: 100%;
    white-space: nowrap;
    text-overflow: clip;
    position: relative;
    padding-left: 4px;
    cursor: pointer;

    &::after {
      content: "";
      height: 32px;
      width: 8px;
      padding: 8px 4px;
      float: right;
      position: absolute;
      right: 0;
      top: 0;
      z-index: -10;
    }
  }

  .sidebar-tab-view-item-icon {
    position: relative;
    min-width: 32px;
    height: 32px;
    margin: 0 4px;

    > .tab-icon {
      position: absolute;
      width: 24px;
      height: 24px;
      margin: 4px;
    }
  }

  .sidebar-tab-view-item-text {
    flex: 1;
    padding-top: 10px;
    padding-bottom: 10px;
    overflow: hidden;
    mask-image: linear-gradient( to right, rgba(0, 0, 0, 1.0), rgba(0, 0, 0, 1.0) calc(100% - 10px), transparent );
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

  .light {
    .sidebar-header-search {
      background-color: $white-100;
      color: $ink-90;
      border: 1px solid #ccc;
    }

    .sidebar-tab-view-item-title {
      color: black;
    }

    .sidebar-tab-view-item-url {
      color: $grey-50;
    }
  }

  @media (prefers-color-scheme: light) {
    .system {
      .sidebar-header-search {
        background-color: $white-100;
        color: $ink-90;
        border: 1px solid #ccc;
      }

      .sidebar-tab-view-item-title {
        color: black;
      }

      .sidebar-tab-view-item-url {
        color: $grey-50;
      }
    }
  }

  .dark {
    .sidebar-tab-view-item-title {
      color: $white-100;
    }

    .sidebar-tab-view-item-url {
      color: $grey-50;
    }
  }

  @media (prefers-color-scheme: dark) {
    .system {
      .sidebar-tab-view-item-title {
        color: $white-100;
      }

      .sidebar-tab-view-item-url {
        color: $grey-50;
      }
    }
  }
</style>
