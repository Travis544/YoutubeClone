import React from 'react';
import logo from './logo.svg';
import './App.css';
import AuthComponent from './Authentication/AuthComponent';

import VideoUploadButton from './Components/VideoUploadButton';
import { ThemeContext, ThemeContextWrapper } from './ThemeContext';
import { useContext, createContext } from 'react';
import VideoDisplay from './Components/VideoDisplay';
import { FirebaseService, ServiceContext } from "./Service/Firebase"


function App() {
  // const context = useContext(ThemeContext)
  const firebaseService = new FirebaseService()

  return (
    <div className="App">
      <ServiceContext.Provider value={firebaseService}>
        <AuthComponent />
        <VideoUploadButton />
        <VideoDisplay />
      </ServiceContext.Provider>
    </div>
  );
}

export default App;
