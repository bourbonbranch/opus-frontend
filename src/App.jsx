import Roster from './pages/Roster';
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import TodayDashboard from './pages/TodayDashboard.jsx';
import AddEnsemble from './pages/AddEnsemble.jsx';
import SignUp from './pages/SignUp.jsx';

const App = () => {
  return (
    <Routes>
  {/* Signup */}
  <Route path="/" element={<SignUp />} />
  <Route path="/signup" element={<SignUp />} />

  {/* Create Ensemble */}
  <Route path="/add-ensemble" element={<AddEnsemble />} />
  <Route path="/ensembles/new" element={<AddEnsemble />} />

  {/* Dashboard */}
  <Route path="/director/today" element={<TodayDashboard />} />

  {/* Roster Management */}
  <Route path="/ensembles/:id/roster" element={<RosterPage />} />
  <Route path="/ensembles/:id/roster/add" element={<AddRosterMemberPage />} />

  {/* Catch-all */}
  <Route path="*" element={<Navigate to="/director/today" replace />} />
</Routes>

export default App;
