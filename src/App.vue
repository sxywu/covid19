<template>
  <div id="app">
    <h2>
      {{ zipCode }}: {{ population.total }} residents<br />
      Day {{ day + 1 }}
    </h2>
    <Community />
    <Hospital />
    <br />
    <button @click='$store.commit("setDay", day + 1)'>Decide</button>
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
    zipCode() {
      return this.$store.state.zipCode
    },
    population() {
      return this.$store.getters.population || {}
    },
  },
  created() {
    this.$store.dispatch('getRawData')
    this.$store.commit('setZipCode', '94110')
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
