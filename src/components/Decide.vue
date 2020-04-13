<template>
  <div id="decideArea" class="mt85">
    <h1 class="header">{{ $t('decide.h1') }} {{ $tc('week', week) }}</h1>
    <div class="flex info mx justify-between">
      <div class="flex w100 mr1 virus-info">
        <img :src="virusImage" class="virus mr1" />
        <div class="flex w100 flex-column align-justify">
          <ProgressBar v-bind="{value: current[5], maxValue: current.total}" />
          <div class="mt2">
            <strong>{{ formatNumber(current[5] || 0) }}</strong>
            {{ $t('outOf') }}
            <strong>{{ formatNumber(current.total) }}</strong>
            {{ $t('decide.passedAway') }}
          </div>
        </div>
      </div>
      <div class="flex w100 bed-info">
        <img :src="bedImage" class="virus" />
        <div class="flex w100 flex-column align-justify">
          <ProgressBar
            v-bind="{value: filledBeds, maxValue: totalAvailableBeds}"
          />
          <div class="mt2">
            <strong>{{ formatNumber(filledBeds) }}</strong>
            {{ $t('decide.bedsOutOf') }}
            <strong>{{ formatNumber(totalAvailableBeds) }}</strong>
            {{ $t('available') }}
          </div>
        </div>
      </div>
    </div>
    <div class="mt3">
      <h2>{{ $t('decide.h2Question') }}</h2>
      <div class="numTimes">
        <div class="labels">
          <div v-for="({value}) in range" v-bind:key="value">
            <label for="range" v-if="value === +numTimes" style="font-weight: bold;">{{ value }}</label>
            <label for="range" v-if="value !== +numTimes">{{ value }}</label>
          </div>
        </div>
        <input type="range" min="0" max="7" v-model="numTimes" />
        <div class="labels">
          <div v-for="({value, label}) in range" v-bind:key="value">
            <label for="range" v-if="value <= numTimes" style="font-weight: bold;">{{ label }}</label>
            <label for="range" v-if="value > numTimes">{{ label }}</label>
          </div>
        </div>
      </div>

      <button @click="onUpdate(numTimes)" class="decideBtn mt3">
        {{ $t('decide.cta') }}
      </button>
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
      numTimes: 0,
      range: [
        {
          value: 0,
          label: '',
        },
        {
          value: 1,
          label: 'go for a walk',
        },
        {
          value: 2,
          label: '& buy groceries',
        },
        {
          value: 3,
          label: '& go for a run',
        },
        {
          value: 4,
          label: '& lunch with a friend',
        },
        {
          value: 5,
          label: '& dinner with family',
        },
        {
          value: 6,
          label: '& go to a house party',
        },
        {
          value: 7,
          label: '& go to a concert',
        },
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
@import '../styles/range';

#decideArea {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid $gray;
  background: rgba(255, 255, 255, 0.9);
  text-align: center;
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
  .labels {
    margin: 0 auto;
    max-width: 780px;
    justify-content: flex-start;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(8, 12.5%);
  }
}
</style>
