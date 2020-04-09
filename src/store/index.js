import Vue from 'vue'
import Vuex from 'vuex'
import * as d3 from 'd3'
import _ from 'lodash'
import {apiService} from '../firebase/db'

Vue.use(Vuex)

let populationsByZip = []
let hospitalsByZip = []
let prevPlayers = []
let prevInfected = []

function assignHealth(person, daysSinceInfection) {
  // health statuses: 0 = healthy, 1 = recovered, 2 = infected+asymptomatic,
  // 3 = infected+ symptomatic, 4 = hospitalized from infection, 5 = died from infection
  // Option to add additional for infected+presymptomatic; and/or to include infectious here rather than as a separate variable
  let newHealth = 0
  let newInfectious = 0
  if (daysSinceInfection >= 14) {
    newHealth = person.dieIfInfected ? 5 : 1 // dead or recovered
    newInfectious = 0
  } else if (daysSinceInfection >= 7 && person.hospitalIfInfected) {
    newHealth = 4 // hospitalized
    newInfectious = 1
  } else if (daysSinceInfection >= 6) {
    newHealth = person.symptomaticIfInfected ? 3 : 2 // symptomatic or asymptomatic
    newInfectious = 1 // and infectious
  } else if (daysSinceInfection >= 4) {
    newHealth = 2 // asymptomatic
    newInfectious = 1 // and infectious
  } else if (daysSinceInfection > 0) {
    newHealth = 2 // asymptomatic
    newInfectious = 0 // and not infectious
  }
  return {health: newHealth, infectious: newInfectious}
}

function healthAndDestination(
  person,
  houses,
  daysSinceInfection,
  prevInfectious,
  playerGoesOut,
  infectedDestinations,
  infectedHouses,
) {
  const {health, infectious} = assignHealth(person, daysSinceInfection)

  let destination = -1 // default to home
  if (health < 3 && playerGoesOut) {
    // if they're healthy, recovered, or asymptomatic
    // if this isn't based on player decisions or
    // the player decided to go out that day have them go to an establishment
    destination = _.sample(houses[person.houseIndex].destinations)

    if (infectious) {
      // but if they're asymptomatic, add that as infected destination
      infectedDestinations[destination] =
        (infectedDestinations[destination] || 0) + 1
    }
  }

  // and if they were infectious the previous day
  // (want previous day bc they'd have spent a night in same house)
  // add their house as infectious also
  if (prevInfectious) {
    infectedHouses[person.houseIndex] =
      (infectedHouses[person.houseIndex] || 0) + 5
  }

  return {health, infectious, destination}
}

function infectPerson(
  obj,
  house,
  destination,
  susceptibility,
  infectedDestinations,
  infectedHouses,
) {
  const timesExposed =
    (infectedDestinations[destination] || 0) + (infectedHouses[house] || 0)
  // if didn't get exposed, don't need to update
  if (!timesExposed) return
  // ( 1 - ( ( 1 - susceptibility ) ^ number of exposures ) ) > random number from 0-1
  const infected =
    1 - Math.pow(1 - susceptibility, timesExposed) > Math.random()
  if (!infected) return

  Object.assign(obj, {
    daysSinceInfection: 1,
    health: 2,
    infectious: 0, // newly infected, so asymptomatic & not infectious
  })
}

