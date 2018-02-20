
import testHelper from './helpers.mjs'
import testInit from './init.mjs'
import testTabActivate from './tab-activate.mjs'
import testTabAdd from './tab-add.mjs'
import testTabRemove from './tab-remove.mjs'
import testTabMove from './tab-move.mjs'
import testValidators from './validators.mjs'
import testWindowAdd from './window-add.mjs'
import testWindowSearch from './window-search.mjs'
import testPinnedTabs from './pinned-tabs.mjs'

export default function testStore( tap ) {
  tap.test( './store/helpers.mjs', testHelper )
  tap.test( './store/init.mjs', testInit )
  tap.test( './store/tab-activate.mjs', testTabActivate )
  tap.test( './store/tab-add.mjs', testTabAdd )
  tap.test( './store/tab-remove.mjs', testTabRemove )
  tap.test( './store/tab-move.mjs', testTabMove )
  tap.test( './store/validators.mjs', testValidators )
  tap.test( './store/window-add.mjs', testWindowAdd )
  tap.test( './store/window-search.mjs', testWindowSearch )
  tap.test( './store/pinned-tabs.mjs', testPinnedTabs )
  tap.end()
}
