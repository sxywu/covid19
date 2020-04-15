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
            <label
              v-for="({value}) in range"
              for="range"
              :key="value"
              :style="{fontWeight: value === +numTimes ? 'bold' : ''}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <g fill="none" fill-rule="evenodd" transform="translate(4)">
                  <path
                    fill="#000"
                    fill-rule="nonzero"
                    d="M12,31.826087 C12.1383625,31.826087 12.2710473,31.7710692 12.3688696,31.6732174 C12.8436522,31.2 24,19.9513043 24,12.0521739 C24,4.50730435 17.8987826,0 12,0 C6.10121739,0 0,4.50730435 0,12.0521739 C0,19.9513043 11.1563478,31.2 11.6311304,31.6732174 C11.7289527,31.7710692 11.8616375,31.826087 12,31.826087 Z"
                  />
                  <text
                    fill="#FFF"
                    font-size="15"
                    :style="{fontWeight: value === +numTimes ? 'bold' : ''}"
                    letter-spacing="-.361"
                  >
                    <tspan x="7.5" y="18">{{ value }}</tspan>
                  </text>
                </g>
              </svg>
            </label>
          </div>
          <range-slider class="slider" min="0" max="7" v-model="numTimes" />
          <div class="labels">
            <div v-for="({value, label}) in range" :key="value">
              <label for="range" :style="{fontWeight: value <= +numTimes ? 'bold' : ''}">{{ label }}</label>
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

h2 {
  margin-bottom: 3rem;
}

.numTimes {
  margin: 0 auto 1rem auto;
  display: flex;
  flex-direction: column;
  .times,
  .labels {
    margin: 0 auto;
    max-width: 988px;
    justify-content: flex-start;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-gap: 15px;
    position: relative;
  }

  .labels {
    label {
      font-weight: 500;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-top: 0.5rem;
      font-size: 14px;
      position: relative;
    }
    :not(:first-of-type):not(:last-of-type) {
      label::before {
        content: '';
        position: absolute;
        width: 2px;
        height: 24px;
        top: -24px;
        pointer-events: none;
        background: white;
      }
      label::after {
        content: '&';
        position: absolute;
        padding-left: 7.5rem;
      }
    }
  }
}

h1, .body {
  z-index: 1000;
}
</style>