export default new Vuex.Store({
  state: {
    day: 0,
    zipCode: '',
    dataLoaded: false,
    bedOccupancyRate: 0.66,
    decisions: [],
    gameId: '',
    totalDays: 8 * 7,
    foodStatus: {value: 18, maxValue: 18},
    exerciseStatus: {value: 7, maxValue: 7},
    dailyHealthStatusCounts: [],
    zipCodeHistory: []
  },
  getters: {
    week({day}) {
      return Math.ceil(day / 7)
    },
    infectedCasesCount(state, {infected}) {
      if(!infected) return
      return _.chain(infected)
        .filter(i=> i.infectious === 1)
        .sumBy(i => i.infectious)
        .value()
    },
    currentCommunityHealth(state, {infected}) {
      if(!infected) return
      return _.countBy(infected, 'health')
    },
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
    filledBeds(state, {infected, totalAvailableBeds}) {
      return Math.min(
        _.sumBy(infected, ({health}) => health === 4), // hospitalized
        totalAvailableBeds,
      )
    },
    community(state, {population}) {
      if (!population) return

      const totalPopulation = population.total

      // make 100 establishments per 1000 people
      // and 7 destinations per group
      const destPerGroup = 7
      const numDestinations = _.floor(0.05 * totalPopulation) || 1
      const numDestGroups = Math.ceil(numDestinations / destPerGroup)
      const destinations = _.times(numDestinations, i => {
        return {
          id: `dest${i}`,
          groupIndex: Math.floor(i / destPerGroup),
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
      while (personIndex < totalPopulation) {
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
            age,
            ageGroup,
            susceptibility: 0.03, // TODO: UPDATE
            symptomaticIfInfected: _.random(99) < 80 ? 1 : 0, // TODO: updated based on age
            hospitalIfInfected: _.random(99) < 20 ? 1 : 0, // TODO: updated based on age
            dieIfInfected: _.random(99) < 3 ? 1 : 0, // TODO: updated based on age
          })
        })

        personIndex += numPeopleInHouse
        houseIndex += 1
      }

      // assign houses and destinations to each other
      const housesPerGroup = Math.ceil(houses.length / numDestGroups)
      _.times(numDestGroups, groupIndex => {
        const housesIndicesInGroup = _.range(
          groupIndex * housesPerGroup,
          (groupIndex + 1) * housesPerGroup,
        )
        const destIndicesInGroup = _.union(
          _.range(groupIndex * destPerGroup, (groupIndex + 1) * destPerGroup),
          _.times(3, i =>
            _.random(
              (groupIndex + 2) * destPerGroup,
              (groupIndex + 4) * destPerGroup,
            ),
          ),
        )
        _.each(
          housesIndicesInGroup,
          i =>
            houses[i] &&
            Object.assign(houses[i], {
              groupIndex,
              destinations: destIndicesInGroup,
            }),
        )
      })

      // add previous players' info to people
      const peopleRatio = Math.floor(totalPopulation / prevPlayers.length)
      _.each(prevPlayers, ({decisions}, i) => {
        Object.assign(people[i * peopleRatio], {decisions})
      })

      return {people, houses, destinations, numGroups: numDestGroups}
    },
    infected({day}, {community, totalBeds}) {
      if (!community) return
      const {people, houses, destinations} = community

      if (!prevInfected.length) {
        // if this is the first day, seed infections
        prevInfected = _.map(people, (person, i) => {
          // And then assign days for those randomly between 1 and 6.
          // We'll probably want to change this, but it gives us something to work with.
          let daysSinceInfection = i % 500 ? 0 : _.random(1, 4)
          let {health, infectious} = assignHealth(person, daysSinceInfection)

          return {
            index: i,
            daysSinceInfection,
            health,
            infectious,
            alternate: {health, infectious, daysSinceInfection},
          }
        })
      }

      const infectedHouses = []
      const infectedDestinations = []
      const alternateHouses = [] // same as infectedHouses, but for alternate scenario
      const alternateDestinations = []
      const infected = _.map(people, (person, i) => {
        let {
          health: prevHealth,
          infectious: prevInfectious,
          daysSinceInfection,
          alternate: prevAlternate,
        } = prevInfected[i]

        // calculate everyone's new health/infectiousness for current day
        daysSinceInfection += !!daysSinceInfection // if days = 0, don't add any, if >0 then add 1
        const {health, infectious, destination} = healthAndDestination(
          person,
          houses,
          daysSinceInfection,
          prevInfectious,
          !person.decisions || person.decisions[day],
          infectedDestinations,
          infectedHouses,
        )
        // now calculate for an alternate scenario
        prevAlternate.daysSinceInfection += !!prevAlternate.daysSinceInfection
        const alternate = Object.assign(
          healthAndDestination(
            person,
            houses,
            prevAlternate.daysSinceInfection,
            prevAlternate.infectious,
            true,
            alternateDestinations,
            alternateHouses,
          ),
          {daysSinceInfection: prevAlternate.daysSinceInfection},
        )

        return {
          index: i,
          house: person.houseIndex,
          daysSinceInfection,
          health,
          infectious,
          destination,
          alternate,
        }
      })

      // for each healthy person
      _.each(infected, person => {
        const {house, destination, index} = person
        if (person.health === 0) {
          // if they're healthy in current game, calculate whether they get infected
          infectPerson(
            person,
            house,
            destination,
            people[index].susceptibility,
            infectedDestinations,
            infectedHouses,
          )
        }
        if (person.alternate.health === 0) {
          // if in alternate simulation they're healthy
          // calculate whether they get infected there
          infectPerson(
            person.alternate,
            house,
            person.alternate.destination,
            people[index].susceptibility,
            alternateDestinations,
            alternateHouses,
          )
        }
      })

      prevInfected = infected

      return infected
    },
  },
  mutations: {
    setDay(state, day) {
      state.day = day
      state.foodStatus.value -= 1 // for every day they don't get groceries
      if (day % 3 === 0) {
        state.exerciseStatus.value -= 1 // for every 3 days they don't go out
      }
    },
    setZipCode(state, zipCode) {
      state.zipCode = zipCode
    },
    setDataLoaded(state, dataLoaded) {
      state.dataLoaded = dataLoaded
    },
    setDecision(state, decision) {
      state.decisions.push(decision)
    },
    setGameId(state, id) {
      state.gameId = id
    },
    setDailyHealthStatusCounts(state, healthStatus){
      state.dailyHealthStatusCounts.push(healthStatus)
    },
    setZipCodeHistory(state, zipCodeHistory) {
      state.zipCodeHistory = zipCodeHistory
    }
  },
  actions: {
    getRawData({commit, state, dispatch}) {
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
        // prevPlayers = _.times(35000, i => {
        //   return {
        //     decisions: _.times(state.totalDays, i => _.random(1)),
        //   }
        // })
        dispatch('getZipCodeGameHistory')
        commit('setDataLoaded', true)
      })
    },
    getZipCodeGameHistory({state: {zipCode="Any"}, commit}) {
      apiService.getFilteredGames({filters: {zipCode}, cb: (data) => commit('setZipCodeHistory', data)})
    },
    storeGame({state: {dailyHealthStatusCounts, decisions, zipCode, gameId}, getters: {infectedCasesCount}}) {
      apiService.setGameById(gameId, {infectedCasesCount, gameId, dailyHealthStatusCounts, decisions, zipCode})
    },
  },
})
