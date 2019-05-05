import App from './components/OptionsApp.svelte'

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
