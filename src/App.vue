<template>
  <div id="app">
    <Community />
  </div>
</template>

<script>
import Community from './components/Community'

export default {
  name: 'App',
  components: {
    Community,
  },
  created() {
    this.$store.dispatch('setup')
  }
}
</script>

<style>
#app {
}
</style>
