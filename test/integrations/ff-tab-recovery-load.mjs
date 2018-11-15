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

  tap.end()
}
