// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1rTYkMPWViAliyNw2nwBILVN275nTJts",
  authDomain: "game-2df2f.firebaseapp.com",
  databaseURL: "https://game-2df2f-default-rtdb.firebaseio.com",
  projectId: "game-2df2f",
  storageBucket: "game-2df2f.firebasestorage.app",
  messagingSenderId: "1081392964139",
  appId: "1:1081392964139:web:6eda2284d3dd44b38e006e",
  measurementId: "G-RCE3Z66RT4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export { database };
export const auth = getAuth(app);
