<template>
  <div id="minimap" :style='{
    left: `${x}px`, top: `${y}px`,
    width: `${width}px`, height: `${height}px`,
  }'>
    <canvas ref='canvas' :width='2 * width' :height='2 * height'
      :style='{width: `${width}px`, height: `${height}px`}' />
    <div class='box' :style='{
      left: `${box.x - box.width / 2}px`, top: `${box.y - box.height / 2}px`,
      width: `${box.width}px`, height: `${box.height}px`,
    }' />
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'
import p5 from 'p5'
import chroma from 'chroma-js'

const destSize = 120
export default {
  name: 'Minimap',
  props: [
    'x', 'y', 'width', 'height', 'colorsByHealth',
    'groups', 'containerWidth', 'containerHeight',
    'tl', 'phases', 'playTimeline',
  ],
  data() {
    return {
      box: {},
    }
  },
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
          return {
            x: p5.prototype.randomGaussian(x, this.width * 30),
            y: p5.prototype.randomGaussian(y, this.height * 30),
          }
        })
      )

      const [minX, maxX] = d3.extent(groups, d => d.x)
      const [minY, maxY] = d3.extent(groups, d => d.y)
      const width = maxX - minX
      const height = maxY - minY
      const scale = Math.max(this.width / width, this.height / height)
      this.people = _.chain(this.community.people)
        .map(({houseIndex}, i) => {
          if (i % 15) return
          let {x, y} = groups[this.community.houses[houseIndex].groupIndex]
          x = p5.prototype.randomGaussian(x, 3 * destSize) // jitter it
          y = p5.prototype.randomGaussian(y, 3 * destSize)
          // then scale it
          x = (x - minX) * scale
          y = (y - minY) * scale
          return {x, y, i, color: this.colorsByHealth[0]}
        }).filter().value()

      this.box = {
        x: (x - minX) * scale, width: this.containerWidth * scale,
        y: (y - minY) * scale, height: window.innerHeight * scale,
      }
    },
    colorMap() {
      const changeColors = _.chain(this.people)
        .sortBy(({i}) => this.infected[i].health)
        .map((d, i) => {
          const {health} = this.infected[i]
          if (health > 3) return
          this.drawCircle(d.color, d.x, d.y)

          const nextColor = this.colorsByHealth[health]
          if (d.color === nextColor) return

          return Object.assign(d, {
            colorInterpolate: chroma.scale([d.color, nextColor]),
          })
        }).filter().value()

      // go through and color
      const duration = 500 * this.phases[1] // turn into milliseconds
      this.tl.add(() => {
        const t = d3.timer(elapsed => {
          const progress = _.clamp(elapsed / duration, 0, 1)
          _.each(changeColors, d => {
            d.color = d.colorInterpolate(progress)
            this.drawCircle(d.color, d.x, d.y)
          })
          if (elapsed > duration) t.stop()
        })
      }, `day${this.day}-1`)
    },
    drawCircle(color, x, y) {
      this.ctx.fillStyle = color
      this.ctx.beginPath()
      this.ctx.arc(x, y, 1, 0, 2 * Math.PI)
      this.ctx.fill()
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

.box {
  position: absolute;
  border: 1px solid;
}
</style>
