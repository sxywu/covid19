<template>
  <div id="community">
    <svg :width='width' :height='height'>
      <!-- <line v-for='d in links' :x1='d.source.x' :y1='d.source.y'
        :x2='d.target.x' :y2='d.target.y' stroke='#000' /> -->
      <g id='houses'>
        <rect v-for='d in houses' :x='d.x - d.size / 2' :y='d.y - d.size / 2'
          :width='d.size' :height='d.size' stroke='#000' fill='#fff' />
      </g>
      <g id='destinations'>
        <rect v-for='d in destinations' :x='d.x - d.size / 2' :y='d.y - d.size / 2'
          :width='d.size' :height='d.size' stroke='#000' fill='#999' />
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'

export default {
  name: 'Community',
  data() {
    return {
      width: 800,
      height: 400,
      houses: [],
      destinations: [],
    }
  },
  computed: {
    housesData() {
      return this.$store.state.houses
    },
    destinationsData() {
      return this.$store.state.destinations
    }
  },
  mounted() {
    this.setupPositions()
  },
  watch: {
    housesData() {
      this.setupPositions()
    },
    destinationsData() {
      this.setupPositions()
    },
  },
  methods: {
    setupPositions() {
      // if the data hasn't loaded, or if we've done the setup
      if (!this.housesData.length || !this.destinationsData.length || this.links) return

      const houses = _.map(this.housesData, house => {
        return {
          id: house.id,
          size: 18,
        }
      })
      const destinations = _.map(this.destinationsData, destination => {
        return {
          id: destination.id,
          size: 30,
        }
      })
      const links = []
      _.each(this.housesData, (d, index) => {
        const source = houses[index]
        _.each(d.destinations, index => {
          const target = destinations[index]
          links.push({source, target, strength: _.random(1, 0.25)})
        })
      })

      const simulation = d3.forceSimulation(_.union(houses, destinations))
        // .force("charge", d3.forceManyBody())
        .force('collide', d3.forceCollide().radius(d => d.size))
        .force("center", d3.forceCenter(this.width / 2, this.height / 2))
        .force("link", d3.forceLink(links).strength(d => d.strength))
        .stop()

      _.times(1000, i => simulation.tick())

      this.houses = houses
      this.destinations = destinations
    },
  },
}
</script>

<style>
#community {
}

svg {
  border: 1px solid;
}
</style>
