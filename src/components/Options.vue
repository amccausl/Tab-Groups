<template>
  <body class="options">
    <!-- @todo localize -->
    <nav class="sidenav">
      <ul>
        <li :class="{ 'active': selected_section === 'preferences' }">
          <a href="javascript:void(0)" @click="selectSection( 'preferences' )">Preferences</a>
        </li>
        <li :class="{ 'active': selected_section === 'data' }">
          <a href="javascript:void(0)" @click="selectSection( 'data' )">Data</a>
        </li>
        <li :class="{ 'active': selected_section === 'debug' }">
          <a href="javascript:void(0)" @click="selectSection( 'debug' )">Debug</a>
        </li>
      </ul>
    </nav>
    <article class="main">
      <section v-if="selected_section === 'preferences'">
        <form @submit.prevent>
          Theme:
          <div class="browser-style">
            <input type="radio" id="theme_light" value="light" v-model="preferences.theme" @input="selectTheme( 'light' )">
            <label for="theme_light">Light</label>
          </div>
          <div class="browser-style">
            <input type="radio" id="theme_dark" value="dark" v-model="preferences.theme" @input="selectTheme( 'dark' )">
            <label for="theme_dark">Dark</label>
          </div>
          <label for="sidebar_tab_display">Sidebar Tab Display</label>
          <select id="sidebar_tab_display" v-model="sidebar_tab_display">
            <option value="large">Large</option>
            <option value="small">Small</option>
            <option value="none">None</option>
          </select>

          <label v-if="sidebar_tab_display !== 'none'" class="checkbox">
            <input class="checkbox__input" type="checkbox" v-model="show_pinned_tabs">
            <span class="checkbox__icon"></span>
            <span class="checkbox__label">Show pinned tabs</span>
          </label>

          <label v-if="sidebar_tab_display !== 'none'" class="checkbox">
            <input class="checkbox__input" type="checkbox" v-model="show_tab_context">
            <span class="checkbox__icon"></span>
            <span class="checkbox__label">Show tab context</span>
          </label>

          <label v-if="preferences.theme === 'dark' && sidebar_tab_display !== 'none'" class="checkbox">
            <input class="checkbox__input" type="checkbox" v-model="show_tab_icon_background">
            <span class="checkbox__icon"></span>
            <span class="checkbox__label">Show tab icon background</span>
          </label>
        </form>
      </section>
      <section v-if="selected_section === 'data'">
        <form @submit.prevent>
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
        theme: null,
        sidebar_tab_display: 'none',
        show_pinned_tabs: null,
        show_tab_context: null,
        show_tab_icon_background: null
      },
      selected_section: 'preferences',
      window_ids: []
    }
  },
  computed: {
    sidebar_tab_display: {
      get() {
        return this.preferences.sidebar_tab_display
      },
      set( value ) {
        setConfig( 'sidebar_tab_display', value )
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
      let window_ids = state.windows.map( window => window.id )

      // Use the extended splice to trigger change detection
      Object.getPrototypeOf( this.window_ids ).splice.apply( this.window_ids, [ 0, this.window_ids.length, ...window_ids ] )

      this.preferences.theme = state.config.theme
      this.preferences.sidebar_tab_display = state.config.sidebar_tab_display
      this.preferences.show_pinned_tabs = state.config.show_pinned_tabs
      this.preferences.show_tab_context = state.config.show_tab_context
      this.preferences.show_tab_icon_background = state.config.show_tab_icon_background
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
