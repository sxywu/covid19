<template>
  <div id="hospital">
    <h3 class="label">{{ hospital && hospital.name }}</h3>
    <div class="stats label">
      <div>{{ filledBeds }} filled of {{ totalAvailableBeds }} available ({{ totalBeds }} total beds)</div>
    </div>
    <svg ref="svg">
      <clipPath id="bedClip">
        <path d="M17.72,116.38,130.36,55.75,186,87.22v15.24L78,163.75,17.39,128.3Z" />
      </clipPath>
      <g v-for="d in beds" :transform="`translate(${d.x}, ${d.y})scale(${scale})`">
        <image :href="bedImage" />
        <circle
          :cx="bedWidth / 2"
          :cy="bedHeight / 2"
          :r="d.r"
          :fill="d.color"
          clip-path="url(#bedClip)"
        />
      </g>
    </svg>
  </div>
</template>

<script>
import _ from 'lodash'

const bedImage = require('../assets/bed.png')
const padding = 2
export default {
  name: 'Hospital',
  props: ['colorsByHealth', 'tl', 'phases', 'playTimeline'],
  data() {
    return {
      width: 0,
      height: 0, // set once layout is calculated
      bedWidth: 211,
      bedHeight: 197,
      bedScale: 1,
      beds: [],
      bedImage,
    }
  },
  computed: {
    day() {
      return this.$store.state.day
    },
    hospitals() {
      return this.$store.getters.hospitals
    },
    hospital() {
      return _.maxBy(this.hospitals, 'beds')
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
    includeOthers() {
      // show all beds if total less than 100
      return this.totalBeds <= 100
    },
    showBeds() {
      return this.includeOthers ? this.totalBeds : this.totalAvailableBeds
    },
    filledBeds() {
      return this.$store.getters.filledBeds
    },
  },
  mounted() {
    this.setupBeds()
    this.updateBeds()
  },
  watch: {
    hospital() {
      this.$nextTick(this.setupBeds)
    },
    totalBeds() {
      this.setupBeds()
    },
    infected() {
      this.updateBeds()
    },
  },
  methods: {
    calculateBedScale(scale1, scale2) {
      const scale = _.floor((scale1 + scale2) / 2, 4) // mid scale
      const perRow = Math.floor(this.width / (this.bedWidth * scale))
      const numRows = Math.ceil(this.showBeds / perRow)
      const height = numRows * this.bedHeight * scale

      if ((this.height - 20 <= height && height <= this.height) || (this.scale === scale)) {
        // if beds height are within some padding
        // or the scale is the same within 4 points of precision
        return {scale, perRow, numRows}
      }

      this.scale = scale
      if (height > this.height) {
        // if the beds go over the container height
        return this.calculateBedScale(scale1, scale)
      } else {
        // else beds are too short and need to scale up
        return this.calculateBedScale(scale, scale2)
      }
    },
    setupBeds() {
      if (!this.totalBeds) return

      // get SVG dimensions
      const {top, left, width, height} = this.$refs.svg.getBoundingClientRect()
      Object.assign(this.$data, {top, left, width, height})

      // calculate bed scale according to svg dimensions
      let {scale, perRow, numRows} = this.calculateBedScale(0.1, 0.3)
      this.scale = scale
      const scaledBedWidth = this.bedWidth * scale
      const scaledBedHeight = this.bedHeight * scale

      const rowPadding = _.clamp((this.height - numRows * scaledBedHeight) / numRows, 0, 10)
      const columnPadding = _.clamp((this.width - perRow * scaledBedWidth) / perRow, 0, 10)

      this.beds = _.times(this.showBeds, i => {
        const isOther = this.includeOthers && i < (this.totalBeds - this.totalAvailableBeds)
        return {
          isOther,
          color: this.colorsByHealth[isOther ? 0 : 4],
          x: Math.floor(i % perRow) * (scaledBedWidth + columnPadding),
          y: this.height - scaledBedHeight - Math.floor(i / perRow) * (scaledBedHeight + rowPadding), // have it start from bottom
          r: isOther ? 100 : 0,
        }
      })
      this.availableBeds = _.filter(this.beds, d => !d.isOther)
    },
    updateBeds() {
      if (!this.infected) return
      if (this.day === 1) {
        _.each(this.availableBeds, d => d.r = 0)
      }

      this.tl.to(
        this.availableBeds,
        {
          r: i => (i < this.filledBeds ? 100 : 0),
          duration: this.phases[1],
        },
        `day${this.day}-1`
      )

      this.playTimeline('hospital')
    },
  },
}
</script>

<style lang="scss" scoped>
#hospital {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  // align-items: center;
}

.stats {
  width: 100%;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  isolation: isolate;
}

circle {
  mix-blend-mode: multiply;
}
</style>
