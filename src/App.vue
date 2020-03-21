<template>
  <div id="app">
    <h2>Day {{ day + 1 }}</h2>
    <Community />
    <Hospital />
    <br />
    <button @click='$store.dispatch("updateDecision")'>Decide</button>
  </div>
</template>

<script>
import Community from './components/Community'
import Hospital from './components/Hospital'

export default {
  name: 'App',
  components: {
    Community, Hospital,
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

button {
  font-size: 1.25em;
  margin-top: 20px;
}
</style>
