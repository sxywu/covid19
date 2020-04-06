import {App} from './app'
import 'firebase/firestore'
import isEmpty from 'lodash/isEmpty'
let DB, gamesCollection, getGamesCollection, getGamesInstance

let appNotSetUpMessage =
  'Firebase app not set up. This session will not be saved.'

if (!isEmpty(App)) {
  DB = App.firestore()
  gamesCollection = DB.collection('games')
  getGamesCollection = () => gamesCollection.get()
  getGamesInstance = gameId => gamesCollection.doc(gameId)
} else {
  getGamesCollection = new Promise((resolve, reject) =>
    reject(appNotSetUpMessage),
  )
  getGamesInstance = () => ({
    set: () => console.warn(appNotSetUpMessage),
  })
}
export {DB, gamesCollection, getGamesCollection, getGamesInstance}
