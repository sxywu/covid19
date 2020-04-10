<template>
  <div id="barChart">
    <svg :width="width" :height="height">
      <text :x="margin.right" dy="1em" class="label">Infected cases by age group</text>
      <g ref="yAxis" :transform="`translate(${margin.left}, 0)`" />
      <g v-for="d in bars" v-if="d.height" :key="d.id" :transform='`translate(${d.x}, ${d.y})`'>
        <rect :width="barWidth" :height="d.height" :fill="d.color" opacity="0.75" />
        <line :x2="barWidth" :stroke="d.color" :stroke-width="2" />
      </g>
      <g ref="xAxis" :transform="`translate(0, ${height - margin.bottom})`" />
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'

const healthStatus = [2, 3, 4, 5]
const margin = {top: 30, right: 20, bottom: 20, left: 30}
export default {
  name: 'BarChart',
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
      width: 300,
      margin,
      bars: [],
      barWidth: 0,
    }
  },
  created() {
    this.stackGenerator = d3
      .stack()
      .keys(healthStatus)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)

    this.xScale = d3
      .scaleBand()
      .domain(_.values(this.ageGroups))
      .range([margin.left, this.width - margin.right])
      .padding(0.45)
    this.yScale = d3
      .scaleLinear()
      .range([this.height - margin.bottom, margin.top])
    this.barWidth = this.xScale.bandwidth()

    this.xAxis = d3.axisBottom().scale(this.xScale).tickSizeOuter(0)
    this.yAxis = d3
      .axisLeft()
      .scale(this.yScale)
      .ticks(4)
      .tickSizeOuter(0)
      .tickSizeInner(-this.width + margin.left + margin.right)
      .tickFormat(d => (d >= 1000 ? `${_.round(d / 1000, 1)}k` : d))
  },
  computed: {
    day() {
      return this.$store.state.day
    },
    population() {
      return this.$store.getters.population
    },
    people() {
      return (
        this.$store.getters.community && this.$store.getters.community.people
      )
    },
    infected() {
      return this.$store.getters.infected
    },
  },
  watch: {
    day() {
      if (this.day === 1) {
        this.startBarChart()
      }
    },
    infected() {
      this.updateBarChart()
    },
  },
  methods: {
    startBarChart() {
      // create bars so that can animate later
      // outer array is health status, inner is age groups
      this.bars = _.chain(healthStatus)
        .map(health => {
          return _.map(_.values(this.ageGroups), ageGroup => {
            return {
              id: `${health}-${ageGroup}`,
              x: this.xScale(ageGroup),
              y: this.yScale(0),
              height: 0,
              color: this.colorsByHealth[health],
            }
          })
        })
        .flatten()
        .value()
    },
    updateBarChart() {
      const healthByAge = _.chain(this.people)
        .groupBy('ageGroup')
        .map((people, age) => {
          return Object.assign(
            _.reduce(healthStatus, (obj, health) => {
              obj[health] = _.sumBy(people, ({index}) => this.infected[index].health === health)
              return obj
            }, {}),
            { ageGroup: this.ageGroups[age] }
          )
        })
        .value()

      const stacks = this.stackGenerator(healthByAge)
      this.yScale.domain([0, d3.max(_.flatten(stacks), d => d[1])])
      const nextBarsById = _.chain(stacks)
        .map(stack => {
          return _.map(stack, d => {
            let [y1, y2] = d
            return {
              id: `${stack.key}-${d.data.ageGroup}`,
              x: this.xScale(d.data.ageGroup),
              y: this.yScale(y2),
              height: this.yScale(y1) - this.yScale(y2),
            }
          })
        })
        .flatten()
        .keyBy('id')
        .value()

      // set up gsap animation
      this.tl.to(
        this.bars,
        {
          x: (i, { id }) => nextBarsById[id].x,
          y: (i, { id }) => nextBarsById[id].y,
          height: (i, { id }) => nextBarsById[id].height,
          duration: this.phases[1] / 2,
        },
        `day${this.day}-1`
      )
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

      this.playTimeline('bar')
    },
    formatYAxis(d, i, nodes) {
      const container = d3.select(nodes[0])
      container.select('path').remove()
      container.selectAll('line')
        .attr('stroke-dasharray', '5')
        .attr('stroke', '#cfcfcf')
        .attr('shape-rendering', 'crispEdges')
    },
  },
}
</script>

<style scoped>
#barChart {
  display: inline-block;
}
</style>
