<template>
  <div id="decideArea">
    <div v-if="!decided">
      <h1 class="header">{{ $tc('decide.h1.week', week) }}</h1>
      <div class="content">
        <p v-if="foodStatus.value < 7 && exerciseStatus.value < 2">
          {{ $t('decide.bothLow') }}
        </p>
        <p v-else-if="foodStatus.value < 7">{{ $t('decide.foodLow') }}</p>
        <p v-else-if="exerciseStatus.value < 2">{{ $t('decide.exerciseLow') }}</p>
        <div class="statusBars">
          <!-- STATUS BARS -->
          <div class="item">
            <img src="../assets/food.svg" />
            <div class="item-content">
              <h3 class="label">{{ $t('food') }}</h3>
              <ProgressBar v-bind="foodStatus" />
            </div>
          </div>
          <div class="item">
            <img src="../assets/exercise.svg" />
            <div class="item-content">
              <h3 class="label">{{ $t('exercise') }}</h3>
              <ProgressBar v-bind="exerciseStatus" />
            </div>
          </div>
        </div>
        <!-- LINE CHART -->
        <p v-if='newCases'>
          <span v-html="$t('decide.newCasesTotal', {count: formatNumber(newCases.total)})" />{{ newCases.avoided ? "," : "."}}
          <span v-if="newCases.avoided" v-html="$t('decide.newCasesAvoided', {count: formatNumber(newCases.avoided)})" />
        </p>
        <LineChart
          v-bind="{
            height: 200,
            ageGroups,
            colorsByHealth,
          }"
        />
      </div>
      <!-- DECISION -->
      <div class="decide">
        <h2>{{ $t('decide.h2Question') }}</h2>
        <div class="numTimes">
        <div class="times">
          <label v-for="({value}) in range" for="range" :key="value"
            :style="{fontWeight: value === +numTimes ? 'bold' : ''}">
            {{ value }}
          </label>
        </div>
          <range-slider class="slider" min="0" max="7" v-model="numTimes" />
          <div class="labels">
            <div v-for="({value, label}) in range" :key="value">
              <label for="range" :style="{fontWeight: value <= +numTimes ? 'bold' : ''}">
                {{ label }}
              </label>
            </div>
          </div>
        </div>

        <button class="decideBtn mt3" @click="decided = true">{{ $t('decide.cta') }}</button>
      </div>
    </div>

    <div v-else>
      <h1 class="header">{{ $tc('decide.h1.numTimes', numTimes, {count: numTimes}) }}.</h1>
      <p class="body">{{ $t('decide.rest') }}</p>
      <Histogram v-bind="{type: 'weekly'}" />
      <button class="decideBtn mt3" @click="onUpdate(numTimes)" >{{ $t('decide.start') }}</button>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'
import LineChart from './LineChart'
import Histogram from './Histogram'
import ProgressBar from './ProgressBar'
import RangeSlider from 'vue-range-slider'
import '../styles/slider.scss'

export default {
  name: 'DecideArea',
  props: ['onUpdate', 'ageGroups', 'colorsByHealth'],
  components: {
    LineChart,
    Histogram,
    ProgressBar,
    RangeSlider,
  },
  data() {
    return {
      numTimes: 0,
      range: _.times(8, i => {
        return {
          value: i,
          label: this.$t(`decide.range.${i}`),
        }
      }),
      decided: false,
    }
  },
  computed: {
    day() {
      return this.$store.state.day
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
    newCases() {
      if (!this.dailyHealthStatus) return
      const today = this.dailyHealthStatus[this.day - 1]
      const lastWeek = this.dailyHealthStatus[this.day - 7]
      return {
        total: today.player.total - lastWeek.player.total,
        avoided: today.worstAlternate.total - lastWeek.worstAlternate.total,
      }
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

.decide {
  margin: 4rem 0;
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

.content {
  width: 600px;
  margin: auto;
}

.statusBars {
  text-align: center;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.item {
  padding: 1rem;
  display: flex;
  flex-direction: row;
  align-items: center;
}
.item-content {
  margin-left: 0.75rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  h3 {
    padding-bottom: 3px;
  }
  progress {
    margin-top: 4px;
  }
}

.numTimes {
  margin: 0 auto;
  display: flex;
  flex-direction: column;


  .times, .labels {
    margin: 0 auto;
    max-width: 900px;
    justify-content: flex-start;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-gap: 15px;
    position: relative;
    grid-template-columns: repeat(8, 1fr);
  }

  .labels {
    label {
      font-weight: 500;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-top: 0.5rem;
    }
    label::before {
      content: '';
      position: absolute;
      border: 2px solid white;
      width: 14px;
      height: 14px;
      top: -17px;
      border-radius: 50%;
      background: $primary;
      pointer-events: none;
    }
    :not(:last-of-type) {
      label::after {
        content: '&';
        position: absolute;
        top: 8px;
        padding-left: 7.5rem;
      }
    }
  }
}

h1, .body {
  z-index: 1000;
}
</style>
