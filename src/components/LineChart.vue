<template>
  <div id="areaChart">
    <svg :width="width" :height="height">
      <text :x="margin.right" dy="1em" class="label">Case Growth Rate</text>
      <g ref="yAxis" :transform="`translate(${margin.left}, 0)`" />
      <path v-for="d in paths" :key="d.id" :d="d.path" fill="none"
        :stroke="d.color" stroke-width="2"
        stroke-linecap="round" :stroke-dasharray="d.strokeDasharray" />
      <g ref="xAxis" :transform="`translate(0, ${height - margin.bottom})`" />
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'

const margin = {top: 30, right: 20, bottom: 20, left: 30}
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
      yAxis: [],
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
      .ticks(4, d3.format(",.1s"))
      .tickSizeOuter(0)
      .tickSizeInner(-this.width + margin.left + margin.right)
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
      return _.last(this.dailyHealthStatus).player[5] ? 5 : 'total'
    },
  },
  watch: {
    dailyHealthStatus() {
      this.updateLineChart()
    },
  },
  methods: {
    updateLineChart() {
      this.xScale.domain([0, Math.max(this.day, 7)])

      const types = ['player', 'worstAlternate', 'bestAlternate']
      const allNumbers = _.chain(this.dailyHealthStatus)
        .map(d => _.map(types, type => d[type][this.healthStatus]))
        .flatten().value()
      const [min, max] = d3.extent(allNumbers, d => d)
      // this.yScale.domain(d3.extent(allNumbers, d => d))
      this.yScale.domain([min, max]).nice()

      this.paths = _.map(types, type => {
        const firstDay = _.find(this.dailyHealthStatus, d => d[type][this.healthStatus]).day
        const points = _.chain(this.dailyHealthStatus)
          .filter(({day}) => day >= firstDay)
          .map(d => {
            return [this.xScale(d.day - firstDay), this.yScale(d[type][this.healthStatus])]
          }).value()
        return {
          id: type,
          color: this.colorsByHealth[this.healthStatus] || this.colorsByHealth[2],
          path: this.lineGenerator(points),
          strokeDasharray: type === 'player' ? 0 : (type === 'worstAlternate' ? '2 4' : '12'),
        }
      })
      // and at same time update scales
      this.tl.add(() => {
        d3.select(this.$refs.xAxis)
          .transition()
          .call(this.xAxis)
        d3.select(this.$refs.yAxis)
          .transition()
          .on('start', this.formatYAxis)
          .call(this.yAxis)
      }, `day${this.day}-1`)

      this.playTimeline('area')
    },
    formatYAxis(d, i, nodes) {
      const container = d3.select(nodes[0])
      container.select('path').remove()
      container.selectAll('g')
        .filter(d => !_.includes([10, 100, 1000, 10000, 100000], d))
        .remove()
      container.selectAll('line')
        .attr('stroke-dasharray', '5')
        .attr('stroke', '#cfcfcf')
        .attr('shape-rendering', 'crispEdges')
    },
  },
}
</script>

<style lang="scss" scoped>
#areaChart {
  display: inline-block;
  border-left: $gray;
}

svg {
  overflow: visible;

  line {
    stroke: $gray;
  }
}
</style>
