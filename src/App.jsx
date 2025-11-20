import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import SignUp from './pages/SignUp';
import AddEnsemble from './pages/AddEnsemble';
import { TodayDashboard } from './pages/TodayDashboard';
import { RoomSetup } from './pages/RoomSetup';
import { Events } from './pages/Events';
import Roster from './pages/Roster';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', background: '#1f2937' }}>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/director/today" replace />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/add-ensemble" element={<AddEnsemble />} />
          <Route path="/ensembles/new" element={<AddEnsemble />} />

          <Route path="/director" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/director/today" replace />} />
            <Route path="today" element={<TodayDashboard />} />
            <Route path="rooms" element={<RoomSetup />} />
            <Route path="roster" element={<Roster />} />
            <Route path="events" element={<Events />} />
            <Route path="ensembles/:ensembleId/roster" element={<Roster />} />
          </Route>

          <Route path="*" element={<Navigate to="/director/today" replace />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;
