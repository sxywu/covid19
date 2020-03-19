import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    day: 0,
    people: [],
    numHouses: 0,
    numDestinations: 0,
    totalHospitalBeds: 0,
  },
  getters: {

  },
  mutations: {
    setPeople(state, people) {
      state.people = people
    },
    setNumHouses(state, numHouses) {
      state.numHouses = numHouses
    },
    setNumDestinations(state, numDestinations) {
      state.numDestinations = numDestinations
    },
  },
  actions: {
    setup ({ commit }) {
      // for now, assume population size
      const totalPopulation = 100
      // ~184 bars&restaurants for 1000 people in America (need to source this)
      const numDestinations = _.floor(0.184 * totalPopulation)

      // go through and assign each person to a house
      const people = []
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

        // for each person in house, create object
        _.times(numPeopleInHouse, i => {
          people.push({
            id: personIndex + i,
            house: houseIndex,
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

      console.log(people, houseIndex)
      // set all new numbers
      commit('setPeople', people)
      commit('setNumHouses', houseIndex)
      commit('setNumDestinations', numDestinations)
    },
    infect ({ commit }) {

    },
  }
})
