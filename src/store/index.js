import Vue from 'vue'
import Vuex from 'vuex'
import * as d3 from 'd3'
import _ from 'lodash'

Vue.use(Vuex)

let populationsByZip
let hospitalsByZip
let prevInfected

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

      const ageGroups = _.map(['<19', '20', '40', '60', '>80'], (key, i) => {
        return [i * 20, population[key], key]
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
            susceptibility: 0.03, // TODO: UPDATE
            symptomaticIfInfected: _.random(99) < 80 ? 1 : 0,  // TODO: updated based on age
            hospitalIfInfected: _.random(99) < 20 ? 1 : 0 , // TODO: updated based on age
            dieIfInfected: _.random(99) < 3 ? 1 : 0, // TODO: updated based on age
          })
        })

        personIndex += numPeopleInHouse
        houseIndex += 1
      }

      // assign houses and destinations to each other
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
    
  	function assignHealth(person, daysSinceInfection ){ 
		// health statuses: 1 = healthy, 2 = recovered, 3 = infected+asymptomatic, 4 = infected+ symptomatic, 5 = hospitalized from infection, 6 = died from infection. Option to add additional for infected+presymptomatic; and/or to include infectious here rather than as a separate variable
		    let newHealth = 1;
        let newInfectious = 0; 
        if ( daysSinceInfection >= 14 ){ 
        	newHealth = person.dieIfInfected == 1 ? 6 : 2 // dead or recovered
        	newInfectious = 0 
        } else if (daysSinceInfection >= 7 & person.hospitalIfInfected == 1 ) {
        	newHealth = 5 // hospitalized 
        	newInfectious = 1 
        } else if (daysSinceInfection >= 6 ) { 
        	newHealth = person.symptomaticIfInfected ? 4 : 3 // symptomatic or asymptomatic 
        	newInfectious = 1        							 // and infectious
        } else if (daysSinceInfection >= 4 ) {
        	newHealth = 3  // asymptomatic 
        	newInfectious = 1 // and infectious
        } else if (daysSinceInfection >= 0 ) { 
        	newHealth = 3  // asymptomatic
        	newInfectious = 0 // and not infectious
        } 
        return {health: newHealth, infectious: newInfectious}
	 }

    
    infected({day}, {community, totalBeds}) {
      if (!community) return
      const {people, houses, destinations} = community

      // id who was exposed and how many times
      let exposedToday = {};
	    prevInfected.filter(d => d.infectious == 1)
	  	  .forEach(function (d){
	 		    prevInfected.forEach(function (o, i ){
	 		 		  if (people[o.index].houseIndex == people[d.index].houseIndex )  { 
	 		 			  exposedToday[i] = exposedToday[i] ? exposedToday[i] + 5 : 5; 
	 		 		  } else if (o.destination != 0 & o.destination == d.destination) {
	 		 		  	exposedToday[i] = exposedToday[i] ? exposedToday[i] + 1 : 1; 
					  }
	 		 	  })
	    })

	    // update to tomorrow's destinations and health status 
      const infected = people.map(function (person, i) {
        let curDest = d3.shuffle(houses[person.houseIndex].destinations).slice(0,1)[0]
        
        // iterate infection days if they are already infected or they were exposed today and their susceptibility * number of exposures > random number from 0-1          
        let newDaysSinceInfection = (prevInfected[i].daysSinceInfection > 0 | 
          							(exposedToday[i] & ((person.susceptibility * exposedToday[i]) > Math.random() ))) ? 
          						prevInfected[i].daysSinceInfection + 1 : 0; 

		curHealth = assignHealth(person, newDaysSinceInfection)
        
        return {
          index: i,
          health: curHealth.health,
          destination: curDest,
          daysSinceInfection: newDaysSinceInfection,
          infectious: curHealth.infectious,
        }
      })
      
	  prevInfected = infected

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
