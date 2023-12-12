import React from 'react';
import logo from './logo.svg';
import './App.css';

import { ServiceContext, ServiceProvider } from "./Service/Firebase"
import { GeistProvider, CssBaseline, Breadcrumbs } from '@geist-ui/core'
import { Routes, Route } from 'react-router-dom';
import LoginInPage from './Views/LoginInPage';
import HomePage from "./Views/HomePage"
import WatchPage from './Views/WatchPage';
import PrivateRoute from "./Components/PrivateRoute"
import Navbar from './Components/Navbar';

function App() {
  // const context = useContext(ThemeContext)

  return (
    <div className="App">

      <GeistProvider>
        <CssBaseline />
        <ServiceProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<LoginInPage />} />
            <Route path='/home' element={<PrivateRoute />}>
              <Route path="/home" element={<HomePage />} />
            </Route>

            <Route path='/watch' element={<PrivateRoute />}>
              <Route path="/watch" element={<WatchPage />} />
            </Route>

          </Routes>
        </ServiceProvider>
      </GeistProvider>
    </div>
  );
}

export default App;
