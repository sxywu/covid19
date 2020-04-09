<template>
  <div id="decideArea">
    <h1 class="header">You've been fighting the virus for {{ week }} week{{ week > 1 ? 's' : ''}}.</h1>
    <div class="flex info mx justify-between">
      <div class="flex w100 mr1 virus-info">
        <img :src="virusImage" class="virus mr1" />
        <div class="flex w100 flex-column align-justify">
          <ProgressBar v-bind="{value: current[5], maxValue: current.total}" />
          <div class="mt2">
            <strong>{{ formatNumber(current[5] || 0) }}</strong> out of
            <strong>{{ formatNumber(current.total) }}</strong> infected people have passed away
          </div>
        </div>
      </div>
      <div class="flex w100 bed-info">
        <img :src="bedImage" class="virus" />
        <div class="flex w100 flex-column align-justify">
          <ProgressBar v-bind="{value: filledBeds, maxValue: totalAvailableBeds}" />
          <div class="mt2">
            <strong>{{ formatNumber(filledBeds) }}</strong> beds are filled
            out of
            <strong>{{ formatNumber(totalAvailableBeds) }}</strong> available
          </div>
        </div>
      </div>
    </div>
    <div class="decide">
      <h2>What activities are you going to do next week?</h2>
      <div class="numTimes">
        <range-slider class="slider" min="0" max="6" v-model="numTimes" />
        <!-- <input type="range" min="0" max="7" v-model="numTimes" /> -->
        <div class="labels">
          <div v-for="(value) in range" v-bind:key="value">
            <label for="range" v-if="value === numTimes" style="font-weight: bold;">{{ value }}</label>
            <label for="range" v-if="value !== numTimes">{{ value }}</label>
          </div>
        </div>
        <!-- <div>(1) go for a walk AND (2) buy groceries AND (3) go for a run AND (4) lunch with a friend AND (5) dinner with family AND (6) go to a house party AND (7) go to a concert</div> -->
        <!-- <output for="range">{{ numTimes }}</output> -->
      </div>

      <button @click="onUpdate(numTimes)" class="decideBtn mt3">Start Next Week →</button>
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
      range: [
        'go for a walk',
        'buy groceries',
        'go for a run',
        'lunch with a friend',
        'dinner with family',
        'go to a house party',
        'go to a concert',
      ],
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
}

.header {
  margin-bottom: 30px;
  margin-right: auto;
  margin-left: auto;
}

.info {
  max-width: 800px;
}

.virus-info {
  max-width: 350px;
}

.bed-info {
  max-width: 350px;
}

.virus {
  width: auto;
  height: 50px;
}

.mx {
  margin: auto;
}

.mr1 {
  margin-right: 10px;
}

.mt2 {
  margin-top: 20px;
}

.flex {
  display: flex;
  flex-direction: row;
}

.flex-column {
  flex-direction: column;
}

.justify-between {
  justify-content: space-between;
}

.w100 {
  width: 100%;
}

.mw500 {
  max-width: 500px;
}

.mw600 {
  max-width: 600px;
}

.decide {
  margin: 4rem 0;
}

.decideBtn {
  margin-top: 4rem;
  background-color: $red;
  color: #fff;
  padding: 1rem 2rem;
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
  .labels {
    margin: 0 auto;
    max-width: 900px;
    justify-content: flex-start;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-gap: 10px;
    position: relative;
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
        content: '+';
        position: absolute;
        top: 8px;
        padding-left: 7.5rem;
      }
    }
  }
}
</style>
