import { createApp } from 'vue'

import { bootstrap } from "./components/helpers"
import Action from './components/Action.vue'

bootstrap().then( ( [ current_window, store ] ) => {
  window.current_window_id = current_window.id
  window.store = store

  createApp( Action ).mount( '#app' )
})
