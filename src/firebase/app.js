import Firebase from 'firebase/app'
import {config} from './credentials'

export const App = Firebase.initializeApp(config)
