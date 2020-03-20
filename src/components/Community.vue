<template>
  <div id="community">
    <svg :width='width' :height='height'>

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

      const houses = _.map(this.housesData, house => {return {id: house.id} })
      const destinations = _.map(this.destinationsData, destination => {return {id: destination.id} })
      const links = []
      _.each(this.housesData, d => {
        const source = houses[d.id]
        _.each(d.destinations, id => {
          const target = destinations[id]
          links.push({source, target})
        })
      })

      // fix just the first house that the MC is in
      Object.assign(houses[0], {fx: this.width / 2, fy: this.height / 2})

      const simulation = d3.forceSimulation(_.union(houses, destinations))
        .force("charge", d3.forceManyBody())
        .force("link", d3.forceLink(links))
        .force("center", d3.forceCenter())
        .stop()

      _.times(1000, i => simulation.tick())
    },
  },
}
</script>

<style>
#community {
}
</style>
