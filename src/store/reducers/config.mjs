
export function updateConfig( state, { config } ) {
  return Object.assign( {}, state, {
    config
  })
}
