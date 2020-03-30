<template>
  <div id="minimap" :style='{
    left: `${x}px`, top: `${y}px`,
    width: `${width}px`, height: `${height}px`,
  }'>
    <canvas ref='canvas' :width='2 * width' :height='2 * height'
      :style='{width: `${width}px`, height: `${height}px`}' />
    <!-- <div class='' -->
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'
import p5 from 'p5'

const destSize = 120
export default {
  name: 'Minimap',
  props: ['x', 'y', 'width', 'height', 'groups', 'colorsByHealth'],
  computed: {
    community() {
      return this.$store.getters.community
    },
    infected() {
      return this.$store.getters.infected
    },
  },
  mounted() {
    this.ctx = this.$refs.canvas.getContext('2d')
    this.ctx.scale(2, 2)
    this.ctx.globalAlpha = 0.25
  },
  watch: {
    groups() {
      this.setupPositions()
    },
    infected() {
      this.colorMap()
    },
  },
  methods: {
    setupPositions() {
      // first calculate group positions
      const {x, y} = this.groups[0]
      const groups = _.union(
        _.map(this.groups, d => Object.assign(d, {fx: d.x, fy: d.y})),
        _.times(this.community.numGroups - this.groups.length, i => {
          return {size: 2 * destSize, x, y}
        })
      )
      const simulation = d3.forceSimulation(groups)
        .force('collide', d3.forceCollide().radius(d => 0.6 * d.size))
        .force("center", d3.forceCenter(x, y))
        .stop()
        .tick(100)

      const [minX, maxX] = d3.extent(groups, d => d.x)
      const [minY, maxY] = d3.extent(groups, d => d.y)
      const width = maxX - minX
      const height = maxY - minY
      const scale = Math.max(this.width / width, this.height / height)
      this.people = _.chain(this.community.people)
        .map(({houseIndex}, i) => {
          if (i % 5) return
          let {x, y} = groups[this.community.houses[houseIndex].groupIndex]
          x = p5.prototype.randomGaussian(x, destSize) // jitter it
          y = p5.prototype.randomGaussian(y, destSize)
          // then scale it
          x = (x - minX) * scale
          y = (y - minY) * scale
          return {x, y, i}
        }).filter().value()
    },
    colorMap() {
      this.ctx.clearRect(0, 0, this.width, this.height)
      // go through and color
      _.each(this.people, ({x, y, i}) => {
        const {health} = this.infected[i]
        if (health > 3) return
        this.ctx.fillStyle = this.colorsByHealth[health]
        this.ctx.beginPath()
        this.ctx.arc(x, y, 1, 0, 2 * Math.PI)
        this.ctx.fill()
      })
    },
  },
}
</script>

<style>
#minimap {
  position: absolute;
  border: 1px solid #efefef;
  background: rgba(255, 255, 255, 0.9);
}
</style>
