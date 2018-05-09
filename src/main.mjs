import Vue from 'vue'

import Action from './components/Action.vue'
import Onboarding from './components/Onboarding.vue'
import Options from './components/Options.vue'
// import TabGroups from './components/TabGroups.vue'
import Sidebar from './components/Sidebar.vue'

Promise.all([
  browser.windows.getCurrent(),
  browser.runtime.getBackgroundPage()
    .then( background => {
      // Save a reference to the background script so it can be accessed syncronously
      window.background = background
      return background.getStore()
    })
])
.then( ( [ current_window, store ] ) => {
  window.current_window_id = current_window.id
  window.store = store

  if( window.document.getElementById( 'action' ) ) {
    new Vue({
      el: '#action',
      render: ( h ) => h( Action )
    })
  }

  if( window.document.getElementById( 'onboarding' ) ) {
    new Vue({
      el: '#onboarding',
      render: ( h ) => h( Onboarding )
    })
  }

  if( window.document.getElementById( 'options' ) ) {
    new Vue({
      el: '#options',
      render: ( h ) => h( Options )
    })
  }

  // if( window.document.getElementById( 'tab-groups' ) ) {
  //   new Vue({
  //     el: '#tab-groups',
  //     render: ( h ) => h( TabGroups )
  //   })
  // }

  if( window.document.getElementById( 'sidebar' ) ) {
    new Vue({
      el: '#sidebar',
      render: ( h ) => h( Sidebar )
    })
  }
})
