<template>
  <body :class="[ `sidebar--${ theme }`, theme ]">
    <div v-if="show_search" :class="[ `action-strip--${ theme }` ]" @click.right.prevent>
      <div :class="[ `action-strip--${ theme }__search` ]">
        <label :class="[ `action-strip--${ theme }__search-label` ]">
          <svg :class="[ `action-strip--${ theme }__search-icon` ]" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path d="M15.707 14.293l-4.822-4.822a6.019 6.019 0 1 0-1.414 1.414l4.822 4.822a1 1 0 0 0 1.414-1.414zM6 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"></path>
          </svg>
          <input :class="[ `action-strip--${ theme }__search-input` ]" type="search" v-model="search_text" @input="onUpdateSearchText" :placeholder="__MSG_tab_search_placeholder__"/>
          <svg :class="[ `action-strip--${ theme }__search-clear-icon` ]" @click="clearSearchText()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M6.586 8l-2.293 2.293a1 1 0 0 0 1.414 1.414L8 9.414l2.293 2.293a1 1 0 0 0 1.414-1.414L9.414 8l2.293-2.293a1 1 0 1 0-1.414-1.414L8 6.586 5.707 4.293a1 1 0 0 0-1.414 1.414L6.586 8zM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0z"></path>
          </svg>
        </label>
      </div>
      <div :class="[ bem( 'button', { 'theme': theme, 'color': 'ghost' } ), `action-strip--${ theme }__button-icon` ]" @click="openOptionsPage()">
        <svg :class="[ `button--color-ghost__icon` ]" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <path d="M15 7h-2.1a4.967 4.967 0 0 0-.732-1.753l1.49-1.49a1 1 0 0 0-1.414-1.414l-1.49 1.49A4.968 4.968 0 0 0 9 3.1V1a1 1 0 0 0-2 0v2.1a4.968 4.968 0 0 0-1.753.732l-1.49-1.49a1 1 0 0 0-1.414 1.415l1.49 1.49A4.967 4.967 0 0 0 3.1 7H1a1 1 0 0 0 0 2h2.1a4.968 4.968 0 0 0 .737 1.763c-.014.013-.032.017-.045.03l-1.45 1.45a1 1 0 1 0 1.414 1.414l1.45-1.45c.013-.013.018-.031.03-.045A4.968 4.968 0 0 0 7 12.9V15a1 1 0 0 0 2 0v-2.1a4.968 4.968 0 0 0 1.753-.732l1.49 1.49a1 1 0 0 0 1.414-1.414l-1.49-1.49A4.967 4.967 0 0 0 12.9 9H15a1 1 0 0 0 0-2zM5 8a3 3 0 1 1 3 3 3 3 0 0 1-3-3z"></path>
        </svg>
      </div>
    </div>
    <div v-else-if="show_header" :class="[ `action-strip--${ theme }` ]" @click.right.prevent>
      <input v-if="is_search_enabled" :class="[ `action-strip--${ theme }__search` ]" type="search" @input="onUpdateSearchText( search_text )" v-model="search_text" :placeholder="__MSG_tab_search_placeholder__"/>
      <div v-else :class="[ `action-strip--${ theme }__spacer` ]"></div>
      <div :class="bem( `action-strip--${ theme }__button`, { 'no-grow': true } )" @click="openOptionsPage()">
        <svg :class="[ `action-strip--${ theme }__button-icon` ]" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <path d="M15 7h-2.1a4.967 4.967 0 0 0-.732-1.753l1.49-1.49a1 1 0 0 0-1.414-1.414l-1.49 1.49A4.968 4.968 0 0 0 9 3.1V1a1 1 0 0 0-2 0v2.1a4.968 4.968 0 0 0-1.753.732l-1.49-1.49a1 1 0 0 0-1.414 1.415l1.49 1.49A4.967 4.967 0 0 0 3.1 7H1a1 1 0 0 0 0 2h2.1a4.968 4.968 0 0 0 .737 1.763c-.014.013-.032.017-.045.03l-1.45 1.45a1 1 0 1 0 1.414 1.414l1.45-1.45c.013-.013.018-.031.03-.045A4.968 4.968 0 0 0 7 12.9V15a1 1 0 0 0 2 0v-2.1a4.968 4.968 0 0 0 1.753-.732l1.49 1.49a1 1 0 0 0 1.414-1.414l-1.49-1.49A4.967 4.967 0 0 0 12.9 9H15a1 1 0 0 0 0-2zM5 8a3 3 0 1 1 3 3 3 3 0 0 1-3-3z"></path>
        </svg>
      </div>
    </div>
    <div v-if="show_pinned_tabs" :class="[ `pinned-tabs-list--${ theme }` ]" @click.right.prevent>
      <div v-for="pinned_tab in pinned_tabs" :key="pinned_tab.id"
          :class="bem( `pinned-tabs-list--${ theme }__item`, { 'active': pinned_tab.active, 'selected': isSelected( pinned_tab ) } )"
          :title="pinned_tab.title"
          @click.ctrl="toggleTabSelection( pinned_tab )"
          @click.exact="openTab( pinned_tab.id )"
          @click.middle="closeTab( pinned_tab )"
      >
        <span :class="[ `pinned-tabs-list--${ theme }__ink` ]"></span>
        <div :class="[ `pinned-tabs-list--${ theme }__tab` ]">
          <tab-icon :theme="theme" :tab="pinned_tab" size="16"></tab-icon>
          <!-- @todo fade styling for pinned tabs if search -->
          <!-- https://design.firefox.com/favicon.ico -->
          <div v-if="pinned_tab.context_id" :class="[ `pinned-tabs-list--${ theme }__tab-context` ]" :style="context_styles[ pinned_tab.context_id ]"></div>
        </div>
        <!-- Add a span to fix centering for tab content -->
      </div>
    </div>
    <!-- <transition-group :class="[ `sidebar-tab_groups-list--${ theme }` ]" tag="div" :name="`sidebar-tab_groups-list--${ theme }__item--transition`" @click.right.prevent> -->
    <div :class="[ `sidebar-tab_groups-list--${ theme }` ]" @click.right.prevent>
      <div :class="bem( `sidebar-tab_groups-list--${ theme }__item-container`, { 'drag-source': isTabGroupDragSource( tab_group ), [`drag-${ drag_state.source.type }-target`]: ! isTabGroupDragSource( tab_group ) && isTabGroupDragTarget( tab_group ) } )"
          v-for="(tab_group, tab_group_index) in tab_groups" :key="tab_group.id"
      >
        <div :class="[ `sidebar-tab_groups-list--${ theme }__item` ]">
          <div :class="bem( `tab-groups-list-item-header--${ theme }`, { 'active': active_tab_group_id === tab_group.id, 'open': show_tabs && tab_group.open, 'drag-source': isTabGroupDragSource( tab_group ), [`drag-${ drag_state.source.type }-target`]: ! isTabGroupDragSource( tab_group ) && isTabGroupDragTarget( tab_group ) } )"
              @dragenter="onTabGroupDragEnter( $event, tab_group, tab_group_index + 1 )"
              @dragover.prevent
              @dragleave="onTabGroupDragLeave( $event, tab_group, tab_group_index + 1 )"
              @drop="onTabGroupDrop( $event, tab_group, tab_group_index + 1 )"
              @click="onTabGroupClick( tab_group )"
              draggable="true"
              @dragstart="onTabGroupDragStart( $event, tab_group )"
              @dragend="onTabGroupDragEnd( $event, tab_group )"
          >
            <div :class="[ `tab-groups-list-item-header--${ theme }__container` ]">
              <div :class="[ `tab-groups-list-item-header--${ theme }__drag-target-ink` ]"></div>
              <div :class="[ `tab-groups-list-item-header--${ theme }__main` ]">
                <svg v-if="show_tabs" :class="bem( `tab-groups-list-item-header--${ theme }__carat-icon`, { 'open': tab_group.open } )" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
                  <path d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"></path>
                </svg>
                <div :class="bem( `tab-groups-list-item-header--${ theme }__title`, { 'editing': rename_tab_group_id === tab_group.id } )">
                  <editable :class="[ `tab-groups-list-item-header--${ theme }__title-editable` ]" v-model="tab_group.title" @input="onTabGroupTitleInput( $event, tab_group )" :active="rename_tab_group_id === tab_group.id"></editable>
                </div>

                <svg v-if="tab_group.muted" :class="bem( `tab-groups-list-item-header--${ theme }__icon`, { 'audio-mute': true } )" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                  <g :fill="context_fill">
                    <path d="M13 8a2.813 2.813 0 0 0-.465-1.535l-.744.744A1.785 1.785 0 0 1 12 8a2.008 2.008 0 0 1-1.4 1.848.5.5 0 0 0 .343.939A3 3 0 0 0 13 8z"></path>
                    <path d="M13.273 5.727A3.934 3.934 0 0 1 14 8a3.984 3.984 0 0 1-2.742 3.775.5.5 0 0 0 .316.949A4.985 4.985 0 0 0 15 8a4.93 4.93 0 0 0-1.012-2.988zm-4.603 7.99a.2.2 0 0 0 .33-.152V10l-2.154 2.154zm6.037-12.424a1 1 0 0 0-1.414 0L9 5.586V2.544a.25.25 0 0 0-.413-.19L5.5 5H4.191A2.191 2.191 0 0 0 2 7.191v1.618a2.186 2.186 0 0 0 1.659 2.118l-2.366 2.366a1 1 0 1 0 1.414 1.414l12-12a1 1 0 0 0 0-1.414z"></path>
                  </g>
                </svg>
                <svg v-else-if="tab_group.audible" :class="bem( `tab-groups-list-item-header--${ theme }__icon`, { 'audio': true } )" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                  <g :fill="context_fill">
                    <path d="M8.587 2.354L5.5 5H4.191A2.191 2.191 0 0 0 2 7.191v1.618A2.191 2.191 0 0 0 4.191 11H5.5l3.17 2.717a.2.2 0 0 0 .33-.152V2.544a.25.25 0 0 0-.413-.19zm2.988.921a.5.5 0 0 0-.316.949 3.97 3.97 0 0 1 0 7.551.5.5 0 0 0 .316.949 4.971 4.971 0 0 0 0-9.449z"></path>
                    <path d="M13 8a3 3 0 0 0-2.056-2.787.5.5 0 1 0-.343.939A2.008 2.008 0 0 1 12 8a2.008 2.008 0 0 1-1.4 1.848.5.5 0 0 0 .343.939A3 3 0 0 0 13 8z"></path>
                  </g>
                </svg>

                <span v-if="show_tabs_count" :class="[ `tab-groups-list-item-header--${ theme }__tabs-count` ]">{{ getCountMessage( 'tabs', tab_group.tabs_count ) }}</span>
              </div>
              <button :class="[ `tab-groups-list-item-header--${ theme }__more-button` ]" @click.stop="openTabGroupMore( $event, tab_group )">
                <svg :class="[ `tab-groups-list-item-header--${ theme }__icon` ]" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                  <path d="M2 6a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm6 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm6 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"></path>
                </svg>
              </button>
            </div>
          </div>
          <!-- <transition-group v-if="tab_group.open && show_tabs && ! isTabGroupDragSource( tab_group )" :class="[ `sidebar-tab-group-tabs-list--${ theme }` ]" tag="div" :name="`sidebar-tab-group-tabs-list--${ theme }__item--transition`"> -->
          <div v-if="tab_group.open && show_tabs && tab_group.tabs.length" :class="[ `sidebar-tab-group-tabs-list--${ theme }` ]">
            <div :class="bem( `sidebar-tab-group-tabs-list--${ theme }__item-container`, { 'drag-target':  ! isSelected( tab ) && drag_state.target.tab_id === tab.id, 'drag-source': isSelected( tab ) && is_dragging } )"
                v-for="tab in tab_group.tabs" :key="tab.id" :tab="tab"
                :title="tab.title"
                @click.ctrl="toggleTabSelection( tab )" @click.exact="openTab( tab.id )" @click.middle="closeTab( tab )"
                @dragenter="onTabDragEnter( $event, tab_group, tab )"
                @dragover.prevent
                @dragleave="onTabDragLeave( $event, tab_group, tab )"
                @drop="onTabDrop( $event, tab_group, tab )"
                draggable="true"
                @dragstart="onTabDragStart( $event, tab )"
                @dragend="onTabDragEnd( $event )"
            >
              <div :class="[ `sidebar-tab-group-tabs-list--${ theme }__drag-target-ink` ]"></div>
              <div class="sidebar-tab-view-item"
                  :class="bem( `sidebar-tab-group-tabs-list--${ theme }__item`, { 'active': tab.active } )"
              >
                <div class="sidebar-tab-view-item-icon"
                    :class="[ `sidebar-tab-group-tabs-list--${ theme }__item-icon` ]"
                >
                  <div class="sidebar-tab-view-item-icon-background"
                      :class="[ `sidebar-tab-group-tabs-list--${ theme }__item-icon-background` ]"
                      v-if="show_tab_icon_background && tab.status !== 'loading'"
                  ></div>
                  <tab-icon :theme="theme" :tab="tab" size="24"></tab-icon>
                </div>
                <div class="sidebar-tab-view-item-text">
                  <span class="sidebar-tab-view-item-title">{{ tab.title }}</span>
                  <br>
                  <span class="sidebar-tab-view-item-url">{{ tab.url | url }}</span>
                </div>
                <div :class="[ `sidebar-tab-group-tabs-list--${ theme }__item-close` ]" @click.stop="closeTab( tab )">
                  <svg :class="[ `sidebar-tab-group-tabs-list--${ theme }__item-close-icon` ]" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M9.061 8l3.47-3.47a.75.75 0 0 0-1.061-1.06L8 6.939 4.53 3.47a.75.75 0 1 0-1.06 1.06L6.939 8 3.47 11.47a.75.75 0 1 0 1.06 1.06L8 9.061l3.47 3.47a.75.75 0 0 0 1.06-1.061z"></path>
                  </svg>
                </div>
                <div v-if="show_tab_context && tab.context_id" class="sidebar-tab-view-item-context" :style="context_styles[ tab.context_id ]"></div>
              </div>
            </div>
            <div :class="[ `sidebar-tab-group-tabs-list--${ theme }__drag-target-ink--is-last` ]"></div>
          </div>
          <!-- </transition-group> -->
        </div>
      </div>
    </div>
    <!-- </transition-group> -->
    <div :class="bem( `empty-dropzone--${ theme }`, { [`drag-${ drag_state.source.type }-target`]: drag_state.target.tab_group_new } )"
        @click.right.prevent
        @dragenter="onTabGroupDragEnter( $event, null, null, 'dropzone' )"
        @dragover.prevent
        @dragleave="onTabGroupDragLeave"
        @dragend="onTabDragEnd"
        @drop="onTabGroupDrop"
    >
      <div :class="[ `empty-dropzone--${ theme }__drag-target-ink` ]"></div>
      <svg v-if="drag_state.target.tab_group_new && drag_state.source.type === 'tab'" :class="[ `empty-dropzone--${ theme }__drag-target-icon` ]" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
        <path d="M14 7H9V2a1 1 0 0 0-2 0v5H2a1 1 0 1 0 0 2h5v5a1 1 0 0 0 2 0V9h5a1 1 0 0 0 0-2z"></path>
      </svg>
    </div>
    <div :class="[ `action-strip--${ theme }` ]">
      <div :class="bem( `action-strip--${ theme }__button`, { 'drag-target': drag_state.target.tab_group_new && drag_state.source.type !== 'tab_group' } )"
          @click.left="createTabGroup()"
          @click.right.prevent
          @dragenter="onTabGroupDragEnter"
          @dragover.prevent
          @dragleave="onTabGroupDragLeave"
          @drop="onTabGroupDrop"
          @dragend="onTabDragEnd"
      >
        <svg :class="[ `action-strip--${ theme }__button-icon` ]" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <path d="M14 7H9V2a1 1 0 0 0-2 0v5H2a1 1 0 1 0 0 2h5v5a1 1 0 0 0 2 0V9h5a1 1 0 0 0 0-2z"></path>
        </svg>
        <span :class="[ `action-strip--${ theme }__button-text` ]">{{ __MSG_tab_group_new__ }}</span>
      </div>
    </div>
    <div v-if="tab_group_context_menu.open" class="context-menu__ctx" @click="closeTabGroupMore" @click.right="closeTabGroupMore"></div>
    <!-- @todo animate -->
    <div v-if="tab_group_context_menu.open" class="context-menu__content" :style="{ top: tab_group_context_menu.y + 'px', right: tab_group_context_menu.x + 'px' }">
      <!-- @todo localize -->
      <!-- @todo icons -->
      <!-- <div class="context-menu__item"><span>R</span>eload Tabs</div> -->
      <div class="context-menu__item" v-if="!isGroupMuted( tab_group_context_menu.tab_group_id )" @click="muteTabGroup( tab_group_context_menu.tab_group_id )"><span class="context-menu__item-hotkey">M</span>ute Tabs</div>
      <div class="context-menu__item" v-else @click="unmuteTabGroup( tab_group_context_menu.tab_group_id )">Un<span class="context-menu__item-hotkey">m</span>ute Tabs</div>
      <!-- @todo separator -->
      <div class="context-menu__item" @click="renameTabGroup( tab_group_context_menu.tab_group_id )">Re<span class="context-menu__item-hotkey">n</span>ame</div>
      <div class="context-menu__item" @click="copyContextTabGroupAsText( $event, tab_group_context_menu.tab_group_id )">
        <span class="context-menu__item-hotkey">C</span>opy as text
        <textarea name="tab_groupcopy_text" v-model="tab_group_context_menu.tab_group_copy_text" style="position: fixed; right: -1000px"></textarea>
      </div>
      <!-- <div class="context-menu__item">Move to New <span>W</span>indow</div> -->
      <!-- <div class="context-menu__item" @click="archiveTabGroup( tab_group_context_menu.tab_group_id )"><span>A</span>rchive</div> -->
      <div v-if="tab_groups.length > 1" class="context-menu__item" @click="closeTabGroup( tab_group_context_menu.tab_group_id )"><span class="context-menu__item-hotkey">C</span>lose</div>
      <div v-else class="context-menu__item context-menu__item--is-disabled"><span class="context-menu__item-hotkey">C</span>lose</div>
    </div>
  </body>
