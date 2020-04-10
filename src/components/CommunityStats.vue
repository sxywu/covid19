<template>
  <div id="communityStats">
    <header>
      <div>
        <h3 class="label">total cases</h3>
        <h4>{{ formatNumber(total) }}</h4>
      </div>
      <div>
        <h3 class="label">avoided cases</h3>
        <h4>{{ formatNumber(avoided) }}</h4>
      </div>
    </header>
    <div class="bars">
      <div class="item" v-for="({label, value, maxValue}) in items" v-bind:key="label">
        <h3 class="label">{{ label }}</h3>
        <div class="value">
          <h4 style="margin-right: 10px;">{{ formatNumber(value) }}</h4>
          <ProgressBar v-bind="{value, maxValue}" />
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
  props: [
    'healthStatus',
    'tl',
    'phases',
    'playTimeline',
  ],
  data() {
    return {
      total: 0,
      avoided: 0,
      items: _.map([4, 5, 1], num => {
        return {
          label: this.healthStatus[num],
          value: 0,
          maxValue: 0,
          num,
        }
      }),
    }
  },
  computed: {
    day() {
      return this.$store.state.day
    },
    infected() {
      return this.$store.getters.infected
    },
    duration() {
      return _.sum(this.phases)
    },
  },
  watch: {
    infected() {
      this.calculateNumbers()
      this.animateNumbers()
    },
  },
  methods: {
    calculateNumbers() {
      const current = _.countBy(this.infected, 'health')
      this.current = {
        total: _.sumBy([1, 2, 3, 4, 5], d => current[d] || 0),
        ...current,
      }
      const alternate = _.chain(this.infected)
        .map(d => d.alternate.health)
        .countBy()
        .value()
      this.alternate = {
        total: _.sumBy([1, 2, 3, 4, 5], d => alternate[d] || 0),
        ...alternate,
      }
    },
    animateNumbers() {
      this.tl.to(this.$data, {
        total: this.current.total,
        avoided: Math.max(this.alternate.total - this.current.total, 0),
        duration: this.duration,
      }, `day${this.day}`)

      this.tl.to(this.items, {
        value: (i, {num}) => this.current[num] || 0,
        maxValue: this.current.total,
        duration: this.duration,
      }, `day${this.day}`)
    },
    formatNumber(number) {
      return d3.format(',')(Math.round(number))
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
