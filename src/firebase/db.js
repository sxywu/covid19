import {App} from './app'
import 'firebase/firestore'
import isEmpty from 'lodash/isEmpty'
let fireStore
if (!isEmpty(App)) {
  fireStore = App.firestore()
} else {
  throw 'Firebase app not set up. This session will not be saved.'
}
function ApiService() {
}

ApiService.prototype.getAllGames = () => {
  fireStore.collection('games')
}

ApiService.prototype.getFilteredGames = (filters, cb) => {
  let query = fireStore.collection('games')

  if (filters.zipCode !== 'Any') {
    query = query.where('zipCode', '==', filters.zipCode)
  }
  
  query
    .get()
    .then(collectionSnapshot => {
      cb(collectionSnapshot.docs.map(docSnapShot => docSnapShot.data()))
    })
    .catch(console.warn)
}

ApiService.prototype.getGameById = id => {
    return fireStore.collection('games')
      .doc(id)
      .get()
    
}

ApiService.prototype.setGameById = (id, state) => {
    return fireStore.collection('games')
      .doc(id)
      .set(state)
  
}
const apiService = new ApiService()

console.log({apiService})
export {apiService}
