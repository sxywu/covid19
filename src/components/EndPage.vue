<template>
  <div id="end">
    <div class="content">
      <h1 class="header">You saved {{ formatNumber(saved) }} lives and were able to avoid {{ formatNumber(avoided) }} cases.</h1>
      <p class="body">
        This is a direct result of you and your community's efforts, who collectively went out an average of {{ average }} times per week:
      </p>
      <Histogram v-bind="{type: 'all'}" />

      <p>
        Here's a closer look at the numbers:
      </p>
      <div class="charts">
        <BarChart
          v-bind="{
            height: 200,
            ageGroups,
            colorsByHealth,
          }"
        />
        <LineChart
          v-bind="{
            height: 200,
            ageGroups,
            colorsByHealth,
          }"
        />
      </div>
      <p class="body">
        During this game, you only had control over 5% of the population. This means that your actions may appear to have little influence. However, this doesn’t mean that your choices have no influence. When <em>everyone</em> chooses to stay home as much as possible, the most infections are avoided. Slower infection rates mean that hospitals and first responders can better help the sickest members of our community.
      </p>
      <p class="body">
        So, take a moment to share this game with your friends, family, and neighbors and work to flatten the curve, together.
      </p>
      <Share />
      <button @click="playAgain" class="playBtn">{{ $t('failed.buttonCta') }}</button>
    </div>

    <div class="footnote">
      <p>METHODOLOGY</p>
      <p>CREDITS</p>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import Share from './Share'
import BarChart from './BarChart'
import LineChart from './LineChart'
import Histogram from './Histogram'

export default {
  name: 'EndPage',
  props: ['onUpdate', 'ageGroups', 'colorsByHealth'],
  components: {
    BarChart,
    LineChart,
    Histogram,
    Share,
  },
  computed: {
    lastHealthStatus() {
      return _.last(this.$store.getters.dailyHealthStatus) || {}
    },
    saved() {
      if (!this.lastHealthStatus) return
      return Math.max(this.lastHealthStatus.worstAlternate[5] - this.lastHealthStatus.player[5] || 0, 0)
    },
    avoided() {
      if (!this.lastHealthStatus) return
      return Math.max(this.lastHealthStatus.worstAlternate.total - this.lastHealthStatus.player.total, 0)
    },
    average() {
      const mean = _.chain(this.$store.state.allDecisions)
        .map(d => d3.mean(d))
        .mean().value()
      return _.round(mean, 2)
    },
  },
  methods: {
    playAgain() {
      this.$store.dispatch('resetGame')
    },
    formatNumber(number) {
      return d3.format(',')(number)
    },
  },
}
</script>

<style lang="scss" scoped>
#failed {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
}

p {
  font-size: 1.25rem;
  line-height: 1.5;
}

.content {
  text-align: center;
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

h1, .body {
  z-index: 1000;
}

.charts {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
}

.playBtn {
  background-color: $red;
  color: #fff;
  padding: 1rem 2rem;
  margin: 1rem 0;
  border: none;
  border-radius: 5px;
  box-shadow: 0 5px #d23658;
  &:hover {
    filter: brightness(0.9) contrast(1.2) saturate(0.9);
  }
}
</style>
