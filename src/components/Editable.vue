<script>
  import { nextTick } from "vue"

  // https://vuejs.org/v2/guide/components.html#Form-Input-Components-using-Custom-Events

  export default {
    name: "editable",
    props: {
      "modelValue": {
        type: String,
        required: true
      },
      "active": {
        type: Boolean,
        default: true
      }
    },
    mounted() {
      this.$el.innerText = this.modelValue
      if( this.active ) {
        nextTick( () => {
          this.$el.focus()
        })
      }
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
        const value = this.$el.innerText.replace( /\n/g, "" )
        this.$emit( "update:modelValue", value )
        this.$el.innerHTML = value
        this.$el.parentElement.scrollLeft = 0
      },
      onPressEnter() {
        this.$el.blur()
      },
    },
    watch: {
      active( active ) {
        if( active ) {
          // Wait for the active change to propagate and focus
          nextTick( () => {
            this.$el.focus()
          })
        }
      }
    }
  }
</script>

<template>
  <div class="editable" :contenteditable="active" spellcheck="false" @focus="onFocus" @blur="onBlur" @keyup.enter.prevent="onPressEnter" @click="onClick"></div>
</template>

<style lang="scss">
  /* @todo some of these properties should be moved into calling context */
  .editable {
    white-space: nowrap;
    text-overflow: clip;

    &:focus {
      outline: none;
    }
  }
</style>
