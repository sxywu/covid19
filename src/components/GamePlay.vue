<template>
  <div id="gameplay" :style="{width: `${width}px`, height: `${height}px`}">
    <div class="gameContainer">
      <!-- TOP PANEL -->
      <div id="topPanel">
        <Header />
      </div>
      <!-- COMMUNITY -->
      <div id="communityPanel">
        <Community
          v-bind="{
            colorsByHealth,
            width,
            height,
            rightWidth,
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
      </div>
      <!-- RIGHT PANEL -->
      <div id="rightPanel">
        <CommunityStats
          v-bind="{
          healthStatus,
          colorsByHealth,
          tl,
          phases,
          playTimeline,
        }"
        />
        <Hospital v-bind="{colorsByHealth, width: rightWidth, tl, phases, playTimeline}" />
      </div>
      <!-- BOTTOM PANEL -->
      <div id="bottomPanel">
        <Legend v-bind="{healthStatus, colorsByHealth}" />
        <BarChart
          v-bind="{
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
      <Decide v-if="showDecision" v-bind="{
          onUpdate: updateDecision,
        }" />
    </div>
    <div class="zipCode">
      ZIP CODE:
      <strong>{{ zipCode }}</strong>
      ({{ population.total }}
      residents)
    </div>
  </div>
</template>

<script>
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

const widthHeightRatio = 16 / 9
const padding = 40
const needSetup = ['community', 'area', 'bar', 'hospital']

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
      // width: 1320,
      // height: 568,
      width: window.innerWidth,
      height: window.innerHeight,
      topHeight: 40,
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
    zipCode() {
      return this.$store.state.zipCode
    },
    population() {
      return this.$store.getters.population || {}
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
        this.updateDay()
      }
    },
  },
  methods: {
    setGroups(groups) {
      this.groups = groups
    },
    calculateDimensions() {
      this.width = window.innerWidth - padding
      this.height = (1 / widthHeightRatio) * this.width
    },
    updateDecision(numTimes) {
      this.showDecision = false
      this.$store.commit('setDecision', numTimes)
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
  },
}
</script>

<style lang="scss" scoped>
#gameplay {
  max-width: 1320px;
  max-height: 840px;
  background: white;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2.8px 2.2px rgba(0, 0, 0, 0.008),
    0 6.7px 5.3px rgba(0, 0, 0, 0.012), 0 12.5px 10px rgba(0, 0, 0, 0.015),
    0 22.3px 17.9px rgba(0, 0, 0, 0.018), 0 41.8px 33.4px rgba(0, 0, 0, 0.022),
    0 100px 80px rgba(0, 0, 0, 0.03);
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
  grid-template-columns: 0.75fr 1fr 1.5fr;
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

.panel {
  position: absolute;
}

.zipCode {
  position: absolute;
  top: -20px;
  right: 0px;
}
</style>
