import Vue from 'vue'
import Vuex from 'vuex'
import * as d3 from 'd3'
import _ from 'lodash'

Vue.use(Vuex)

let populationsByZip
let hospitalsByZip

export default new Vuex.Store({
  state: {
    day: 0,
    zipCode: '',
    dataLoaded: false,
  },
  getters: {
    population({zipCode, dataLoaded}) {
      if (!zipCode || !dataLoaded) return
      return _.find(populationsByZip, d => d.zip === zipCode)
    },
    hospitals({zipCode, dataLoaded}) {
      if (!zipCode || !dataLoaded) return
      return _.filter(hospitalsByZip, d => d.zip === zipCode)
    },
    totalBeds(state, {hospitals}) {
      if (!hospitals) return
      return _.sumBy(hospitals, 'beds')
    },
    community(state, {population}) {
      if (!population) return

      const totalPopulation = population.total

      // make 100 establishments per 1000 people
      const numDestinations = _.floor(0.1 * totalPopulation) || 1
      const destinations = _.times(numDestinations, i => {
        return {
          id: `dest${i}`,
          houses: [], // houses whose people visit that establishment
        }
      })

      // go through, create people, and assign each person to a house
      const people = []
      const houses = []
      let personIndex = 0
      let houseIndex = 0
      while(personIndex < totalPopulation) {
        // randomly assign number of people to a house
        // between 1 and 6 people
        let numPeopleInHouse = _.random(1, 5)
        // make sure it doesn't go over total population
        if (personIndex + numPeopleInHouse > totalPopulation) {
          numPeopleInHouse = totalPopulation - personIndex
        }

        const house = {
          id: `house${houseIndex}`,
        }
        houses.push(house)

        // for each person in house, create object
        _.times(numPeopleInHouse, i => {
          people.push({
            id: `person${personIndex + i}`,
            houseIndex, // reference house person lives in
            age: 0, // TODO: UPDATE
            susceptibility: 0, // TODO: UPDATE
          })
        })

        personIndex += numPeopleInHouse
        houseIndex += 1
      }

      const destHouseRatio = destinations.length / houses.length
      _.each(houses, (house, i) => {
        const start = _.floor(i * destHouseRatio)
        house.destinations = _.chain(_.random(5, 10))
          // randomly assign 5 - 10 destinations to this house
          .times(num => _.random(start, start + 20))
          // but make sure we don't get the same destinations more than once
          .uniq()
          // and make sure the destination exists
          .filter(dest => destinations[dest])
          .value()

        // and likewise register that house to its destinations
        _.each(house.destinations, index => destinations[index].houses.push(houseIndex))
      })

      return {people, houses, destinations}
    },
    infected({day}, {community, totalBeds}) {
      if (!community) return
      const {people, houses, destinations} = community

      const infected = _.map(people, person => {
        const dests = [0]
        _.each(houses[person.houseIndex].destinations, dest => dests.push(dest + 1))

        return {
          health: _.random(2),
          destination: dests[_.random(dests.length - 1)],
          daysSinceInfection: 0,
        }
      })
      _.times(_.random(totalBeds), i => infected[_.random(infected.length - 1)].health = 3)

      return infected
    },
  },
  mutations: {
    setDay(state, day) {
      state.day = day
    },
    setZipCode(state, zipCode) {
      state.zipCode = zipCode
    },
    setDataLoaded(state, dataLoaded) {
      state.dataLoaded = dataLoaded
    },
  },
  actions: {
    getRawData({commit, state}) {
      function formatData(obj) {
        const zip = obj.zip // make sure zip doesn't get turned into integers
        return Object.assign(d3.autoType(obj), {zip}) // but everything else is formatted correctly
      }
      Promise.all([
        d3.csv('./population-by-zip-code.csv', formatData),
        d3.csv('./hospitals-by-zip-code.csv', formatData),
      ]).then(([populations, hospitals]) => {
        populationsByZip = populations
        hospitalsByZip = hospitals

        commit('setDataLoaded', true)
      })
    },
  }
})
