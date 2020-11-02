<script>
  import {
    bem,
  } from './helpers.mjs'

  import TabSearch from './TabSearch.vue'

  export default {
    name: 'sidebar-header',
    props: [ 'theme' ],
    components: {
      TabSearch,
    },
    methods: {
      bem,
      openOptionsPage() {
        window.background.openOptionsPage()
      },
    }
  }
</script>

<template>
  <div :class="[ bem( 'sidebar-header', { theme } ) ]" @click.right.prevent>
    <tab-search :theme="theme"></tab-search>
    <div :class="[ bem( 'button', { theme, 'color': 'ghost' } ), `sidebar-header__button-icon` ]" @click="openOptionsPage()">
      <svg class="button--color-ghost__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <path d="M15 7h-2.1a4.967 4.967 0 0 0-.732-1.753l1.49-1.49a1 1 0 0 0-1.414-1.414l-1.49 1.49A4.968 4.968 0 0 0 9 3.1V1a1 1 0 0 0-2 0v2.1a4.968 4.968 0 0 0-1.753.732l-1.49-1.49a1 1 0 0 0-1.414 1.415l1.49 1.49A4.967 4.967 0 0 0 3.1 7H1a1 1 0 0 0 0 2h2.1a4.968 4.968 0 0 0 .737 1.763c-.014.013-.032.017-.045.03l-1.45 1.45a1 1 0 1 0 1.414 1.414l1.45-1.45c.013-.013.018-.031.03-.045A4.968 4.968 0 0 0 7 12.9V15a1 1 0 0 0 2 0v-2.1a4.968 4.968 0 0 0 1.753-.732l1.49 1.49a1 1 0 0 0 1.414-1.414l-1.49-1.49A4.967 4.967 0 0 0 12.9 9H15a1 1 0 0 0 0-2zM5 8a3 3 0 1 1 3 3 3 3 0 0 1-3-3z"></path>
      </svg>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../styles/photon-colors";
  @import "../styles/photon-typography";

  .sidebar-header {
    @media (prefers-color-scheme: dark) {
      --sidebar-header--background-color: #323234;
      --sidebar-header__button--background-color: #323234;
      --sidebar-header__button--hover--background-color: #5b5b5d;
      --sidebar-header__separator--color: rgba(12, 12, 13, 0.8);
      --sidebar-header__text--color: #d0d0d0;
    }

    @media (prefers-color-scheme: light) {
      --sidebar-header--background-color: #f5f6f7;
      --sidebar-header__button--background-color: #f5f6f7;
      --sidebar-header__button--hover--background-color: #d0d0d0;
      --sidebar-header__separator--color: #cccccc;
      --sidebar-header__text--color: rgba(12, 12, 13, 0.8);
    }

    &.sidebar-header--theme-dark {
      --sidebar-header--background-color: #323234;
      --sidebar-header__button--background-color: #323234;
      --sidebar-header__button--hover--background-color: #5b5b5d;
      --sidebar-header__separator--color: rgba(12, 12, 13, 0.8);
      --sidebar-header__text--color: #d0d0d0;
    }

    &.sidebar-header--theme-light {
      --sidebar-header--background-color: #f5f6f7;
      --sidebar-header__button--background-color: #f5f6f7;
      --sidebar-header__button--hover--background-color: #d0d0d0;
      --sidebar-header__separator--color: #cccccc;
      --sidebar-header__text--color: rgba(12, 12, 13, 0.8);
    }
  }

  /* Helpers */

  %slow-transition {
    transition-duration: 250ms;
    transition-timing-function: cubic-bezier(.07,.95,0,1);
  }

  @mixin slow-transition {
    transition-duration: 250ms;
    transition-timing-function: cubic-bezier(.07,.95,0,1);
  }

  /* Action Strip */

  .sidebar-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: var( --sidebar-header--background-color );

    &__button {
      @extend %slow-transition;
      transition-property: background-color;
      flex: 1;
      display: flex;
      align-items: center;
      padding: 0 8px;
      height: 32px;
      cursor: pointer;

      &:hover {
        background-color: var( --sidebar-header__button--hover--background-color );
      }

      &--no-grow {
        flex: 0;
      }
    }

    &__button-text {
      padding-left: 4px;
      color: var( --sidebar-header__text--color );
    }

    &__button-icon {
      margin: 4px 4px 4px 0;
      fill: var( --sidebar-header__text--color );
    }

    &__spacer {
      flex: 1;
      height: 32px;
      background-color: var( --sidebar-header__separator--color );
    }
  }

  /* @todo should be moved to common css */
  .icon {
    height: 16px;
    width: 16px;
    margin-right: 4px;
  }
</style>
