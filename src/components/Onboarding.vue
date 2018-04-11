<template>
  <body :class="[ `onboarding`, `onboarding--${ theme }` ]">
    <div class="onboarding__aside onboarding-tasks-list">
      <h3 class="onboarding-tasks-list__header">Let’s get started</h3>
      <div class="onboarding-tasks-list__items-container">
        <div class="onboarding-tasks-list__item">
          <span class="onboarding-tasks-list__item-text">The Introduction</span>
        </div>
        <div class="onboarding-tasks-list__item">
          <span class="onboarding-tasks-list__item-text">The Presenter</span>
        </div>
        <div class="onboarding-tasks-list__item">
          <span class="onboarding-tasks-list__item-text">The Researcher</span>
        </div>
        <div class="onboarding-tasks-list__item">
          <span class="onboarding-tasks-list__item-text">FAQ</span>
        </div>
      </div>
    </div>
    <div class="onboarding__main page">
      <h1 class="page__title">Welcome</h1>
      <p class="page__text">This is the onboarding</p>
    </div>
  </body>
</template>

<script>
import Vue from "vue"

import {
  bem,
  onStateChange,
} from "./helpers.mjs"

export default {
  name: "onboarding",
  components: {
  },
  data() {
    return {
      window_id: window.current_window_id,
      context_styles: {},
      show_tabs: true,
      show_tabs_count: true,
      show_pinned_tabs: true,
      show_tab_context: true,
      show_tab_icon_background: true,
      theme: null
    }
  },
  created() {
    document.title = window.background.getMessage( "onboarding_title" )

    onStateChange( state => {
      // @todo move to helper
      this.theme = ( state.config.theme === "dark" ? "dark" : "light" )
      this.show_tabs_count = state.config.show_tabs_count
      this.show_tabs = state.config.show_tabs
      this.show_pinned_tabs = this.show_tabs && state.config.show_pinned_tabs
      this.show_tab_context = this.show_tabs && state.config.show_tab_context
      this.show_tab_icon_background = this.show_tabs && state.config.show_tab_icon_background

      for( let context_id in state.contexts || {} ) {
        this.context_styles[ context_id ] = {
          "background-color": state.contexts[ context_id ].color
        }
      }
    })
  },
  computed: {
  },
  filters: {
  },
  methods: {
    bem,
  }
}
</script>

<style lang="scss">
@import "../styles/photon";

.onboarding {
  display: flex;
  flex-direction: row;

  &__aside {
    flex: 1
  }

  &__main {
    flex: 2
  }
}

.onboarding-tasks-list {
  &__header {
    @extend %text-title-30;
  }

  &__items-container {
    display: flex;
    flex-direction: column;
  }

  &__item {
  }

  &__item-text {
  }
}

.page {
  &__title {
    @extend %text-display-20;
  }

  &__text {
    @extend %text-body-10;
  }
}

</style>
