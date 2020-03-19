<template>
  <div id="app">
    Hello World
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
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
