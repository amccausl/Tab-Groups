<template>
  <div class="tab-icon">
    <img class="tab-icon__img" :src="icon_url" :data-size="size" @error="onIconLoadError"/>
    <svg v-if="tab.muted" class="tab-icon__state audio-mute-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"
        @click.prevent="unmuteTab( $event, tab.id )"
    >
      <g :fill="context_fill">
        <path d="M13 8a2.813 2.813 0 0 0-.465-1.535l-.744.744A1.785 1.785 0 0 1 12 8a2.008 2.008 0 0 1-1.4 1.848.5.5 0 0 0 .343.939A3 3 0 0 0 13 8z"></path>
        <path d="M13.273 5.727A3.934 3.934 0 0 1 14 8a3.984 3.984 0 0 1-2.742 3.775.5.5 0 0 0 .316.949A4.985 4.985 0 0 0 15 8a4.93 4.93 0 0 0-1.012-2.988zm-4.603 7.99a.2.2 0 0 0 .33-.152V10l-2.154 2.154zm6.037-12.424a1 1 0 0 0-1.414 0L9 5.586V2.544a.25.25 0 0 0-.413-.19L5.5 5H4.191A2.191 2.191 0 0 0 2 7.191v1.618a2.186 2.186 0 0 0 1.659 2.118l-2.366 2.366a1 1 0 1 0 1.414 1.414l12-12a1 1 0 0 0 0-1.414z"></path>
      </g>
    </svg>
    <svg v-else-if="tab.audible" class="tab-icon__state audio-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"
        @click.prevent="muteTab( $event, tab.id )"
    >
      <g :fill="context_fill">
        <path d="M8.587 2.354L5.5 5H4.191A2.191 2.191 0 0 0 2 7.191v1.618A2.191 2.191 0 0 0 4.191 11H5.5l3.17 2.717a.2.2 0 0 0 .33-.152V2.544a.25.25 0 0 0-.413-.19zm2.988.921a.5.5 0 0 0-.316.949 3.97 3.97 0 0 1 0 7.551.5.5 0 0 0 .316.949 4.971 4.971 0 0 0 0-9.449z"></path>
        <path d="M13 8a3 3 0 0 0-2.056-2.787.5.5 0 1 0-.343.939A2.008 2.008 0 0 1 12 8a2.008 2.008 0 0 1-1.4 1.848.5.5 0 0 0 .343.939A3 3 0 0 0 13 8z"></path>
      </g>
    </svg>
  </div>
</template>

<script>
import {
  INK_90,
} from './photon-colors'

export default {
  name: 'tab-icon',
  props: [ 'theme', 'tab', 'size' ],
  data() {
    return {
      window_id: window.current_window_id,
    }
  },
  computed: {
    context_fill() {
      switch( this.theme ) {
        case 'dark':
          return 'rgb(255, 255, 255)'
        default:
          return INK_90
      }
    },
    icon_url() {
      switch( this.tab.icon_url ) {
        case 'chrome://mozapps/skin/extensions/extensionGeneric-16.svg':
          return '/icons/extensionGeneric.svg'
        case 'chrome://branding/content/icon32.png':
          if( this.theme === 'dark' ) {
            return `/icons/firefox-logo-glyph.svg`
          }
      }
      return this.tab.icon_url
    },
  },
  created() {
  },
  methods: {
    muteTab( event ) {
      console.info('muteTab', this.tab.id)
      event.stopPropagation()
      window.background.muteTab( window.store, this.window_id, this.tab.id )
    },
    unmuteTab( event ) {
      console.info('unmuteTab', this.tab.id)
      event.stopPropagation()
      window.background.unmuteTab( window.store, this.window_id, this.tab.id )
    },
    onIconLoadError( event ) {
      console.info('onIconLoadError', event, this.tab.id, this.tab.icon_url)
    }
  }
}
</script>

<style lang="scss">
$tab-icon--size: 16px !default;
$tab-icon__state--size: 12px !default;

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
}
</style>
