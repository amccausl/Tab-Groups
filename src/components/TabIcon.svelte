<script>
  export let theme
  export let tab
  export let size

  import {
    INK_90,
  } from "./photon-colors"
  import {
    bem,
  } from "./helpers.mjs"

  let error_url = null
  const window_id = window.current_window_id

  let context_fill, tab_icon_url
  $: {
    console.info('update context_fill')
    context_fill = ( theme === "dark" ? "rgb(255, 255, 255)" : INK_90 )
  }
  $: {
    console.info('update tab_icon_url')
    tab_icon_url = getIconUrl( tab )
  }

  function getIconUrl( tab ) {
    switch( tab.icon_url ) {
      case "chrome://mozapps/skin/extensions/extensionGeneric-16.svg":
        return "/favicons/extensionGeneric.svg"
      case "chrome://branding/content/icon32.png":
        if( theme === "dark" ) {
          return `/favicons/firefox-logo-glyph.svg`
        }
    }

    // Add mapping for icons blocked by tracking protection
    // Twitter
    if( tab.url.startsWith( "https://twitter.com" ) ) {
      return `/favicons/twitter.svg`
    }
    // Google
    if( tab.url.startsWith( "https://mail.google.com" ) ) {
      return `/favicons/google/mail.ico`
    }
    if( tab.url.startsWith( "https://docs.google.com/document" ) ) {
      return `/favicons/google/document.ico`
    }
    if( tab.url.startsWith( "https://docs.google.com/presentation" ) ) {
      return `/favicons/google/presentation.ico`
    }

    if( tab.url.startsWith( "about:" ) ) {
      if( tab.url === 'about:debugging' || tab.url === 'about:config' || tab.url === 'about:newtab' ) {
        if( theme === "dark" ) {
          return `/favicons/firefox-logo-glyph.svg`
        }
      }
    }
    return tab.icon_url
  }

  function muteTab( event ) {
    console.info('muteTab', tab.id)
    event.stopPropagation()
    window.background.muteTab( window.store, window_id, tab.id )
  }

  function unmuteTab( event ) {
    console.info('unmuteTab', tab.id)
    event.stopPropagation()
    window.background.unmuteTab( window.store, window_id, tab.id )
  }

  function onIconLoadError( event ) {
    console.info('onIconLoadError', event, tab.id, tab.icon_url)
    error_url = tab.icon_url
  }
</script>

<style lang="sass">
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
    }

    &__state {
      position: absolute;
      top: -2px;
      right: -8px;
      height: $tab-icon__state--size;
      width: $tab-icon__state--size;
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

      @for $i from 0 through 11 {
        &--index-#{$i} {
          transform: translateX(6px) translateY(5px) rotate($i * 30deg) translateY(-10px);
          animation-delay: $i * 2s / 12;
        }
      }
    }
  }
</style>

<div class={ bem( 'tab-icon', { 'is-loading': tab.status === 'loading' } ).join( " " ) }>
  {#if error_url !== tab_icon_url }
  <img class="tab-icon__img" src={ tab_icon_url } style={ `height: ${ size }px; width: ${ size }px;` } on:error={ onIconLoadError } alt="favicon"/>
  {/if}
  {#if tab.muted }
  <svg class="tab-icon__state audio-mute-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"
      on:click|preventDefault={ e => unmuteTab( e, tab.id ) }
  >
    <g fill={ context_fill }>
      <path d="M13 8a2.813 2.813 0 0 0-.465-1.535l-.744.744A1.785 1.785 0 0 1 12 8a2.008 2.008 0 0 1-1.4 1.848.5.5 0 0 0 .343.939A3 3 0 0 0 13 8z"></path>
      <path d="M13.273 5.727A3.934 3.934 0 0 1 14 8a3.984 3.984 0 0 1-2.742 3.775.5.5 0 0 0 .316.949A4.985 4.985 0 0 0 15 8a4.93 4.93 0 0 0-1.012-2.988zm-4.603 7.99a.2.2 0 0 0 .33-.152V10l-2.154 2.154zm6.037-12.424a1 1 0 0 0-1.414 0L9 5.586V2.544a.25.25 0 0 0-.413-.19L5.5 5H4.191A2.191 2.191 0 0 0 2 7.191v1.618a2.186 2.186 0 0 0 1.659 2.118l-2.366 2.366a1 1 0 1 0 1.414 1.414l12-12a1 1 0 0 0 0-1.414z"></path>
    </g>
  </svg>
  {:else if tab.audible }
  <svg class="tab-icon__state audio-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"
      on:click|preventDefault={ e => muteTab( e, tab.id ) }
  >
    <g fill={ context_fill }>
      <path d="M8.587 2.354L5.5 5H4.191A2.191 2.191 0 0 0 2 7.191v1.618A2.191 2.191 0 0 0 4.191 11H5.5l3.17 2.717a.2.2 0 0 0 .33-.152V2.544a.25.25 0 0 0-.413-.19zm2.988.921a.5.5 0 0 0-.316.949 3.97 3.97 0 0 1 0 7.551.5.5 0 0 0 .316.949 4.971 4.971 0 0 0 0-9.449z"></path>
      <path d="M13 8a3 3 0 0 0-2.056-2.787.5.5 0 1 0-.343.939A2.008 2.008 0 0 1 12 8a2.008 2.008 0 0 1-1.4 1.848.5.5 0 0 0 .343.939A3 3 0 0 0 13 8z"></path>
    </g>
  </svg>
  {/if}
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
