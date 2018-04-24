
export function updateFeatures( state, { features } ) {
  return Object.assign( {}, state, {
    features: Object.assign( {}, state.features, features )
  })
}
