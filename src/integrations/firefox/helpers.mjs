
export const TAB_GROUP_ID_KEY = 'group_id'

// @todo need way to clean this up
const tab_group_id_map = new Map()

/**
 * Fetch the preview image for a tab from session storage
 */
export function getTabGroupId( tab_id ) {
  console.info(`browser.sessions.getTabValue( ${ tab_id }, ${ TAB_GROUP_ID_KEY } )`)
  return new Promise( ( resolve, reject ) => {
    // This needs to be bumped to the next cycle or value won't have been set under some scenarios
    setTimeout( () => {
      console.info('resolve')
      if( tab_group_id_map.has( tab_id ) ) {
        return resolve( tab_group_id_map.get( tab_id ) )
      }
      return browser.sessions.getTabValue( tab_id, TAB_GROUP_ID_KEY ).then( resolve, reject )
    }, 0 )
  })
}

/**
 * Save the tab preview image and details to the
 */
export function setTabGroupId( tab_id, tab_group_id ) {
  console.info(`browser.sessions.setTabValue( ${ tab_id }, ${ TAB_GROUP_ID_KEY }, ${ tab_group_id } )`)
  tab_group_id_map.set( tab_id, tab_group_id )
  return browser.sessions.setTabValue( tab_id, TAB_GROUP_ID_KEY, tab_group_id )
}
