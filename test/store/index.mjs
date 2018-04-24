
import testHelper from "./helpers.mjs"
import testTabActivate from "./tab-activate.mjs"
import testTabRemove from "./tab-remove.mjs"
import testPinnedTabs from "./pinned-tabs.mjs"
import testSearch from "./reducers/search.mjs"
import testTabAdd from "./reducers/tab-add.mjs"
import testTabAttach from "./reducers/tab-attach.mjs"
import testTabMove from "./reducers/tab-move.mjs"
import testTabsMove from "./reducers/tabs-move.mjs"
import testGroupAdd from "./reducers/group-add.mjs"
import testGroupMove from "./reducers/group-move.mjs"
import testInit from "./reducers/init.mjs"
import testWindowAdd from "./reducers/window-add.mjs"
import testValidators from "./validators.mjs"

export default function testStore( tap ) {
  tap.test( "./store/helpers.mjs", testHelper )
  tap.test( "./store/tab-activate.mjs", testTabActivate )
  tap.test( "./store/reducers/tab-add.mjs", testTabAdd )
  tap.test( "./store/tab-remove.mjs", testTabRemove )
  tap.test( "./store/tab-move.mjs", testTabMove )
  tap.test( "./store/tabs-move.mjs", testTabsMove )
  tap.test( "./store/reducers/window-add.mjs", testWindowAdd )
  tap.test( "./store/reducers/search.mjs", testSearch )
  tap.test( "./store/pinned-tabs.mjs", testPinnedTabs )
  tap.test( "./store/reducers/group-add.mjs", testGroupAdd )
  tap.test( "./store/reducers/group-move.mjs", testGroupMove )
  tap.test( "./store/reducers/init.mjs", testInit )
  tap.test( "./store/reducers/tab-attach.mjs", testTabAttach )
  tap.test( "./store/validators.mjs", testValidators )
  tap.end()
}
