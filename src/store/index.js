import Vue from 'vue'
import Vuex from 'vuex'
import * as d3 from 'd3'
import _ from 'lodash'

Vue.use(Vuex)

let populationsByZip = []
let hospitalsByZip = []
let prevInfected = []
let dailyHealthStatus = []
let dailyInfectious = []
const totalPlayers = 20
const foodStatus = {value: 18, maxValue: 18}
const exerciseStatus = {value: 7, maxValue: 7}

function assignHealth(person, daysSinceInfection, prevInHospital) {
  // health statuses: 0 = healthy, 1 = recovered, 2 = infected+asymptomatic,
  // 3 = infected+ symptomatic, 4 = hospitalized from infection, 5 = died from infection
  // Option to add additional for infected+presymptomatic; and/or to include infectious here rather than as a separate variable
  let newHealth = 0
  let newInfectious = 0
  if (daysSinceInfection >= 14) {
    const dies = prevInHospital ? person.dieIfInfected : person.dieIfNotHospitalized
    newHealth = dies ? 5 : 1 // dead or recovered
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
  prevInHospital,
  playerGoesOut,
  infectedDestinations,
  infectedHouses
) {
  const {health, infectious} = assignHealth(person, daysSinceInfection, prevInHospital)

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
  infectedHouses
) {
  const timesExposed =
    (infectedDestinations[destination] || 0) + (infectedHouses[house] || 0)
  // if didn't get exposed, don't need to update
  if (!timesExposed) return
  // ( 1 - ( ( 1 - susceptibility ) ^ number of exposures ) ) > random number from 0-1
  const infected = 1 - Math.pow( 1 - susceptibility, timesExposed ) > Math.random()
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
    allDecisions: [],
    totalDays: 8 * 7,
    foodStatus: {},
    exerciseStatus: {},
  },
  getters: {
    week({day}) {
      return Math.ceil(day / 7)
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
        _.sumBy(infected, ({ health }) => health === 4), // hospitalized
        totalAvailableBeds
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

          const symptomaticIfInfected = +(Math.random() < 0.8)
          const hospitalIfInfected = +(symptomaticIfInfected && Math.random() < 0.25)
          const dieIfInfected = +(hospitalIfInfected && Math.random() < 0.12)
          const dieIfNotHospitalized = +(hospitalIfInfected && Math.random() < 0.4)
          people.push({
            index: personIndex + i,
            id: `person${personIndex + i}`,
            houseIndex, // reference house person lives in
            age,
            ageGroup,
            susceptibility: 0.03, // TODO: UPDATE
            symptomaticIfInfected, // TODO: updated based on age
            hospitalIfInfected, // TODO: updated based on age
            dieIfInfected, // TODO: updated based on age
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
          (groupIndex + 1) * housesPerGroup
        )
        const destIndicesInGroup = _.union(
          _.range(groupIndex * destPerGroup, (groupIndex + 1) * destPerGroup),
          _.times(3, i =>
            _.random(
              (groupIndex + 2) * destPerGroup,
              (groupIndex + 4) * destPerGroup
            )
          )
        )
        _.each(
          housesIndicesInGroup,
          i =>
            houses[i] &&
            Object.assign(houses[i], {
              groupIndex,
              destinations: destIndicesInGroup,
            })
        )
      })

      return {people, houses, destinations, numGroups: numDestGroups}
    },
    weeklyDecisions({allDecisions}, {week}) {
      return _.map(allDecisions, decisions => {
        const numTimes = decisions[week - 1]
        return _.chain(7)
          .times(i => +(i <numTimes))
          .shuffle()
          .value()
      })
    },
    infected({day}, {community, weeklyDecisions, totalAvailableBeds}) {
      if (!community) return
      const {people, houses, destinations} = community

      if (!prevInfected.length) {
        // if this is the first day, seed infections
        prevInfected = _.map(people, (person, i) => {
          // And then assign days for those randomly between 1 and 6.
          // We'll probably want to change this, but it gives us something to work with.
          let daysSinceInfection = i % 1000 ? 0 : _.random(1, 4);
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
      let numSevere = 0
      let numAlternateSevere = 0
      const infected = _.map(people, (person, i) => {
        let {
          health: prevHealth,
          infectious: prevInfectious,
          inHospital: prevInHospital,
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
          prevInHospital,
          weeklyDecisions[i % totalPlayers][(day - 1) % 7],
          infectedDestinations,
          infectedHouses
        )
        let inHospital = prevInHospital
        if (health === 4) {
          // if the person is in severe condition
          numSevere += 1
          inHospital = numSevere <= totalAvailableBeds
        }


        // now calculate for an alternate scenario
        prevAlternate.daysSinceInfection += !!prevAlternate.daysSinceInfection
        const alternate = Object.assign(
          healthAndDestination(
            person,
            houses,
            prevAlternate.daysSinceInfection,
            prevAlternate.infectious,
            prevAlternate.inHospital,
            true,
            alternateDestinations,
            alternateHouses
          ),
          {daysSinceInfection: prevAlternate.daysSinceInfection}
        )
        if (alternate.health === 4) {
          numAlternateSevere += 1
          alternate.inHospital = numAlternateSevere <= totalAvailableBeds
        }

        return {
          index: i,
          house: person.houseIndex,
          daysSinceInfection,
          health,
          infectious,
          destination,
          inHospital,
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
            infectedHouses
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
            alternateHouses
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
      const worstAlternate = _.chain(infected).map(d => d.alternate.health).countBy().value()
      dailyHealthStatus.push({
        day,
        player: Object.assign(player, {
          total: _.sumBy([1, 2, 3, 4, 5], d => player[d] || 0),
        }),
        worstAlternate: Object.assign(worstAlternate, {
          total: _.sumBy([1, 2, 3, 4, 5], d => worstAlternate[d] || 0),
        }),
      })

      return dailyHealthStatus
    },
    dailyInfectious({day}, {infected}) {
      if (!infected) return
      dailyInfectious.push({
        day,
        player: _.countBy(infected, 'infectious'),
        worstAlternate: _.chain(infected).map(d => d.alternate.infectious).countBy().value(),
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
    setAllDecisions(state, allDecisions) {
      state.allDecisions = allDecisions
    },
    setDecision(state, decision) {
      if (decision > 0) {
        // if go out more than once, then they did exercise
        state.exerciseStatus.value += 1
      }
      if (decision > 1) {
        // if they go out twice, 2 weeks of groceries are taken care of
        state.foodStatus.value += 14
      }
      state.allDecisions[0].push(decision) // update decision for current player
    },
    setFoodStatus(state, foodStatus) {
      state.foodStatus = _.clone(foodStatus)
    },
    setExerciseStatus(state, exerciseStatus) {
      state.exerciseStatus = _.clone(exerciseStatus)
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
        const allDecisions = _.times(totalPlayers - 1, i =>
          _.times(state.totalDays / 7, i => i ? _.random(7) : 7))
        allDecisions.unshift([7]) // add this player's decision at beginning, assume they go out every day

        commit('setDataLoaded', true)
        commit('setAllDecisions', allDecisions)
        commit('setFoodStatus', foodStatus)
        commit('setExerciseStatus', exerciseStatus)
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
