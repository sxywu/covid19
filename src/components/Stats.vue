<template>
  <div id="stats">
    <div class='alternate' v-if='avoided'>
      <div v-if='saved'>{{ saved }} Lives SAVED</div>
      <div>{{ avoided }} Cases AVOIDED</div>
    </div>
    <div class='current'>
      <div>{{ current.total }} Total Cases</div>
      <!-- passed away -->
      <div v-if='current[5]'>{{ current[5] }} {{ healthStatus[5] }}</div>
      <!-- recovered -->
      <div v-if='current[1]'>{{ current[1] }} {{ healthStatus[1] }}</div>
    </div>
    <div class='inOrOut' v-if='infected'>
      {{ Math.round((inOrOut.in / infected.length) * 100) }}% stayed home
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'Stats',
  props: ['healthStatus'],
  computed: {
    infected() {
      return this.$store.getters.infected
    },
    current() {
      const current = _.countBy(this.infected, 'health')
      return {
        total: _.sumBy([1, 2, 3, 4, 5], d => current[d] || 0),
        ...current,
      }
    },
    alternate() {
      const alternate = _.chain(this.infected)
        .map(d => d.alternate.health).countBy().value()
      return {
        total: _.sumBy([1, 2, 3, 4, 5], d => alternate[d] || 0),
        ...alternate,
      }
    },
    saved() {
      return Math.max((this.alternate[5] || 0) - (this.current[5] || 0), 0)
    },
    avoided() {
      return Math.max(this.alternate.total - this.current.total, 0)
    },
    inOrOut() {
      return _.countBy(this.infected, ({destination}) => destination === -1 ? 'in' : 'out')
    },
  },
}
</script>

<style>
#stats {
}
</style>
