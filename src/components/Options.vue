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
          <fieldset>
            Theme:
            <div class="browser-style">
              <input type="radio" id="theme_light" value="light" v-model="preferences.theme" @input="selectTheme( 'light' )">
              <label for="theme_light">Light</label>
            </div>
            <div class="browser-style">
              <input type="radio" id="theme_dark" value="dark" v-model="preferences.theme" @input="selectTheme( 'dark' )">
              <label for="theme_dark">Dark</label>
            </div>
          </fieldset>
          <fieldset>
            <label for="show_pinned_tabs">Show pinned tabs</label>
            <input type="checkbox" id="show_pinned_tabs" v-model="show_pinned_tabs">
          </fieldset>
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
        show_pinned_tabs: null
      },
      selected_section: 'preferences',
      window_ids: []
    }
  },
  computed: {
    show_pinned_tabs: {
      get() {
        return this.preferences.show_pinned_tabs
      },
      set( value ) {
        setConfig( 'show_pinned_tabs', value )
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
      this.preferences.show_pinned_tabs = state.config.show_pinned_tabs
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

<style scoped>
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
  font-size: 22px; font-weight: 300; /* Title 30 */
  color: #0c0c0d; /* Photon Primary Text */
  text-decoration: none;
}

.sidenav a:hover,
.sidenav a:focus {
  background-color: #d7d7db; /* Photon Grey 30 */
}

.sidenav a:focus {
  border: none;
}

.sidenav li.active a {
  color: #0a84ff; /* Photon Blue 50 */
}

.main {
  flex: 1;
  padding: 16px;
}
</style>
