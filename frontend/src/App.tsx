import React from 'react';
import logo from './logo.svg';
import './App.css';

import { ServiceContext, ServiceProvider } from "./Service/Firebase"
import { GeistProvider, CssBaseline } from '@geist-ui/core'
import { Routes, Route } from 'react-router-dom';
import LoginInPage from './Views/LoginInPage';
import HomePage from "./Views/HomePage"
import PrivateRoute from "./Components/PrivateRoute"

function App() {
  // const context = useContext(ThemeContext)

  return (
    <div className="App">
      <GeistProvider>
        <CssBaseline />
        <ServiceProvider>
          <Routes>
            <Route path="/" element={<LoginInPage />} />
            <Route path='/home' element={<PrivateRoute />}>
              <Route path="/home" element={<HomePage />} />
            </Route>
          </Routes>
        </ServiceProvider>
      </GeistProvider>
    </div>
  );
}

export default App;
