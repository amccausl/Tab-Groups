<script>
  import {
    bem,
  } from "./helpers.mjs"

  export default {
    name: "tab-icon",
    props: [ "theme", "tab", "size" ],
    data() {
      return {
        error_url: null,
      }
    },
    computed: {
      icon() {
        // Handle icons blocked by app security
        switch( this.tab.icon_url ) {
          case "chrome://mozapps/skin/extensions/extensionGeneric-16.svg":
            return { is_svg: true, url: "/favicons/firefox-addon.svg" }
          case "chrome://branding/content/icon32.png":
            return { is_svg: true, url: "/favicons/firefox-logo.svg" }
        }

        if( this.tab.url.startsWith( "about:" ) ) {
          if( this.tab.url === 'about:debugging' || this.tab.url === 'about:config' || this.tab.url === 'about:newtab' ) {
            return { is_svg: true, url: "/favicons/firefox-logo.svg" }
          }
        }

        // Handle icons blocked by tracking protection
        // Twitter
        if( this.tab.url.startsWith( "https://twitter.com" ) ) {
          return { is_svg: false, url: "/favicons/twitter.svg" }
        }
        // Google
        if( this.tab.url.startsWith( "https://mail.google.com" ) ) {
          return { is_svg: false, url: "/favicons/google/mail.ico" }
        }
        if( this.tab.url.startsWith( "https://docs.google.com/document" ) ) {
          return { is_svg: false, url: "/favicons/google/document.ico" }
        }
        if( this.tab.url.startsWith( "https://docs.google.com/presentation" ) ) {
          return { is_svg: false, url: "/favicons/google/presentation.ico" }
        }

        // Remaining icons
        return { is_svg: false, url: this.tab.icon_url }
      },
    },
    created() {
    },
    methods: {
      bem,
      muteTab( event ) {
        console.info('muteTab', this.tab.id)
        event.stopPropagation()
        window.background.muteTab( window.store, window.current_window_id, this.tab.id )
      },
      unmuteTab( event ) {
        console.info('unmuteTab', this.tab.id)
        event.stopPropagation()
        window.background.unmuteTab( window.store, window.current_window_id, this.tab.id )
      },
      onIconLoadError( event ) {
        console.info('onIconLoadError', event, this.tab.id, this.tab.icon_url)
        this.error_url = this.tab.icon_url
      }
    }
  }
</script>

