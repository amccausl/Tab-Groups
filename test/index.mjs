import tap from 'tap'

import testComponents from './components/index.mjs'
import testIntegations from './integrations/index.mjs'
import testStore from './store/index.mjs'

tap.test( './components', testComponents )
tap.test( './integrations', testIntegations )
tap.test( './store', testStore )
