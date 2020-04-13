<template>
  <div id="decideArea">
    <div>
      <h1 class="header">{{ $t('decide.h1') }} {{ $tc('week', week) }}</h1>
      <div class="mt3">
        <h2>{{ $t('decide.h2Question') }}</h2>
        <div class="numTimes">
          <range-slider class="slider" min="0" max="6" v-model="numTimes" />
          <!-- <input type="range" min="0" max="7" v-model="numTimes" /> -->
          <div class="labels">
            <div v-for="(value) in range" v-bind:key="value">
              <label for="range" v-if="value === numTimes" style="font-weight: bold;">{{ value }}</label>
              <label for="range" v-if="value !== numTimes">{{ value }}</label>
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
