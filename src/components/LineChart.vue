<template>
  <div id="lineChart">
    <svg :width="width" :height="height">
      <text :x="margin.left" dy="1em" class="label">Total Cases Daily Growth Rate</text>
      <!-- WEEK -->
      <rect v-if="week > 1" :x="rect.x" :y="rect.y" :width="rect.width" :height="rect.height" />
      <!-- Y-AXIS -->
      <g class="axis" ref="yAxis" :transform="`translate(${margin.left}, 0)`" />
      <path v-for="d in paths" :key="d.type" :d="d.path" fill="none"
        :stroke="pathColor" stroke-width="2"
        stroke-linecap="round" :stroke-dasharray="d.strokeDasharray" />
      <!-- X-AXIS -->
      <g class="axis" ref="xAxis" :transform="`translate(0, ${height - margin.bottom})`" />
    </svg>
    <ul class="legend">
      <li v-for="({label, count, strokeDasharray}) in legend">
        <div>
          <svg :width="legendSVGWidth" height="1">
            <line :x2="legendSVGWidth" :stroke="pathColor" stroke-width="2"
              stroke-linecap="round" :stroke-dasharray="strokeDasharray" />
          </svg>
          <span class="label">  {{ formatNumber(count) }} Cases</span>
        </div>
        <div class="label">{{ label }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'

const types = ['worstAlternate', 'player', 'bestAlternate']
const margin = {top: 30, right: 20, bottom: 20, left: 20}
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
      legendSVGWidth: 60,
      pathColor: this.colorsByHealth[2],
      margin,
      paths: [],
      rect: {},
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

    this.xAxis = d3.axisBottom().scale(this.xScale)
      .ticks(7).tickSizeOuter(0)
      .tickFormat((d, i) => (!i ? 'Day ' : '') + d)
    this.yAxis = d3.axisLeft().scale(this.yScale)
      .ticks(6, d3.format(",.1s"))
      .tickSizeOuter(0)
      .tickSizeInner(-this.width + margin.left + margin.right)
  },
  computed: {
    day() {
      return this.$store.state.day
    },
    week() {
      return this.$store.getters.week
    },
    dailyHealthStatus() {
      return this.$store.getters.dailyHealthStatus
    },
    legend() {
      const latest = _.last(this.dailyHealthStatus)
      return _.map(types, type => {
        return {
          strokeDasharray: type === 'player' ? 0 : (type === 'worstAlternate' ? '2 4' : '12'),
          count: latest && latest[type].total,
          label: type === "worstAlternate" ?
            'Worst Case Scenario' : type === "player" ?
            'Current Scenario' :
            'Best Case Scenario'
        }
      })
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
          points: [],
          path: '',
          strokeDasharray: type === 'player' ? 0 : (type === 'worstAlternate' ? '2 4' : '12'),
        }
      })
      this.rect = {
        x: this.width - margin.right, y: margin.top,
        width: 0, height: this.height - margin.top - margin.bottom,
      }
    },
    updateLineChart() {
      this.xScale.domain([1, this.week * 7])

      const allNumbers = _.chain(this.dailyHealthStatus)
        .map(d => _.map(types, type => d[type].total))
        .flatten().value()
      const [min, max] = d3.extent(allNumbers, d => d)
      this.yScale.domain([_.floor(min, -1) || 1, _.ceil(max, -1)])

      if (this.day % 7 === 1) {
        // if first day of week update rect and x axis right away
        const firstDay = (this.week - 1) * 7
        Object.assign(this.rect, {
          x: this.xScale(firstDay),
          width: this.xScale(firstDay + 7) - this.xScale(firstDay)
        })
        d3.select(this.$refs.xAxis).call(this.xAxis)

        // and then recalculate all path points with new scale
        _.each(this.paths, d => {
          d.points = _.map(d.points, ([x, y], i) => {
            return [_.round(this.xScale(i + 1), 2), y]
          })
        })
      }

      // calculate next point
      _.each(this.paths, d => {
        const nextPoints = _.map(this.dailyHealthStatus, o => {
          return [_.round(this.xScale(o.day), 2), _.round(this.yScale(o[d.type].total), 0)]
        })
        // for sake of animation make previous path have same number of points as next set
        const lastPoint = d.points.length ? _.last(d.points) : nextPoints[0]
        _.times(this.dailyHealthStatus.length - d.points.length, i => d.points.push(lastPoint))

        return Object.assign(d, {
          points: nextPoints,
          path: this.lineGenerator(d.points),
          nextPath: this.lineGenerator(nextPoints),
        })
      })

      // else animate paths and y axis
      this.tl.to(this.paths, {
        duration: this.phases[1],
        path: (i, d) => d.nextPath,
      }, `day${this.day}-1`)
      // y scale
      this.tl.add(() => {
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
    formatNumber(number) {
      return d3.format(',')(Math.round(number))
    },
  },
}
</script>

<style lang="scss" scoped>
#lineChart {
  display: inline-block;
  border-left: $gray;
  display: grid;
  grid-template-columns: repeat(2, min-content);
}

svg {
  overflow: visible;

  rect {
    fill: $gray;
  }

  .axis line {
    stroke: $gray;
  }
}

ul,
li {
  list-style-type: none;
  padding: 0;
}
li {
  padding: 0.25rem 0;
  align-items: center;
}

.legend {
  svg {
    vertical-align: middle;
  }

  .label {
    white-space: nowrap;
  }
}
</style>
