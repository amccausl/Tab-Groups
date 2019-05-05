<script>
  import { writable } from 'svelte/store'

  import { getMessage, openTabGroupsPage } from "../integrations/index.mjs"

  let selected_section = 'preferences'
  const __MSG_container_tabs_info_url__ = getMessage( "container_tabs_info_url" )
  const __MSG_learn_more__ = getMessage( "learn_more" )
  const __MSG_options_section_preferences__ = getMessage( "options_section_preferences" )
  const __MSG_options_section_data__ = getMessage( "options_section_data" )
  const __MSG_options_section_debug__ = getMessage( "options_section_debug" )
  const __MSG_options_theme__ = getMessage( "options_theme" )
  const __MSG_options_theme_light__ = getMessage( "options_theme_light" )
  const __MSG_options_theme_dark__ = getMessage( "options_theme_dark" )
  const __MSG_options_sidebar_legend__ = getMessage( "options_sidebar_legend" )
  const __MSG_options_sidebar_show_header__ = getMessage( "options_sidebar_show_header" )
  const __MSG_options_sidebar_show_tabs_count__ = getMessage( "options_sidebar_show_tabs_count" )
  const __MSG_options_sidebar_show_tabs__ = getMessage( "options_sidebar_show_tabs" )
  const __MSG_options_sidebar_show_pinned_tabs__ = getMessage( "options_sidebar_show_pinned_tabs" )
  const __MSG_options_sidebar_show_tab_context__ = getMessage( "options_sidebar_show_tab_context" )
  const __MSG_options_sidebar_show_tab_icon_background__ = getMessage( "options_sidebar_show_tab_icon_background" )
  const __MSG_options_use_sync_config__ = getMessage( "options_use_sync_config" )

  let theme = "dark"
  let show_tabs = writable( false, ( value ) => console.info('show_tabs', value) )
  let show_header = false
  let show_tabs_count = false
  let show_pinned_tabs = false
  let show_tab_context = false
  let show_tab_icon_background = false
  let use_sync_config = false

  function selectSection( section ) {
    selected_section = section
  }

  function clearAllData() {
    window.background.resetBrowserState( window.store )
  }

  function openSidebarPage() {
    window.background.openSidebarPage()
  }

  function syncState() {
    window.background.syncState()
  }

  function setConfig( key, value ) {
    console.info('setConfig', key, value )
    window.background.setConfig( key, value )
  }

  function selectTheme( theme_id ) {
    window.background.setConfig( 'theme', theme_id )
  }
</script>

<style lang="sass">
  @import "../styles/photon-colors";

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

<div class="options">
  <nav class="sidenav">
    <ul>
      <li>
        <a href="javascript:void(0)" on:click={e => selectSection( 'preferences' )}>{ __MSG_options_section_preferences__ }</a>
      </li>
      <li>
        <a href="javascript:void(0)" on:click={e => selectSection( 'data' )}>{ __MSG_options_section_data__ }</a>
      </li>
      <li>
        <a href="javascript:void(0)" on:click={e => selectSection( 'debug' )}>{ __MSG_options_section_debug__ }</a>
      </li>
    </ul>
  </nav>
  <article class="main">
    {#if selected_section === 'preferences'}
    <section>
      <form>
        { __MSG_options_theme__ }:
        <div class="browser-style">
          <input type="radio" id="theme_light" bind:group={ theme } value="light" on:change={ e => selectTheme( 'light' ) }>
          <label for="theme_light">{ __MSG_options_theme_light__ }</label>
        </div>
        <div class="browser-style">
          <input type="radio" id="theme_dark" bind:group={ theme } value="dark" on:change={ e => selectTheme( 'dark' ) }>
          <label for="theme_dark">{ __MSG_options_theme_dark__ }</label>
        </div>

        <fieldset>
          <legend>{ __MSG_options_sidebar_legend__ }</legend>

          <label class="checkbox">
            <input class="checkbox__input" type="checkbox" bind:checked={ show_header } on:change={ e => setConfig( 'show_header', show_header ) }>
            <span class="checkbox__icon"></span>
            <span class="checkbox__label">{ __MSG_options_sidebar_show_header__ }</span>
          </label>

          <label class="checkbox">
            <input class="checkbox__input" type="checkbox" bind:checked={ show_tabs_count } on:change={ e => setConfig( 'show_tabs_count', show_tabs_count ) }>
            <span class="checkbox__icon"></span>
            <span class="checkbox__label">{ __MSG_options_sidebar_show_tabs_count__ }</span>
          </label>

          <label class="checkbox">
            <input class="checkbox__input" type="checkbox" bind:checked={ show_tabs } on:change={ e => setConfig( 'show_tabs', show_tabs ) }>
            <span class="checkbox__icon"></span>
            <span class="checkbox__label">{ __MSG_options_sidebar_show_tabs__ }</span>
          </label>

          <!-- <label v-if="show_tabs" class="checkbox checkbox--nested">
            <input class="checkbox__input" type="checkbox" v-model="show_pinned_tabs">
            <span class="checkbox__icon"></span>
            <span class="checkbox__label">{ __MSG_options_sidebar_show_pinned_tabs__ }</span>
          </label> -->

          <label v-if="show_tabs && features_contexual_identities_enabled" class="checkbox checkbox--nested">
            <input class="checkbox__input" type="checkbox" bind:checked={ show_tab_context } on:change={ e => setConfig( 'show_tab_context', show_tab_context ) }>
            <span class="checkbox__icon"></span>
            <span class="checkbox__label">{ __MSG_options_sidebar_show_tab_context__ } <a href={ __MSG_container_tabs_info_url__ }>{ __MSG_learn_more__ }</a></span>
          </label>

          <label v-if="show_tabs && preferences.theme === 'dark'" class="checkbox checkbox--nested">
            <input class="checkbox__input" type="checkbox" bind:checked={ show_tab_icon_background } on:change={ e => setConfig( 'show_tab_icon_background', show_tab_icon_background ) }>
            <span class="checkbox__icon"></span>
            <span class="checkbox__label">{ __MSG_options_sidebar_show_tab_icon_background__ }</span>
          </label>

          <label class="checkbox">
            <input class="checkbox__input" type="checkbox" bind:checked={ use_sync_config } on:change={ e => setConfig( 'use_sync_config', use_sync_config ) }>
            <span class="checkbox__icon"></span>
            <span class="checkbox__label">{ __MSG_options_use_sync_config__ }</span>
          </label>
        </fieldset>
      </form>
    </section>
    {:else if selected_section === 'data'}
    <section>
      <!-- @todo localize -->
      <button on-click={ e => clearAllData() } class="browser-style">Clear All Data</button>
      <button on-click={ e => syncState() } class="browser-style">Reload State</button>
    </section>
    {:else if selected_section === 'debug'}
    <section>
      <!-- @todo localize -->
      <button on-click={ e => openSidebarPage() } class="browser-style">Open Sidebar Page</button>
    </section>
    {/if}
  </article>
</div>
