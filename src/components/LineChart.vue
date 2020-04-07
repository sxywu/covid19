<template>
  <div id="areaChart">
    <svg :width="width" :height="height">
      <text :x="margin.right" dy="1em" class="label">Infected cases by day</text>
      <path v-for="d in paths" :key="d.id" :d="d.path" fill="none"
        :stroke="d.color" stroke-width="2" />
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
    this.stackGenerator = d3
      .stack()
      .keys(healthStatus)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)

    this.xScale = d3
      .scaleLinear()
      .range([margin.left, this.width - margin.right])
    this.yScale = d3
      .scaleLinear()
      .range([this.height - margin.bottom, margin.top])

    this.lineGenerator = d3
      .line()
      .curve(d3.curveCatmullRom)

    this.xAxis = d3.axisBottom().scale(this.xScale).ticks(7)
    this.yAxis = d3.axisLeft().scale(this.yScale)
      .ticks(5)
      .tickFormat(d => (d >= 1000 ? `${_.round(d / 1000)}k` : d))
  },
  mounted() {
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
    day() {
      if (this.day === 1) {
        this.startLineChart()
      }
    },
    infected() {
      this.updateLineChart()
    },
  },
  methods: {
    startLineChart() {
      this.healthByDay = [{ day: 0, 4: 0, 3: 0, 2: 0 }]
      this.paths = _.map(healthStatus.reverse(), health => {
        return { id: health, path: '', color: this.colorsByHealth[health] }
      })
    },
    updateLineChart() {
      this.xScale.domain([0, Math.max(this.day, 7)])

      this.healthByDay.push(
        Object.assign(_.countBy(this.infected, 'health'), { day: this.day })
      )

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
            path: this.lineGenerator(points),
          }
        })
        .keyBy('id')
        .value()

      // set up gsap animation
      this.tl.to(
        this.paths,
        {
          path: (i, { id }) => nextPathsById[id].path,
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
