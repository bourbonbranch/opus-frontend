import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import TodayDashboard from './pages/TodayDashboard.jsx';
import AddEnsemble from './pages/AddEnsemble.jsx';
import SignUp from './pages/SignUp.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<SignUp />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Add both paths to avoid 404s */}
      <Route path="/add-ensemble" element={<AddEnsemble />} />
      <Route path="/ensembles/new" element={<AddEnsemble />} />

      <Route path="/director/today" element={<TodayDashboard />} />
      <Route path="*" element={<Navigate to="/director/today" replace />} />
    </Routes>
  );
};

export default App;