<template>
  <div :class="bem( 'tab-icon', { 'is-loading': tab.status === 'loading' } )">
    <img v-if="icon.url && ! icon.is_svg && error_url !== icon.url" class="tab-icon__img" :src="icon.url" :style="{ height: `${ size }px`, width: `${ size }px` }" @error="onIconLoadError"/>
    <svg v-if="icon.is_svg" :class="bem( 'tab-icon__img', { 'is-svg': true, theme } )">
      <use :xlink:href="`${ icon.url }#icon`"></use>
    </svg>
    <svg v-if="tab.muted" :class="[ bem( 'tab-icon__state', { theme } ), 'audio-mute-icon']" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"
        @click.prevent="unmuteTab( $event, tab.id )"
    >
      <g>
        <path d="M13 8a2.813 2.813 0 0 0-.465-1.535l-.744.744A1.785 1.785 0 0 1 12 8a2.008 2.008 0 0 1-1.4 1.848.5.5 0 0 0 .343.939A3 3 0 0 0 13 8z"></path>
        <path d="M13.273 5.727A3.934 3.934 0 0 1 14 8a3.984 3.984 0 0 1-2.742 3.775.5.5 0 0 0 .316.949A4.985 4.985 0 0 0 15 8a4.93 4.93 0 0 0-1.012-2.988zm-4.603 7.99a.2.2 0 0 0 .33-.152V10l-2.154 2.154zm6.037-12.424a1 1 0 0 0-1.414 0L9 5.586V2.544a.25.25 0 0 0-.413-.19L5.5 5H4.191A2.191 2.191 0 0 0 2 7.191v1.618a2.186 2.186 0 0 0 1.659 2.118l-2.366 2.366a1 1 0 1 0 1.414 1.414l12-12a1 1 0 0 0 0-1.414z"></path>
      </g>
    </svg>
    <svg v-else-if="tab.audible" :class="[ bem( 'tab-icon__state', { theme } ), 'audio-icon']" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"
        @click.prevent="muteTab( $event, tab.id )"
    >
      <g>
        <path d="M8.587 2.354L5.5 5H4.191A2.191 2.191 0 0 0 2 7.191v1.618A2.191 2.191 0 0 0 4.191 11H5.5l3.17 2.717a.2.2 0 0 0 .33-.152V2.544a.25.25 0 0 0-.413-.19zm2.988.921a.5.5 0 0 0-.316.949 3.97 3.97 0 0 1 0 7.551.5.5 0 0 0 .316.949 4.971 4.971 0 0 0 0-9.449z"></path>
        <path d="M13 8a3 3 0 0 0-2.056-2.787.5.5 0 1 0-.343.939A2.008 2.008 0 0 1 12 8a2.008 2.008 0 0 1-1.4 1.848.5.5 0 0 0 .343.939A3 3 0 0 0 13 8z"></path>
      </g>
    </svg>
    <div class="tab-icon__spinner">
      <div class="tab-icon__spinner-sub tab-icon__spinner-sub--index-0"></div>
      <div class="tab-icon__spinner-sub tab-icon__spinner-sub--index-1"></div>
      <div class="tab-icon__spinner-sub tab-icon__spinner-sub--index-2"></div>
      <div class="tab-icon__spinner-sub tab-icon__spinner-sub--index-3"></div>
      <div class="tab-icon__spinner-sub tab-icon__spinner-sub--index-4"></div>
      <div class="tab-icon__spinner-sub tab-icon__spinner-sub--index-5"></div>
      <div class="tab-icon__spinner-sub tab-icon__spinner-sub--index-6"></div>
      <div class="tab-icon__spinner-sub tab-icon__spinner-sub--index-7"></div>
      <div class="tab-icon__spinner-sub tab-icon__spinner-sub--index-8"></div>
      <div class="tab-icon__spinner-sub tab-icon__spinner-sub--index-9"></div>
      <div class="tab-icon__spinner-sub tab-icon__spinner-sub--index-10"></div>
      <div class="tab-icon__spinner-sub tab-icon__spinner-sub--index-11"></div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../styles/photon-colors";

  $tab-icon--size: 16px !default;
  $tab-icon__state--size: 12px !default;

  %slow-transition {
    transition-duration: 250ms;
    transition-timing-function: cubic-bezier(.07,.95,0,1);
  }

  @keyframes spinner {
    0% { opacity: 1; }
    50% { opacity: 0.25; }
    100% { opacity: 1; }
  }

  .tab-icon {
    position: relative;

    &__img {
      width: $tab-icon--size;
      height: $tab-icon--size;

      &--is-svg {
        fill: var( --tab-icon__color );
      }

      &--is-svg.tab-icon__img--theme-dark {
        --tab-icon__color: $grey-30;
      }

      &--is-svg.tab-icon__img--theme-light {
        --tab-icon__color: $ink-90;
      }

      @media (prefers-color-scheme: dark) {
        --tab-icon__color: $grey-30;
      }

      @media (prefers-color-scheme: light) {
        --tab-icon__color: $ink-90;
      }
    }

    &__state {
      position: absolute;
      top: -2px;
      right: -8px;
      height: $tab-icon__state--size;
      width: $tab-icon__state--size;

      &--theme-dark {
        fill: rgb(255, 255, 255);
      }

      &--theme-light {
        fill: $ink-90;
      }

      @media (prefers-color-scheme: dark) {
        &--theme-system {
          fill: rgb(255, 255, 255);
        }
      }

      @media (prefers-color-scheme: light) {
        &--theme-system {
          fill: $ink-90;
        }
      }
    }

    &__spinner {
      @extend %slow-transition;
      transition-property: opacity;
      opacity: 0;
    }

    &--is-loading &__spinner {
      opacity: 1;
    }

    &__spinner-sub {
      position: absolute;
      top: 0;
      width: 4px;
      height: 6px;
      border-radius: 2px;
      background: $grey-50;

      animation-name: spinner;
      animation-duration: 2s;
      animation-iteration-count: infinite;

      &--index-0 {
        transform: translateX(6px) translateY(5px) rotate( calc( 0 * 30deg ) ) translateY(-10px);
        animation-delay: calc( 0 * 2s / 12 );
      }

      &--index-1 {
        transform: translateX(6px) translateY(5px) rotate( calc( 1 * 30deg ) ) translateY(-10px);
        animation-delay: calc( 1 * 2s / 12 );
      }

      &--index-2 {
        transform: translateX(6px) translateY(5px) rotate( calc( 2 * 30deg ) ) translateY(-10px);
        animation-delay: calc( 2 * 2s / 12 );
      }

      &--index-3 {
        transform: translateX(6px) translateY(5px) rotate( calc( 3 * 30deg ) ) translateY(-10px);
        animation-delay: calc( 3 * 2s / 12 );
      }

      &--index-4 {
        transform: translateX(6px) translateY(5px) rotate( calc( 4 * 30deg ) ) translateY(-10px);
        animation-delay: calc( 4 * 2s / 12 );
      }

      &--index-5 {
        transform: translateX(6px) translateY(5px) rotate( calc( 5 * 30deg ) ) translateY(-10px);
        animation-delay: calc( 5 * 2s / 12 );
      }

      &--index-6 {
        transform: translateX(6px) translateY(5px) rotate( calc( 6 * 30deg ) ) translateY(-10px);
        animation-delay: calc( 6 * 2s / 12 );
      }

      &--index-7 {
        transform: translateX(6px) translateY(5px) rotate( calc( 7 * 30deg ) ) translateY(-10px);
        animation-delay: calc( 7 * 2s / 12 );
      }

      &--index-8 {
        transform: translateX(6px) translateY(5px) rotate( calc( 8 * 30deg ) ) translateY(-10px);
        animation-delay: calc( 8 * 2s / 12 );
      }

      &--index-9 {
        transform: translateX(6px) translateY(5px) rotate( calc( 9 * 30deg ) ) translateY(-10px);
        animation-delay: calc( 9 * 2s / 12 );
      }

      &--index-10 {
        transform: translateX(6px) translateY(5px) rotate( calc( 10 * 30deg ) ) translateY(-10px);
        animation-delay: calc( 10 * 2s / 12 );
      }

      &--index-11 {
        transform: translateX(6px) translateY(5px) rotate( calc( 11 * 30deg ) ) translateY(-10px);
        animation-delay: calc( 11 * 2s / 12 );
      }
    }
  }
</style>
