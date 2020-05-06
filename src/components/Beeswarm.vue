<template>
  <div id="beeswarm">
    <svg :width="width" :height="height">
      <!-- AXIS -->
      <g
        class="axis label"
        ref="xAxis"
        :transform="`translate(0, ${height - margin.bottom})`"
      />
      <g v-for="(d, i) in people" :key="i"
        :transform="`translate(${d.x - imageWidth / 2}, ${d.y})`">
        <image
          :width="imageWidth"
          :height="imageHeight"
          :href="d.image"
          opacity="0.75"
        />
        <image v-if="d.isPlayer"
          :width="imageWidth" :height="imageHeight" href="../assets/star.svg" />
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
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'

const images = [
  require('../assets/person-1.svg'),
  require('../assets/person-2.svg'),
]
const imageWidth = 15
const imageRatio = 94 / 52
export default {
  name: 'Beeswarm',
  props: ['isPhone', 'width', 'type', 'decision'],
  data() {
    return {
      height: 300,
      imageWidth,
      imageHeight: imageWidth * imageRatio,
      margin: { top: 20, right: 0, bottom: 20, left: 80 },
      activities: _.map(
        ['groceries', 'exercise', 'small', 'large'],
        (key, index) => {
          return {
            label: this.$t(`decide.activities.${key}.label`),
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

      const perHeight = (this.height - this.margin.top - this.margin.bottom) / this.activities.length
      this.people = _.chain(this.activities)
        .map((label, activity) => {
          const forceY = (activity + 0.5) * perHeight + this.margin.top
          return _.map(this.allDecisions, (weeklyDecisions, person) => {
            let decision = (weeklyDecisions[this.week] || this.decision)[activity]
            if (this.type === 'all') {
              // if showing all weeks and first person doesn't have all 8 weeks
              if (weeklyDecisions.length !== 8) return
              decision = _.chain(weeklyDecisions)
                .map(d => d[activity])
                .mean().round(1).value()
            }
            return {
              image: images[_.random(1)],
              isPlayer: person === 0,
              forceX: this.xScale(decision),
              forceY,
            }
          })
        }).flatten().filter().value()

      this.simulation.nodes(this.people)
      _.times(250, i => this.simulation.tick())
    },
    renderAxis() {
      d3.select(this.$refs.xAxis).call(this.xAxis)
      d3.select(this.$refs.xAxis).select('path').remove()
      d3.select(this.$refs.xAxis).selectAll('line')
        .attr('stroke', '#cfcfcf')
        .attr('stroke-dasharray', '5')

      const perHeight = (this.height - this.margin.top - this.margin.bottom) / this.activities.length
      _.each(this.activities, (d, i) => d.y = this.margin.top + (i + 0.5) * perHeight)
    },
  },
}
</script>

<style lang="scss" scoped>
#beeswarm {
  position: relative;
}

svg {
  overflow: visible;
}

.annotation {
  position: absolute;
  text-align: right;
}
</style>
