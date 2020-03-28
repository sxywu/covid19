<template>
  <div id="gameplay" :style='{width: `${width}px`, height: `${height}px`}'>
    <div class='container'>
      <!-- BACKGROUND -->
      <Community v-bind='{colorsByHealth, width, height}' />
      <h2>
        Day {{ day + 1 }}
      </h2>
      <Hospital />
      <p>
        <button @click='$store.commit("setDay", day + 1)'>Decide</button>
      </p>
      <div>
        <BarChart v-bind='$props' />
        <AreaChart v-bind='$props' />
      </div>
    </div>
    <div class='zipCode'>ZIP CODE: <strong>{{ zipCode }}</strong> ({{ population.total }} residents)</div>
  </div>
</template>

<script>
import Community from './Community'
import Hospital from './Hospital'
import BarChart from './BarChart'
import AreaChart from './AreaChart'

const widthHeightRatio = 16 / 9
const padding = 40
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
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 5px;
  background: #fff;
}

.zipCode {
  position: absolute;
  top: -20px;
  right: 0px;
}
</style>
