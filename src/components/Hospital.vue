<template>
  <div id="hospital" >
    <div>{{ filledBeds }} filled out of {{ totalBeds }} total beds</div>
    <svg :width='width' :height='height'>
      <rect v-for='d in beds' :x='d.x' :y='d.y'
        :width='bedWidth - padding' :height='bedHeight - padding'
        :fill='d.color' stroke='#333' />
    </svg>
  </div>
</template>

<script>
import _ from 'lodash'

const bedWidth = 10
const bedHeight = 15
const padding = 2
export default {
  name: 'Hospital',
  data() {
    return {
      width: 300,
      height: 400,
      bedWidth, bedHeight, padding,
      beds: [],
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
    filledBeds() {
      return _.countBy(this.infected, ({health}) => health === 3).true || 0 // hospitalized
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

      const perRow = this.width / bedWidth
      this.beds = _.times(this.totalBeds, i => {
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
  padding-left: 10px;
}

svg {
  overflow: visible;
}
</style>
