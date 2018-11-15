<template>
  <body class="page page--options">
    <div v-if="! features_tabhide_enabled" :class="bem( 'message-bar', { 'is-warning': true } )">
      <!-- @todo localize -->
      <div class="message-bar__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <path fill="rgba(12, 12, 13, .8)" d="M14.742 12.106L9.789 2.2a2 2 0 0 0-3.578 0l-4.953 9.91A2 2 0 0 0 3.047 15h9.905a2 2 0 0 0 1.79-2.894zM7 5a1 1 0 0 1 2 0v4a1 1 0 0 1-2 0zm1 8.25A1.25 1.25 0 1 1 9.25 12 1.25 1.25 0 0 1 8 13.25z"></path>
        </svg>
      </div>
      <span class="message-bar__text">Visit <span class="text--code">about:config</span> and set <span class="text--code">tabhide.enabled</span> to <span class="text--code">true</span> for a better experience</span>
    </div>
    <div class="options">
      <nav class="sidenav">
        <ul>
          <li :class="{ 'active': selected_section === 'preferences' }">
            <a href="javascript:void(0)" @click="selectSection( 'preferences' )" v-once>{{ __MSG_options_section_preferences__ }}</a>
          </li>
          <li :class="{ 'active': selected_section === 'data' }">
            <a href="javascript:void(0)" @click="selectSection( 'data' )" v-once>{{ __MSG_options_section_data__ }}</a>
          </li>
          <li :class="{ 'active': selected_section === 'debug' }">
            <a href="javascript:void(0)" @click="selectSection( 'debug' )" v-once>{{ __MSG_options_section_debug__ }}</a>
          </li>
        </ul>
      </nav>
      <article class="main">
        <section v-if="selected_section === 'preferences'">
          <form @submit.prevent>
            {{ __MSG_options_theme__ }}:
            <div class="browser-style">
              <input type="radio" id="theme_light" value="light" v-model="preferences.theme" @input="selectTheme( 'light' )">
              <label for="theme_light" v-once>{{ __MSG_options_theme_light__ }}</label>
            </div>
            <div class="browser-style">
              <input type="radio" id="theme_dark" value="dark" v-model="preferences.theme" @input="selectTheme( 'dark' )">
              <label for="theme_dark" v-once>{{ __MSG_options_theme_dark__ }}</label>
            </div>

            <fieldset>
              <legend v-once>{{ __MSG_options_sidebar_legend__ }}</legend>

              <label class="checkbox">
                <input class="checkbox__input" type="checkbox" v-model="show_header">
                <span class="checkbox__icon"></span>
                <span class="checkbox__label" v-once>{{ __MSG_options_sidebar_show_header__ }}</span>
              </label>

              <label class="checkbox">
                <input class="checkbox__input" type="checkbox" v-model="show_tabs_count">
                <span class="checkbox__icon"></span>
                <span class="checkbox__label" v-once>{{ __MSG_options_sidebar_show_tabs_count__ }}</span>
              </label>

              <label class="checkbox">
                <input class="checkbox__input" type="checkbox" v-model="show_tabs">
                <span class="checkbox__icon"></span>
                <span class="checkbox__label" v-once>{{ __MSG_options_sidebar_show_tabs__ }}</span>
              </label>

              <!-- <label v-if="show_tabs" class="checkbox checkbox--nested">
                <input class="checkbox__input" type="checkbox" v-model="show_pinned_tabs">
                <span class="checkbox__icon"></span>
                <span class="checkbox__label" v-once>{{ __MSG_options_sidebar_show_pinned_tabs__ }}</span>
              </label> -->

              <label v-if="show_tabs && features_contexual_identities_enabled" class="checkbox checkbox--nested">
                <input class="checkbox__input" type="checkbox" v-model="show_tab_context">
                <span class="checkbox__icon"></span>
                <span class="checkbox__label" v-once>{{ __MSG_options_sidebar_show_tab_context__ }} <a :href="__MSG_container_tabs_info_url__">{{ __MSG_learn_more__ }}</a></span>
              </label>

              <label v-if="show_tabs && preferences.theme === 'dark'" class="checkbox checkbox--nested">
                <input class="checkbox__input" type="checkbox" v-model="show_tab_icon_background">
                <span class="checkbox__icon"></span>
                <span class="checkbox__label" v-once>{{ __MSG_options_sidebar_show_tab_icon_background__ }}</span>
              </label>
            </fieldset>
          </form>
        </section>
        <section v-if="selected_section === 'data'">
          <form @submit.prevent>
            <!-- @todo localize -->
            <button @click="clearAllData()" class="browser-style">Clear All Data</button>
            <button @click="syncState()" class="browser-style">Sync State</button>
          </form>
        </section>
        <section v-if="selected_section === 'debug'">
          <form @submit.prevent>
            <button @click="openSidebarPage()" class="browser-style">Open Sidebar Page</button>
          </form>
        </section>
      </article>
    </div>
  </body>
</template>

<script>
import {
  bem,
  onStateChange,
} from './helpers.mjs'

