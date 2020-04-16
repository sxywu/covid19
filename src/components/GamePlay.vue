<template>
  <div id="gameplay" :style="{width: `${width}px`, height: `${height}px`}">
    <div class="gameContainer">
      <!-- TOP PANEL -->
      <div id="topPanel">
        <Header v-bind="{height: topHeight}" />
      </div>
      <!-- COMMUNITY -->
      <div id="communityPanel">
        <Community
          v-bind="{
            ...communityDimensions,
            colorsByHealth,
            tl,
            phases,
            playTimeline,
            setGroups,
          }"
        />
        <!-- MINIMAP -->
        <div id="minimapContainer">
          <Minimap
            v-bind="{
              ...minimapDimensions,
              groups,
              colorsByHealth,
              containerWidth: width,
              containerHeight: height,
            }"
          />
        </div>
        <!-- POPULATION  -->
        <div class="label" id="populationContainer">
          <h3 v-if="cityCounty">{{ cityCounty.city }}, {{ cityCounty.state }} {{ cityCounty.zip }}</h3>
          <div v-if="population">Population: {{ formatNumber(population.total) }}</div>
        </div>
      </div>
      <!-- RIGHT PANEL -->
      <div id="rightPanel" :style="{width: `${rightWidth}px`}">
        <CommunityStats
          v-bind="{
          healthStatus,
          colorsByHealth,
          tl,
          phases,
          playTimeline,
        }"
        />
        <Hospital v-bind="{colorsByHealth, tl, phases, playTimeline}" />
      </div>
      <!-- BOTTOM PANEL -->
      <div id="bottomPanel">
        <Legend v-bind="{healthStatus, colorsByHealth}" />
        <BarChart
          v-bind="{
            width: 300,
            height: bottomHeight,
            ageGroups,
            colorsByHealth,
            tl,
            phases,
            playTimeline,
          }"
        />
        <LineChart
          v-bind="{
            width: 320,
            height: bottomHeight,
            ageGroups,
            colorsByHealth,
            tl,
            phases,
            playTimeline,
          }"
        />
      </div>
      <!-- DECISION SCREEN -->
      <Decide
        v-if="showDecision"
        v-bind="{
          onUpdate: updateDecision,
          ageGroups,
          colorsByHealth,
        }"
      />
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import gsap from 'gsap'

import Community from './Community'
import Decide from './Decide'
import CommunityStats from './CommunityStats'
import Minimap from './Minimap'
import Hospital from './Hospital'
import BarChart from './BarChart'
import LineChart from './LineChart'
import Header from './Header'
import Legend from './Legend'

const maxWidth = 1320
const maxHeight = 840
const widthHeightRatio = maxWidth / maxHeight
const padding = 40
const needSetup = ['community', 'area', 'bar', 'hospital', 'stats']

export default {
  name: 'GamePlay',
  components: {
    Community,
    CommunityStats,
    Decide,
    Minimap,
    Hospital,
    BarChart,
    LineChart,
    Header,
    Legend,
  },
  props: ['ageGroups', 'healthStatus', 'colorsByHealth'],
  data() {
    return {
      width: maxWidth,
      height: maxHeight,
      topHeight: 75,
      rightWidth: 320,
      bottomHeight: 180,
      tl: new gsap.timeline({ paused: true }),
      phases: [0.5, 0.75, 0.75],
      groups: [],
      showDecision: false,
    }
  },
  computed: {
    currentPage() {
      return this.$store.state.currentPage
    },
    day() {
      return this.$store.state.day
    },
    totalDays() {
      return this.$store.state.totalDays
    },
    population() {
      return this.$store.getters.population || {}
    },
    cityCounty() {
      return this.$store.getters.cityCounty
    },
    population() {
      return this.$store.getters.population
    },
    communityDimensions() {
      return {
        top: 0,
        left: this.topHeight,
        width: this.width - this.rightWidth,
        height: this.height - this.topHeight - this.bottomHeight,
      }
    },
    minimapDimensions() {
      const width = 140
      const height = 90
      return {
        width,
        x: this.width - this.rightWidth - width - 10,
        height,
        y: this.height - this.bottomHeight - height - 10,
      }
    },
  },
  mounted() {
    window.addEventListener('resize', this.calculateDimensions)
    this.calculateDimensions()
  },
  destroyed() {
    window.removeEventListener('resize', this.calculateDimensions)
  },
  watch: {
    currentPage() {
      if (this.currentPage === 'game') {
        // if current page became "game" again that means we restarted
        this.tl.clear(true)
        this.showDecision = false
        this.updateDay()
      }
    },
  },
  methods: {
    setGroups(groups) {
      this.groups = groups
    },
    calculateDimensions() {
      this.width = Math.min(window.innerWidth - padding, maxWidth)
      this.height = Math.min((1 / widthHeightRatio) * this.width, maxHeight)
    },
    updateDecision(numTimes) {
      this.showDecision = false
      this.$store.commit('setDecision', +numTimes)
      this.$store.dispatch('storeGame')
      this.updateDay()
    },
    updateDay() {
      this.setupDone = []

      let prevLabel = `day${this.day + 1}`
      this.tl.add(prevLabel)
      _.each(this.phases, (d, i) => {
        let label = `day${this.day + 1}-${i + 1}`
        this.tl.add(label, `${prevLabel}+=${d}`)
        prevLabel = label
      })
      this.$store.commit('setDay', this.day + 1)
    },
    playTimeline(child) {
      this.setupDone.push(child)
      if (_.difference(needSetup, this.setupDone).length) return

      // if all children have been setup
      this.tl.add(() => {
        if (this.day % 7) {
          this.updateDay()
        } else if (this.day < this.totalDays) {
          this.showDecision = true
        } else {
          this.$store.commit('setCurrentPage', 'end') // if we've gone through all the days, end
        }
      }, `day${this.day}-3`)
      this.tl.play(`day${this.day}`)
    },
    formatNumber(number) {
      return d3.format(',')(Math.round(number))
    },
  },
}
</script>

<style lang="scss" scoped>
#gameplay {
  background: white;
  border-radius: 6px;
  overflow: hidden;
  @include shadow;
}

.gameContainer {
  position: relative;
  display: grid;
  height: 100%;
  grid-template-rows: 1fr 7fr 2fr;
}

#topPanel {
  grid-column: 1 / 3;
  width: 100%;
  top: 0;
  border-bottom: 1px solid $gray;
}

#communityPanel {
  overflow: hidden;
  display: grid;
  grid-row-start: 2;
  grid-row-end: 3;
  position: relative;
}

#rightPanel {
  display: flex;
  flex-direction: column;
  grid-column: 2;
  grid-row-start: 2;
  grid-row-end: 4;
  right: 0px;
  bottom: 0px;
  border-left: 1px solid $gray;
}

#bottomPanel {
  display: grid;
  grid-template-columns: 180px 1fr 1.5fr;
  grid-row: 3;
  padding: 1rem;
  left: 0px;
  bottom: 0px;
  border-top: 1px solid $gray;
}

#minimapContainer {
  position: relative;
  align-self: flex-end;
  margin-left: auto;
  padding: 1rem;
}

#populationContainer {
  position: absolute;
  align-self: flex-start;
  margin: 1rem;
  margin-right: auto;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 5px;
  border: 1px solid $gray;
  border-radius: 3px;

  h3 {
    margin: 0;
  }
}

.panel {
  position: absolute;
}
</style>
