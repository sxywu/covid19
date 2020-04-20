<template>
  <div id="histogram">
    <svg :width="width" :height="height">
      <g v-for="(d, i) in people" :key="i"
        :transform="`translate(${d.x - imageWidth / 2}, ${d.y})`">
        <image
          :height="imageHeight"
          :href="d.image"
          opacity="0.85"
        />
        <g v-if="d.isPlayer">
          <image :height="imageHeight" href="../assets/star.svg" />
          <text class="label" :x="imageWidth / 2" text-anchor="middle"
            :y="imageHeight + margin.bottom / 2" dy="1em">YOU</text>
        </g>
      </g>
      <g
        class="label"
        v-if="average.x"
        :transform="`translate(${average.x}, ${height - margin.bottom})`"
      >
        <line :y2="margin.bottom * 0.8" stroke="#333" />
        <circle r="3" />
        <text
          :y="margin.bottom * 0.8 + 2"
          dy="1em"
          text-anchor="middle"
          font-weight="bold"
        >
          average: {{ average.count }} times
        </text>
      </g>
      <g
        class="axis label"
        ref="xAxis"
        :transform="`translate(0, ${height - margin.bottom})`"
      />
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
const margin = { top: 20, right: 20, bottom: 40, left: 20 }
export default {
  name: 'Histogram',
  props: ['width', 'type', 'numTimes'],
  data() {
    return {
      height: 250,
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
    this.xScale = d3
      .scaleLinear()
      .domain([-0.5, 7.5])
      .range([margin.left, this.width - margin.right])

    this.xAxis = d3
      .axisBottom()
      .scale(this.xScale)
      .tickSizeOuter(1)
      .tickFormat(d => _.isInteger(d)? _.round(d) : '')
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
      if (!this.allDecisions.length) return

      const groupedPeople = _.chain(this.allDecisions)
        .map((d, i) => {
          let numTimes = d[this.week] || this.numTimes
          if (this.type === 'all') {
            if (d.length !== 8) return
            numTimes = _.round(d3.mean(d), 1)
          }
          return {
            numTimes,
            isPlayer: i === 0, // player is first
          }
        })
        .filter()
        .groupBy('numTimes')
        .value()
      const maxLength = _.chain(groupedPeople)
        .map(d => d.length).max().value()
      this.imageHeight = _.clamp(Math.floor(this.height / maxLength), 40, 60)
      this.imageWidth = this.imageHeight / imageRatio
      this.height = Math.min(
        this.height,
        this.imageHeight * maxLength + margin.top + margin.bottom
      )
      this.people = _.chain(groupedPeople)
        .map(people => {
          let y = this.height - margin.bottom
          return _.map(people, d => {
            y -= this.imageHeight
            return Object.assign(d, {
              x: this.xScale(d.numTimes),
              y,
              image: images[_.random(1)],
            })
          })
        })
        .flatten()
        .value()
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
