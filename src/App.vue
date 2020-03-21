<template>
  <div id="app">
    <h2>Day {{ day + 1 }}</h2>
    <Community />
    <button @click='$store.dispatch("updateDecision")'>Decide</button>
  </div>
</template>

<script>
import Community from './components/Community'

export default {
  name: 'App',
  components: {
    Community,
  },
  computed: {
    day() {
      return this.$store.state.day
    },
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
