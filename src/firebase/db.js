import {App} from './app'
import 'firebase/firestore'
import _ from 'lodash'
let noop = () => {}
let apiService = {
  getAllGames: noop,
  getFilteredGames: noop,
  getGameById: noop,
  setGameById: noop,
  setGameByTeamName: noop,
  getFilteredGamesWithDefault: noop,
  getTeamNames: noop,
}
const FIRESTORE_COLLECTION = 'games-v2'

if (!_.isEmpty(App)) {
  let fireStore = App.firestore()
  let getAllGames = () => {
    fireStore.collection(FIRESTORE_COLLECTION)
  }
  let getFilteredGames = ({filters = {}, limit = 10000, cb = noop}) => {
    let query = fireStore
      .collection(FIRESTORE_COLLECTION)
      .limit(limit)
      .where('numDecisions', '==', 5)
      .where('lowerCaseName', '==', filters.teamName.toLowerCase() || '')
    if (filters.zipCode) {
      query = query.where('zipCode', '==', filters.zipCode)
    }
    if (filters.locale && filters.locale !== 'en') {
      query = query.where('locale', '==', filters.locale)
    }

    query
      .get()
      .then(collectionSnapshot => {
        let teamCollection = collectionSnapshot.docs.map(docSnapShot => docSnapShot.data())
        cb(teamCollection)
      })
      .catch(console.warn)
  }
  let getGameById = id => {
    return fireStore
      .collection(FIRESTORE_COLLECTION)
      .doc(id)
      .get()
  }
  let setGameById = (id, state) => {
    return fireStore
      .collection(FIRESTORE_COLLECTION)
      .doc(id)
      .set(state)
  }
  let getTeamNames = ({cb}) => {
    return fireStore
      .collection(FIRESTORE_COLLECTION)
      .orderBy('lowerCaseName', 'desc')
      .orderBy('createdAt', 'desc')
      .where('lowerCaseName', '>', '')
      .where('numDecisions', '==', 5)
      .get()
      .then(collectionSnapshot => {
        let teamCollection = collectionSnapshot.docs.map(docSnapShot => docSnapShot.data())
        cb(_.uniqBy(teamCollection, 'lowerCaseName'))
      })
  }
  let getFilteredGamesWithDefault = ({
    filters = {},
    limit = 10000,
    cb = noop,
  }) => {
    getFilteredGames({
      filters,
      limit,
      cb: teamCollection => {
        if (teamCollection.length === 0) {
          getFilteredGames({
            limit: 100,
            cb,
          })
        } else {
          cb(teamCollection)
        }
      },
    })
  }
  // save lower case version of team name for case insensitivity
  let setLowerCaseTeamNames = () => {
    // first, go get all games with team name
    // (can't use getTeamNames because that gives only most recent game for each team)
    fireStore
      .collection(FIRESTORE_COLLECTION)
      .orderBy('teamName', 'desc')
      .orderBy('createdAt', 'desc')
      .get()
      .then(collectionSnapshot => {
        let teamCollection = collectionSnapshot.docs.map(docSnapShot => docSnapShot.data())
        _.chain(teamCollection)
          .groupBy(({teamName}) => teamName.toLowerCase())
          // .filter((games, teamName) => teamName === 'puppy-party')
          .each((games) => {
            // go through and add lower case team name to each game
            // and then store the game
            const {teamName} = _.last(games)
            _.each(games, game => {
              setGameById(game.id, Object.assign(game, {
                teamName,
                lowerCaseName: game.teamName.toLowerCase()
              }))
            })
          }).value()
      })
  }

  apiService = {
    getAllGames,
    getFilteredGames,
    getGameById,
    setGameById,
    getFilteredGamesWithDefault,
    getTeamNames,
    setLowerCaseTeamNames,
  }
} else {
  console.warn('Firebase app not set up. This session will not be saved.')
}

export {apiService}
