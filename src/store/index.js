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
    bedOccupancyRate: 0.66,
  },
  getters: {
    population({zipCode, dataLoaded}) {
      if (!zipCode || !dataLoaded) return
      return _.find(populationsByZip, d => d.zip === zipCode)
    },
    zipsInCounty(state, {population}) {
      if (!population) return
      return _.filter(populationsByZip, d => d.county === population.county)
    },
    hospitals(state, {zipsInCounty}) {
      if (!zipsInCounty) return
      const zips = _.map(zipsInCounty, 'zip')
      return _.filter(hospitalsByZip, d => _.includes(zips, d.zip))
    },
    totalBeds(state, {hospitals, population, zipsInCounty}) {
      if (!population || !hospitals || !zipsInCounty) return
      const countyPopulation = _.sumBy(zipsInCounty, 'total')
      const bedsPerPerson = _.sumBy(hospitals, 'beds') / countyPopulation
      return Math.floor(population.total * bedsPerPerson)
    },
    totalAvailableBeds({bedOccupancyRate}, {totalBeds}) {
      return Math.floor((1 - bedOccupancyRate) * totalBeds)
    },
    community(state, {population}) {
      if (!population) return

      const totalPopulation = population.total

      // make 100 establishments per 1000 people
      const numDestinations = _.floor(0.05 * totalPopulation) || 1
      const destinations = _.times(numDestinations, i => {
        return {
          id: `dest${i}`,
          houses: [], // houses whose people visit that establishment
        }
      })

      const ageGroups = _.map(['0', '20', '40', '60', '80'], (key, i) => {
        return [i * 20, population[key], key]
      })
      // go through, create people, and assign each person to a house
      const people = []
      const houses = []
      let personIndex = 0
      let houseIndex = 0
      while(personIndex < totalPopulation) {
        // randomly assign number of people to a house
        // between 2 and 5 people
        let numPeopleInHouse = _.random(2, 5)
        // make sure it doesn't go over total population
        if (personIndex + numPeopleInHouse > totalPopulation) {
          numPeopleInHouse = totalPopulation - personIndex
        }

        const house = {
          id: `house${houseIndex}`,
          numPeople: numPeopleInHouse,
        }
        houses.push(house)

        // for each person in house, create object
        _.times(numPeopleInHouse, i => {
          // calculate person's age
          let age
          let ageGroup
          while (true) {
            const index = _.random(ageGroups.length - 1)
            const [baseAge, remaining, key] = ageGroups[index]
            if (remaining > 0) {
              age = _.random(baseAge, baseAge + 19)
              ageGroup = key
              ageGroups[index][1] = remaining - 1
              break
            }
          }

          people.push({
            index: personIndex + i,
            id: `person${personIndex + i}`,
            houseIndex, // reference house person lives in
            age, ageGroup,
            susceptibility: 0, // TODO: UPDATE
          })
        })

        personIndex += numPeopleInHouse
        houseIndex += 1
      }

      // assign houses and destinations to each other
      const destPerGroup = 7
      const numDestGroups = Math.ceil(destinations.length / destPerGroup)
      const housesPerGroup = Math.ceil(houses.length / numDestGroups)
      const groups = _.times(numDestGroups, groupIndex => {
        const destIndicesInGroup = _.range(groupIndex * destPerGroup, (groupIndex + 1) * destPerGroup)
        const housesIndicesInGroup = _.range(groupIndex * housesPerGroup, (groupIndex + 1) * housesPerGroup)
        _.each(housesIndicesInGroup, i => houses[i] &&
          Object.assign(houses[i], {groupIndex, destinations: destIndicesInGroup}))
        _.each(destIndicesInGroup, i => destinations[i] &&
          Object.assign(destinations[i], {groupIndex, houses: housesIndicesInGroup}))

        return {id: `group${groupIndex}`}
      })

      return {people, houses, destinations, groups}
    },
    infected({day}, {community, totalAvailableBeds}) {
      if (!community) return
      const {people, houses, destinations} = community

      const infected = _.map(people, (person, i) => {
        const dests = _.union(houses[person.houseIndex].destinations, [-1])

        return {
          index: i,
          health: _.random(3),
          destination: dests[_.random(dests.length - 1)],
          daysSinceInfection: 0,
        }
      })
      _.times(_.random(totalAvailableBeds), i => infected[_.random(infected.length - 1)].health = 4)

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
