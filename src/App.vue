<template>
  <div id="app">
    <MainPage />
  </div>
</template>

<script>
import MainPage from './views/MainPage.vue'

export default {
  name: 'App',
  components: {
    MainPage
  }
}
</script>

<style lang="stylus">
body
  margin: 0
</style>
