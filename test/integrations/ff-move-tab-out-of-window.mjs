import EventEmitter from 'events'
import {
  bindBrowserEvents,
} from '../../src/integrations/index.mjs'
import App from '../../src/store/reducers.mjs'

import { createStore } from '../../src/store/dispatcher.mjs'
import { getInitialState } from '../store/helpers.mjs'
import { getMockBrowser } from './helpers.mjs'

export default function( tap ) {
  const emitter = new EventEmitter()

  // Initialize state with 1 window, 2 tabs
  let state = getInitialState()
  const browser = getMockBrowser( emitter )
  const store = createStore( App, state )
  const browser_state = {}
  bindBrowserEvents( browser, browser_state, store )

  // @todo Run browser events

  const moving_tab = state.windows[ 0 ].tab_groups[ 1 ].tabs[ 1 ]
  const new_window_id = 2

  emitter.emit( 'windows.onCreated', { id: new_window_id } )
  emitter.emit( 'tabs.onDetached', moving_tab.id, { oldWindowId: state.windows[ 0 ].id, oldPosition: 1 })
  emitter.emit( 'tabs.onUpdated', moving_tab.id, { favIconUrl: null }, { id: moving_tab.id, windowId: new_window_id } )
  emitter.emit( 'tabs.onActivated', { tabId: state.windows[ 0 ].tab_groups[ 1 ].tabs[ 0 ].id, windowId: state.windows[ 0 ].id } )
  emitter.emit( 'tabs.onAttached', moving_tab.id, { newWindowId: new_window_id, newPosition: 0 } )
  emitter.emit( 'tabs.onActivated', { tabId: moving_tab.id, windowId: new_window_id } )

  // @todo validate that dispatch is only run once per event
  // @todo validate final state

  state = store.getState()
  // console.info( 'state', state )

  tap.end()
}
