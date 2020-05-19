<template>
  <div id="end">
    <div class="content">
      <header>
        <h1>{{ $t('end.h1', {week}) }}</h1>
        <p>
          <span v-html="$t('end.numbers', {
            deaths: formatNumber(lastHealthStatus.player[5] || 0),
            saved: formatNumber(saved), percent,
          })"></span>  <span v-if="percentBetter" v-html="$t('end.otherTeams', {
            teamName,
            percentBetter,
          })"></span>
        </p>
      </header>
      <p>{{ $t('end.decisionsTogether') }}</p>
      <Beeswarm v-bind="{type: 'all', width: isPhone ? 300 : 700}" />
      <p>{{ $t('end.closerLook') }}</p>

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
      <Legend v-bind="{healthStatus, colorsByHealth, isMinimal: true}" />
      <hr />

      <p v-html="$t('end.together')"></p>
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
import Beeswarm from './Beeswarm'
import Footnotes from './Footnotes'
import Legend from './Legend'

export default {
  name: 'EndPage',
  props: ['isPhone', 'onUpdate', 'ageGroups', 'healthStatus', 'colorsByHealth'],
  components: {
    BarChart,
    Legend,
    LineChart,
    Beeswarm,
    Share,
    Footnotes,
  },
  computed: {
    teamName() {
      return this.$store.state.teamName
    },
    week() {
      return this.$store.state.totalWeeks
    },
    lastDay() {
      return this.$store.state.totalDays - 1
    },
    lastHealthStatus() {
      return this.$store.getters.dailyHealthStatus[this.lastDay] || {}
    },
    saved() {
      if (!this.lastHealthStatus) return
      return Math.max(
        this.lastHealthStatus.worstAlternate[5] -
          this.lastHealthStatus.player[5] || 0,
        0
      )
    },
    percent() {
      if (!this.lastHealthStatus) return
      const percent = 100 * _.clamp(
        this.saved / this.lastHealthStatus.worstAlternate[5],
        0, 1
      )
      return _.round(percent, 2)
    },
    percentBetter() {
      if (!this.teamName) return
      const otherTeamPercents = _.chain(this.$store.state.allTeams)
        .map(({dailyHealthStatus, teamName}) => {
          if (!dailyHealthStatus.length) return
          const {player, worstAlternate} = _.last(dailyHealthStatus)
          const saved = Math.max(worstAlternate[5] - player[5] || 0, 0)
          const percent = 100 * _.clamp(saved / worstAlternate[5], 0, 1)
          return _.round(percent, 2)
        }).filter(d => !_.isUndefined(d)).sortBy().value()
      let moreThan = 0
      _.some(otherTeamPercents, percent => {
        if (this.percent < percent) return true
        moreThan += 1
      })

      return _.round(100 * (moreThan / otherTeamPercents.length))
    },
    average() {
      const mean = _.chain(this.$store.getters.allDecisions)
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

  @include respond-to('small') {
    padding: 1rem;
  }
}

.content {
  background: white;
  text-align: center;
  width: 100%;
  padding: 4rem;
  max-width: 880px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  @include shadow;

  @include respond-to('small') {
    padding: 1rem 1.5rem;
  }
}

header {
  position: relative;
  z-index: 1000;
  max-width: 550px;
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

  @include respond-to('small') {
    grid-template-columns: 1fr;
  }
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
