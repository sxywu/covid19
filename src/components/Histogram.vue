<template>
  <div id="histogram">
    <svg :width="width" :height="height">
      <image v-for="d in people" :x="d.x - imageWidth / 2" :y="d.y"
        :height="imageHeight" :href="d.image" />
      <g class="label" v-if="average.x"
        :transform="`translate(${average.x}, ${height - margin.bottom})`">
        <line :y2="margin.bottom * 0.75" stroke="#333" />
        <circle r="3" />
        <text :y="margin.bottom * 0.75 + 2" dy="1em" text-anchor="middle">
          average: {{ average.count }} times
        </text>
      </g>
      <g class="axis label" ref="xAxis" :transform="`translate(0, ${height - margin.bottom})`" />
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'

const images = [
  require('../assets/person-1.svg'),
  require('../assets/person-2.svg'),
]
const imageRatio = 94 / 52
const margin = {top: 20, right: 20, bottom: 40, left: 20}
export default {
  name: 'Histogram',
  props: ['type'],
  data() {
    return {
      width: 800,
      height: 300,
      imageHeight: 25,
      imageHeight: 25 * imageRatio,
      margin,
      people: [],
      average: {},
    }
  },
  computed: {
    week() {
      return this.$store.getters.week
    },
    allDecisions() {
      return this.$store.state.allDecisions
    },
  },
  created() {
    this.xScale = d3.scaleLinear().domain([-0.5, 7.5])
      .range([margin.left, this.width - margin.right])

    this.xAxis = d3.axisBottom().scale(this.xScale)
      .tickSize(0).tickFormat(d => _.isInteger(d) ? _.round(d) : '')
  },
  mounted() {
    this.calculatePeople()
  },
  watch: {
    allDecisions() {
      this.calculatePeople()
    },
  },
  methods: {
    calculatePeople() {
      if (!this.allDecisions) return

      const groupedPeople = _.chain(this.allDecisions)
        .map(d => this.type === 'all' ? _.round(d3.mean(d), 1) : d[this.week])
        .countBy()
        .value()
      const maxLength = _.max(_.values(groupedPeople))
      this.imageHeight = _.clamp(Math.floor(this.height / maxLength), 40, 80)
      this.imageWidth = this.imageHeight / imageRatio
      this.height = Math.min(this.height, this.imageHeight * maxLength + margin.top + margin.bottom)
      this.people = _.chain(groupedPeople)
        .map((length, numTimes) => {
          if (numTimes === 'undefined') return
          let y = this.height - margin.bottom
          return _.times(length, i => {
            y -= this.imageHeight
            return {
              x: this.xScale(numTimes),
              y, image: images[_.random(1)],
              numTimes,
            }
          })
        }).filter().flatten().value()

      const average = d3.mean(this.people, d => d.numTimes)
      this.average = {
        count: _.round(average, 2),
        x: this.xScale(average),
      }

      d3.select(this.$refs.xAxis).call(this.xAxis)
    },
  },
}
</script>

<style lang="scss" scoped>
svg {
  overflow: visible;

}
</style>
