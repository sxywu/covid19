<template>
  <div id="gameplay" :style='{width: `${width}px`, height: `${height}px`}'>
    <h2>
      {{ zipCode }}: {{ population.total }} residents<br />
      Day {{ day + 1 }}
    </h2>
    <div>
      <Community v-bind='{colorsByHealth}' />
      <Hospital />
    </div>
    <p>
      <button @click='$store.commit("setDay", day + 1)'>Decide</button>
    </p>
    <div>
      <BarChart v-bind='$props' />
      <AreaChart v-bind='$props' />
    </div>
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
  border-radius: 3px;
  overflow: hidden;
  background: #fff;
}
</style>
