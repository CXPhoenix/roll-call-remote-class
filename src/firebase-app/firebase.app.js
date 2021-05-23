import { firebaseConfig } from './firebase.config.js'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

export const app = firebase.initializeApp(firebaseConfig)
export const auth = firebase.auth
export const db = firebase.firestore()
export const apiKey = firebaseConfig.apiKey