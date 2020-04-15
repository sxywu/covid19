import Vue from 'vue'
import Vuex from 'vuex'
import * as d3 from 'd3'
import _ from 'lodash'
import {apiService} from '../firebase/db'
import {v4 as uuidv4} from 'uuid'

Vue.use(Vuex)

import diseaseNumbers from '../assets/diseaseNumbers.json'

let populationsByZip = []
let hospitalsByZip = []
let prevInfected = []
let dailyHealthStatus = []
let dailyInfectious = []
const totalPlayers = 20
const foodStatus = {value: 18, maxValue: 18}
const exerciseStatus = {value: 7, maxValue: 7}
const numTimesOut = _.times(8, numTimes => {
  return _.times(7, i => +(i < numTimes))
})

function assignHealth(person, daysSinceInfection, prevInHospital) {
  // health statuses: 0 = healthy, 1 = recovered, 2 = infected+asymptomatic,
  // 3 = infected+ symptomatic, 4 = hospitalized from infection, 5 = died from infection
  // Option to add additional for infected+presymptomatic; and/or to include infectious here rather than as a separate variable
  let newHealth = 0
  let newInfectious = 0
  if (daysSinceInfection >= 14) {
    const dies = prevInHospital
      ? person.dieIfSymptomatic
      : person.dieIfNotHospitalized
    newHealth = dies ? 5 : 1 // dead or recovered
    newInfectious = 0
  } else if (daysSinceInfection >= 7 && person.hospitalIfSymptomatic) {
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
  prevInHospital,
  playerGoesOut,
  infectedDestinations,
  infectedHouses,
) {
  const {health, infectious} = assignHealth(
    person,
    daysSinceInfection,
    prevInHospital,
  )

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
    currentPage: 'landing',
    day: 0,
    zipCode: '',
    dataLoaded: false,
    bedOccupancyRate: 0.66,
    totalDays: 8 * 7,
    allDecisions: [],
    pastPlayerIDs: [],
    foodStatus: {},
    exerciseStatus: {},
    gameId: '',
  },
  getters: {
    week({day}) {
      return Math.ceil(day / 7)
    },
    allZips({dataLoaded}) {
      if (!dataLoaded) return
      return _.map(populationsByZip, d => d.zip)
    },
    zipsByCommunitySize({dataLoaded}) {
      if (!dataLoaded) return
      return _.groupBy(populationsByZip, d => {
        if (d.total > 50000) return 'urban'
        if (d.total > 10000) return 'suburban'
        if (d.total > 5000) return 'rural'
        return 'others'
      })
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

          // set susceptibility and other numbers based on their age group
          let {
            susceptibility,
            symptomaticIfInfected,
            hospitalIfSymptomatic,
            dieIfSymptomatic,
            dieIfNotHospitalized,
          } = diseaseNumbers['ageGroups'][ageGroup]
          symptomaticIfInfected = +(Math.random() < symptomaticIfInfected)
          hospitalIfSymptomatic = +(
            symptomaticIfInfected && Math.random() < hospitalIfSymptomatic
          )
          dieIfSymptomatic = +(
            hospitalIfSymptomatic && Math.random() < dieIfSymptomatic
          )
          dieIfNotHospitalized = +(
            hospitalIfSymptomatic && Math.random() < dieIfNotHospitalized
          )

          people.push({
            index: personIndex + i,
            id: `person${personIndex + i}`,
            houseIndex, // reference house person lives in
            age,
            ageGroup,
            susceptibility, // TODO: UPDATE
            symptomaticIfInfected, // TODO: updated based on age
            hospitalIfSymptomatic, // TODO: updated based on age
            dieIfSymptomatic, // TODO: updated based on age
            dieIfNotHospitalized, // TODO: update based on age
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

      return {people, houses, destinations, numGroups: numDestGroups}
    },
    infected({day, allDecisions}, {week, community, totalAvailableBeds}) {
      if (!community || !allDecisions.length) return
      const {people, houses} = community

      if (!prevInfected.length) {
        // if this is the first day, seed infections
        prevInfected = _.map(people, (person, i) => {
          // And then assign days for those randomly between 1 and 6.
          // We'll probably want to change this, but it gives us something to work with.
          let daysSinceInfection = i % 1000 ? 0 : _.random(1, 4)
          let {health, infectious} = assignHealth(person, daysSinceInfection)

          return {
            index: i,
            daysSinceInfection,
            health,
            infectious,
            worstAlternate: {health, infectious, daysSinceInfection},
            bestAlternate: {health, infectious, daysSinceInfection},
          }
        })
      }

      const infectedHouses = []
      const infectedDestinations = []
      const worstAlternateHouses = [] // same as infectedHouses, but for worstAlternate scenario
      const worstAlternateDestinations = []
      const bestAlternateHouses = [] // same as infectedHouses, but for worstAlternate scenario
      const bestAlternateDestinations = []
      let numSevere = 0
      let numWorstAlternateSevere = 0
      let numBestAlternateSevere = 0
      const infected = _.map(people, (person, i) => {
        let {
          health: prevHealth,
          infectious: prevInfectious,
          inHospital: prevInHospital,
          daysSinceInfection,
          worstAlternate: prevWorstAlternate,
          bestAlternate: prevBestAlternate,
          weeklyDecision,
        } = prevInfected[i]

        const dayOfWeek = (day - 1) % 7
        // if this is first day of week
        if (dayOfWeek === 0) {
          const numTimes = allDecisions[i % totalPlayers][week - 1]
          let player = numTimesOut[7]
          let bestAlternate = numTimesOut[7]
          if (numTimes < 7) {
            player = _.shuffle(numTimesOut[numTimes])
          }
          if (week > 1) {
            // for best alternate, have everyone go out the same amount in week 1
            // and after week 1, only go out once a week
            bestAlternate = _.shuffle(numTimesOut[1])
          }
          weeklyDecision = {
            player, bestAlternate,
          }
        }

        // calculate everyone's new health/infectiousness for current day
        daysSinceInfection += !!daysSinceInfection // if days = 0, don't add any, if >0 then add 1
        const {health, infectious, destination} = healthAndDestination(
          person,
          houses,
          daysSinceInfection,
          prevInfectious,
          prevInHospital,
          weeklyDecision.player[dayOfWeek],
          infectedDestinations,
          infectedHouses,
        )
        let inHospital = prevInHospital
        if (health === 4) {
          // if the person is in severe condition
          numSevere += 1
          inHospital = numSevere <= totalAvailableBeds
        }

        // now calculate for an worstAlternate scenario
        prevWorstAlternate.daysSinceInfection += !!prevWorstAlternate.daysSinceInfection
        const worstAlternate = Object.assign(
          healthAndDestination(
            person,
            houses,
            prevWorstAlternate.daysSinceInfection,
            prevWorstAlternate.infectious,
            prevWorstAlternate.inHospital,
            true,
            worstAlternateDestinations,
            worstAlternateHouses,
          ),
          {daysSinceInfection: prevWorstAlternate.daysSinceInfection},
        )
        if (worstAlternate.health === 4) {
          numWorstAlternateSevere += 1
          worstAlternate.inHospital =
            numWorstAlternateSevere <= totalAvailableBeds
        }

        // and best case scenario
        prevBestAlternate.daysSinceInfection += !!prevBestAlternate.daysSinceInfection
        const bestAlternate = Object.assign(
          healthAndDestination(
            person,
            houses,
            prevBestAlternate.daysSinceInfection,
            prevBestAlternate.infectious,
            prevBestAlternate.inHospital,
            weeklyDecision.bestAlternate[dayOfWeek],
            bestAlternateDestinations,
            bestAlternateHouses,
          ),
          {daysSinceInfection: prevBestAlternate.daysSinceInfection},
        )
        if (bestAlternate.health === 4) {
          numWorstAlternateSevere += 1
          bestAlternate.inHospital =
            numWorstAlternateSevere <= totalAvailableBeds
        }

        return {
          index: i,
          house: person.houseIndex,
          daysSinceInfection,
          health,
          infectious,
          destination,
          inHospital,
          worstAlternate,
          bestAlternate,
          weeklyDecision,
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
        if (person.worstAlternate.health === 0) {
          // if in worstAlternate simulation they're healthy
          // calculate whether they get infected there
          infectPerson(
            person.worstAlternate,
            house,
            person.worstAlternate.destination,
            people[index].susceptibility,
            worstAlternateDestinations,
            worstAlternateHouses,
          )
        }
        if (person.bestAlternate.health === 0) {
          // and like-wise for best alternate
          infectPerson(
            person.bestAlternate,
            house,
            person.bestAlternate.destination,
            people[index].susceptibility,
            bestAlternateDestinations,
            bestAlternateHouses,
          )
        }
      })

      prevInfected = infected

      return infected
    },
    dailyHealthStatus({day}, {infected}) {
      if (!infected) return
      // keeps track of all cumulative numbers for every scenario daily
      const player = _.countBy(infected, 'health')
      const worstAlternate = _.chain(infected)
        .map(d => d.worstAlternate.health)
        .countBy()
        .value()
      const bestAlternate = _.chain(infected)
        .map(d => d.bestAlternate.health)
        .countBy()
        .value()
      const totalHealthStatus = [1, 2, 3, 4, 5]
      dailyHealthStatus.push({
        day,
        player: Object.assign(player, {
          total: _.sumBy(totalHealthStatus, d => player[d] || 0),
        }),
        worstAlternate: Object.assign(worstAlternate, {
          total: _.sumBy(totalHealthStatus, d => worstAlternate[d] || 0),
        }),
        bestAlternate: Object.assign(bestAlternate, {
          total: _.sumBy(totalHealthStatus, d => bestAlternate[d] || 0),
        }),
      })

      return dailyHealthStatus
    },
    dailyInfectious({day}, {infected}) {
      if (!infected) return
      dailyInfectious.push({
        day,
        player: _.countBy(infected, 'infectious'),
        worstAlternate: _.chain(infected)
          .map(d => d.worstAlternate.infectious)
          .countBy()
          .value(),
        bestAlternate: _.chain(infected)
          .map(d => d.bestAlternate.infectious)
          .countBy()
          .value(),
      })

      return dailyInfectious
    },
  },
  mutations: {
    setCurrentPage(state, currentPage) {
      state.currentPage = currentPage
    },
    setDay(state, day) {
      state.day = day
      state.foodStatus.value -= 1 // for every day they don't get groceries
      if (day % 3 === 0) {
        state.exerciseStatus.value -= 1 // for every 3 days they don't go out
      }

      if (!state.foodStatus.value || !state.exerciseStatus) {
        state.currentPage = 'failed'
      }
    },
    setZipCode(state, zipCode) {
      state.zipCode = '' + zipCode // stringify just in case
    },
    setDataLoaded(state, dataLoaded) {
      state.dataLoaded = dataLoaded
    },
    setPastPlayerIDs(state, pastPlayerIDs) {
      state.pastPlayerIDs = pastPlayerIDs
    },
    setAllDecisions(state, allDecisions) {
      state.allDecisions = allDecisions
    },
    setDecision(state, decision) {
      if (decision > 0) {
        // if go out more than once, then they did exercise
        state.exerciseStatus.value = Math.min(
          state.exerciseStatus.value + 1,
          state.exerciseStatus.maxValue
        )
      }
      if (decision > 1) {
        // if they go out twice, 2 weeks of groceries are taken care of
        state.foodStatus.value = Math.min(
          state.foodStatus.value + 14,
          state.foodStatus.maxValue
        )
      }
      if (decision > 2) {
        // if they go out three times
        state.exerciseStatus.value = Math.min(
          state.exerciseStatus.value + 3,
          state.exerciseStatus.maxValue
        )
      }
      state.allDecisions[0].push(decision) // update decision for current player
    },
    setFoodStatus(state, foodStatus) {
      state.foodStatus = _.clone(foodStatus)
    },
    setExerciseStatus(state, exerciseStatus) {
      state.exerciseStatus = _.clone(exerciseStatus)
    },
    setGameId(state) {
      state.gameId = uuidv4()
    },
  },
  actions: {
    getRawData({commit, dispatch}) {
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
        commit('setFoodStatus', foodStatus)
        commit('setExerciseStatus', exerciseStatus)
      })
    },
    getPastGames({commit, dispatch}, zipCode) {
      const numPastPlayers = totalPlayers - 1
      apiService.getFilteredGames({
        filters: {zipCode},
        limit: numPastPlayers,
        cb: data => {
          if (zipCode !== 'Any' && data.length < numPastPlayers) {
            // if there aren't enough past games in zip code, take from any zip code
            dispatch('getPastGames', 'Any')
            return
          }
          const allDecisions = _.chain(data).map('decisions').filter().value()
          // if there still aren't enough, then add in the rest assuming they go out every day
          _.times(numPastPlayers - allDecisions.length, i => {
            allDecisions.push([7, 7, 7, 7, 7, 7, 7, 7])
          })
          // add this player's decision at beginning, assume they go out every day
          allDecisions.unshift([7])

          commit('setAllDecisions', allDecisions)
          commit('setPastPlayerIDs', _.map(data, 'id'))
        },
      })
    },
    storeGame({
      state: {allDecisions, zipCode, gameId, pastPlayerIDs},
      getters: {dailyInfectious, dailyHealthStatus},
    }) {
      const decisions = _.get(allDecisions, '[0]', [])
      apiService.setGameById(gameId, {
        dailyInfectious,
        id: gameId,
        dailyHealthStatus,
        decisions,
        // use this in db to filter by those that have gone through all 8 weeks
        numDecisions: decisions.length,
        pastPlayerIDs,
        zipCode,
      })
    },
    resetGame({commit, state}) {
      // reset prevInfected
      prevInfected = []
      dailyHealthStatus = []
      dailyInfectious = []

      const allDecisions = _.clone(state.allDecisions) // to avoid mutating?
      allDecisions[0] = [7]
      commit('setAllDecisions', allDecisions)
      commit('setDay', 0)
      commit('setFoodStatus', foodStatus)
      commit('setExerciseStatus', exerciseStatus)
      commit('setCurrentPage', 'game')
    },
  },
})
