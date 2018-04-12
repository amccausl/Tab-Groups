
import testHelper from './helpers.mjs'
import testTabActivate from './tab-activate.mjs'
import testTabAdd from './tab-add.mjs'
import testTabRemove from './tab-remove.mjs'
import testTabMove from './tab-move.mjs'
import testTabsMove from './tabs-move.mjs'
import testWindowAdd from './window-add.mjs'
import testWindowSearch from './window-search.mjs'
import testPinnedTabs from './pinned-tabs.mjs'
import testGroupCreate from './reducers/group-create.mjs'
import testGroupMove from './reducers/group-move.mjs'
import testInit from './reducers/init.mjs'
import testTabAttach from './reducers/tab-attach.mjs'
import testValidators from './validators.mjs'

export default function testStore( tap ) {
  tap.test( './store/helpers.mjs', testHelper )
  tap.test( './store/tab-activate.mjs', testTabActivate )
  tap.test( './store/tab-add.mjs', testTabAdd )
  tap.test( './store/tab-remove.mjs', testTabRemove )
  tap.test( './store/tab-move.mjs', testTabMove )
  tap.test( './store/tabs-move.mjs', testTabsMove )
  tap.test( './store/window-add.mjs', testWindowAdd )
  // tap.test( './store/window-search.mjs', testWindowSearch )
  tap.test( './store/pinned-tabs.mjs', testPinnedTabs )
  tap.test( './store/reducers/group-create.mjs', testGroupCreate )
  tap.test( './store/reducers/group-move.mjs', testGroupMove )
  tap.test( './store/reducers/init.mjs', testInit )
  tap.test( './store/reducers/tab-attach.mjs', testTabAttach )
  tap.test( './store/validators.mjs', testValidators )
  tap.end()
}
