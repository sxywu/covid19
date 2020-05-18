<template>
  <div id="lineChart" :class="$mq">
    <h3 class="label" style="grid-column: 1 / 3">{{ $t('lineChart.label') }}</h3>
    <svg class="chart" ref="svg" :width="width" :height="height">
      <!-- WEEK -->
      <rect v-if="week > 1" :x="rect.x" :y="rect.y" :width="rect.width" :height="rect.height" />
      <!-- Y-AXIS -->
      <g class="axis label" ref="yAxis" :transform="`translate(${margin.left}, 0)`" />
      <path
        v-for="d in paths"
        :key="d.id"
        :d="d.path"
        fill="none"
        :stroke="d.color"
        stroke-width="2"
        stroke-linecap="round"
        :stroke-dasharray="d.strokeDasharray"
      />
      <!-- HOSPITAL CAPACITY LINE -->
      <g class="label hospital" v-if="line.x" :transform="`translate(${line.x}, ${margin.top})`">
        <line :y2="height - margin.top - margin.bottom" :stroke="colorsByHealth[4]" />
        <text text-anchor="middle" dy="-2" :fill="colorsByHealth[4]">{{ $t('lineChart.hospital') }}</text>
      </g>
      <!-- X-AXIS -->
      <g class="axis label" ref="xAxis" :transform="`translate(0, ${height - margin.bottom})`" />
    </svg>
    <ul class="legend" :style="{width: `${legendWidth}px`}">
      <li v-for="({label, counts, strokeDasharray}) in legend">
        <div class="label">{{ label }}</div>
        <div v-for="{color, label} in counts">
          <svg :width="legendSVGWidth" height="1">
            <line
              :x2="legendSVGWidth"
              :stroke="color"
              stroke-width="2"
              stroke-linecap="round"
              :stroke-dasharray="strokeDasharray"
            />
          </svg>
          <span class="label"> {{ label }}</span>
        </div>
      </li>
      <!-- NOT ON PHONE -->
      <li v-if="!isPhone && week > 1">
        <span class="week"></span>
        <span class="label"> {{
          day > totalDays ?
          $t('lineChart.legend.reopened') :
          $t('lineChart.legend.currentWeek')
        }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'
import gsap from 'gsap'

const types = ['worstAlternate', 'player']
const healths = ['total', 5]
export default {
  name: 'LineChart',
  props: [
    'isPhone',
    'height',
    'ageGroups',
    'colorsByHealth',
    'tl',
    'phases',
    'playTimeline',
  ],
  data() {
    const legendWidth = 140
    return {
      width: null, // 12 is for padding in CSS
      legendWidth,
      legendSVGWidth: 20,
      // margin: this.isPhone ? {top: 30, right: 10, bottom: 20, left: 20} :
      //   { top: 30, right: 15, bottom: 20, left: 20 },
      margin: { top: 12, right: 15, bottom: 20, left: 20 },
      paths: [],
      rect: {},
      line: {},
    }
  },
  computed: {
    day() {
      return this.$store.state.day
    },
    totalDays() {
      return this.$store.state.totalDays
    },
    week() {
      return this.$store.getters.week
    },
    population() {
      return this.$store.getters.population
    },
    dailyHealthStatus() {
      return this.$store.getters.dailyHealthStatus
    },
    totalAvailableBeds() {
      return this.$store.getters.totalAvailableBeds
    },
    firstHospitalOverDay() {
      const firstDay = _.find(
        this.dailyHealthStatus,
        d => d.player[4] >= this.totalAvailableBeds
      )
      return firstDay && firstDay.day
    },
    legend() {
      const latest = _.last(this.dailyHealthStatus)
      return _.chain(types)
        .map(type => {
          const counts = _.map(healths, health => {
            const count = latest && (latest[type][health] || 0)
            return {
              color: this.colorsByHealth[health] || this.colorsByHealth[2],
              label: this.$tc(`lineChart.legend.${health}`, count, {
                count: this.formatNumber(count)
              }),
            }
          })
          return {
            strokeDasharray:
              type === 'player' ? 0 : type === 'worstAlternate' ? '2 4' : '12',
            label: this.$t(`lineChart.legend.types.${type}`),
            counts,
          }
        }).value()
    },
  },
  created() {
    this.xScale = d3.scaleLinear()

    this.yScale = d3.scaleLinear()
      .range([this.height - this.margin.bottom, this.margin.top])

    this.lineGenerator = d3.line().curve(d3.curveCatmullRom)

    this.xAxis = d3
      .axisBottom()
      .scale(this.xScale)
      .ticks(7)
      .tickSizeOuter(0)
      .tickFormat((d, i) => (!i ? 'Day ' : '') + d)
    this.yAxis = d3
      .axisLeft()
      .scale(this.yScale)
      .ticks(this.isPhone ? 2 : 4)
      .tickFormat(d => (d >= 1000 ? `${_.round(d / 1000, 1)}k` : d))
      .tickSizeOuter(0)
  },
  mounted() {
    this.calculateDimensions()
    this.startLineChart()
    this.calculateLineChart()
    this.animateLineChart()
  },
  watch: {
    day() {
      if (this.day === 1) {
        this.startLineChart()
      }
    },
    dailyHealthStatus() {
      this.calculateDimensions()
      this.calculateLineChart()
      this.animateLineChart()
    },
  },
  methods: {
    calculateDimensions() {
      const {width} = this.$refs.svg.getBoundingClientRect()
      if (!width) return
      Object.assign(this.$data, {width})

      this.xScale.range([this.margin.left, this.width - this.margin.right])

      this.yAxis.tickSizeInner(-this.width + this.margin.left + this.margin.right)
    },
    startLineChart() {
      this.paths = _.chain(types)
        .map(type => {
          return _.map(healths, health => {
            return {
              id: `${type}-${health}`,
              type, health,
              points: [],
              path: '',
              color: this.colorsByHealth[health] || this.colorsByHealth[2],
              strokeDasharray:
                type === 'player' ? 0 : type === 'worstAlternate' ? '2 4' : '12',
            }
          })
        }).flatten().value()
      this.rect = {
        x: this.width - this.margin.right,
        y: this.margin.top,
        width: 0,
        height: this.height - this.margin.top - this.margin.bottom,
      }
      this.line = {}
    },
    calculateLineChart() {
      if (!this.dailyHealthStatus) return

      this.xScale.domain([1, this.week * 7])
      this.yScale.domain([0, this.population.total]).nice()

      if (this.day % 7 === 1 || !this.tl) {
        // if first day of week or isn't part of week animation
        // update rect and x axis right away
        let x
        let width
        const firstDay = (this.week - 1) * 7
        if (this.day > this.totalDays) {
          // than it's "back to normal"
          x = this.xScale(this.totalDays)
          width = this.xScale(firstDay + 7) - this.xScale(this.totalDays)
        } else {
          x = this.xScale(firstDay)
          width = this.xScale(firstDay + 7) - this.xScale(firstDay)
        }
        Object.assign(this.rect, {x, width})
        d3.select(this.$refs.xAxis).call(this.xAxis)

        // and then recalculate all path points with new scale
        _.each(this.paths, d => {
          d.points = _.map(d.points, ([x, y], i) => {
            return [_.round(this.xScale(i + 1), 2), y]
          })
        })
      }

      if (this.firstHospitalOverDay) {
        this.line.x = this.xScale(this.firstHospitalOverDay)
      }

      // calculate next point
      _.each(this.paths, d => {
        const nextPoints = _.map(this.dailyHealthStatus, o => {
          return [
            _.round(this.xScale(o.day), 2),
            _.round(this.yScale(o[d.type][d.health] || 0), 0),
          ]
        })
        // for sake of animation make previous path have same number of points as next set
        const lastPoint = d.points.length ? _.last(d.points) : nextPoints[0]
        _.times(this.dailyHealthStatus.length - d.points.length, i =>
          d.points.push(lastPoint)
        )

        return Object.assign(d, {
          points: nextPoints,
          path: this.lineGenerator(d.points),
          nextPath: this.lineGenerator(nextPoints),
        })
      })
    },
    animateLineChart() {
      if (!this.dailyHealthStatus) return

      if (this.tl) {
        // if this is part of the timeline
        const duration = this.phases[1]
        this.tl.to(
          this.paths,
          {
            duration,
            path: (i, d) => d.nextPath,
          },
          `day${this.day}-1`
        )
        // y scale
        this.tl.add(() => {
          d3.select(this.$refs.yAxis)
            .transition()
            .on('start', this.formatYAxis)
            .call(this.yAxis)
        }, `day${this.day}-1`)

        this.playTimeline('area')
      } else {
        d3.select(this.$refs.yAxis).call(this.yAxis)
        this.formatYAxis(null, null, [this.$refs.yAxis])
        _.each(this.paths, d => Object.assign(d, { path: d.nextPath }))
      }
    },
    formatYAxis(d, i, nodes) {
      const container = d3.select(nodes[0])
      container.select('path').remove()
      container
        .selectAll('line')
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
  width: 100%;
  display: inline-block;
  border-left: $gray;
  display: grid;
  grid-template-columns: auto 140px;
  grid-template-rows: repeat(2, auto);
  align-items: center;
}

svg.chart {
  width: 100%;
  overflow: visible;

  rect {
    fill: $gray;
  }

  .axis {
    font-size: 10px;

    line {
      stroke: $gray;
    }
  }

  .hospital {
    font-size: 10px;
  }
}

.legend {
  margin: 0;
  padding: 0;
  text-align: left;

  ul,
  li {
    list-style-type: none;
    padding: 0;
  }
  li {
    padding: 0.35rem 0;
    align-items: center;
  }

  svg {
    vertical-align: middle;
  }

  .label {
    white-space: nowrap;
    font-variant-numeric: tabular-nums;

  }

  .week {
    width: 30px;
    height: 0.75rem;
    display: inline-block;
    background-color: $gray;
    vertical-align: middle;
  }
}

.sm {
  padding: 0.5rem 0px 0.5px 0.75rem;
  border-top: 1px solid $gray;

  .legend {
    margin: 0;
  }
}
</style>
