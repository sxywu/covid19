<template>
  <div id="hospital" :class="$mq">
    <h3 class="label">
      {{ hospital ? hospital.name : $t('hospital.null') }}
      <span v-if="hospital && hospitals && hospitals.length > 1" style="white-space: nowrap">
        & {{ hospitals.length - 1 }} others
      </span>
    </h3>
    <div class="stats label">
      <div>
        {{ $t('hospital.beds', {filledBeds, totalAvailableBeds, totalBeds}) }}
      </div>
    </div>
    <svg ref="svg" :width="isPhone ? width : null" :height="isPhone ? height : null">
      <clipPath id="bedClip">
        <path
          d="M17.72,116.38,130.36,55.75,186,87.22v15.24L78,163.75,17.39,128.3Z"
        />
      </clipPath>
      <g v-for="d in beds" :transform="`translate(${d.x}, ${d.y})scale(${scale})`">
        <image :href="bedImage" :width="bedWidth" :height="bedHeight" />
        <circle v-if="!isPhone"
          :cx="bedWidth / 2"
          :cy="bedHeight / 2"
          :r="d.r"
          :fill="d.color"
          clip-path="url(#bedClip)"
        />
        <rect v-if="isPhone"
          :x="17"
          :width="d.r"
          :height="bedHeight"
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
  props: ['isPhone', 'colorsByHealth', 'tl', 'phases', 'playTimeline'],
  data() {
    return {
      width: null,
      height: null, // set once layout is calculated
      bedWidth: 211,
      filledWidth: 168,
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
    window.addEventListener('resize', this.setupBeds)
    this.setupBeds()
    this.updateBeds()
  },
  destroyed() {
    window.removeEventListener('resize', this.setupBeds)
  },
  watch: {
    hospital() {
      this.$nextTick(this.setupBeds)
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
      if (!this.totalBeds || !this.hospital) return

      // get SVG dimensions
      const {width, height} = this.$refs.svg.getBoundingClientRect()
      Object.assign(this.$data, {width, height})

      if (this.isPhone) {
        // if phone, then just calculate 10 beds
        this.maxBeds = 10
        this.scale = (this.width / this.maxBeds) / this.bedWidth
        this.beds = _.times(Math.min(this.totalAvailableBeds, this.maxBeds), i => {
          return {
            color: this.colorsByHealth[4],
            x: Math.floor(i % this.maxBeds) * (this.scale * this.bedWidth),
            y: 0, r: this.beds[i] ? this.beds[i].r : 0,
          }
        })
        this.height = this.scale * this.bedHeight
      } else {
        // if desktop
        // calculate bed scale according to svg dimensions
        let {scale, perRow, numRows} = this.calculateBedScale(0.01, 0.3)
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
            r: isOther ? this.filledWidth : (this.beds[i] ? this.beds[i].r : 0),
          }
        })
        this.availableBeds = _.filter(this.beds, d => !d.isOther)
      }
    },
    updateBeds() {
      if (!this.infected) return
      if (this.day === 1) {
        _.each(this.availableBeds, d => d.r = 0)
      }

      if (this.isPhone) {
        // phone
        let filledIcons = this.filledBeds
        let partialIcon = 0
        if (this.totalAvailableBeds > 10) {
          filledIcons = (this.filledBeds / this.totalAvailableBeds) * this.maxBeds
          partialIcon = filledIcons - Math.floor(filledIcons)
          filledIcons = Math.floor(filledIcons)
        }
        this.tl.to(
          this.beds,
          {
            r: i => {
              if (i < filledIcons) return this.filledWidth
              if (i === filledIcons) {
                return this.filledWidth * partialIcon
              }
              return 0
            },
            duration: this.phases[1],
          },
          `day${this.day}-1`,
        )
      } else {
        // desktop
        this.tl.to(
          this.availableBeds,
          {
            r: i => (i < this.filledBeds ? this.filledWidth : 0),
            duration: this.phases[1],
          },
          `day${this.day}-1`,
        )
      }

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

circle, rect {
  mix-blend-mode: multiply;
}

#hospital.sm {
  border-top: 1px solid $gray;
  padding: 0.5rem 0.75rem;
}
</style>
