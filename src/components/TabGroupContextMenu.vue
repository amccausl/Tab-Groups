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
    getTabGroupCopyText,
    onStateChange,
  } from './helpers.mjs'

  import TabSearch from './TabSearch.vue'

  export default {
    name: 'tab-group-context-menu',
    props: [ 'theme', "tab_groups" ],
    data() {
      return {
        is_open: false,
        tab_group: null,
        position: "bottom",
        style: {},
        tab_group_copy_text: null,
      }
    },
    created() {
    },
    computed: {
    },
    methods: {
      /** Launch the context menu */
      openContextMenu( target_element, tab_group ) {
        if( this.is_open && this.tab_group?.id === tab_group.id ) {
          this.is_open = false
          this.tab_group = null
          return
        }
        this.is_open = true
        this.tab_group = tab_group
        console.info('openContextMenu', event, tab_group )
        const box = target_element.getBoundingClientRect()
        if( document.body.clientHeight - box.top > 130 ) {
          // Render below
          this.position = "bottom"
          this.style = {
            top: `${ box.bottom + 5 }px`,
            right: `${ document.body.clientWidth - box.right + 3 }px`,
          }
        } else {
          // Render above
          this.position = "top"
          this.style = {
            bottom: `${ document.body.clientHeight - box.top + 5 }px`,
            right: `${ document.body.clientWidth - box.right + 3 }px`,
          }
        }
        this.tab_group_copy_text = getTabGroupCopyText( tab_group )
      },
      bem,
      archiveTabGroup() {
        console.info( 'archiveTabGroup', this.tab_group.id )
      },
      closeContextMenu( event ) {
        console.info( 'closeContextMenu', event )
        this.is_open = false
        this.tab_group = null
      },
      closeTabGroup() {
        console.info( 'closeTabGroup', this.tab_group.id )
        window.background.closeTabGroup( window.store, window.current_window_id, this.tab_group.id )
        this.closeContextMenu()
      },
      copyContextTabGroupAsText( event ) {
        console.info('copyContextTabGroupAsText', event )
        const textarea_el = event.target.querySelector( 'textarea' )
        textarea_el.select()
        document.execCommand( 'copy' )
        textarea_el.blur()
        this.closeContextMenu()
      },
      muteTabGroup() {
        console.info( 'muteTabGroup', this.tab_group.id )
        window.background.muteTabGroup( window.store, window.current_window_id, this.tab_group_id )
        this.closeContextMenu()
      },
      unmuteTabGroup() {
        console.info( 'unmuteTabGroup', this.tab_group.id )
        window.background.unmuteTabGroup( window.store, window.current_window_id, this.tab_group_id )
        this.closeContextMenu()
      },
      renameTabGroup() {
        console.info( 'renameTabGroup', this.tab_group.id )
        this.$emit( "rename", this.tab_group.id )
        this.closeContextMenu()
      },
    }
  }
</script>

<template>
  <div class="tab-group-context-menu">
    <div v-if="is_open" class="tab-group-context-menu__ctx" @click="closeContextMenu"></div>
    <!-- @todo animate -->
    <div v-if="is_open" :class="bem( `tab-group-context-menu__content`, { position: position } )" :style="style">
      <!-- @todo localize -->
      <!-- @todo icons -->
      <!-- <div class="tab-group-context-menu__item"><span>R</span>eload Tabs</div> -->
      <div class="tab-group-context-menu__item" v-if="!tab_group.muted" @click="muteTabGroup()"><span class="tab-group-context-menu__item-hotkey">M</span>ute Tabs</div>
      <div class="tab-group-context-menu__item" v-else @click="unmuteTabGroup()">Un<span class="tab-group-context-menu__item-hotkey">m</span>ute Tabs</div>
      <!-- @todo separator -->
      <div class="tab-group-context-menu__item" @click="renameTabGroup()">Re<span class="tab-group-context-menu__item-hotkey">n</span>ame</div>
      <div class="tab-group-context-menu__item" @click="copyContextTabGroupAsText( $event )">
        <span class="tab-group-context-menu__item-hotkey">C</span>opy as text
        <textarea name="tab_groupcopy_text" v-model="tab_group_copy_text" style="position: fixed; right: -1000px"></textarea>
      </div>
      <!-- <div class="tab-group-context-menu__item">Move to New <span>W</span>indow</div> -->
      <!-- <div class="tab-group-context-menu__item" @click="archiveTabGroup( tab_group.id )"><span>A</span>rchive</div> -->
      <div v-if="tab_groups.length > 1" class="tab-group-context-menu__item" @click="closeTabGroup()"><span class="tab-group-context-menu__item-hotkey">C</span>lose</div>
      <div v-else class="tab-group-context-menu__item tab-group-context-menu__item--is-disabled"><span class="tab-group-context-menu__item-hotkey">C</span>lose</div>
    </div>
  </div>
</template>

<style lang="scss">
  .tab-group-context-menu {
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
        right: 5px;
        width: 12px;
        height: 12px;
        transform: rotate(45deg);
        box-shadow: 0 4px 16px rgba(12,12,13,.1);
        background-color: $white-100;
        border: solid 1px $grey-90-a20;
        content: "";
      }

      &--position-top {
        &::before {
          bottom: -7px;
          clip-path: polygon(100% 100%, 100% 0, 0 100%);
        }
      }

      &--position-bottom {
        &::before {
          top: -7px;
          clip-path: polygon(0 0, 100% 0, 0 100%);
        }
      }
    }

    &__item {
      @extend %slow-transition;
      transition-property: background-color;
      padding: 4px 8px;

      &--is-disabled {
        opacity: 0.5;
      }

      &:not(#{&}--is-disabled):hover {
        background-color: $grey-20;
        cursor: pointer;
      }

      &-hotkey {
        /* @todo add this once support is added, not MVP
        text-decoration: underline; */
      }
    }
  }
</style>
