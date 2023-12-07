import React from 'react';
import logo from './logo.svg';
import './App.css';
import AuthComponent from './Authentication/AuthComponent';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
} from "firebase/firestore";

//contains API key, project id information for this particular web app. This can be accessed in "Your apps" in the project settings
import firebaseConfig from "./Firebase/key.json"

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  return (
    <div className="App">
      <AuthComponent auth={auth} />
    </div>
  );
}

export default App;
