<template>
  <body class="tab-groups" :class="theme">
    <TabGroupsSingleView></TabGroupsSingleView>
  </body>
</template>

<script>
import {
  onStateChange,
} from "./helpers.mjs"

import TabGroupsSingleView from "./TabGroupsSingleView.vue"

export default {
  name: "tab-groups",
  components: {
    TabGroupsSingleView
  },
  data() {
    return {
      theme: null
    }
  },
  created() {
    onStateChange( state => {
      this.theme = state.config.theme
    })
  }
}
</script>

<style>
body {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    margin: 0;
}

.app {
    color: #444;
    margin-top: 100px;
    max-width: 600px;
    font-family: Helvetica, sans-serif;
    text-align: center;
    display: flex;
    align-items: center;
}
</style>
