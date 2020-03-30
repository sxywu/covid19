<template>
  <div id="areaChart">
    <strong>Infected cases by day</strong><br />
    <svg :width='width' :height='height'>
      <path v-for='d in paths' :key='d.id' :d='d.path' :fill='d.color' />
      <g ref='xAxis' :transform='`translate(0, ${height - margin.bottom})`' />
      <g ref='yAxis' :transform='`translate(${margin.left}, 0)`' />
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'

const healthStatus = [4, 3, 2]
const margin = {top: 20, right: 20, bottom: 20, left: 30}
export default {
  name: 'AreaChart',
  props: ['ageGroups', 'colorsByHealth', 'tl', 'phases', 'playTimeline'],
  data() {
    return {
      width: 500,
      height: 150,
      margin,
      paths: [],
    }
  },
  created() {
    this.healthByDay = [{day: 0, 4: 0, 3: 0, 2: 0}]

    this.stackGenerator = d3.stack()
      .keys(healthStatus)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)

    this.xScale = d3.scaleLinear().range([margin.left, this.width - margin.right])
    this.yScale = d3.scaleLinear().range([this.height - margin.bottom, margin.top])

    this.areaGenerator = d3.area()
      .y0(this.yScale(0))
      .curve(d3.curveCatmullRom)

    this.xAxis = d3.axisBottom().scale(this.xScale)
    this.yAxis = d3.axisLeft().scale(this.yScale)
      .ticks(5)
      .tickFormat(d => d >= 1000 ? `${_.round(d / 1000)}k` : d)
  },
  mounted() {
    this.paths = _.map(healthStatus.reverse(), health => {
      return {id: health, path: '', color: this.colorsByHealth[health]}
    })
  },
  computed: {
    day() {
      return this.$store.state.day
    },
    infected() {
      return this.$store.getters.infected
    },
  },
  watch: {
    infected() {
      this.updateAreaChart()
      d3.select(this.$refs.xAxis).call(this.xAxis)
      d3.select(this.$refs.yAxis).call(this.yAxis)
    },
  },
  methods: {
    updateAreaChart() {
      this.xScale.domain([0, Math.max(this.day + 1, 12)])

      this.healthByDay.push(Object.assign(
        _.countBy(this.infected, 'health'),
        {day: this.day + 1}
      ))

      const stacks = this.stackGenerator(this.healthByDay)
      this.yScale.domain([0, d3.max(_.flatten(stacks), d => d[1])])

      const nextPathsById = _.chain(stacks)
        .map(stack => {
          const points = _.map(stack, d => {
            let [y0, y1] = d
            y1 = y1 || 0 // in case they are NaN
            return [this.xScale(d.data.day), this.yScale(y1)]
          })
          return {
            id: stack.key,
            path: this.areaGenerator(points),
          }
        }).keyBy('id').value()

      // set up gsap animation
      this.tl.to(this.paths, {
        path: (i, {id}) => nextPathsById[id].path,
        duration: this.phases[1] / 2,
      }, `day${this.day}-1`)

    },
  },
}
</script>

<style scoped>
#areaChart {
  display: inline-block;
  border-left: #efefef;
}
</style>
