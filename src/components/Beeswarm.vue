<template>
  <div id="beeswarm">
    <div class="label">
      <div class="legend" v-for="d in legend">
        <svg :width="0.75 * imageWidth" :height="0.75 * imageHeight">
          <image :width="0.75 * imageWidth" :height="0.75 * imageHeight"
            :href="d.image" :opacity="d.opacity" />
          <image v-if="d.hasStar"
            :width="0.75 * imageWidth" :height="0.75 * imageHeight" :href="starImage" />
        </svg>
        <span>{{ d.label }}</span>
      </div>
    </div>
    <div class="container">
      <svg :width="width" :height="height">
        <!-- AXIS -->
        <g
          class="axis label"
          ref="xAxis"
          :transform="`translate(0, ${height - margin.bottom})`"
        />
        <g class="label" :transform="`translate(0, ${height})`">
          <text class="label" :x="margin.left" text-anchor="end" dy='.35em'>
            Went out
          </text>
          <text class="label" :x="width - margin.right" text-anchor="start" dy='.35em'>
            times
          </text>
        </g>
        <g v-for="(d, i) in people" :key="i"
          :transform="`translate(${d.x - imageWidth / 2}, ${d.y - imageHeight / 2})`">
          <image :width="imageWidth" :height="imageHeight"
            :href="d.image" :opacity="d.opacity" />
          <image v-if="d.hasStar"
            :width="imageWidth" :height="imageHeight" :href="starImage" />
        </g>
      </svg>
      <div class="label">
        <div class="annotation" v-for="d in activities" :style="{
          top: `${d.y - 12}px`,
          width: `${margin.left}px`,
        }">
          {{ d.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'

const images = [
  require('../assets/person-1.svg'),
  require('../assets/person-2.svg'),
]
const starImage = require('../assets/star.svg')
const imageWidth = 16
const imageRatio = 94 / 52
export default {
  name: 'Beeswarm',
  props: ['isPhone', 'width', 'type', 'decisions'],
  data() {
    const height = 250
    const margin = { top: 10, right: 40, bottom: 20, left: 75 }
    const perHeight = (height - margin.top - margin.bottom) / 4

    return {
      height, margin,
      imageWidth,
      imageHeight: imageWidth * imageRatio,
      starImage,
      legend: [
        {label: "You", image: images[_.random(1)], hasStar: true, opacity: 0.85},
        {label: "Your Teammates", image: images[_.random(1)], hasStar: false, opacity: 0.85},
        {label: "NPC", image: images[_.random(1)], hasStar: false, opacity: 0.35},
      ],
      activities: _.map(
        ['groceries', 'exercise', 'small', 'large'],
        (key, i) => {
          return {
            label: this.$t(`decide.activities.${key}.label`),
            y: (i + 0.5) * perHeight + margin.top,
          }
        }
      ),
      people: [],
    }
  },
  computed: {
    week() {
      return this.$store.getters.week
    },
    allDecisions() {
      return this.$store.state.allDecisions
    },
    pastPlayers() {
      return this.$store.state.pastPlayerIDs
    },
  },
  created() {
    this.xScale = d3
      .scaleLinear()
      .domain([-0.5, 7.5])
      .range([this.margin.left, this.width - this.margin.right])

    this.xAxis = d3
      .axisBottom()
      .scale(this.xScale)
      .tickSizeOuter(0)
      .tickSizeInner(-this.height + this.margin.top + this.margin.bottom)
      .tickFormat(d => _.isInteger(d)? _.round(d) : '')

    this.simulation = d3.forceSimulation()
      .force('x', d3.forceX().x(d => d.forceX))
      .force('y', d3.forceY().y(d => d.forceY))
      .force('collide', d3.forceCollide(this.imageWidth * 0.45))
      .stop()
  },
  mounted() {
    this.calculatePeople()
    this.renderAxis()
  },
  watch: {
    allDecisions() {
      this.calculatePeople()
    },
  },
  methods: {
    calculatePeople() {
      if (!this.allDecisions.length) return

      console.log(this.pastPlayers.length)
      this.people = _.chain(this.activities)
        .map(({y}, activity) => {
          return _.map(this.allDecisions, (weeklyDecisions, person) => {
            let decision
            if (this.type === 'all') {
              // if showing all weeks and first person doesn't have all 8 weeks
              if (weeklyDecisions.length !== 8) return
              decision = _.chain(weeklyDecisions)
                .map(d => d[activity])
                .mean().round(1).value()
            } else {
              decision = (weeklyDecisions[this.week] || this.decisions)[activity]
            }
            return {
              image: images[_.random(1)],
              hasStar: person === 0,
              opacity: person > this.pastPlayers.length ? 0.35 : 0.85,
              forceX: this.xScale(decision),
              forceY: y,
            }
          })
        }).flatten().filter()
        .sortBy(d => (d.hasStar ? 1 : 0) + d.opacity).value()

      this.simulation.nodes(this.people)
      _.times(250, i => this.simulation.tick())
    },
    renderAxis() {
      d3.select(this.$refs.xAxis).call(this.xAxis)
      d3.select(this.$refs.xAxis).select('path').remove()
      d3.select(this.$refs.xAxis).selectAll('line')
        .attr('stroke', '#cfcfcf')
        .attr('stroke-dasharray', '5 10')
      d3.select(this.$refs.xAxis).selectAll('text')
        .attr('y', this.margin.bottom)
        .attr('dy', '.35em')
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
}

.legend {
  display: inline-block;
  margin: 0 10px;

  span {
    display: inline-block;
    margin-left: 5px;
    vertical-align: bottom;
  }
}

.label {
  text-align: center;
}

svg {
  overflow: visible;
}

.annotation {
  position: absolute;
  text-align: right;
  font-weight: bold;
}
</style>
