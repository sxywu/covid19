<template>
  <div id="hospital">
    <h3 class="label">Your Hospital</h3>
    <div class="stats label">
      <div>{{ filledBeds }} filled of {{ totalAvailableBeds }} available beds</div>
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
          :fill="colorsByHealth[4]"
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
    showBeds() {
      return this.totalBeds >= 100 ? this.totalAvailableBeds : this.totalBeds
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

      // get SVG dimensions
      let {top, left, width, height} = this.$refs.svg.getBoundingClientRect()
      Object.assign(this.$data, {top, left, width, height})

      // calculate bed scale according to svg dimensions
      let scale = 0.2
      let perRow
      let numRows
      while (true) {
        perRow = Math.floor(this.width / (this.bedWidth * scale))
        width = perRow * this.bedWidth * scale
        numRows = Math.ceil(this.showBeds / perRow)
        height = numRows * this.bedHeight * scale
        if (height > this.height) {
          // if the beds go over the container height, scale down
          scale -= 0.01
        } else if (this.height - scale * this.bedHeight <= height && height <= this.height) {
          // if beds are within some padding, use that scale
          break
        } else {
          // else beds are too short and need to scale up
          scale += 0.001
        }
      }
      this.scale = scale

      const rowPadding = (this.height - height) / numRows
      const columnPadding = (this.width - width) / perRow
      const scaledBedWidth = this.bedWidth * scale
      const scaledBedHeight = this.bedHeight * scale
      this.beds = _.times(this.showBeds, i => {
        return {
          color: '$gray',
          x: Math.floor(i % perRow) * (scaledBedWidth + columnPadding),
          y: this.height - scaledBedHeight - Math.floor(i / perRow) * (scaledBedHeight + rowPadding), // have it start from bottom
          r: 0,
        }
      })
    },
    updateBeds() {
      if (!this.infected) return
      if (this.day === 1) {
        _.each(this.beds, d => d.r = 0)
      }

      this.tl.to(
        this.beds,
        {
          r: i => (i < this.filledBeds ? 100 : 0),
          duration: this.phases[1],
          stagger: 0.02,
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
