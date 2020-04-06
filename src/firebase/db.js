import {App} from './app'
import 'firebase/firestore'

export const DB = App.firestore()
export const gamesCollection = DB.collection('games')
