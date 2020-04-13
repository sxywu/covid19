<template>
  <div id="app">
    <GamePlay v-bind="$data" />
    <LandingPage v-if='currentPage === "landing"' />
    <EndPage v-if='currentPage === "end"' />
    <FailedPage v-if='currentPage === "failed"' />
  </div>
</template>

<script>
import GamePlay from './components/GamePlay'
import LandingPage from './components/LandingPage'
import EndPage from './components/EndPage'
import FailedPage from './components/FailedPage'

export default {
  name: 'App',
  components: {
    GamePlay, LandingPage, EndPage, FailedPage,
  },
  data() {
    return {
      ageGroups: {
        '0': 'Under 19',
        '20': '20 to 39',
        '40': '40 to 59',
        '60': '60 to 79',
        '80': 'Over 80',
      },
      healthStatus: [
        'Uninfected',
        'Recovered',
        'Infected, asymptomatic',
        'Mild symptoms',
        'Severe symptoms',
        'Deceased',
      ],
      colorsByHealth: [
        '#e1e0ed',
        '#63cbe2',
        '#8f6dbd',
        '#fe8f55',
        '#fe476f',
        '#4b3b59',
      ],
    }
  },
  computed: {
    currentPage() {
      return this.$store.state.currentPage
    },
  },
  created() {
    this.$store.dispatch('getRawData')
  },
}
</script>

<style lang="scss">
*,
*:before,
*:after {
  box-sizing: border-box;
}
#app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text;
  padding: 2rem;
  padding-bottom: 5rem;
  background-color: $gray;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

button {
  font-size: 1.25em;
  margin-top: 20px;
}

.label {
  font-size: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin: 0;
}
</style>
