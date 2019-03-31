import tap from "tap"

export function getMockBrowser( emitter ) {
  const getEmitter = ( event ) => {
    return {
      addListener: ( listener ) => emitter.addListener( event, listener )
    }
  }

  return {
    i18n: {
      // @todo can load from json
      getMessage: ( key ) => ""
    },
    sessions: {
      onChanged: getEmitter( "sessions.onChanged" ),
      setTabValue( tab_id, key, value ) {
        return new Promise( ( resolve, reject ) => {
          resolve()
        })
      }
    },
    storage: {
      onChanged: getEmitter( "storage.onChanged" ),
    },
    windows: {
      onCreated: getEmitter( "windows.onCreated" ),
      onRemoved: getEmitter( "windows.onRemoved" ),
    },
    tabs: {
      onActivated: getEmitter( "tabs.onActivated" ),
      onAttached: getEmitter( "tabs.onAttached" ),
      onCreated: getEmitter( "tabs.onCreated" ),
      onDetached: getEmitter( "tabs.onDetached" ),
      onMoved: getEmitter( "tabs.onMoved" ),
      onRemoved: getEmitter( "tabs.onRemoved" ),
      onReplaced: getEmitter( "tabs.onReplaced" ),
      onUpdated: getEmitter( "tabs.onUpdated" ),
      captureVisibleTab( window_id, image_details ) {
        return new Promise( ( resolve, reject ) => {
          resolve( "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAgAAAPI" )
        })
      },
    }
  }
}

if( process.argv[ 1 ].endsWith( "test/integrations/helpers.mjs" ) ) {
  tap.pass()
}
