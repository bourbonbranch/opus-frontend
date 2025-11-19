import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TodayDashboard from './pages/TodayDashboard.jsx';
import AddEnsemble from './pages/AddEnsemble.jsx';

const App = () => {
  return (
    <div className="min-h-screen w-full" style={{
      background: 'linear-gradient(to bottom right, #111827, #4c1d95, #1d4ed8)',
      color: 'white'
    }}>
      <Routes>
        {/* default redirect */}
        <Route path="/" element={<Navigate to="/director/today" replace />} />

        {/* Today dashboard */}
        <Route path="/director/today" element={<TodayDashboard />} />

        {/* Add Ensemble */}
        <Route path="/ensembles/new" element={<AddEnsemble />} />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/director/today" replace />} />
      </Routes>
    </div>
  );
};

export default App;

