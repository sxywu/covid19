import Firebase from 'firebase/app'
import {config} from './credentials'
import isEmpty from 'lodash/isEmpty'

let App
if (isEmpty(config)) {
  console.warn('firebase config is empty, these sessions wont be saved.')
} else {
  App = Firebase.initializeApp(config)
}
export {App}
