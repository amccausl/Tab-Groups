<template>
  <div :class="bem( `tab-search`, { theme, 'is-active': !! search_text } )">
    <label class="tab-search__label">
      <svg class="tab-search__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <path d="M15.707 14.293l-4.822-4.822a6.019 6.019 0 1 0-1.414 1.414l4.822 4.822a1 1 0 0 0 1.414-1.414zM6 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"></path>
      </svg>
      <input class="tab-search__input" type="search" v-model="search_text" @input="onUpdateSearchText" @focus="onSearchFocus" @blur="onSearchBlur" :placeholder="__MSG_tab_search_placeholder__"/>
      <svg class="tab-search__progress-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" transform="rotate(-90, 12, 12)" :stroke-dasharray="progress_dasharray"></circle>
      </svg>
      <svg class="tab-search__clear-icon" @click="clearSearchText()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M6.586 8l-2.293 2.293a1 1 0 0 0 1.414 1.414L8 9.414l2.293 2.293a1 1 0 0 0 1.414-1.414L9.414 8l2.293-2.293a1 1 0 1 0-1.414-1.414L8 6.586 5.707 4.293a1 1 0 0 0-1.414 1.414L6.586 8zM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0z"></path>
      </svg>
    </label>
  </div>
</template>

<script>
  import {
    getWindow,
  } from "../store/helpers.mjs"
  import {
    bem,
    debounce,
    onStateChange,
  } from "./helpers.mjs"

  const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * 10

  export default {
    name: "tab-search",
    props: [ "theme" ],
    data() {
      return {
        search_text: "",
        search_resolved: true,
        progress_dasharray: `0 ${ PROGRESS_CIRCUMFERENCE }`,
        window_id: window.current_window_id,
        is_focused: false,
      }
    },
    computed: {
      __MSG_tab_search_placeholder__() {
        return window.background.getMessage( "tab_search_placeholder" )
      }
    },
    created() {
      onStateChange( state => {
        const state_window = getWindow( state, this.window_id )
        if( state_window && state_window.search != null ) {
          console.info('new tab search state', state_window.search.text)
          if( ! this.is_focused ) {
            // Only set state if focused to prevent overwriting while typing
            this.search_text = state_window.search.text
          }
          this.search_resolved = state_window.search.resolved
          if( ! this.search_resolved ) {
            const progress = 1 - state_window.search.queued_tab_ids.length / state_window.search.total_tabs_count
            this.progress_dasharray = `${ progress * PROGRESS_CIRCUMFERENCE } ${ PROGRESS_CIRCUMFERENCE }`
          } else {
            this.progress_dasharray = `${ PROGRESS_CIRCUMFERENCE }`
          }
        } else {
          this.search_text = ""
          this.search_resolved = true
          this.progress_dasharray = `0 ${ this.progress_dasharray }`
        }
      })
    },
    methods: {
      bem,
      onUpdateSearchText: debounce( function() {
        console.info('runSearch', this.search_text)
        window.background.runTabSearch( window.store, this.window_id, this.search_text )
      }, 250 ),
      onSearchBlur() {
        console.info('onSearchBlur')
        this.is_focused = false
      },
      onSearchFocus() {
        console.info('onSearchFocus')
        this.is_focused = true
      },
      clearSearchText() {
        console.info('clearSearchText', this.search_text)
        this.search_text = ""
        window.background.runTabSearch( window.store, this.window_id, this.search_text )
      },
    }
  }
</script>

<style lang="scss">
  @import "../styles/photon";

  %tab-search__icon {
    @extend %slow-transition;
    fill: var( --tab-search__color );
    transition-property: opacity;
    position: absolute;
    top: 11px;
    height: 16px;
    width: 16px;
  }

  .tab-search {
    flex: 1;
    padding: 4px;
    position: relative;

    @media (prefers-color-scheme: dark) {
      --tab-search__background-color: #474749;
      --tab-search__color: white;
      --tab-search__border-color: #919192;
      --tab-search__border-color--hover: #a3a3a4;
    }

    @media (prefers-color-scheme: light) {
      --tab-search__background-color: white;
      --tab-search__color: #0c0c0d;
      --tab-search__border-color: #b5b5b5;
      --tab-search__border-color--hover: #858585;
    }

    &.tab-search--theme-dark {
      --tab-search__background-color: #474749;
      --tab-search__color: white;
      --tab-search__border-color: #919192;
      --tab-search__border-color--hover: #a3a3a4;
    }

    &.tab-search--theme-light {
      --tab-search__background-color: white;
      --tab-search__color: #0c0c0d;
      --tab-search__border-color: #b5b5b5;
      --tab-search__border-color--hover: #858585;
    }

    &__input {
      @extend %text-body-10;
      width: 100%;
      height: 30px;
      padding-left: 28px;
      border: 1px solid var( --tab-search__border-color );
      border-radius: 4px;
      background-color: var( --tab-search__background-color );
      color: var( --tab-search__color );

      &::-moz-placeholder {
        @extend %text-body-10;
        color: var( --tab-search__color );
      }
    }

    &__label:hover &__input {
      border-color: var( --tab-search__border-color--hover );
    }

    &__icon {
      @extend %tab-search__icon;
      left: 11px;
      opacity: 0.4;
    }

    &__clear-icon {
      @extend %tab-search__icon;
      right: 8px;
      cursor: pointer;
      display: none;
      opacity: 0;
    }

    &__progress-icon {
      @extend %slow-transition;
      transition-property: opacity, stroke-dasharray;
      position: absolute;
      top: 7px;
      right: 4px;
      stroke: $magenta-50;
      stroke-width: 4px;
      fill: transparent;
      opacity: 0;
    }

    &--is-active &__icon,
    &--is-active &__clear-icon,
    &--is-active &__progress-icon {
      display: block;
      opacity: 1;
    }
  }
</style>
