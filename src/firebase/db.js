import {App} from './app'
import 'firebase/firestore'
import isEmpty from 'lodash/isEmpty'
let noop = () => {}
let apiService = {
  getAllGames: noop,
  getFilteredGames: noop,
  getGameById: noop,
  setGameById: noop,
  setGameByTeamName: noop,
  getGamesByTeamName: noop,
}
const FIRESTORE_COLLECTION = 'games-v2'
if (!isEmpty(App)) {
  let fireStore = App.firestore()
  let getAllGames = () => {
    fireStore.collection(FIRESTORE_COLLECTION)
  }
  let getFilteredGames = ({
    filters = {zipCode: 'Any', teamName: 'Any'},
    limit = 10000,
    cb = noop,
  }) => {
    let query = fireStore
      .collection(FIRESTORE_COLLECTION)
      .limit(limit)
      .where('numDecisions', '==', 8)
    if (filters.zipCode !== 'Any') {
      query = query.where('zipCode', '==', filters.zipCode)
    }

    if (filters.teamName !== 'Any') {
      query = query.where('teamName', '==', filters.teamName)
    }

    query
      .get()
      .then(collectionSnapshot => {
        cb(collectionSnapshot.docs.map(docSnapShot => docSnapShot.data()))
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
  let setGameByTeamName = (teamName, state) => {
    return fireStore
      .collection(FIRESTORE_COLLECTION)
      .where('teamName', '==', teamName)
      .get()
      .then(collectionSnapshot => {
        let teamCollection = collectionSnapshot.docs.map(docSnapShot =>
          docSnapShot.data(),
        )
        if (teamCollection.length === 0) {
          setGameById(state.id, {...state, teamName})
        } else {
          throw 'That team name has been taken. Please enter another name.'
        }
      })
  }
  let getGamesByTeamName = ({teamName = '', cb = noop}) => {
    getFilteredGames({
      filters: {teamName, zipCode: 'Any'},
      cb: teamCollection => {
        if (teamCollection.length === 0) {
          getFilteredGames({
            limit: 19,
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
    setGameByTeamName,
    getGamesByTeamName,
  }
} else {
  console.warn('Firebase app not set up. This session will not be saved.')
}

export {apiService}
