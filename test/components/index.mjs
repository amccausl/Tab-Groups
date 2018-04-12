
import testDraggable from './draggable.mjs'
import testHelpers from './helpers.mjs'

export default function testComponents( tap ) {
  tap.test( './components/draggable.mjs', testDraggable )
  // tap.test( './components/helpers.mjs', testHelpers )
  tap.end()
}
