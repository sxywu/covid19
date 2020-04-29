import {App} from './app'
import 'firebase/firestore'
import isEmpty from 'lodash/isEmpty'
let noop = () => {}
let apiService = {
  getAllGames: noop,
  getFilteredGames: noop,
  getGameById: noop,
  setGameById: noop,
}
const FIRESTORE_COLLECTION = 'games-v2'
if (!isEmpty(App)) {
  let fireStore = App.firestore()
  apiService = {
    getAllGames: () => {
      fireStore.collection(FIRESTORE_COLLECTION)
    },
    getFilteredGames: ({filters = {}, limit = 100, cb = noop}) => {
      let query = fireStore
        .collection(FIRESTORE_COLLECTION)
        .limit(limit)
        .where('numDecisions', '==', 8)

      if (filters.zipCode !== 'Any') {
        query = query.where('zipCode', '==', filters.zipCode)
      }

      query
        .get()
        .then(collectionSnapshot => {
          cb(collectionSnapshot.docs.map(docSnapShot => docSnapShot.data()))
        })
        .catch(console.warn)
    },
    getGameById: id => {
      return fireStore
        .collection(FIRESTORE_COLLECTION)
        .doc(id)
        .get()
    },
    setGameById: (id, state) => {
      return fireStore
        .collection(FIRESTORE_COLLECTION)
        .doc(id)
        .set(state)
    },
  }
} else {
  console.warn('Firebase app not set up. This session will not be saved.')
}

export {apiService}
