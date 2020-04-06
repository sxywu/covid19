<template>
  <div id="decideArea" class="mt85">
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
    <div class="mt3">
      <h2>How many times will you go out this week?</h2>
      <div class="numTimes">
        <input type="range" min="0" max="7" v-model="numTimes" />
        <div class="labels">
          <div v-for="(value) in range" v-bind:key="value">
            <label for="range" v-if="value === numTimes" style="font-weight: bold;">{{ value }}</label>
            <label for="range" v-if="value !== numTimes">{{ value }}</label>
          </div>
        </div>
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
const virusImage = require('../assets/virus.png')
const bedImage = require('../assets/bed.png')

export default {
  name: 'DecideArea',
  props: ['onUpdate'],
  components: {
    ProgressBar,
  },
  data() {
    return {
      virusImage,
      bedImage,
      numTimes: 2,
      range: ['0', '1', '2', '3', '4', '5', '6', '7'],
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
@import '../styles/range';

#decideArea {
  width: 100%;
  height: 100%;
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

.mt85 {
  margin-top: 85px;
}

.mt2 {
  margin-top: 20px;
}

.mt3 {
  margin-top: 30px;
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

.decideBtn {
  background-color: #393939;
  color: #fff;
  padding: 10px 30px;
  border: none;
  border-radius: 5px;
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
    max-width: 550px;
    justify-content: flex-start;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(8, 12.5%);
  }
}
</style>
