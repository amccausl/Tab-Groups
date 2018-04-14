<template>
  <div class="editable" :contenteditable="active" spellcheck="false" @focus="onFocus" @blur="onBlur" @keyup.enter.prevent="onPressEnter" @click="onClick"></div>
</template>

<script>
import Vue from "vue"

// https://vuejs.org/v2/guide/components.html#Form-Input-Components-using-Custom-Events

export default {
  name: "editable",
  props: {
    "value": {
      type: String,
      required: true
    },
    "active": {
      type: Boolean,
      default: true
    }
  },
  mounted() {
    this.$el.innerText = this.value
    if( this.active ) {
      Vue.nextTick( () => {
        this.$el.focus()
      })
    }

    this.$on( "input", this.onInput )
  },
  methods: {
    onClick( event ) {
      // Capture click only if active to prevent disrupting context
      if( this.active ) {
        event.stopPropagation()
      }
    },
    onFocus() {
      // Select all text
      const range = document.createRange()
      range.selectNodeContents( this.$el )
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange( range )
    },
    onBlur() {
      this.$emit( "input", this.$el.innerText.replace( /\n/g, "" ) )
      this.$el.parentElement.scrollLeft = 0
    },
    onPressEnter() {
      this.$el.blur()
    },
    onInput( value ) {
      this.$el.innerHTML = value
    }
  },
  watch: {
    active( active ) {
      if( active ) {
        // Wait for the active change to propagate and focus
        Vue.nextTick( () => {
          this.$el.focus()
        })
      }
    }
  }
}
</script>

<style lang="scss">

// @todo some of these properties should be moved into calling context
.editable {
  white-space: nowrap;
  text-overflow: clip;

  &:focus {
    outline: none;
  }
}

</style>
