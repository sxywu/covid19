<template>
  <div id="app">
    <h2>
      {{ zipCode }}: {{ population.total }} residents<br />
      Day {{ day + 1 }}
    </h2>
    <div>
      <Community v-bind='{colorsByHealth}' />
      <Hospital />
    </div>
    <button @click='$store.commit("setDay", day + 1)'>Decide</button>
    <div>
      <BarChart v-bind='{ageGroups, healthStatus, colorsByHealth}' />
      <AreaChart v-bind='{ageGroups, healthStatus, colorsByHealth}' />
    </div>
  </div>
</template>

<script>
import Community from './components/Community'
import Hospital from './components/Hospital'
import BarChart from './components/BarChart'
import AreaChart from './components/AreaChart'

export default {
  name: 'App',
  components: {
    Community, Hospital, BarChart, AreaChart,
  },
  data() {
    return {
      ageGroups: {
        '<19': 'Under 19',
        '20': '20 to 39',
        '40': '40 to 59',
        '60': '60 to 79',
        '>80': 'Over 80',
      },
      healthStatus: [
        'Healthy', 'Recovered', 'Infected, asymptomatic',
        'Mild symptoms', 'Severe symptoms', 'Deceased',
      ],
      colorsByHealth: [
        '#ffdd00', '#0a911e', '#5a0d91',
        '#e37419', '#910a0a', '#333'
      ]
    }
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
