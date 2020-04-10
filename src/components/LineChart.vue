<template>
  <div id="lineChart">
    <svg :width="width" :height="height">
      <text :x="margin.right" dy="1em" class="label">Case Growth Rate</text>
      <g ref="yAxis" :transform="`translate(${margin.left}, 0)`" />
      <path v-for="d in paths" :key="d.type" :d="d.path" fill="none"
        :stroke="d.color" stroke-width="2"
        stroke-linecap="round" :stroke-dasharray="d.strokeDasharray" />
      <g ref="xAxis" :transform="`translate(0, ${height - margin.bottom})`" />
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'

const types = ['player', 'worstAlternate', 'bestAlternate']
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
      .ticks(6, d3.format(",.1s"))
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
  },
  watch: {
    day() {
      if (this.day === 1) {
        this.startLineChart()
      }
    },
    dailyHealthStatus() {
      this.updateLineChart()
    },
  },
  methods: {
    startLineChart() {
      this.paths = _.map(types, type => {
        return {
          type,
          color: this.colorsByHealth[2], // a different color for total?
          points: [],
          path: '',
          strokeDasharray: type === 'player' ? 0 : (type === 'worstAlternate' ? '2 4' : '12'),
        }
      })
    },
    updateLineChart() {
      this.xScale.domain([1, Math.max(this.day, 7)])

      const allNumbers = _.chain(this.dailyHealthStatus)
        .map(d => _.map(types, type => d[type].total))
        .flatten().value()
      const [min, max] = d3.extent(allNumbers, d => d)
      this.yScale.domain([_.floor(min, -1), _.ceil(max, -1)])

      _.each(this.paths, d => {
        const nextPoints = _.map(this.dailyHealthStatus, o => {
          return [this.xScale(o.day), this.yScale(o[d.type].total)]
        })
        // debugger
        // for sake of animation make previous path have same number of points as next set
        const lastPoint = d.points.length ? _.last(d.points) : nextPoints[0]
        _.times(this.dailyHealthStatus.length - d.points.length, i => d.points.push(lastPoint))

        return Object.assign(d, {
          points: nextPoints,
          path: this.lineGenerator(d.points),
          nextPath: this.lineGenerator(nextPoints),
        })
      })

      this.tl.to(this.paths, {
        duration: this.phases[1],
        path: (i, d) => d.nextPath,
      }, `day${this.day}-1`)

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
        .filter(d => !_.includes([1, 5, 10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000], d))
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
#lineChart {
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
