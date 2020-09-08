import { createApp } from 'vue'

import Action from './components/Action.vue'
import Options from './components/Options.vue'
// import TabGroups from './components/TabGroups.vue'
import Sidebar from './components/Sidebar.vue'

Promise.all([
  browser.windows.getCurrent(),
  browser.runtime.getBackgroundPage()
    .then( background => {
      // Save a reference to the background script so it can be accessed syncronously
      window.background = background

      // Sometimes this is reached before the background script has run it's initializer, check for that
      if( background.getStore ) {
        return background.getStore()
      }

      console.info('deferring load')
      return new Promise( ( resolve ) => {
        background.addEventListener( "load", () => {
          console.info('load event', background.getStore)
          resolve( background.getStore() )
        })
      })
    })
])
.then( ( [ current_window, store ] ) => {
  window.current_window_id = current_window.id
  window.store = store

  if( window.document.getElementById( 'action' ) ) {
    createApp( Action ).mount( '#action' )
  }

  if( window.document.getElementById( 'options' ) ) {
    createApp( Options ).mount( '#options' )
  }

  if( window.document.getElementById( 'sidebar' ) ) {
    createApp( Sidebar ).mount( '#sidebar' )
  }
})
