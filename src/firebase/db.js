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
      .where('teamName', '==', filters.teamName || '')
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
      .orderBy('teamName', 'desc')
      .orderBy('createdAt', 'desc')
      .where('teamName', '>', '')
      .where('numDecisions', '==', 5)
      .get()
      .then(collectionSnapshot => {
        let teamCollection = collectionSnapshot.docs.map(docSnapShot => docSnapShot.data())
        cb(_.uniqBy(teamCollection, 'teamName'))
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
  apiService = {
    getAllGames,
    getFilteredGames,
    getGameById,
    setGameById,
    getFilteredGamesWithDefault,
    getTeamNames,
  }
} else {
  console.warn('Firebase app not set up. This session will not be saved.')
}

export {apiService}
