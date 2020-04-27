<template>
  <div id="gameplay" :class="$mq" :style="{width: `${width}px`, height: `${height}px`}">
    <div v-if="!isPhone" class="gameContainer">
      <!-- TOP PANEL -->
      <div id="topPanel">
        <Header v-bind="{height: topHeight, isPhone}" />
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
        <!-- DECISION SCREEN -->
        <Decide
          v-if="showDecision"
          v-bind="{
            onUpdate: updateDecision,
            continueGame,
            ageGroups,
            colorsByHealth,
          }"
        />
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
            width: 460,
            height: bottomHeight,
            ageGroups,
            colorsByHealth,
            tl,
            phases,
            playTimeline,
          }"
        />
      </div>
    </div>
    <div v-if="isPhone" class="gameContainer">
      <div id="chartsPanel" class="panel" :style='{
        bottom: `${bottomHeight}px`,
        height: `${chartsHeight}px`,
      }'>
        <div>
          <Legend v-bind="{healthStatus, colorsByHealth, isPhone}" />
          <LineChart
            v-bind="{
              isPhone,
              width,
              height: 120,
              ageGroups,
              colorsByHealth,
              tl,
              phases,
              playTimeline,
            }"
          />
          <Hospital v-bind="{isPhone, colorsByHealth, tl, phases, playTimeline}" />
          <BarChart
            v-bind="{
              isPhone,
              width,
              height: 120,
              ageGroups,
              colorsByHealth,
              tl,
              phases,
              playTimeline,
            }"
          />
        </div>
      </div>
      <div id="topPanel" class="panel">
        <Header v-bind="{height: topHeight, isPhone}" />
      </div>
      <div id="bottomPanel" class="panel" :style="{height: `${bottomHeight}px`}">
        <CommunityStats
          v-bind="{
            isPhone,
            tl, phases,
            playTimeline,
          }"
        />
      </div>
    </div>
    <!-- ONLY SHOW FOOTNOTE METHODOLOGY ON DESKTOP -->
    <footer v-if="!isPhone" id='footNote' class='label' :style="{width: `${width}px`}">
      <span v-html="$t('footnotes.fullMethodology')"></span>
    </footer>
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
  props: ['isPhone', 'ageGroups', 'healthStatus', 'colorsByHealth'],
  data() {
    return {
      width: this.isPhone ? window.innerWidth : maxWidth,
      height: this.isPhone ? window.innerHeight : maxHeight,
      topHeight: this.isPhone ? 55 : 75,
      rightWidth: 320,
      chartsHeight: 275,
      bottomHeight: this.isPhone ? 55 : 180,
      tl: new gsap.timeline({ paused: true }),
      groups: [],
      needSetup: this.isPhone ? ['area', 'stats', 'hospital'] :
        ['community', 'area', 'bar', 'hospital', 'stats'],
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
    week() {
      return this.$store.getters.week
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
    phases() {
      if (this.week === 1 || this.week === 8) return [1, 0.75, 1.25]
      return [0.5, 0.75, 0.75]
    },
  },
  mounted() {
    this.setupDone = []
    this.calculateDimensions()
    window.addEventListener('resize', this.calculateDimensions)
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
      this.width = window.innerWidth
      this.height = window.innerHeight
      if (!this.isPhone) {
        this.width = Math.min(window.innerWidth - padding, maxWidth)
        this.height = Math.min((1 / widthHeightRatio) * this.width, maxHeight)
      }
    },
    updateDecision(numTimes) {
      this.showDecision = false
      this.$store.commit('setDecision', +numTimes)
      this.$store.dispatch('storeGame')
      this.updateDay()
    },
    continueGame(cont) {
      this.showDecision = false
      if (cont) {
        // if after 8 weeks, player decides to continue
        this.updateDay()
      } else {
        // if not, go to end page
        this.$store.commit('setCurrentPage', 'end')
      }
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
      if (_.difference(this.needSetup, this.setupDone).length) return

      // if all children have been setup
      this.tl.add(() => {
        if (this.day === this.totalDays + 28) {
          // if four weeks after total, show end page
          this.$store.commit('setCurrentPage', 'end') // if we've gone through all the days, end
        } else if (this.day % 7 || this.day > this.totalDays) {
          // if it isn't the seventh day of the week
          // or if it's the 4 weeks after initial 8 weeks
          // then continue animating
          this.updateDay()
        } else if (this.day <= this.totalDays) {
          // if it's the seventh day of week
          // and still within initial 8 weeks, show decision
          this.showDecision = true
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
// DESKTOP
#gameplay.lg, #gameplay.md {
  background: white;
  border-radius: 6px;
  overflow: hidden;
  @include shadow;

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

  #footNote {
    position: absolute;
    text-align: right;
    padding: 3px;
  }
}

#gameplay.sm {
  background: white;
  overflow: hidden;

  #topPanel {
    top: 0;
    border-bottom: 1px solid $gray;
  }

  #chartsPanel {
    bottom: 0;
    overflow-x: hidden;
    overflow-y: scroll;
    border-top: 1px solid $gray;
  }

  #bottomPanel {
    left: 0px;
    bottom: 0px;
    border-top: 1px solid $gray;
  }

  .panel {
    width: 100%;
    position: fixed;
  }
}
</style>
