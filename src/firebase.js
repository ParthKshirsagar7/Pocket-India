import { getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyCjBN2uK1c4u9Ft3FHRp065AomkOE5Gw14',
  authDomain: 'the-info-game.firebaseapp.com',
  databaseURL: 'https://the-info-game-default-rtdb.firebaseio.com',
  projectId: 'the-info-game',
  storageBucket: 'the-info-game.appspot.com',
  messagingSenderId: '4434299815',
  appId: '1:4434299815:web:d9ac6292e884b80e7c8482',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const database = getDatabase(app)
