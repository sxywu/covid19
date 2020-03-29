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
const houseSizes = [75, 85]
const destSize = 120

const houseImages = _.map([
  'house-sm-left', 'house-sm-right',
  'house-lg-left', 'house-lg-right'
  ], file => require(`../assets/${file}.png`))
const destImages = _.map(['cafe', 'restaurant', 'park'], file => require(`../assets/${file}.png`))

export default {
  name: 'Community',
  props: ['colorsByHealth', 'width', 'height', 'rightWidth'],
  data() {
    return {
      houses: [],
      destinations: [],
      people: [],
      center: {x: (this.width - this.rightWidth) / 2, y: this.height / 2},
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

      const cutoff = 240
      const destsPerGroup = 7
      const houses = []
      const destinations = []
      const links = []
      const groups = []
      let group
      _.some(this.community.houses, (house, i) => {
        if (i >= cutoff) return true // terminate loop here

        const source = {
          id: house.id,
          size: houseSizes[house.numPeople < 3 ? 0 : 1],
          href: houseImages[house.numPeople < 3 ? _.random(1) : _.random(2, 3)],
        }
        houses.push(source)
        _.each(house.destinations, index => {
          let destination = destinations[index]
          if (!destination) {
            // if destination doesn't exist yet
            // first get the group it's going to belong to
            if (!group || group.destinations.length >= destsPerGroup) {
              group = Object.assign({
                size: 2.5 * destSize,
                destinations: [],
              }, !group ? {fx: this.center.x, fy: this.center.y} : {})
              groups.push(group)
            }

            destination = destinations[index] = {
              id: this.community.destinations[index].id,
              size: destSize,
              group,
            }
            group.destinations.push(destination)
          }
          links.push({source, target: destination.group})
        })
      })
      // and also link all groups together so they're packed closely together
      _.each(groups, source => {
        _.each(groups, target => {
          if (source === target) return
          links.push({source, target})
        })
      })

      // simulation for just houses & dest positions
      const simulation = d3.forceSimulation(_.union(groups, houses))
        .force('collide', d3.forceCollide().radius(d => 0.6 * d.size))
        .force("center", d3.forceCenter(this.center.x, this.center.y))
        .force("link", d3.forceLink(links))
        .stop()
        .tick(250)

      // calculate positions for destinations
      const rad = Math.PI / 3
      _.each(groups, ({destinations, x, y}) => {
        _.each(destinations, (dest, i) => {
           // have one park in center, rest are restaurants
          let dx = x
          let dy = y
          if (i > 0) {
            dx += 0.95 * destSize * Math.cos(i * rad)
            dy += 0.95 * destSize * Math.sin(i * rad)
          }
          Object.assign(dest, {
            href: destImages[i % destsPerGroup ? _.random(1) : 2],
            x: dx, y: dy, fx: dx, fy: dy,
          })
        })
      })

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
          r: personR,
        })
      })

      this.houses = _.chain(houses)
        .map(d => Object.assign(d, {fx: d.x, fy: d.y}))
        .sortBy(d => d.y).value()
      this.destinations = destinations
      this.people = this.allPeople = people
      this.links = links
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
          }).on('end', null)
      }
      this.simulation.nodes(this.people).alpha(1).restart()
    },
  },
}
</script>

<style scoped>
#community {
  position: absolute;
  top: 0;
  left: 0;
}

svg {
  isolation: isolate;
}

#people {
  mix-blend-mode: multiply;
}
</style>
