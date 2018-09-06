
import testDraggable from "./tab-draggable.mjs"
// import testHelpers from "./helpers.mjs"
import testSelectable from "./tab-selectable.mjs"

export default function testComponents( tap ) {
  tap.test( "./components/tab-draggable.mjs", testDraggable )
  // tap.test( "./components/helpers.mjs", testHelpers )
  tap.test( "./components/tab-selectable.mjs", testSelectable )
  tap.end()
}
