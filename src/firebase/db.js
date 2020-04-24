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
if (!isEmpty(App)) {
  let fireStore = App.firestore()
  apiService = {
    getAllGames: () => {
      fireStore.collection('games')
    },
    getRandomGames: ({cb=noop, limit=19}) => {
      let games = fireStore.collection('games')
      let key = games.doc().id
      let finishedGames = games.where('numDecisions', '==', 8)
      let randomGames1 = finishedGames.where('id', '>=', key)
      let randomGames2 = finishedGames.where('id', '<', key)
      randomGames1
        .limit(limit)
        .get()
        .then(collectionSnapshot => {
          if (collectionSnapshot.size > 0) {
            cb(collectionSnapshot.docs.map(docSnapShot => docSnapShot.data()))
          } else {
            randomGames2
              .limit(limit)
              .get()
              .then(collectionSnapshot => {
                cb(collectionSnapshot.docs.map(docSnapShot => docSnapShot.data()))
              })
              .catch(err => {
                console.log('Error getting documents', err)
              })
          }
          
        })
        .catch(err => {
          console.log('Error getting documents', err)
        })
    },
    getFilteredGames: ({filters = {}, limit = 100, cb = noop}) => {
      let query = fireStore
        .collection('games')
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
        .collection('games')
        .doc(id)
        .get()
    },
    setGameById: (id, state) => {
      return fireStore
        .collection('games')
        .doc(id)
        .set(state)
    },
  }
} else {
  console.warn('Firebase app not set up. This session will not be saved.')
}

export {apiService}
