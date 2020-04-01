<template>
  <div id="hospital" >
    <div>{{ filledBeds }} filled of {{ totalAvailableBeds }} available</div>
    <div>{{ totalBeds }} total beds</div>
    <svg :width='width' :height='height'>
      <clipPath id='bedClip'>
        <path d='M17.72,116.38,130.36,55.75,186,87.22v15.24L78,163.75,17.39,128.3Z' />
      </clipPath>
      <g v-for='d in beds' :transform='`translate(${d.x}, ${d.y})scale(0.2)`'>
        <image :href='bedImage' />
        <circle :cx='bedWidth / 2' :cy='bedHeight / 2' :r='d.r'
          :fill='colorsByHealth[4]' clip-path='url(#bedClip)' />
      </g>
    </svg>
  </div>
</template>

<script>
import _ from 'lodash'

const bedImage = require('../assets/bed.png')
const bedWidthHeightRatio = 1.071
const bedWidth = 40
const bedHeight = (1 / bedWidthHeightRatio) * bedWidth
const padding = 2
export default {
  name: 'Hospital',
  props: ['width', 'colorsByHealth', 'tl', 'phases', 'playTimeline'],
  data() {
    return {
      height: 500,
      bedWidth: 211,
      bedHeight: 197,
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
          r: 0,
        }
      })
    },
    updateBeds() {
      this.tl.to(this.beds, {
        r: i => i < this.filledBeds ? 100 : 0,
        duration: this.phases[1],
        stagger: 0.02,
      }, `day${this.day}-1`)

      this.playTimeline('hospital')
    },
  },
}
</script>

<style scoped>
#hospital {
  display: inline-block;
  border-top: 1px solid #efefef;
}

svg {
  overflow: visible;
  isolation: isolate;
}

circle {
  mix-blend-mode: multiply;
}
</style>
