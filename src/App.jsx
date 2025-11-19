import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import TodayDashboard from './pages/TodayDashboard.jsx';
import AddEnsemble from './pages/AddEnsemble.jsx';
import SignUp from './pages/SignUp.jsx';

const App = () => {
  return (
    <Routes>
      {/* Default to signup for now */}
      <Route path="/" element={<SignUp />} />

      {/* Explicit signup route */}
      <Route path="/signup" element={<SignUp />} />

      {/* Director dashboard */}
      <Route path="/director/today" element={<TodayDashboard />} />

      {/* Add ensemble */}
      <Route path="/ensembles/new" element={<AddEnsemble />} />

      {/* Catch-all: send them to Today */}
      <Route path="*" element={<Navigate to="/director/today" replace />} />
    </Routes>
  );
};

export default App;
