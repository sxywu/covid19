<template>
  <div id="barChart">
    <svg :width='width' :height='height'>
      <rect v-for='d in bars' :x='d.x' :y='d.y'
        :width='barWidth' :height='d.height' :fill='d.color' />
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'

const margin = {top: 20, right: 20, bottom: 20, left: 20}
export default {
  name: 'BarChart',
  props: ['ageGroups', 'healthStatus', 'colorsByHealth'],
  data() {
    return {
      width: 200,
      height: 200,
      bars: [],
      barWidth: 0,
    }
  },
  created() {
    this.stackGenerator = d3.stack()
      .keys([4, 3, 2])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)

    this.xScale = d3.scaleBand().domain(_.values(this.ageGroups))
      .range([margin.left, this.width - margin.right])
      .paddingInner(0.2)
    this.yScale = d3.scaleLinear().range([this.height - margin.bottom, margin.top])
    this.barWidth = this.xScale.bandwidth()
  },
  computed: {
    population() {
      return this.$store.getters.population
    },
    people() {
      return this.$store.getters.community && this.$store.getters.community.people
    },
    infected() {
      return this.$store.getters.infected
    },
  },
  watch: {
    infected() {
      this.updateBarChart()
    },
  },
  methods: {
    updateBarChart() {
      const healthByAge = _.chain(this.people)
        .groupBy('ageGroup')
        .map((people, age) => {
          return Object.assign(
            _.countBy(people, ({index}) => this.infected[index].health),
            {ageGroup: this.ageGroups[age]}
          )
        }).value()

      const stacks = this.stackGenerator(healthByAge)
      this.yScale.domain([0, d3.max(_.flatten(stacks), d => d[1])])
      this.bars = _.chain(stacks)
        .map(stack => {
          return _.map(stack, d => {
            const [y1, y2] = d
            return {
              x: this.xScale(d.data.ageGroup),
              y: this.yScale(y2),
              height: this.yScale(y1) - this.yScale(y2),
              color: this.colorsByHealth[stack.key]
            }
          })
        }).flatten().value()
    },
  },
}
</script>

<style scoped>
#barChart {
  display: inline-block;
}
</style>
