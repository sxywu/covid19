<template>
  <div id="decideArea">
    <!-- IF THIS IS EIGHT WEEK -->
    <div v-if="day === totalDays">
      <h1 class="header">{{ $t('decide.h1.8weeks') }}</h1>
      <div class="content">
        <div v-html="$t('decide.businessAsUsual')"></div>
        <button class="decideBtn" @click="continueGame(true)">
          {{ $t('decide.start4weeks') }}
        </button>
        <div>
          <a @click="continueGame(false)">
            {{ $t('decide.finish') }}
          </a>
        </div>
      </div>
    </div>
    <!-- ALL OTHER WEEKS -->
    <div v-else-if="!decided">
      <h1 class="header">{{ $tc('decide.h1.prevWeek', week) }}</h1>
      <div class="content">
        <p v-if="newCases">
          <span v-html="
            $tc('decide.prevTimes', prevWeekDecisions[0])
          "/>, <span v-html="
            $t('decide.avgTimes', {count: avgTimes})
          "/> <span
            v-html="
              $t('decide.newCasesTotal', { count: formatNumber(newCases.total) })
            "
          />{{ newCases.avoided ? ',' : '.' }}
          <span
            v-if="newCases.avoided"
            v-html="
              $t('decide.newCasesAvoided', {
                count: formatNumber(newCases.avoided),
              })
            "
          />
        </p>
      </div>
      <!-- DECISION -->
      <div class="decide">
        <h2>{{ $t('decide.h2Question') }}</h2>
        <Decision v-for="activity in activities" v-bind="{ ...activity, updateDecision }" />
        <button class="decideBtn mt3" @click="decided = true">
          {{ $t('decide.cta') }}
        </button>
      </div>
    </div>

    <!-- IF DECIDED, SHOW HISTOGRAM -->
    <div v-else>
      <h1 class="header">
        {{ $tc('decide.h1.numTimes', numTimes, { count: numTimes }) }}.
      </h1>
      <p class="body">{{ $t('decide.rest') }}</p>
      <Histogram v-bind="{
        type: 'weekly', numTimes: numTimes,
        width: isPhone ? 340 : 700 }"
      />
      <button class="decideBtn mt3" @click="onUpdate(numTimes)">
        {{ $t('decide.start') }}
      </button>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'
import Decision from './Decision'
import Histogram from './Histogram'

const images = {
  groceries: 'groceries.svg',
  exercise: 'exercise.png',
  small: 'small-gathering.svg',
  large: 'large-gathering.svg',
}
export default {
  name: 'DecideArea',
  props: ['isPhone', 'onUpdate', 'continueGame', 'ageGroups', 'colorsByHealth'],
  components: {
    Decision, Histogram,
  },
  data() {
    return {
      numTimes: 0,
      activities: _.map([
        'groceries', 'exercise', 'small', 'large',
      ], (key, index) => {
        return {
          label: this.$t(`decide.activities.${key}.label`),
          byline: this.$t(`decide.activities.${key}.byline`),
          icon: require(`../assets/${images[key]}`),
          index,
        }
      }),
      decisions: [0, 0, 0, 0],
      decided: false,
    }
  },
  computed: {
    day() {
      return this.$store.state.day
    },
    totalDays() {
      return this.$store.state.totalDays
    },
    week() {
      return this.$store.getters.week
    },
    foodStatus() {
      return this.$store.state.foodStatus
    },
    exerciseStatus() {
      return this.$store.state.exerciseStatus
    },
    dailyHealthStatus() {
      return this.$store.getters.dailyHealthStatus
    },
    prevWeekDecisions() {
      return _.map(this.$store.state.allDecisions, d => d[this.week - 1])
    },
    avgTimes() {
      return _.chain(this.prevWeekDecisions).mean().round(2)
    },
    newCases() {
      if (!this.dailyHealthStatus) return
      const today = this.dailyHealthStatus[this.day - 1]
      const lastWeek = this.dailyHealthStatus[this.day - 7]
      const total = today.player.total - lastWeek.player.total
      const alternateTotal = today.worstAlternate.total - lastWeek.worstAlternate.total
      return {
        total,
        avoided: Math.max(alternateTotal - total, 0),
      }
    },
  },
  methods: {
    updateDecision(count, index) {
      this.decisions[index] = count
    },
    formatNumber(number) {
      return d3.format(',')(number)
    },
  },
}
</script>

<style lang="scss" scoped>
#decideArea {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid $gray;
  background: rgba(255, 255, 255, 0.95);
  text-align: center;
}

.header {
  margin-bottom: 30px;
  margin-right: auto;
  margin-left: auto;
}
.content {
  width: 100%;
  max-width: 520px;
  font-size: 18px;
  line-height: 1.5;
  padding: 0 0.5rem;
  margin: auto;
}

.decideBtn {
  background-color: $red;
  color: #fff;
  padding: 1rem 2rem;
  margin: 2rem 0;
  border: none;
  border-radius: 5px;
  box-shadow: 0 5px #d23658;
  &:hover {
    filter: brightness(0.9) contrast(1.2) saturate(0.9);
  }
}

h2 {
  margin: 2rem 0;
}

h1,
.body {
  position: relative;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.75);
}
</style>
