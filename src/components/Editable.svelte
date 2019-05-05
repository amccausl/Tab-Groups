<script>
  export let value
  export let active

  import { onMount, tick } from 'svelte'

  let ref

  onMount( () => {
    ref.innerText = value
    if( active ) {
      tick( () => {
        ref.focus()
      })
    }

    // this.$on( "input", this.onInput )
	});

  function onClick( event ) {
    // Capture click only if active to prevent disrupting context
    if( this.active ) {
      event.stopPropagation()
    }
  }

  function onFocus() {
    // Select all text
    const range = document.createRange()
    range.selectNodeContents( ref )
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange( range )
  }

  function onBlur() {
    this.$emit( "input", ref.innerText.replace( /\n/g, "" ) )
    ref.parentElement.scrollLeft = 0
  }

  function onPressEnter() {
    ref.blur()
  }

  function onInput( value ) {
    ref.innerHTML = value
  }

  // watch: {
  //   active( active ) {
  //     if( active ) {
  //       // Wait for the active change to propagate and focus
  //       // Vue.nextTick( () => {
  //       //   ref.focus()
  //       // })
  //     }
  //   }
  // }
</script>

<style lang="sass">
.editable {
  white-space: nowrap;
  text-overflow: clip;

  &:focus {
    outline: none;
  }
}
</style>

<div bind:this={ ref } class="editable" contenteditable={ active } spellcheck="false" @focus="onFocus" @blur="onBlur" @keyup.enter.prevent="onPressEnter" @click="onClick">{ value }</div>
