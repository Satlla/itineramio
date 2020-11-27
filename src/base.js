import firebase from 'firebase';
import 'firebase/storage';

export const App = firebase.initializeApp({

    apiKey: "AIzaSyBV0iYINImekCuWYEGm_eUMAj4v9PpH2A0",
    authDomain: "itineramio.firebaseapp.com",
    databaseURL: "https://itineramio.firebaseio.com",
    projectId: "itineramio",
    storageBucket: "itineramio.appspot.com",
    messagingSenderId: "781234588135",
    appId: "1:781234588135:web:f8a351385c863fb2095542"

});