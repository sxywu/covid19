<template>
  <div id="community">
    <svg :width='width' :height='height'>
      <!-- <line v-for='d in links' :x1='d.source.x' :y1='d.source.y'
        :x2='d.target.x' :y2='d.target.y' stroke='#000' /> -->
      <g id='houses'>
        <image v-for='d in houses' :x='d.x - d.size / 2' :y='d.y - 0.7 * d.size'
          :width='d.size' :height='d.size' :href='d.href' />
      </g>
      <g id='destinations'>
        <image v-for='d in destinations' v-if='d'
          :x='d.x - d.size / 2' :y='d.y - 0.7 * d.size'
          :width='d.size' :height='d.size' :href='d.href' />
      </g>
      <g id='people'>
        <circle v-for='d in people' :key='d.id' :cx='d.x' :cy='d.y' :r='d.r'
          :fill='d.fill' :stroke='d.stroke' stroke-width='2' />
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'

const personR = 4
const houseSizes = [75, 90]
const destSize = 140

const houseImages = _.map([
  'house-sm-left', 'house-sm-right',
  'house-lg-left', 'house-lg-right'
  ], file => require(`../assets/${file}.png`))
const destImages = _.map(['cafe', 'restaurant', 'park'], file => require(`../assets/${file}.png`))

export default {
  name: 'Community',
  props: ['colorsByHealth'],
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
    day() {
      return this.$store.state.day
    },
    community() {
      return this.$store.getters.community
    },
    infected() {
      return this.$store.getters.infected
    },
  },
  mounted() {
    // setup force simulation for people positions
    this.simulation = d3.forceSimulation()
      .force('collide', d3.forceCollide().radius(d => 1.5 * d.r))
      .force('x', d3.forceX().x(d => d.focusX))
      .force('y', d3.forceY().y(d => d.focusY))
      .alphaDecay(0.002)
      .stop()

    this.setupPositions()
    this.updatePeople()
  },
  watch: {
    community() {
      this.setupPositions()
      this.updatePeople()
    },
    infected() {
      this.updatePeople(true)
    },
  },
  methods: {
    setupPositions() {
      if (!this.community) return

      const cutoff = 300
      const houses = []
      const destinations = []
      const links = []
      _.some(this.community.houses, (house, i) => {
        if (i >= cutoff) return true // terminate loop here

        const source = {
          id: house.id,
          size: houseSizes[house.numPeople < 3 ? 0 : 1],
          href: houseImages[house.numPeople < 3 ? _.random(1) : _.random(2, 3)],
        }
        houses.push(source)
        _.each(house.destinations, index => {
          let target = destinations[index]
          if (!target) {
            target = destinations[index] = {
              id: this.community.destinations[index].id,
              size: destSize,
              href: destImages[index % 4 ? _.random(1) : 2],
            }
          }
          links.push({source, target})
        })
      })

      const nodes = _.chain(houses).union(destinations).filter().value()
      // simulation for just houses & dest positions
      const simulation = d3.forceSimulation(nodes)
        .force('collide', d3.forceCollide().radius(d => 0.55 * d.size))
        .force("center", d3.forceCenter(this.width / 2, this.height / 2))
        .force("link", d3.forceLink(links))
        .stop()
        .tick(225)

      // create people whose houses appear within community view
      const people = []
      _.some(this.community.people, ({id, houseIndex}, i) => {
        if (houseIndex >= cutoff) return true // terminate loop here

        const house = houses[houseIndex]
        const color = this.colorsByHealth[0]

        people.push({
          id,
          house,
          x: house.x + [1, -1][_.random(1)] * _.random(10),
          y: house.y + [1, -1][_.random(1)] * _.random(10),
          prevColor: color, color,
          r: personR,
        })
      })

      this.houses = houses
      this.destinations = destinations
      this.people = this.allPeople = people
    },
    updatePeople(goDestination) {
      if (!this.community && !this.people.length) return

      this.people = _.chain(this.allPeople)
        .map((person, i) => {
          const {health, destination} = this.infected[i]
          if (health > 3) return

          const {x, y} = !goDestination || !destination ?
            person.house : this.destinations[destination - 1]

          return Object.assign(person, {
            focusX: x,
            focusY: y,
            fill: health === 1 ? '#fff' : this.colorsByHealth[health],
            stroke: this.colorsByHealth[health],
          })
        }).filter().value()

      if (goDestination) {
        this.simulation
          .velocityDecay(0.5)
          .alphaMin(0.89)
          .on('tick', null)
          .on('end', () => this.updatePeople())
      } else {
        // go home
        this.simulation
          .velocityDecay(0.65)
          .alphaMin(0.75)
          .on('tick', () => {
            const progress = 1 - _.clamp((this.simulation.alpha() - 0.75) / 0.25, 0, 1)
            _.each(this.people, d => d.color = d.colorInterpolate(progress))
          }).on('end', null)
      }
      this.simulation.nodes(this.people).alpha(1).restart()
    },
  },
}
</script>

<style scoped>
#community {
  display: inline-block;
}

svg {
  border: 1px solid;
}

svg {
  isolation: isolate;
}

#people {
  mix-blend-mode: multiply;
}
</style>