</template>

<script>
import Vue from 'vue'

import {
  updateGroupAction,
} from '../store/actions.mjs'
import {
  cloneTabGroup,
  cloneTab,
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
} from './draggable.mjs'
import {
  bem,
  debounce,
  getCountMessage,
  getFriendlyUrlText,
  getTabGroupCopyText,
  onStateChange,
} from './helpers.mjs'
import {
  INK_90,
} from './photon-colors'

import Editable from './Editable.vue'
import TabIcon from './TabIcon.vue'

export default {
  name: 'sidebar',
  components: {
    Editable,
    TabIcon,
  },
  data() {
    return {
      tab_group_context_menu: {
        open: false,
        x: 0,
        y: 0,
        tab_group_id: null
      },
      window_id: window.current_window_id,
      active_tab_group_id: null,
      context_styles: {},
      is_dragging: false,
      is_tab_group_open: {},
      rename_tab_group_id: null,
      search_text: '',
      search_resolved: true,
      selected_tab_ids: [],
      show_header: true,
      show_tabs: true,
      show_tabs_count: true,
      show_pinned_tabs: true,
      show_tab_context: true,
      show_tab_icon_background: true,
      show_search: true,
      pinned_tabs: [],
      tab_groups: [],
      drag_state: {
        source: {},
        target: {},
      },
      theme: null
    }
  },
  created() {
    onStateChange( state => {
      this.theme = ( state.config.theme === 'dark' ? 'dark' : 'light' )
      this.show_header = state.config.show_header
      this.show_tabs_count = state.config.show_tabs_count
      this.show_tabs = state.config.show_tabs
      this.show_pinned_tabs = false && this.show_tabs && state.config.show_pinned_tabs
      this.show_tab_context = this.show_tabs && state.config.show_tab_context
      this.show_tab_icon_background = this.show_tabs && state.config.show_tab_icon_background
      this.show_search = this.show_tabs && state.config.show_search

      for( let context_id in state.contexts || {} ) {
        this.context_styles[ context_id ] = {
          'background-color': state.contexts[ context_id ].color
        }
      }

      const state_window = state.windows.find( window => window.id === this.window_id )
      if( state_window ) {
        // @todo if active_tab_group_id has changed, open the new active group
        this.active_tab_group_id = state_window.active_tab_group_id

        // @todo only update if this doesn't have focus
        // this.search_text = state_window.search_text
        this.search_resolved = state_window.search_resolved

        // @todo this could be done more efficiently
        const new_selected_tab_ids = []

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
          tab_group.tabs.forEach( tab => {
            if( this.selected_tab_ids.includes( tab.id ) ) {
              new_selected_tab_ids.push( tab.id )
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
        Object.getPrototypeOf( this.selected_tab_ids ).splice.apply( this.selected_tab_ids, [ 0, this.selected_tab_ids.length, ...new_selected_tab_ids ] )
        Object.getPrototypeOf( this.pinned_tabs ).splice.apply( this.pinned_tabs, [ 0, this.pinned_tabs.length, ...tab_groups[ 0 ].tabs ] )
        Object.getPrototypeOf( this.tab_groups ).splice.apply( this.tab_groups, [ 0, this.tab_groups.length, ...tab_groups.slice( 1 ) ] )
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
    bem,
    getCountMessage,
    createTabGroup() {
      // Create new group with default properties in the store
      window.background.createGroup( window.store, this.window_id )
        .then( tab_group => {
          console.info('created group', tab_group)
          Vue.nextTick( () => {
            this.renameTabGroup( tab_group.id )
          })
        })
    },
    openTabGroupMore( event, tab_group ) {
      console.info('openTabGroupMore', event, tab_group )
      this.tab_group_context_menu.open = true
      const box = event.target.getBoundingClientRect()
      this.tab_group_context_menu.x = document.body.clientWidth - box.right + 3
      this.tab_group_context_menu.y = box.bottom + 5
      this.tab_group_context_menu.tab_group_id = tab_group.id
      this.tab_group_context_menu.tab_group_copy_text = getTabGroupCopyText( tab_group )
    },
    closeTabGroupMore( event ) {
      console.info('closeTabGroupMore', event )
      this.tab_group_context_menu.open = false
      this.tab_group_context_menu.tab_group_id = null
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
    archiveTabGroup( tab_group_id ) {
      console.info('archiveTabGroup', tab_group_id)
    },
    closeTabGroup( tab_group_id ) {
      console.info('closeTabGroup', tab_group_id)
      window.background.closeTabGroup( window.store, this.window_id, tab_group_id )
      this.tab_group_context_menu.open = false
    },
    muteTabGroup( tab_group_id ) {
      window.background.muteTabGroup( window.store, this.window_id, tab_group_id )
      this.tab_group_context_menu.open = false
    },
    unmuteTabGroup( tab_group_id ) {
      window.background.unmuteTabGroup( window.store, this.window_id, tab_group_id )
      this.tab_group_context_menu.open = false
    },
    renameTabGroup( tab_group_id ) {
      console.info('renameTabGroup', tab_group_id)
      this.rename_tab_group_id = tab_group_id
      this.tab_group_context_menu.open = false
    },
    copyContextTabGroupAsText( event ) {
      console.info('copyContextTabGroupAsText', event)
      const textarea_el = event.target.querySelector( 'textarea' )
      textarea_el.select()
      document.execCommand( 'copy' )
      textarea_el.blur()
      this.tab_group_context_menu.open = false
    },
    isSelected( tab ) {
      return this.selected_tab_ids.includes( tab.id )
    },
    isGroupMuted( tab_group_id ) {
      const tab_group = this.tab_groups.find( tab_group => tab_group.id === tab_group_id )
      return tab_group.muted
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
    onTabGroupTitleInput( title, tab_group ) {
      console.info('onTabGroupTitleInput', title, tab_group)
      // Update interferes with the editable div if it happens too quickly
      this.rename_tab_group_id = null
      // @todo skip if empty, reset
      // @todo should be moved to background
      window.store.dispatch( updateGroupAction( tab_group.id, this.window_id, { title } ) )
    },
    onUpdateSearchText: debounce( function() {
      console.info('runSearch', this.search_text)
      window.background.runTabSearch( window.store, this.window_id, this.search_text )
    }, 250 ),
    clearSearchText() {
      console.info('clearSearchText', this.search_text)
      this.search_text = ""
      window.background.runTabSearch( window.store, this.window_id, this.search_text )
    },
    openOptionsPage() {
      window.background.openOptionsPage()
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
@import "../styles/photon-colors";
@import "../styles/photon-typography";

$photon-border-radius: 2px;
$--drag-source--opacity: 0.3;

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

$--theme-light: (
  __primary-text--color: $grey-90,
  __secondary-text--color: $grey-50,
  --border-color: #e0e0e1,
  --drag-target--background-color: $purple-50,
  --drag-target--color: $white-100,
  --drag-target--ink-color: $purple-50,
);

$--theme-dark: (
  __primary-text--color: $white-100,
  __secondary-text--color: $grey-10,
  --border-color: #e0e0e1,
  --drag-target--background-color: $purple-50,
  --drag-target--color: $white-100,
  --drag-target--ink-color: $purple-50,
);

// =============================================================================
// Helpers
// =============================================================================

%slow-transition {
  transition-duration: 250ms;
  transition-timing-function: cubic-bezier(.07,.95,0,1);
}

@mixin drag-target-index( $ink--color ) {
  position: absolute;
  top: -1px;
  height: 2px;
  width: 100%;
  background-color: $ink--color;
  z-index: 10;

  &::before {
    content: "";
    width: 0px;
    height: 0px;
    border-radius: 50%;
    border: 5px solid $ink--color;
    position: absolute;
    top: -4px;
    left: -6px;
  }
}

// =============================================================================
// Sidebar
// =============================================================================

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

@each $theme, $colors in $sidebar__themes {
  .sidebar--#{$theme} {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    color: map-get( $colors, --color );
  }
}

// =============================================================================
// Empty Dropzone
// =============================================================================

$empty-dropzone__themes: (
  light: (
    --background-color: $white-100,
    --drag-target--background-color: map-get( $--theme-light, --drag-target--background-color ),
    --drag-target--color: $white-100,
    --drag-target--ink-color: map-get( $--theme-light, --drag-target--ink-color ),
  ),
  dark: (
    --background-color: black,
    --drag-target--background-color: map-get( $--theme-dark, --drag-target--background-color ),
    --drag-target--color: #d0d0d0,
    --drag-target--ink-color: map-get( $--theme-dark, --drag-target--ink-color ),
  )
);

@each $theme, $colors in $empty-dropzone__themes {
  .empty-dropzone--#{$theme} {
    @extend %slow-transition;
    transition-property: background-color, margin-top;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    background-color: map-get( $colors, --background-color );
    position: relative;

    &__drag-target-icon {
      @extend %slow-transition;
      transition-property: fill, opacity;
      position: absolute;
    }

    &--drag-tab-target {
      background-color: map-get( $colors, --drag-target--background-color );
      fill: map-get( $colors, --drag-target--color );
    }

    &--drag-tab_group-target &__drag-target-ink {
      @include drag-target-index( map-get( $colors, --drag-target--ink-color ) );
    }
  }
}

// =============================================================================
// Action Strip
// =============================================================================

$action-strip__themes: (
  light: (
    --background-color: #f5f6f7,
    __button--background-color: #f5f6f7,
    __button--hover--background-color: #d0d0d0,
    __button--drag-target--background-color: map-get( $--theme-light, --drag-target--background-color ),
    __search--background-color: $white-100,
    __search--color: $grey-90,
    __search--border-color: #ccc,
    __separator--color: #cccccc,
    __text--color: $grey-90-a80,
  ),
  dark: (
    --background-color: #323234,
    __button--background-color: #323234,
    __button--hover--background-color: #5b5b5d,
    __button--drag-target--background-color: map-get( $--theme-dark, --drag-target--background-color ),
    __search--background-color: $dark-awesome-bar-background,
    __search--color: $white-100,
    __search--border-color: $dark-awesome-bar-background,
    __separator--color: $grey-90-a80,
    __text--color: #d0d0d0,
  )
);

@each $theme, $colors in $action-strip__themes {
  .action-strip--#{$theme} {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: map-get( $colors, --background-color );

    &__button {
      @extend %slow-transition;
      transition-property: background-color;
      flex: 1;
      display: flex;
      align-items: center;
      padding: 0 8px;
      height: 32px;
      cursor: pointer;

      &--no-grow {
        flex: 0;
      }

      &--drag-target {
        background-color: map-get( $colors, __button--drag-target--background-color );
      }

      &:hover {
        background-color: map-get( $colors, __button--hover--background-color );
      }
    }

    &__button-text {
      padding-left: 4px;
      color: map-get( $colors, __text--color );
    }

    &__button--drag-target &__button-text {
      color: $white-100;
    }

    &__button-icon {
      margin: 4px;
      fill: map-get( $colors, __text--color );
    }

    &__button--drag-target &__button-icon {
      fill: $white-100;
    }

    &__search {
      flex: 1;
      padding: 4px 0 4px 4px;
    }

    &__search-label {
      position: relative;
    }

    &__search-input {
      @extend %text-body-10;
      width: 100%;
      height: 30px;
      padding-left: 28px;
      background-color: map-get( $colors, __search--background-color );
      border: 1px solid $grey-90-a30;
      border-radius: 4px;
      color: map-get( $colors, __search--color );

      &::-moz-placeholder {
        @extend %text-body-10;
        color: map-get( $colors, __search-icon--color );
      }
    }

    &__search-label:hover &__search-input {
      border-color: $grey-90-a50;
    }

    &__search-icon {
      opacity: 0.4;
      height: 16px;
      width: 16px;
      fill: map-get( $colors, __search--color );
      position: absolute;
      left: 8px;
      top: 0;
    }

    &__search-clear-icon {
      @extend %slow-transition;
      transition-property: opacity;
      opacity: 0.4;
      height: 16px;
      width: 16px;
      fill: map-get( $colors, __search--color );
      position: absolute;
      right: 8px;
      top: 0;
      cursor: pointer;
    }

    &__search-input:placeholder-shown + &__search-clear-icon {
      display: none;
      opacity: 0;
    }

    &__spacer {
      flex: 1;
      height: 32px;
      background-color: map-get( $colors, __button--background-color );
    }
  }
}

// =============================================================================
// Pinned Tabs List
// =============================================================================

$pinned-tabs-list__item--width: 40px;

// @todo use photon colors
$pinned-tabs-list__themes: (
  light: (
    __item--background-color: #e3e4e6,
    __item--active--background-color: #f5f6f7,
    __ink--color: #a5a6a7,
    __ink--hover--color: #cccdcf,
    __ink--active--color: $blue-50,
  ),
  dark: (
    __item--background-color: #0c0c0d,
    __item--active--background-color: #323234,
    __ink--color: #545455,
    __ink--hover--color: #252526,
    __ink--active--color: $blue-50,
  )
);

// @todo may be tab-list--pinned or plural tabs

@each $theme, $colors in $pinned-tabs-list__themes {
  .pinned-tabs-list--#{$theme} {
    display: grid;
    grid-template-columns: repeat(auto-fill, $pinned-tabs-list__item--width);
    grid-auto-columns: min-content;
    grid-auto-rows: max-content;
    background-color: map-get( $colors, __item--background-color );

    &__item {
      margin-left: -1px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      border-right: solid 1px transparent;
      border-left: solid 1px transparent;
      border-top: solid 1px transparent;

      &:not(#{&}--active):hover {
        cursor: pointer;
        border-right-color: map-get( $colors, __ink--color );
        border-left-color: map-get( $colors, __ink--color );
        background-color: map-get( $colors, __ink--hover--color );
      }

      &--active {
        border-top-color: map-get( $colors, __item--background-color );
        border-right-color: map-get( $colors, __ink--color );
        border-left-color: map-get( $colors, __ink--color );
        background-color: map-get( $colors, __item--active--background-color );
      }
    }

    &__ink {
      min-width: 1px;
      height: 24px;
      margin-left: -1px;
      background-color: map-get( $colors, __ink--color );
    }

    &__tab {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      width: $pinned-tabs-list__item--width;
      padding: 6px 0;
      border-top: solid 2px transparent;
      border-top-color: map-get( $colors, __item--background-color );
    }

    &__item--active &__tab {
      z-index: 5;
      border-top-color: map-get( $colors, __ink--active--color );
    }

    &__item:not(#{&}__item--active):hover &__tab {
      z-index: 10;
      border-top-color: map-get( $colors, __ink--color );
    }
  }
}

// =============================================================================
// Tab Groups List
// =============================================================================

$sidebar-tab_groups-list__themes: (
  light: (
    separator--color: #e0e0e1,
    --drag-target--ink-color: map-get( $--theme-light, --drag-target--ink-color ),
  ),
  dark: (
    separator--color: #545455,
    --drag-target--ink-color: map-get( $--theme-dark, --drag-target--ink-color ),
  )
);

@each $theme, $colors in $sidebar-tab_groups-list__themes {
  .sidebar-tab_groups-list--#{$theme} {
    @extend %slow-transition;
    transition-property: height;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    overflow-y: auto;
    border-top: solid 1px map-get( $colors, separator--color );

    &__item-container {
      @extend %slow-transition;
      transition-property: padding-top, padding-bottom, transform;
      flex: 0;

      &--transition-enter {
        // max-height: 0;
        transform: translate3d(0,-100%,0);
        opacity: 0;
        z-index: -1000;
      }

      &--transition-enter-to {
        transform: none;
        opacity: 1;
        z-index: 0;
      }

      &--transition-leave {
        opacity: 1;
      }

      &--transition-leave-to {
        max-height: 0;
        opacity: 0;
      }

      // &--drag-tab_group-target {
      //   padding-top: 32px;
      // }

      &--drag-tab-target {
        // padding-bottom: 54px;
      }

      &--drag-source {
        opacity: $--drag-source--opacity;
        // transform: translate3d(0,-100%,0);

        // Adjusting the height on the last child with transition, causes the sidebar to scroll
        // &:not(:last-child) {
        //   max-height: 0;
        // }
      }
    }

    &__drag-target-ink {
      @include drag-target-index( map-get( $colors, --drag-target--ink-color ) );
    }

    &__item {
      @extend %slow-transition;
      transition-property: padding-top, padding-bottom, transform;

      &--active {
      }
    }
  }
}

// =============================================================================
// Tab Groups List Item Header
// =============================================================================

$tab-groups-list-item-header__themes: (
  light: (
    --background-color: $white-100,
    --drag-target--background-color: map-get( $--theme-light, --drag-target--background-color ),
    --drag-target--ink-color: map-get( $--theme-light, --drag-target--ink-color ),
    --hover--background-color: $light-header-hover-background,
    primary-text--color: $grey-90,
    secodary-text--color: $grey-50,
  ),
  dark: (
    --background-color: black,
    --drag-target--background-color: map-get( $--theme-dark, --drag-target--background-color ),
    --drag-target--ink-color: map-get( $--theme-dark, --drag-target--ink-color ),
    --hover--background-color: #5b5b5d,
    primary-text--color: $white-100,
    secodary-text--color: $grey-10,
  )
);

@each $theme, $colors in $tab-groups-list-item-header__themes {
  .tab-groups-list-item-header--#{$theme} {
    @extend %slow-transition;
    transition-property: background-color;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 1;
    border-bottom: $light-border-color 1px solid;
    background-color: map-get( $colors, --background-color );
    cursor: pointer;

    &__container {
      @extend %slow-transition;
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
      border-left: 1px solid map-get( $colors, --background-color );
      height: 34px;
      min-width: 4px;
      margin-top: -1px;
      margin-bottom: -1px;
    }

    &--active:not(#{&}--open) &__container::before {
      background-color: $blue-50;
    }

    &--drag-tab_group-target &__drag-target-ink {
      @include drag-target-index( map-get( $colors, --drag-target--ink-color ) );
    }

    &--drag-tab-target {
      background-color: $purple-50;
      color: $white-100;
    }

    &__main {
      @extend %slow-transition;
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
      mask-image: linear-gradient( to right, rgba(0, 0, 0, 1.0), rgba(0, 0, 0, 1.0) calc(100% - 10px), transparent );

      // Reset the fade out while the field is editing to prevent odd gradient display on long titles (scrollable)
      &--editing {
        mask-image: none;
      }
    }

    &__title-editable {
      max-height: 16px;
      max-width: 10px;
    }

    &__tabs-count {
      padding-left: 4px;
      text-align: right;
      flex-grow: 0;
      white-space: nowrap;
      color: map-get( $colors, secodary-text--color );
    }

    &--drag-tab-target &__tabs-count {
      color: $white-100;
    }

    &__icon {
      height: 16px;
      width: 16px;
      fill: map-get( $colors, primary-text--color );
    }

    &__carat-icon {
      @extend %slow-transition;
      transition-property: transform;
      width: 6px;
      margin: 0 8px 0 4px;
      fill: map-get( $colors, primary-text--color );

      &--open {
        transform: rotate(90deg);
      }
    }

    &__more-button {
      @extend %slow-transition;
      transition-property: background-color;
      padding: 8px;
      display: flex;
      border: none;
      background-color: transparent;
      cursor: pointer;

      // Remove the dotted outline inside the button on focus
      &::-moz-focus-inner {
        border: 0;
      }
    }

    &--drag-tab-target &__carat-icon,
    &--drag-tab-target &__icon {
      fill: $white-100;
    }

    // Separate hover effect for doorhanger
    &__main:hover,
    &__main:hover + &__more-button,
    &__more-button:hover {
      background-color: map-get( $colors, --hover--background-color );
    }
  }
}

// =============================================================================
// Tabs List
// =============================================================================

// @todo clean up

$sidebar-tab-group-tabs-list__themes: (
  light: (
    --color: $grey-90,
    --background-color: $white-100,
    --active--background-color: $light-header-active-background,
    --drag-target--background-color: $white-100,
    --drag-target--ink-color: map-get( $--theme-light, --drag-target--ink-color ),
    --hover--background-color: $light-header-hover-background,
    --border-color: map-get( $--theme-light, --border-color ),
  ),
  dark: (
    --color: $white-100,
    --background-color: $dark-header-background,
    --active--background-color: $dark-header-active-background,
    --drag-target--background-color: $dark-header-active-background,
    --drag-target--ink-color: map-get( $--theme-dark, --drag-target--ink-color ),
    --hover--background-color: $dark-header-hover-background,
    --border-color: map-get( $--theme-dark, --border-color ),
  )
);

@each $theme, $colors in $sidebar-tab-group-tabs-list__themes {
  .sidebar-tab-group-tabs-list--#{$theme} {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    max-height: 80vh;
    overflow-y: auto;
    border-bottom: solid 1px map-get( $colors, --border-color );
    padding-top: 1px;
    background-color: map-get( $colors, --background-color );
    position: relative;

    &__item-container {
      @extend %slow-transition;
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

    &__item-container--drag-target &__drag-target-ink {
      @include drag-target-index( map-get( $colors, --drag-target--ink-color ) );
    }

    &__item {
      background-color: map-get( $colors, --background-color );

      &--active {
        background-color: map-get( $colors, --active--background-color );

        &::before {
          content: '';
          background-color: $blue-50;
          border-left: 1px solid map-get( $colors, --background-color );
          height: 52px;
          min-width: 4px;
        }
      }

      &:not(#{&}--active):hover {
        background-color: map-get( $colors, --hover--background-color );
      }
    }

    &__item-close {
      height: 24px;
      padding: 4px;
      margin-right: 4px;
    }

    &__item-close-icon {
      fill: map-get( $colors, --color );
    }

    // @todo should clean up this cross-component rule
    .sidebar-tab_groups-list--#{$theme}__item-container--drag-tab-target &__drag-target-ink--is-last {
      @include drag-target-index( map-get( $colors, --drag-target--ink-color ) );
      top: initial;
      bottom: 0;

      &::before {
        border-bottom: none;
      }
    }
  }
}

// =============================================================================
// Context Menu
// =============================================================================

.context-menu {
  &__ctx {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }

  &__content {
    z-index: 2;
    position: absolute;
    padding: 2px 0;
    background-color: $white-100;
    border: solid 1px $grey-90-a20;
    border-radius: 2px;
    box-shadow: 0 4px 16px rgba(12,12,13,.1);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    color: $grey-90;

    &::before {
      position: absolute;
      top: -7px;
      right: 5px;
      width: 12px;
      height: 12px;
      transform: rotate(45deg);
      clip-path: polygon(0% 0, 100% 0, 0 100%);
      box-shadow: 0 4px 16px rgba(12,12,13,.1);
      background-color: $white-100;
      border: solid 1px $grey-90-a20;
      content: "";
    }
  }

  &__item {
    @extend %slow-transition;
    transition-property: background-color;
    padding: 4px 8px;

    &--is-disabled {
      // @todo
    }

    &:hover {
      background-color: $grey-20;
      cursor: pointer;
    }

    &-hotkey {
      // @todo add this once support is added, not MVP
      // text-decoration: underline;
    }
  }
}

// =============================================================================
// Tab List Item
// =============================================================================

.sidebar-tab-view-item {
  @extend %slow-transition;
  transition-property: margin-top, margin-left, background-color;
  display: flex;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  text-overflow: clip;
  position: relative;
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

  > .sidebar-tab-view-item-icon-background {
    position: absolute;
    padding: 16px;
    border-radius: 16px;
  }

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

.dark {
  .sidebar-tab-view-item-icon > .sidebar-tab-view-item-icon-background {
    background-color: $grey-50;
  }

  .sidebar-tab-view-item-title {
    color: $white-100;
  }

  .sidebar-tab-view-item-url {
    color: $grey-50;
  }
}
</style>
