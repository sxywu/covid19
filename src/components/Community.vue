<template>
  <div id="community">
    <svg :width='width' :height='height'>
      <!-- <line v-for='d in links' :x1='d.source.x' :y1='d.source.y'
        :x2='d.target.x' :y2='d.target.y' stroke='#000' /> -->
      <g id='houses'>
        <image v-for='d in houses' :x='d.x - d.size / 2' :y='d.y - 0.6 * d.size'
          :width='d.size' :height='d.size' :href='d.href' />
      </g>
      <g id='destinations'>
        <image v-for='d in destinations' v-if='d'
          :x='d.x - d.size / 2' :y='d.y - 0.6 * d.size'
          :width='d.size' :height='d.size' :href='d.href' />
      </g>
      <g id='people'>
        <circle v-for='d in people' :key='d.id' :cx='d.x' :cy='d.y' :r='d.r'
          :fill='d.color' :stroke='d.outline' stroke-width='2' />
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'
import modifiedCollide from './ModifiedCollide'

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
  props: [
    'colorsByHealth', 'width', 'height', 'rightWidth',
    'tl', 'phases', 'playTimeline'
  ],
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
      .force('collide', modifiedCollide().radius(d => 2 * d.r || 0.5 * d.size))
      .force('x', d3.forceX().x(d => d.focusX))
      .force('y', d3.forceY().y(d => d.focusY))
      .alphaDecay(0)
      .velocityDecay(0.55)
      .stop()
    this.tl.eventCallback('onUpdate', () => this.simulation.tick())

    this.setupPositions()
    this.updateTimeline()
  },
  watch: {
    community() {
      this.setupPositions()
      this.updateTimeline()
    },
    infected() {
      this.updateTimeline()
    },
  },
  methods: {
    setupPositions() {
      if (!this.community) return

      const cutoff = 210
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
          x: house.x,
          y: house.y,
          r: personR,
          color, outline: color,
        })
      })

      this.houses = _.chain(houses)
        .map(d => Object.assign(d, {fx: d.x, fy: d.y}))
        .sortBy(d => d.y).value()
      this.destinations = destinations
      this.people = this.allPeople = people
      this.buildings = _.chain(this.destinations).filter().union(this.houses).value()
    },
    updateTimeline() {
      if (!this.community && !this.people.length) return

      const [duration1, duration2, duration3] = this.phases

      // phase 1: go to destinations
      this.tl.add(() => {
        this.people = _.chain(this.allPeople)
          .map((person, i) => {
            const {health, destination} = this.infected[i]
            if (health > 3) return
            const {x, y, id} = destination > 0 ? this.destinations[destination] : person.house
            return Object.assign(person, {
              destination: id,
              focusX: x, focusY: y,
              nextColor: health === 1 ? '#ffffff' : this.colorsByHealth[health],
              nextOutline: this.colorsByHealth[health],
            })
          }).filter().value()

        this.nodes = _.union(this.people, this.buildings)
        this.simulation.nodes(this.nodes)
      }, `day${this.day + 1}`)

      // phase 2: update colors
      this.tl.to(this.people, {
        duration: 0.75 * duration2,
        color: (i, person) => person.nextColor,
        outline: (i, person) => person.nextOutline,
        stagger: 0.003,
      }, `day${this.day + 1}+=${duration1}`)

      // phase 3: go back home
      this.tl.add(() => {
        _.each(this.people, person => Object.assign(person, {
          destination: person.house.id,
          focusX: person.house.x,
          focusY: person.house.y,
        }))
        this.simulation.nodes(this.nodes)
      }, `day${this.day + 1}+=${duration1 + duration2}`)

      this.tl.add(() => {

      }, `day${this.day + 1}+=${duration1 + duration2 + duration3}`)

      this.playTimeline()
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
