import { omit } from "../helpers.mjs"

export function addContextualIdentity( state, { contextual_identity } ) {
  return updateContextualIdentity( state, { contextual_identity } )
}

export function updateContextualIdentity( state, { contextual_identity } ) {
  return Object.assign( {}, state, {
    contextual_identities_data: Object.assign( {}, state.contextual_identities_data, {
      [`${ contextual_identity.cookieStoreId }`]: {
        color: contextual_identity.colorCode,
        name: contextual_identity.name,
      }
    })
  })
}

export function removeContextualIdentity( state, { contextual_identity } ) {
  return Object.assign( {}, state, {
    contextual_identities_data: omit( state.contextual_identities_data, contextual_identity.cookieStoreId )
  })
}
