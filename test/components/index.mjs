
import testDroppable from './droppable.mjs'

export default function testComponents( tap ) {
  tap.test( './components/droppable.mjs', testDroppable )
  tap.end()
}
