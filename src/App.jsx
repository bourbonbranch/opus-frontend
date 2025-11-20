import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AddEnsemble from './pages/AddEnsemble';
import { TodayDashboard } from './pages/TodayDashboard';
import { RoomSetup } from './pages/RoomSetup';
import { Events } from './pages/Events';
import { CalendarView } from './pages/CalendarView';
import Roster from './pages/Roster';
import StudentCheckIn from './pages/StudentCheckIn';
import LiveAttendance from './pages/LiveAttendance';
import Messages from './pages/Messages';
import Tickets from './pages/Tickets';
import CreateEvent from './pages/CreateEvent';
import SeatingChart from './pages/SeatingChart';

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
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/checkin/:roomId" element={<StudentCheckIn />} />
          <Route path="/rooms/:roomId/live" element={<LiveAttendance />} />
          <Route path="/add-ensemble" element={<AddEnsemble />} />
          <Route path="/ensembles/new" element={<AddEnsemble />} />

          <Route path="/director" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/director/today" replace />} />
            <Route path="today" element={<TodayDashboard />} />
            <Route path="rooms" element={<RoomSetup />} />
            <Route path="roster" element={<Roster />} />
            <Route path="events" element={<Events />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="messages" element={<Messages />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="tickets/events/new" element={<CreateEvent />} />
            <Route path="ensembles/:ensembleId/roster" element={<Roster />} />
            <Route path="seating" element={<SeatingChart />} />
          </Route>

          <Route path="*" element={<Navigate to="/director/today" replace />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;
