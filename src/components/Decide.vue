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
          <span v-html="$tc('decide.prevTimes', prevWeekDecisions[0])" />,
          <span v-html="$t('decide.avgTimes', { count: avgTimes })" />
          <span
            v-html="
              $t('decide.newCasesTotal', {
                count: formatNumber(newCases.total),
              })
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
        <div class="decisions">
          <Decision
            v-for="activity in activities"
            v-bind="{ ...activity, updateDecision }"
          />
        </div>
        <button class="decideBtn mt3" @click="decided = true">
          {{ $t('decide.cta') }}
        </button>
      </div>
    </div>

    <!-- IF DECIDED, SHOW HISTOGRAM -->
    <div v-else>
      <div class="decided">
        <div>
          <h1 class="header">
          </h1>
          <p class="body">{{ $t('decide.rest') }}</p>
        </div>
        <div class="py-3" />
        <Beeswarm
          v-bind="{
            type: 'weekly',
            decisions,
            width: isPhone ? 340 : 700,
          }"
        />
        <button
          class="decideBtn startNextWeekBtn mt3"
          @click="onUpdate(decisions)"
        >
          {{ $t('decide.start') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'
import Decision from './Decision'
import Beeswarm from './Beeswarm'

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
    Decision,
    Beeswarm,
  },
  data() {
    return {
      activities: _.map(
        ['groceries', 'exercise', 'small', 'large'],
        (key, index) => {
          return {
            label: this.$t(`decide.activities.${key}.label`),
            byline: this.$t(`decide.activities.${key}.byline`),
            icon: require(`../assets/${images[key]}`),
            index,
          }
        }
      ),
      decisions: [0, 0, 0, 0, 0],
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
      return _.chain(this.prevWeekDecisions)
        .mean()
        .round(2)
    },
    newCases() {
      if (!this.dailyHealthStatus) return
      const today = this.dailyHealthStatus[this.day - 1]
      const lastWeek = this.dailyHealthStatus[this.day - 7]
      const total = today.player.total - lastWeek.player.total
      const alternateTotal =
        today.worstAlternate.total - lastWeek.worstAlternate.total
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
  @include respond-to('small') {
    z-index: 20;
    top: 0;
    align-items: flex-start;
  }
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
  font-size: 1.5rem;
  margin-bottom: 16px;
  margin-right: auto;
  margin-left: auto;
}
.content {
  width: 100%;
  height: 100%;
  max-width: 780px;
  font-size: 18px;
  line-height: 1.5;
  padding: 0 0.5rem;
  margin: auto;
}

.decisions {
  @include respond-to('small') {
    grid-template-columns: 1fr;
    grid-gap: 8px;
    padding: 0 8px;
  }
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
}

.decide {
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
}

.decided {
  @include respond-to('small') {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0 2rem;
  }

  height: 100%;
}

.startNextWeekBtn {
  @include respond-to('small') {
    position: fixed;
    bottom: 1rem;
  }
}

.decideBtn {
  background-color: $red;
  color: #fff;
  padding: 1rem 2rem;
  margin: 2rem auto;
  border: none;
  border-radius: 5px;
  box-shadow: 0 5px #d23658;
  &:hover {
    filter: brightness(0.9) contrast(1.2) saturate(0.9);
  }
}

h2 {
  font-size: 1.5rem;
  margin: 2rem 0 1.5rem;
}

h1,
.body {
  position: relative;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.75);
}
.py-3 {
  @include respond-to('small') {
    padding: 3rem 0;
  }
  padding: 1rem 0;
}
</style>
