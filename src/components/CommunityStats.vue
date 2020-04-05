<template>
  <div id="communityStats">
    <header>
      <div>
        <h3 class="label">total cases</h3>
        <h4>{{ formatNumber(current.total) }}</h4>
      </div>
      <div>
        <h3 class="label">avoided cases</h3>
        <h4>{{ formatNumber(avoided) }}</h4>
      </div>
    </header>
    <div class="item" v-for="num in [4, 5, 1]">
      <h4>{{ formatNumber(current[num] || 0) }}</h4>
      <div>
        <h3 class="label">{{ healthStatus[num] }}</h3>
        <ProgressBar v-bind="{value: current[num], maxValue: current.total}" />
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import ProgressBar from './ProgressBar'

export default {
  name: 'CommunityStats',
  components: {
    ProgressBar,
  },
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
        .map(d => d.alternate.health)
        .countBy()
        .value()
      return {
        total: _.sumBy([1, 2, 3, 4, 5], d => alternate[d] || 0),
        ...alternate,
      }
    },
    avoided() {
      return Math.max(this.alternate.total - this.current.total, 0)
    },
  },
  methods: {
    formatNumber(number) {
      return d3.format(',')(number)
    },
  },
}
</script>

<style lang="scss" scoped>
#communityStats {
  padding: 1rem;
}

header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  h4 {
    margin: 0;
    font-size: 1.75rem;
  }
  h3 {
    margin-top: 0.25rem;
  }
}
.item {
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-gap: 1rem;
  // display: flex;
  // align-items: flex-start;
  // justify-content: center;
  // flex-direction: column;
  h3 {
    padding-bottom: 3px;
  }
  progress {
    margin-top: 4px;
  }
}
</style>