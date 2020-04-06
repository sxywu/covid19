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
    <div class="bars">
      <div class="item" v-for="num in [4, 5, 1]" v-bind:key="num">
        <h3 class="label">{{ healthStatus[num] }}</h3>
        <div class="value">
          <h4 style="margin-right: 10px;">{{ formatNumber(current[num] || 0) }}</h4>
          <ProgressBar v-bind="{value: current[num], maxValue: current.total}" />
        </div>
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
}

header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  border-bottom: 1px solid $gray;
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
.bars {
  border-bottom: 1px solid $gray;
  padding-bottom: 0.5rem;
}
.item {
  padding: 0.5rem 1rem;
  // display: grid;
  // grid-gap: 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 0.25rem;
  .value {
    width: 100%;
    display: grid;
    align-items: center;
    grid-template-columns: 20% auto;
  }
  h4 {
    margin: 0;
    padding: 0;
  }
  h3 {
    margin-bottom: 5px;
  }
  progress {
    margin-top: 4px;
  }
}
</style>
