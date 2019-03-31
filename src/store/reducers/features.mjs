
export function updateFeatures( state, { features } ) {
  return {
    ...state,
    features: { ...state.features, ...features }
  }
}
