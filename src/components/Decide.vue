<template>
  <div id="decideArea">
    <div>
      <h1 class="header">{{ $tc('decide.h1', week) }}</h1>
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

        <button @click="onUpdate(numTimes)" class="decideBtn mt3">{{ $t('decide.cta') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'
import ProgressBar from './ProgressBar'
import RangeSlider from 'vue-range-slider'
import '../styles/slider.scss'
const virusImage = require('../assets/virus.png')
const bedImage = require('../assets/bed.png')

export default {
  name: 'DecideArea',
  props: ['onUpdate'],
  components: {
    ProgressBar,
    RangeSlider,
  },
  data() {
    return {
      virusImage,
      bedImage,
      numTimes: 0,
      range: _.times(8, i => {
        return {
          value: i,
          label: this.$t(`decide.range.${i}`),
        }
      }),
    }
  },
  computed: {
    week() {
      return this.$store.getters.week
    },
    totalAvailableBeds() {
      return this.$store.getters.totalAvailableBeds
    },
    filledBeds() {
      return this.$store.getters.filledBeds
    },
    infected() {
      return this.$store.getters.infected
    },
    current() {
      const current = _.countBy(this.infected, 'health')
      return {
        total: _.sumBy([1, 2, 3, 4, 5], d => current[d] || 0),
        ...current,
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

.align-justify {
  text-align: justify;
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
</style>
