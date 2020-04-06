<template>
  <div id="gameplay" :style="{width: `${width}px`, height: `${height}px`}">
    <div class="container">
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
        <div id="actions">
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
          <!-- DECISION SCREEN -->
          <div class="decision" v-if="showDecision">
            <Decide
              v-bind="{
                onUpdate: updateDecision,
              }"
            />
          </div>
        </div>
      </div>
      <!-- RIGHT PANEL -->
      <div id="rightPanel">
        <CommunityStats v-bind="{healthStatus}" />
        <Hospital
          v-bind="{colorsByHealth, width: rightWidth, tl, phases, playTimeline}"
        />
      </div>
      <!-- BOTTOM PANEL -->
      <div id="bottomPanel">
        <Legend />
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
        <AreaChart
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
import AreaChart from './AreaChart'
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
    AreaChart,
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
      bottomHeight: 150,
      tl: new gsap.timeline({paused: true}),
      phases: [0.5, 1, 1],
      groups: [],
      showDecision: false,
    }
  },
  computed: {
    day() {
      return this.$store.state.day
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
  created() {
    this.updateDay()
  },
  mounted() {
    window.addEventListener('resize', this.calculateDimensions)
    this.calculateDimensions()
  },
  destroyed() {
    window.removeEventListener('resize', this.calculateDimensions)
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
      this.$store.dispatch('storeGame')
      this.$store.dispatch('getGameState')
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
        } else {
          this.showDecision = true
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

.container {
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
}

#bottomPanel {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-row: 3;
  padding: 1rem;
}

#actions {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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

#rightPanel {
  right: 0px;
  bottom: 0px;
  border-left: 1px solid $gray;
}

#bottomPanel {
  left: 0px;
  bottom: 0px;
  border-top: 1px solid $gray;
}

.zipCode {
  position: absolute;
  top: -20px;
  right: 0px;
}

.decision {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  border: 1px solid $gray;
  transform: translate(-50%, -50%);
  background: #fff;
  text-align: center;
}
</style>
