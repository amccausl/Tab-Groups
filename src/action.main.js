import App from './components/ActionApp.svelte'

// moz-extension://e6191a46-22ef-416d-8821-99ffb31b9367/action.html

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

	new App({
		target: document.body
	})
})
