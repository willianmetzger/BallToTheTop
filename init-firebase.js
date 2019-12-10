// TODO: Replace the following with your app's Firebase project configuration
var firebaseConfig = {
    apiKey: "AIzaSyC1nwfECzAMJSfviqqPabKExmergNWr_hM",
    authDomain: "balltothetop-abfe0.firebaseapp.com",
    databaseURL: "https://balltothetop-abfe0.firebaseio.com",
    projectId: "balltothetop-abfe0",
    storageBucket: "balltothetop-abfe0.appspot.com",
    messagingSenderId: "108301361663",
    appId: "1:108301361663:web:aedee872f4d6541516c7ca",
    measurementId: "G-TEHYNVVM11"
  };
  
  // Initialize Firebase with a "default" Firebase project
var defaultProject = firebase.initializeApp(firebaseConfig);

console.log(defaultProject.name);  // "[DEFAULT]"

// Option 1: Access Firebase services via the defaultProject variable
var defaultStorage = defaultProject.storage();
var defaultFirestore = defaultProject.firestore();