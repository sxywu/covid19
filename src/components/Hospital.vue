<template>
  <div id="hospital" >
    <div>{{ filledBeds }} filled of {{ totalAvailableBeds }} available</div>
    <div>{{ totalBeds }} total beds</div>
    <svg :width='width' :height='height'>
      <image v-for='d in beds' :x='d.x' :y='d.y'
        :width='bedWidth - padding' :height='bedHeight - padding'
        :href='bedImage' />
    </svg>
  </div>
</template>

<script>
import _ from 'lodash'

const bedImage = require('../assets/bed.png')
const bedWidthHeightRatio = 1.071
const bedWidth = 30
const bedHeight = (1 / bedWidthHeightRatio) * bedWidth
const padding = 2
export default {
  name: 'Hospital',
  props: ['width'],
  data() {
    return {
      height: 400,
      bedWidth, bedHeight, padding,
      beds: [],
      bedImage,
    }
  },
  computed: {
    hospital() {
      return _.maxBy(this.$store.getters.hospitals, 'beds')
    },
    infected() {
      return this.$store.getters.infected
    },
    totalBeds() {
      return this.$store.getters.totalBeds
    },
    totalAvailableBeds() {
      return this.$store.getters.totalAvailableBeds
    },
    filledBeds() {
      return _.sumBy(this.infected, ({health}) => health === 4) // hospitalized
    },
  },
  mounted() {
    this.setupBeds()
    this.updateBeds()
  },
  watch: {
    totalBeds() {
      this.setupBeds()
    },
    infected() {
      this.updateBeds()
    },
  },
  methods: {
    setupBeds() {
      if (!this.totalBeds || this.beds.length) return

      const perRow = Math.floor(this.width / bedWidth)
      this.beds = _.times(this.totalAvailableBeds, i => {
        return {
          color: '#efefef',
          x: Math.floor(i % perRow) * bedWidth,
          y: this.height - bedHeight - Math.floor(i / perRow) * bedHeight,
        }
      })
    },
    updateBeds() {
      _.each(this.beds, (bed, i) => {
        bed.color = i < this.filledBeds ? '#910a0a' : '#efefef'
      })
    },
  },
}
</script>

<style scoped>
#hospital {
  display: inline-block;
}

svg {
  overflow: visible;
}
</style>
