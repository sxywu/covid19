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
      <g id='people'>
        <circle v-for='d in people' :cx='d.x' :cy='d.y'
          :r='d.r' :fill='d.color' />
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'

const personR = 4
const houseSize = 30
const destSize = 50
const baseColor = '#ffdd00'

export default {
  name: 'Community',
  data() {
    return {
      width: 800,
      height: 400,
      houses: [],
      destinations: [],
      people: [],
      // links: null,
    }
  },
  computed: {
    housesData() {
      return this.$store.state.houses
    },
    destinationsData() {
      return this.$store.state.destinations
    },
    peopleData() {
      return this.$store.state.people
    },
  },
  mounted() {
    // setup force simulation for people positions
    this.simulation = d3.forceSimulation()
      .force('collide', d3.forceCollide().radius(d => 1.5 * d.r))
      .force('x', d3.forceX().x(d => d.focusX))
      .force('y', d3.forceY().y(d => d.focusY))
      .alphaDecay(0)
      .stop()

    this.setupPositions()
    this.updatePeople()
  },
  watch: {
    housesData() {
      this.setupPositions()
    },
    destinationsData() {
      this.setupPositions()
    },
    peopleData() {
      this.setupPositions()
      this.updatePeople()
    },
  },
  methods: {
    setupPositions() {
      // if the data hasn't loaded, or if we've done the setup
      if (!this.housesData.length || !this.destinationsData.length ||
        !this.peopleData.length || this.links) return

      const cutoff = 150
      const houses = []
      const destinations = []
      const links = []
      _.some(this.housesData, (house, i) => {
        if (i >= cutoff) return true // terminate loop here

        const source = {
          id: house.id,
          size: houseSize,
        }
        houses.push(source)
        _.each(house.destinations, index => {
          let target = destinations[index]
          if (!target) {
            target = destinations[index] = {
              id: this.destinationsData[index].id,
              size: destSize,
            }
          }
          links.push({source, target})
        })
      })

      const nodes = _.chain(houses).union(destinations).filter().value()
      // simulation for just houses & dest positions
      const simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody())
        .force('collide', d3.forceCollide().radius(d => d.size))
        .force("center", d3.forceCenter(this.width / 2, this.height / 2))
        .force("link", d3.forceLink(links))
        .stop()
      _.times(250, i => simulation.tick())

      // create people whose houses appear within community view
      const people = []
      _.some(this.peopleData, (person, i) => {
        if (person.houseIndex >= cutoff) return true // terminate loop here
        const house = houses[person.houseIndex]
        people.push({
          id: person.id,
          color: baseColor,
          house, x: house.x, y: house.y,
          r: personR,
        })
      })

      this.houses = houses
      this.destinations = destinations
      this.people = people
    },
    updatePeople() {
      if (!this.peopleData.length && !this.people.length) return

      _.each(this.people, (person, i) => {
        const destination = this.peopleData[i].destination
        const {x, y} = !destination ? person.house : this.destinations[destination - 1]

        Object.assign(person, {focusX: x, focusY: y})
      })

      this.simulation.nodes(this.people).restart()
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
