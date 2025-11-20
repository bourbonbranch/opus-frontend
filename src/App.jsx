// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import SignUp from './pages/SignUp';
import AddEnsemble from './pages/AddEnsemble';
import TodayDashboard from './pages/TodayDashboard';
import Roster from './pages/Roster'; // make sure this file exists

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Signup */}
        <Route path="/" element={<SignUp />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Create Ensemble */}
        <Route path="/add-ensemble" element={<AddEnsemble />} />
        <Route path="/ensembles/new" element={<AddEnsemble />} />

        {/* Dashboard */}
        <Route path="/director/today" element={<TodayDashboard />} />

        {/* Roster page for a specific ensemble */}
        <Route
          path="/ensembles/:ensembleId/roster"
          element={<Roster />}
        />

        {/* Catch-all */}
        <Route
          path="*"
          element={<Navigate to="/director/today" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
