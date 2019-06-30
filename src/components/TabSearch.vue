<template>
  <div :class="bem( `tab-search`, { theme, 'is-active': !! search_text } )">
    <label class="tab-search__label">
      <svg class="tab-search__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <path d="M15.707 14.293l-4.822-4.822a6.019 6.019 0 1 0-1.414 1.414l4.822 4.822a1 1 0 0 0 1.414-1.414zM6 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"></path>
      </svg>
      <input class="tab-search__input" type="search" v-model="search_text" @input="onUpdateSearchText" @focus="onSearchFocus" @blur="onSearchBlur" :placeholder="__MSG_tab_search_placeholder__"/>
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

export default {
  name: "tab-search",
  props: [ "theme" ],
  data() {
    return {
      search_text: "",
      search_resolved: true,
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
      } else {
        this.search_text = ""
        this.search_resolved = true
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

$dark-awesome-bar-background: #474749;

%tab-search__icon {
  @extend %slow-transition;
  transition-property: opacity;
  position: absolute;
  top: 11px;
  height: 16px;
  width: 16px;
  opacity: 0.4;
}

$tab-search__theme: (
  light: (
    --background-color: $white-100,
    --color: $grey-90,
  ),
  dark: (
    --background-color: $dark-awesome-bar-background,
    --color: $white-100,
  ),
);

.tab-search {
  flex: 1;
  padding: 4px 0 4px 4px;
  position: relative;

  &__input {
    @extend %text-body-10;
    width: 100%;
    height: 30px;
    padding-left: 28px;
    border: 1px solid $grey-90-a30;
    border-radius: 4px;

    &::-moz-placeholder {
      @extend %text-body-10;
    }
  }

  &__label:hover &__input {
    border-color: $grey-90-a50;
  }

  &__icon {
    @extend %tab-search__icon;
    left: 11px;
  }

  &__clear-icon {
    @extend %tab-search__icon;
    right: 8px;
    cursor: pointer;
  }

  &--is-active &__icon,
  &--is-active &__clear-icon {
    opacity: 1;
  }

  &__input:placeholder-shown + &__clear-icon {
    display: none;
    opacity: 0;
  }
}

@each $theme, $colors in $tab-search__theme {
  .tab-search {
    &--theme-#{$theme} &__input {
      background-color: map-get( $colors, --background-color );
      color: map-get( $colors, --color );
      border: 1px solid rgba( map-get( $colors, --color ), 0.3 );

      &::-moz-placeholder {
        color: map-get( $colors, --color );
      }
    }

    &--theme-#{$theme} &__label:hover &__input {
      border-color: rgba( map-get( $colors, --color ), 0.5 );
    }

    &--theme-#{$theme} &__icon {
      fill: map-get( $colors, --color );
    }

    &--theme-#{$theme} &__clear-icon {
      fill: map-get( $colors, --color );
    }
  }

  @media (prefers-color-scheme: $theme) {
    .tab-search {
      &__input {
        background-color: map-get( $colors, --background-color );
        color: map-get( $colors, --color );
        border: 1px solid rgba( map-get( $colors, --color ), 0.3 );

        &::-moz-placeholder {
          color: map-get( $colors, --color );
        }
      }

      &__label:hover &__input {
        border-color: rgba( map-get( $colors, --color ), 0.5 );
      }

      &__icon {
        fill: map-get( $colors, --color );
      }

      &__clear-icon {
        fill: map-get( $colors, --color );
      }
    }
  }
}
</style>
