<template>
  <div id="beeswarm">
    <h3 class="label" v-html="$tc('beeswarm.h3', this.type === 'all' ? 8 : 1)" />
    <div class="container">
      <svg :width="width" :height="height">
        <!-- AXIS -->
        <g
          class="axis label"
          ref="xAxis"
          :transform="`translate(0, ${margin.top})`"
        />
        <g class="label">
          <text class="label" v-for="d in axisLabels"
            :x="d.x" :text-anchor="d.anchor" dy="1em">
            {{ d.label }}
          </text>
        </g>
        <!-- PEOPLE -->
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
          top: `${d.y}px`,
          width: `${margin.left}px`,
        }">
          For <strong>{{ d.label }}</strong>
        </div>
      </div>
    </div>
    <!-- LEGEND -->
    <div class="legends">
      <div class="legend" v-for="d in legend">
        <svg :width="0.75 * imageWidth" :height="0.75 * imageHeight">
          <image :width="0.75 * imageWidth" :height="0.75 * imageHeight"
            :href="d.image" :opacity="d.opacity" />
          <image v-if="d.hasStar"
            :width="0.75 * imageWidth" :height="0.75 * imageHeight" :href="starImage" />
        </svg>
        <span>{{ d.label }}</span>
      </div>
      <p>
        <sup>*{{ $t('landing.NPCDisclaimer') }}</sup>
      </p>
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
    const height = 240
    const margin = { top: 20, right: 40, bottom: 0, left: 85 }
    const perHeight = (height - margin.top - margin.bottom) / 4
    this.xScale = d3
      .scaleLinear()
      .domain([-0.5, 7.5])
      .range([margin.left, this.width - margin.right])

    return {
      height, margin,
      imageWidth,
      imageHeight: imageWidth * imageRatio,
      starImage,
      legend: [
        {
          label: this.$t('beeswarm.legend.you'), image: images[_.random(1)],
          hasStar: true, opacity: 0.85,
        },
        {
          label: this.$t('beeswarm.legend.teammates'), image: images[_.random(1)],
          hasStar: false, opacity: 0.85,
        },
        {
          label: this.$t('beeswarm.legend.npc') + '*', image: images[_.random(1)],
          hasStar: false, opacity: 0.35,
        },
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
      axisLabels: [
        {
          label: this.$t('beeswarm.axis.out'), anchor: 'end',
          x: this.xScale(0) - 8,
        },
        {
          label: this.$t('beeswarm.axis.times'),
          anchor: 'start', x: this.xScale(7) + 8,
        },
      ],
    }
  },
  computed: {
    week() {
      return this.$store.getters.week
    },
    allDecisions() {
      return this.$store.getters.allDecisions
    },
    pastPlayers() {
      return this.$store.getters.pastPlayerIDs
    },
  },
  created() {
    this.xAxis = d3
      .axisBottom()
      .scale(this.xScale)
      .tickSizeOuter(0)
      .tickSizeInner(this.height - this.margin.top - this.margin.bottom)
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
      if (!this.allDecisions || !this.pastPlayers) return

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

      this.simulation.nodes(this.people).alpha(1)
      _.times(250, i => this.simulation.tick())
    },
    renderAxis() {
      d3.select(this.$refs.xAxis).call(this.xAxis)
      d3.select(this.$refs.xAxis).select('path').remove()
      d3.select(this.$refs.xAxis).selectAll('line')
        .attr('stroke', '#cfcfcf')
        .attr('stroke-dasharray', '5 10')
      d3.select(this.$refs.xAxis).selectAll('text')
        .attr('y', -this.margin.top)
        .attr('dy', '1em')
    },
  },
}
</script>

<style lang="scss" scoped>

h3 {
  margin-bottom: 15px;
}

.container {
  position: relative;
}

.legends {
  text-align: center;
  max-width: 600px;
  margin: auto;

  .legend {
    display: inline-block;
    margin: 10px 10px 0 10px;

    span {
      display: inline-block;
      margin-left: 5px;
      vertical-align: bottom;
    }
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
  transform: translate(0, -50%);
}
</style>
