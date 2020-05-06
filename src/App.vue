<template>
  <div id="app">
    <GamePlay v-bind="$data" v-show="currentPage === 'game'" />
    <LandingPage v-bind="$data" v-if="currentPage === 'landing'" />
    <EndPage v-bind="$data" v-if="currentPage === 'end'" />
    <FailedPage v-bind="$data" v-if="currentPage === 'failed'" />
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
    GamePlay,
    LandingPage,
    EndPage,
    FailedPage,
  },
  data() {
    return {
      isPhone: isMobile.phone,
      ageGroups: {
        '0': this.$t('ageGroups.0'),
        '20': this.$t('ageGroups.20'),
        '40': this.$t('ageGroups.40'),
        '60': this.$t('ageGroups.60'),
        '80': this.$t('ageGroups.80'),
      },
      healthStatus: [
        this.$t('healthStatus.healthy'),
        this.$t('healthStatus.recovered'),
        this.$t('healthStatus.infectedAsymptomatic'),
        this.$t('healthStatus.mildSymptoms'),
        this.$t('healthStatus.severeSymptoms'),
        this.$t('healthStatus.deceased'),
      ],
      activities: [
        this.$t('activities.food'),
        this.$t('activities.exercise'),
        this.$t('activities.small'),
        this.$t('activities.large'),
      ],
      colorsByHealth: [
        '#B8D7E1',
        '#3BB2CA',
        '#815FAE',
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
    this.$store.commit('setCountry')
    this.$store.dispatch('getRawData')
    this.$store.dispatch('getPastGames')
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

a {
  text-decoration: none;
  border-bottom: 1px solid;
  color: inherit;
  cursor: pointer;
}
a:hover {
  border-bottom: 1px dashed;
}
</style>
