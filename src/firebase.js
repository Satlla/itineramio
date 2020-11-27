import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';

var firebaseConfig = {
  apiKey: "AIzaSyBV0iYINImekCuWYEGm_eUMAj4v9PpH2A0",
  authDomain: "itineramio.firebaseapp.com",
  databaseURL: "https://itineramio.firebaseio.com",
  projectId: "itineramio",
  storageBucket: "itineramio.appspot.com",
  messagingSenderId: "781234588135",
  appId: "1:781234588135:web:f8a351385c863fb2095542"
};
// Initialize Firebase
 export const fb = firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

export const db = fb.firestore();

export default storage;


