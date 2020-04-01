import * as firebase from 'firebase/app'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCz1AC4mrjF_DKIlGPYe7a1A1lAjjY0ca0',
  authDomain: 'covid19-e8f9a.firebaseapp.com',
  databaseURL: 'https://covid19-e8f9a.firebaseio.com',
  projectId: 'covid19-e8f9a',
  storageBucket: 'covid19-e8f9a.appspot.com',
  messagingSenderId: '57223984866',
  appId: '1:57223984866:web:bb21d8bf5d0811e7ac10bb',
  measurementId: 'G-2HB19L9H88',
}
// Get a Firestore instance
export const db = firebase.initializeApp(firebaseConfig).firestore()
export const gamesCollection = db.collection('games')
