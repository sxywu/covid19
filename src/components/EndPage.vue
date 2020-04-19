<template>
  <div id="end">
    <div class="content">
      <header>
        <h1>{{ $t('end.h1', {saved, avoided}) }}</h1>
        <p>{{ $t('end.average', {average}) }}</p>
      </header>
      <Histogram v-bind="{type: 'all', width: 700}" />

      <p>{{ $t('end.closerLook') }}</p>
      <div class="charts">
        <BarChart
          v-bind="{
            width: 280,
            height: 200,
            ageGroups,
            colorsByHealth,
          }"
        />
        <LineChart
          v-bind="{
            width: 320,
            height: 200,
            ageGroups,
            colorsByHealth,
          }"
        />
      </div>

      <p v-html="$t('end.influence')"></p>
      <p v-html="$t('end.share')"></p>
      <Share />
      <hr />
      <button @click="playAgain" class="playBtn">{{ $t('failed.buttonCta') }}</button>
    </div>

    <footer id="footnote">
      <Footnotes />
    </footer>
  </div>
</template>

<script>
import * as d3 from 'd3'
import Share from './Share'
import BarChart from './BarChart'
import LineChart from './LineChart'
import Histogram from './Histogram'
import Footnotes from './Footnotes'

export default {
  name: 'EndPage',
  props: ['onUpdate', 'ageGroups', 'colorsByHealth'],
  components: {
    BarChart,
    LineChart,
    Histogram,
    Share,
    Footnotes,
  },
  computed: {
    lastHealthStatus() {
      return _.last(this.$store.getters.dailyHealthStatus) || {}
    },
    saved() {
      if (!this.lastHealthStatus) return
      const saved = Math.max(
        this.lastHealthStatus.worstAlternate[5] -
          this.lastHealthStatus.player[5] || 0,
        0
      )
      return this.formatNumber(saved)
    },
    avoided() {
      if (!this.lastHealthStatus) return
      const avoided = Math.max(
        this.lastHealthStatus.worstAlternate.total -
          this.lastHealthStatus.player.total,
        0
      )
      return this.formatNumber(avoided)
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
</style>