export default {
  name: 'options',
  data() {
    return {
      features_contexual_identities_enabled: false,
      features_tabhide_enabled: false,
      preferences: {
        theme: 'dark',
        show_header: true,
        show_tabs_count: false,
        show_tabs: false,
        show_pinned_tabs: false,
        show_tab_context: false,
        show_tab_icon_background: false,
      },
      selected_section: 'preferences',
    }
  },
  computed: {
    __MSG_container_tabs_info_url__() {
      return window.background.getMessage( "container_tabs_info_url" )
    },
    __MSG_learn_more__() {
      return window.background.getMessage( "learn_more" )
    },
    __MSG_options_section_preferences__() {
      return window.background.getMessage( "options_section_preferences" )
    },
    __MSG_options_section_data__() {
      return window.background.getMessage( "options_section_data" )
    },
    __MSG_options_section_debug__() {
      return window.background.getMessage( "options_section_debug" )
    },
    __MSG_options_theme__() {
      return window.background.getMessage( "options_theme" )
    },
    __MSG_options_theme_light__() {
      return window.background.getMessage( "options_theme_light" )
    },
    __MSG_options_theme_dark__() {
      return window.background.getMessage( "options_theme_dark" )
    },
    __MSG_options_sidebar_legend__() {
      return window.background.getMessage( "options_sidebar_legend" )
    },
    __MSG_options_sidebar_show_header__() {
      return window.background.getMessage( "options_sidebar_show_header" )
    },
    __MSG_options_sidebar_show_tabs_count__() {
      return window.background.getMessage( "options_sidebar_show_tabs_count" )
    },
    __MSG_options_sidebar_show_tabs__() {
      return window.background.getMessage( "options_sidebar_show_tabs" )
    },
    __MSG_options_sidebar_show_pinned_tabs__() {
      return window.background.getMessage( "options_sidebar_show_pinned_tabs" )
    },
    __MSG_options_sidebar_show_tab_context__() {
      return window.background.getMessage( "options_sidebar_show_tab_context" )
    },
    __MSG_options_sidebar_show_tab_icon_background__() {
      return window.background.getMessage( "options_sidebar_show_tab_icon_background" )
    },
    show_header: {
      get() {
        return this.preferences.show_header
      },
      set( value ) {
        window.background.setConfig( 'show_header', value )
      }
    },
    show_tabs: {
      get() {
        return this.preferences.show_tabs
      },
      set( value ) {
        window.background.setConfig( 'show_tabs', value )
      }
    },
    show_tabs_count: {
      get() {
        return this.preferences.show_tabs_count
      },
      set( value ) {
        window.background.setConfig( 'show_tabs_count', value )
      }
    },
    show_pinned_tabs: {
      get() {
        return this.preferences.show_pinned_tabs
      },
      set( value ) {
        window.background.setConfig( 'show_pinned_tabs', value )
      }
    },
    show_tab_context: {
      get() {
        return this.preferences.show_tab_context
      },
      set( value ) {
        window.background.setConfig( 'show_tab_context', value )
      }
    },
    show_tab_icon_background: {
      get() {
        return this.preferences.show_tab_icon_background
      },
      set( value ) {
        window.background.setConfig( 'show_tab_icon_background', value )
      }
    }
  },
  created() {
    onStateChange( state => {
      console.info('loadState', state)
      Object.assign( this.preferences, state.config )
      // @todo state.features undefined
      this.features_contexual_identities_enabled = state.features.contextual_identities.enabled
      this.features_tabhide_enabled = state.features.tabhide.enabled
    })
  },
  methods: {
    bem,
    clearAllData() {
      window.background.resetBrowserState( window.store )
    },
    openSidebarPage() {
      window.background.openSidebarPage()
    },
    syncState() {
      window.background.syncState()
    },
    selectSection( section_id ) {
      this.selected_section = section_id
    },
    selectTheme( theme_id ) {
      window.background.setConfig( 'theme', theme_id )
    }
  }
}
</script>

<style lang="scss">
@import "../styles/photon-colors";

.page {
  display: flex;
  flex-direction: column;
}

.options {
  display: flex;
  align-items: flex-start;
  flex-direction: row;
  justify-content: flex-start;
  align-content: stretch;
}

.sidenav {
  flex: 1;
  flex-grow: 0;
}

.sidenav ul {
  list-style: none;
  padding-left: 0;
}

.sidenav a {
  display: block;
  padding: 16px;
  /* Title 30 */
  font-size: 22px;
  font-weight: 300;
  color: $grey-90;
  text-decoration: none;
}

.sidenav a:hover,
.sidenav a:focus {
  background-color: $grey-30;
}

.sidenav a:focus {
  border: none;
}

.sidenav li.active a {
  color: $blue-50;
}

.main {
  flex: 1;
  padding: 16px;
}

.checkbox {
  display: flex;
  align-items: flex-start;
  padding: 3px;

  &--nested {
    padding-left: 2em;
  }

  &__input {
    // @todo need to determine how this is still selectable
    display: none;
  }

  &__icon {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    background-color: $grey-90-a10;
    border: 1px solid $grey-90-a30;
    margin-right: 4px;
  }

  &__icon:hover {
    background-color: $grey-90-a20;
  }

  &__input:checked + &__icon {
    border: none;
    background-color: $blue-60;
    background-image: url("/icons/checkbox-check-16.svg");
  }

  &:hover &__icon {
    background-color: $grey-90-a20;
  }

  &:hover &__input:checked + &__icon {
    background-color: $blue-70;
  }
}

</style>
