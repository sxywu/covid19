<template>
  <div id="hospital">
    <svg :width='width' :height='height'>
      <rect v-for='d in beds' :x='d.x' :y='d.y'
        :width='bedWidth - padding' :height='bedHeight - padding'
        :fill='d.color' stroke='#333' />
    </svg>
  </div>
</template>

<script>
import _ from 'lodash'

const bedWidth = 20
const bedHeight = 30
const padding = 5
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
    day() {
      return this.$store.state.day
    },
    numBeds() {
      return this.$store.state.numBeds
    },
    people() {
      return this.$store.state.people
    },
  },
  mounted() {
    this.setupBeds()
    this.updateBeds()
  },
  watch: {
    day() {
      this.updateBeds()
    },
    numBeds() {
      this.setupBeds()
    },
  },
  methods: {
    setupBeds() {
      if (!this.numBeds || this.beds.length) return

      const perRow = this.width / bedWidth
      this.beds = _.times(this.numBeds, i => {
        return {
          color: '#efefef',
          x: Math.floor(i % perRow) * bedWidth,
          y: this.height - bedHeight - Math.floor(i / perRow) * bedHeight,
        }
      })
    },
    updateBeds() {
      const filledBeds = _.countBy(this.people, ({health}) => health === 3).true || 0 // hospitalized
      _.each(this.beds, (bed, i) => {
        bed.color = i < filledBeds ? '#910a0a' : '#efefef'
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
