<template>
  <div id="gameplay" :style='{width: `${width}px`, height: `${height}px`}'>
    <div class='container'>
      <!-- BACKGROUND -->
      <Community v-bind='{
        colorsByHealth, width, height, rightWidth,
        tl, phases, playTimeline,
      }' />
      <!-- BOTTOM PANEL -->
      <div class='panel' id='bottomPanel' :style='{width: `${width - rightWidth}px`}'>
        <BarChart v-bind='{ageGroups, colorsByHealth, tl, phases, playTimeline}' />
        <AreaChart v-bind='{ageGroups, colorsByHealth, tl, phases, playTimeline}' />
      </div>
      <!-- RIGHT PANEL -->
      <div class='panel' id='rightPanel' :style='{height: `${height - topHeight}px`}'>
        <Hospital v-bind='{width: rightWidth}' />
      </div>
      <!-- TOP PANEL -->
      <div class='panel' id='topPanel' :style='{height: `${topHeight}px`}'>
        <strong>Day {{ day }}</strong>
        <button @click='updateDecision'>Decide</button>
      </div>
    </div>
    <div class='zipCode'>ZIP CODE: <strong>{{ zipCode }}</strong> ({{ population.total }} residents)</div>
  </div>
</template>

<script>
import gsap from 'gsap'

import Community from './Community'
import Hospital from './Hospital'
import BarChart from './BarChart'
import AreaChart from './AreaChart'

const widthHeightRatio = 16 / 9
const padding = 40
const needSetup = ['community']

export default {
  name: 'GamePlay',
  components: {
    Community, Hospital, BarChart, AreaChart,
  },
  props: ['ageGroups', 'healthStatus', 'colorsByHealth'],
  data() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      topHeight: 40,
      rightWidth: 320,
      tl: new gsap.timeline({paused: true}),
      phases: [1.5, 1.5, 2],
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
    calculateDimensions() {
      this.width = window.innerWidth - padding
      this.height = (1 / widthHeightRatio) * this.width
    },
    updateDecision() {
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
      this.$store.commit("setDay", this.day + 1)
    },
    playTimeline(child) {
      this.setupDone.push(child)
      if (_.difference(needSetup, this.setupDone).length) return

      // if all children have been setup, then play
      this.tl.play(`day${this.day}`)
    },
  },
}
</script>

<style scoped>
#gameplay {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.container {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 5px;
  background: #fff;
}

.panel {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
}

#topPanel {
  width: 100%;
  top: 0;
  border-bottom: 1px solid #efefef;
}

#rightPanel {
  right: 0px;
  bottom: 0px;
  border-left: 1px solid #efefef;
}

#bottomPanel {
  left: 0px;
  bottom: 0px;
  border-top: 1px solid #efefef;
}

.zipCode {
  position: absolute;
  top: -20px;
  right: 0px;
}
</style>
