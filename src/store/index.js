import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    day: 0,
    people: [],
    houses: [], // linked houses & destinations so that people only go to
    destinations: [], // destinations that are close to their homes
    totalHospitalBeds: 0,
  },
  getters: {

  },
  mutations: {
    setPeople(state, people) {
      state.people = people
    },
    setHouses(state, houses) {
      state.houses = houses
    },
    setDestinations(state, destinations) {
      state.destinations = destinations
    },
  },
  actions: {
    setup ({ commit }) {
      // for now, assume population size
      const totalPopulation = 100
      // ~184 bars&restaurants for 1000 people in America (need to source this)
      const numDestinations = _.floor(0.184 * totalPopulation)
      const destinations = _.times(numDestinations, i => {
        return {
          id: i,
          houses: [], // houses whose people visit that establishment
        }
      })

      // go through and assign each person to a house
      const people = []
      const houses = []
      let personIndex = 0
      let houseIndex = 0
      while(personIndex < totalPopulation) {
        // randomly assign number of people to a house
        // between 1 and 5 people
        let numPeopleInHouse = _.random(1, 6)
        // make sure it doesn't go over total population
        if (personIndex + numPeopleInHouse > totalPopulation) {
          numPeopleInHouse = totalPopulation - personIndex
        }

        const house = {
          id: houseIndex,
          destinations: _.chain(_.random(5, 11))
            // randomly assign 5 - 10 destinations to this house
            .times(i => _.random(destinations.length - 1))
            // but make sure we don't get the same destinations more than once
            .uniq().filter().value(),
        }
        // and likewise register that house to its destinations
        _.each(house.destinations, index => destinations[index].houses.push(houseIndex))
        houses.push(house)

        // for each person in house, create object
        _.times(numPeopleInHouse, i => {
          people.push({
            id: personIndex + i,
            houseId: houseIndex, // reference house person lives in
            destination: 0, // index of establishment or 0 if stay at home?
            age: 0, // TODO: UPDATE
            health: 0,
            susceptibility: 0, // TODO: UPDATE
            daysSinceInfection: 0,
          })
        })

        personIndex += numPeopleInHouse
        houseIndex += 1
      }

      // set all new numbers
      commit('setPeople', people)
      commit('setHouses', houses)
      commit('setDestinations', destinations)
    },
    infect ({ commit }) {

    },
  }
})
