<template>
  <div id="end">
    <div class="content">
      <header>
        <h1>You saved {{ formatNumber(saved) }} lives and were able to avoid {{ formatNumber(avoided) }} cases.</h1>
        <p>This is a direct result of you and your community's efforts, who collectively went out an average of {{ average }} times per week:</p>
      </header>
      <Histogram v-bind="{type: 'all'}" />

      <p>Here's a closer look at the numbers:</p>
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

      <p>
        During this game, you only had control over 5% of the population. This means that your actions may appear to have little influence. However, this doesn’t mean that your choices have no influence. When
        <em>everyone</em> chooses to stay home as much as possible, the most infections are avoided. Slower infection rates mean that hospitals and first responders can better help the sickest members of our community.
      </p>
      <p>So, take a moment to share this game with your friends, family, and neighbors and work to flatten the curve, together.</p>
      <Share />
      <hr />
      <button @click="playAgain" class="playBtn">{{ $t('failed.buttonCta') }}</button>
    </div>

    <footer class="footnote">
      <p>METHODOLOGY</p>
      <Credits />
    </footer>
  </div>
</template>

<script>
import * as d3 from 'd3'
import Share from './Share'
import BarChart from './BarChart'
import LineChart from './LineChart'
import Histogram from './Histogram'
import Credits from './Credits'

export default {
  name: 'EndPage',
  props: ['onUpdate', 'ageGroups', 'colorsByHealth'],
  components: {
    BarChart,
    LineChart,
    Histogram,
    Share,
    Credits,
  },
  computed: {
    lastHealthStatus() {
      return _.last(this.$store.getters.dailyHealthStatus) || {}
    },
    saved() {
      if (!this.lastHealthStatus) return
      return Math.max(
        this.lastHealthStatus.worstAlternate[5] -
          this.lastHealthStatus.player[5] || 0,
        0
      )
    },
    avoided() {
      if (!this.lastHealthStatus) return
      return Math.max(
        this.lastHealthStatus.worstAlternate.total -
          this.lastHealthStatus.player.total,
        0
      )
    },
    average() {
      const mean = _.chain(this.$store.state.allDecisions)
        .map(d => d3.mean(d))
        .mean()
        .value()
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
#end {
  padding: 5rem 1.5rem 3rem 1.5rem;
}

.content {
  background: white;
  text-align: center;
  width: 100%;
  padding: 4rem;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  @include shadow;
}

header {
  position: relative;
  z-index: 1000;
  max-width: 450px;
  p {
    text-align: center;
  }
}

p {
  text-align: left;
  font-size: 1.25rem;
  line-height: 1.5;
}

hr {
  border: none;
  height: 3px;
  width: 32px;
  background: $primary;
  margin: 3rem 0;
  opacity: 0.7;
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

footer {
  margin: 0 auto;
}
</style>
