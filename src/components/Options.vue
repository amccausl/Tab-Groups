<template>
  <body>
    <p>
      <!-- @todo localize -->
      Changing the visibility of tabs in the header bar is currently experimental, but can be enabled by updating <pre>extensions.webextensions.tabhide.enabled</pre> on <a href="about:config">about:config</a>
    </p>
    <div class="options">
      <nav class="sidenav">
        <ul>
          <li :class="{ 'active': selected_section === 'preferences' }">
            <a href="javascript:void(0)" @click="selectSection( 'preferences' )">{{ __MSG_options_section_preferences__ }}</a>
          </li>
          <li :class="{ 'active': selected_section === 'data' }">
            <a href="javascript:void(0)" @click="selectSection( 'data' )">{{ __MSG_options_section_data__ }}</a>
          </li>
          <li :class="{ 'active': selected_section === 'debug' }">
            <a href="javascript:void(0)" @click="selectSection( 'debug' )">{{ __MSG_options_section_debug__ }}</a>
          </li>
        </ul>
      </nav>
      <article class="main">
        <section v-if="selected_section === 'preferences'">
          <form @submit.prevent>
            {{ __MSG_options_theme__ }}:
            <div class="browser-style">
              <input type="radio" id="theme_light" value="light" v-model="preferences.theme" @input="selectTheme( 'light' )">
              <label for="theme_light">{{ __MSG_options_theme_light__ }}</label>
            </div>
            <div class="browser-style">
              <input type="radio" id="theme_dark" value="dark" v-model="preferences.theme" @input="selectTheme( 'dark' )">
              <label for="theme_dark">{{ __MSG_options_theme_dark__ }}</label>
            </div>

            <fieldset>
              <legend>{{ __MSG_options_sidebar_legend__ }}</legend>

              <label class="checkbox">
                <input class="checkbox__input" type="checkbox" v-model="show_tabs_count">
                <span class="checkbox__icon"></span>
                <span class="checkbox__label">{{ __MSG_options_sidebar_show_tabs_count__ }}</span>
              </label>

              <label class="checkbox">
                <input class="checkbox__input" type="checkbox" v-model="show_tabs">
                <span class="checkbox__icon"></span>
                <span class="checkbox__label">{{ __MSG_options_sidebar_show_tabs__ }}</span>
              </label>

              <label v-if="show_tabs" class="checkbox checkbox--nested">
                <input class="checkbox__input" type="checkbox" v-model="show_pinned_tabs">
                <span class="checkbox__icon"></span>
                <span class="checkbox__label">{{ __MSG_options_sidebar_show_pinned_tabs__ }}</span>
              </label>

              <label v-if="show_tabs" class="checkbox checkbox--nested">
                <input class="checkbox__input" type="checkbox" v-model="show_tab_context">
                <span class="checkbox__icon"></span>
                <span class="checkbox__label">{{ __MSG_options_sidebar_show_tab_context__ }}</span>
              </label>

              <label v-if="show_tabs && preferences.theme === 'dark'" class="checkbox checkbox--nested">
                <input class="checkbox__input" type="checkbox" v-model="show_tab_icon_background">
                <span class="checkbox__icon"></span>
                <span class="checkbox__label">{{ __MSG_options_sidebar_show_tab_icon_background__ }}</span>
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
  resetBrowserState,
  openSidebarPage,
  setConfig,
} from '../integrations/index.mjs'
import {
  onStateChange,
} from './helpers.mjs'

export default {
  name: 'options',
  data() {
    return {
      preferences: {
        theme: 'dark',
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
    show_tabs: {
      get() {
        return this.preferences.show_tabs
      },
      set( value ) {
        setConfig( 'show_tabs', value )
      }
    },
    show_tabs_count: {
      get() {
        return this.preferences.show_tabs_count
      },
      set( value ) {
        setConfig( 'show_tabs_count', value )
      }
    },
    show_pinned_tabs: {
      get() {
        return this.preferences.show_pinned_tabs
      },
      set( value ) {
        setConfig( 'show_pinned_tabs', value )
      }
    },
    show_tab_context: {
      get() {
        return this.preferences.show_tab_context
      },
      set( value ) {
        setConfig( 'show_tab_context', value )
      }
    },
    show_tab_icon_background: {
      get() {
        return this.preferences.show_tab_icon_background
      },
      set( value ) {
        setConfig( 'show_tab_icon_background', value )
      }
    }
  },
  created() {
    onStateChange( state => {
      console.info('loadState', state)
      Object.assign( this.preferences, state.config )
    })
  },
  methods: {
    clearAllData() {
      resetBrowserState( window.store )
    },
    openSidebarPage,
    syncState() {
      window.background.syncState()
    },
    selectSection( section_id ) {
      this.selected_section = section_id
    },
    selectTheme( theme_id ) {
      setConfig( 'theme', theme_id )
    }
  }
}
</script>

<style lang="scss">
@import 'photon-colors';

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
