
import testMoveTabOutOfWindow from "./ff-move-tab-out-of-window.mjs"

export default function testIntegrations( tap ) {
  tap.test( "./integrations/ff-move-tab-out-of-window.mjs", testMoveTabOutOfWindow )
  tap.end()
}
