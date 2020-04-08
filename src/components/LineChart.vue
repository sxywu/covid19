<template>
  <div id="areaChart">
    <svg :width="width" :height="height">
      <text :x="margin.right" dy="1em" class="label">Infected cases by day</text>
      <path v-for="d in paths" :key="d.id" :d="d.path" fill="none"
        :stroke="d.color" stroke-width="2" :stroke-dasharray="d.strokeDasharray" />
      <g ref="xAxis" :transform="`translate(0, ${height - margin.bottom})`" />
      <g ref="yAxis" :transform="`translate(${margin.left}, 0)`" />
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'

const healthStatus = [4, 3, 2, 5]
const margin = {top: 20, right: 20, bottom: 20, left: 30}
export default {
  name: 'LineChart',
  props: [
    'height',
    'ageGroups',
    'colorsByHealth',
    'tl',
    'phases',
    'playTimeline',
  ],
  data() {
    return {
      width: 320,
      margin,
      paths: [],
    }
  },
  created() {
    this.xScale = d3
      .scaleLinear()
      .range([margin.left, this.width - margin.right])
    this.yScale = d3
      .scaleLog()
      .range([this.height - margin.bottom, margin.top])

    this.lineGenerator = d3
      .line()
      .curve(d3.curveCatmullRom)

    this.xAxis = d3.axisBottom().scale(this.xScale).ticks(7)
    this.yAxis = d3.axisLeft().scale(this.yScale)
      .ticks(5)
      .tickFormat(d => (d >= 1000 ? `${_.round(d / 1000, 1)}k` : d))
  },
  computed: {
    day() {
      return this.$store.state.day
    },
    dailyHealthStatus() {
      return this.$store.getters.dailyHealthStatus
    },
    healthStatus() {
      // which health status to show in line chart
      // if there are deaths, and it's the start of a week
      // then show line chart with deaths, otherwise show total case numbers
      // return _.last(this.dailyHealthStatus)[5] && (this.day % 7 === 0) ? 5 : 'total'
      return 'total'
    },
  },
  watch: {
    dailyHealthStatus() {
      this.updateLineChart()
    },
  },
  methods: {
    updateLineChart() {
      this.xScale.domain([1, Math.max(this.day, 7)])

      const types = ['player', 'worstAlternate']
      const allNumbers = _.chain(this.dailyHealthStatus)
        .map(d => _.map(types, type => d[type][this.healthStatus]))
        .flatten().value()
      // this.yScale.domain(d3.extent(allNumbers, d => d))
      this.yScale.domain([1, _.max(allNumbers)])

      this.paths = _.map(types, id => {
        const points = _.map(this.dailyHealthStatus, d => {
          return [this.xScale(d.day), this.yScale(d[id][this.healthStatus])]
        })
        return {
          id,
          color: this.colorsByHealth[this.healthStatus] || this.colorsByHealth[2],
          path: this.lineGenerator(points),
          strokeDasharray: id === 'player' ? 0 : 2,
        }
      })
      // and at same time update scales
      this.tl.add(() => {
        d3.select(this.$refs.xAxis)
          .transition()
          .call(this.xAxis)
        d3.select(this.$refs.yAxis)
          .transition()
          .call(this.yAxis)
      }, `day${this.day}-1`)

      this.playTimeline('area')
    },
  },
}
</script>

<style lang="scss" scoped>
#areaChart {
  display: inline-block;
  border-left: $gray;
}
</style>
