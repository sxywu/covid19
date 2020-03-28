<template>
  <div id="app">
    <GamePlay v-bind='$data' />
  </div>
</template>

<script>
import GamePlay from './components/GamePlay'

export default {
  name: 'App',
  components: {
    GamePlay,
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
