<template>
  <div id="gameplay">
    <h2>
      {{ zipCode }}: {{ population.total }} residents<br />
      Day {{ day + 1 }}
    </h2>
    <div>
      <Community v-bind='{colorsByHealth}' />
      <Hospital />
    </div>
    <p>
      <button @click='$store.commit("setDay", day + 1)'>Decide</button>
    </p>
    <div>
      <BarChart v-bind='$props' />
      <AreaChart v-bind='$props' />
    </div>
  </div>
</template>

<script>
import Community from './Community'
import Hospital from './Hospital'
import BarChart from './BarChart'
import AreaChart from './AreaChart'

export default {
  name: 'GamePlay',
  components: {
    Community, Hospital, BarChart, AreaChart,
  },
  props: ['ageGroups', 'healthStatus', 'colorsByHealth'],
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
}
</script>

<style>
#gameplay {
}

button {
  font-size: 1.25em;
  margin-top: 20px;
}
</style>
