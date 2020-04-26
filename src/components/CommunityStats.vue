<template>
  <div id="communityStats" :class="$mq">
    <header>
      <div>
        <h3 class="label">{{ $t('communityStats.total') }}</h3>
        <h4>{{ formatNumber(total) }}</h4>
      </div>
      <div>
        <h3 class="label">{{ $t('communityStats.avoided') }}</h3>
        <h4>{{ formatNumber(avoided) }}</h4>
      </div>
    </header>
    <!-- ONLY ON DESKTOP -->
    <div class="bars" v-if="!isPhone">
      <div class="item" v-for="({label, value, maxValue, color}) in items" v-bind:key="label">
        <h3 class="label">{{ label }}</h3>
        <div class="value">
          <h4 style="margin-right: 10px;">{{ formatNumber(value) }}</h4>
          <ProgressBar v-bind="{value, maxValue, color}" />
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
    'isPhone',
    'colorsByHealth',
    'healthStatus',
    'tl',
    'phases',
    'playTimeline',
  ],
  data() {
    return {
      total: 0,
      avoided: 0,
      items: [],
    }
  },
  computed: {
    day() {
      return this.$store.state.day
    },
    duration() {
      return _.sum(this.phases)
    },
    stats() {
      return _.last(this.$store.getters.dailyHealthStatus)
    },
  },
  watch: {
    day() {
      if (this.day === 1) {
        this.resetNumbers()
      }
    },
    stats() {
      this.animateNumbers()
    },
  },
  methods: {
    resetNumbers() {
      this.total = 0
      this.avoided = 0

      if (this.isPhone) return

      // ONLY ON DESKTOP
      this.items = _.map([4, 5, 1], num => {
        return {
          color: this.colorsByHealth[num],
          label: this.healthStatus[num],
          value: 0,
          maxValue: 0,
          num,
        }
      })
    },
    animateNumbers() {
      if (!this.stats) return
      const {player, worstAlternate} = this.stats

      this.tl.to(this.$data, {
        total: player.total,
        avoided: Math.max(worstAlternate.total - player.total, 0),
        duration: this.duration,
      }, `day${this.day}`)

      // ONLY ON DESKTOP
      if (!this.isPhone) {
        this.tl.to(this.items, {
          value: (i, {num}) => player[num] || 0,
          maxValue: player.total,
          duration: this.duration,
        }, `day${this.day}`)
      }

      this.playTimeline('stats')
    },
    formatNumber(number) {
      return d3.format(',')(Math.round(number))
    },
  },
}
</script>

<style lang="scss" scoped>
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
    font-variant-numeric: tabular-nums;
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
    grid-template-columns: 25% auto;
  }
  h4 {
    margin: 0;
    padding: 0;
    font-variant-numeric: tabular-nums;
  }
  h3 {
    margin-bottom: 5px;
  }
  progress {
    margin-top: 4px;
  }
}

.sm {
  header {
    padding: 0.25rem;
    margin: 0;
    border-top: 1px solid $gray;
    border-bottom: 0;

    h4 {
      font-size: 1.5rem;
    }
  }
}
</style>
