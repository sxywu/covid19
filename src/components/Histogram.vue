<template>
  <div id="histogram">
    <svg :width="width" :height="height">
      <g v-for="(d, i) in people" :key="i"
        :transform="`translate(${d.x - imageWidth / 2}, ${d.y})`">
        <image
          :height="imageHeight"
          :href="d.image"
          opacity="0.85"
        />
        <g v-if="d.isPlayer">
          <image :height="imageHeight" href="../assets/star.svg" />
          <text class="label" :x="imageWidth / 2" text-anchor="middle"
            :y="imageHeight + margin.bottom / 2" dy="1em">YOU</text>
        </g>
      </g>
      <g
        class="label"
        v-if="annotations.average &&
          annotations.average !== annotations.usual &&
          annotations.average !== annotations.best"
        :transform="`translate(${annotations.average}, ${height - margin.bottom})`"
      >
        <line :y2="margin.bottom * 0.8" stroke="#333" />
        <circle r="3" />
        <text
          :y="margin.bottom * 0.8 + 2"
          dy="1em"
          text-anchor="middle"
          font-weight="bold"
        >
          {{ $t('histogram.average') }}
        </text>
      </g>
      <line :x1="margin.left" :x2="width - margin.right"
        :y1="height - margin.bottom" :y2="height - margin.bottom" stroke="#333" />
      <!-- ANNOTATIONS -->
      <g
        class="label"
        v-for="(x, key) in annotations"
        v-if="x"
        :transform="`translate(${x}, ${height - margin.bottom})`"
      >
        <line :y2="margin.bottom * 0.8" stroke="#333" />
        <circle r="3" />
        <text
          :y="margin.bottom * 0.8 + 2"
          dy="1em"
          :text-anchor="key === 'best' ? 'start' : (key === 'usual' ? 'end' : 'middle')"
          font-weight="bold"
        >
          {{ $t(`histogram.${key}`) }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'

const images = [
  require('../assets/person-1.svg'),
  require('../assets/person-2.svg'),
]
const imageRatio = 94 / 52
export default {
  name: 'Histogram',
  props: ['isPhone', 'width', 'type', 'decision', 'activities'],
  data() {
    return {
      height: 250,
      imageHeight: 25,
      imageHeight: 25 * imageRatio,
      margin: this.isPhone ? { top: 20, right: 0, bottom: 40, left: 0 } :
        { top: 20, right: 20, bottom: 40, left: 20 },
      people: [],
      annotations: {},
    }
  },
  computed: {
    week() {
      return this.$store.getters.week
    },
    allDecisions() {
      return this.$store.state.allDecisions
    },
    calculateActivityLevel() {
      return this.$store.getters.calculateActivityLevel
    },
    usualActivityLevel() {
      return this.$store.getters.usualActivityLevel
    },
    bestActivityLevel() {
      return this.$store.getters.bestActivityLevel
    },
  },
  created() {
    this.xScale = d3
      .scaleLinear()
      .range([this.margin.left, this.width - this.margin.right])
  },
  mounted() {
    this.calculatePeople()
  },
  watch: {
    allDecisions() {
      this.calculatePeople()
    },
  },
  methods: {
    calculatePeople() {
      if (!this.allDecisions.length) return

      let groupedPeople = _.chain(this.allDecisions)
        .map((d, i) => {
          let activityLevel
          if (this.type === 'all') {
            if (d.length !== 8) return // if this is current player
            activityLevel = _.chain(d)
              .map(decisions => this.calculateActivityLevel(decisions))
              .mean().round(1).value()
          } else {
            activityLevel = this.calculateActivityLevel(d[this.week])
          }
          return {
            activityLevel,
            isPlayer: i === 0, // player is first
          }
        }).filter()
        .value()

      // update x-scale
      const maxActivityLevel = d3.max(groupedPeople, d => d.activityLevel)
      this.xScale.domain([0, Math.max(maxActivityLevel, this.usualActivityLevel + 2)])
      groupedPeople = _.groupBy(groupedPeople, 'activityLevel')

      const maxLength = _.chain(groupedPeople)
        .map(d => d.length).max().value()
      this.imageHeight = _.clamp(Math.floor(this.height / maxLength), 30, 60)
      this.imageWidth = this.imageHeight / imageRatio
      this.height = Math.min(
        this.height,
        this.imageHeight * maxLength + this.margin.top + this.margin.bottom
      )
      this.people = _.chain(groupedPeople)
        .map(people => {
          let y = this.height - this.margin.bottom
          return _.map(people, d => {
            y -= this.imageHeight
            return Object.assign(d, {
              x: this.xScale(d.activityLevel),
              y,
              image: images[_.random(1)],
            })
          })
        })
        .flatten()
        .value()
      const average = d3.mean(this.people, d => d.activityLevel)
      this.annotations = {
        average: this.xScale(average),
        usual: this.xScale(this.usualActivityLevel),
        best: this.xScale(this.bestActivityLevel),
      }
    },
  },
}
</script>

<style lang="scss" scoped>
svg {
  overflow: visible;
}
</style>
