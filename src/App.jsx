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
import EnsembleDetail from './pages/EnsembleDetail';
import Recruiting from './pages/Recruiting';
import RecruitingPipeline from './pages/RecruitingPipeline';
import AddProspect from './pages/AddProspect';
import RecruitingQRCode from './pages/RecruitingQRCode';
import RecruitingAnalytics from './pages/RecruitingAnalytics';
import ProspectDetail from './pages/ProspectDetail';
import ImportProspects from './pages/ImportProspects';
import FundraisingDashboard from './pages/FundraisingDashboard';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetail from './pages/CampaignDetail';
import PublicDonationPage from './pages/PublicDonationPage';
import StudentFundraising from './pages/StudentFundraising';
import EnsemblesList from './pages/EnsemblesList';
import EnsembleDetailLayout from './pages/EnsembleDetail';
import EnsembleOverview from './pages/ensemble/Overview';
import EnsembleRoster from './pages/ensemble/Roster';
import EnsembleAttendance from './pages/ensemble/Attendance';
import EnsembleAssignments from './pages/ensemble/Assignments';
import AssignmentDetail from './pages/ensemble/AssignmentDetail';
import EnsembleLibrary from './pages/ensemble/Library';
import EnsembleMessages from './pages/ensemble/Messages';
import EnsembleEvents from './pages/ensemble/Events';
import EnsembleSettings from './pages/ensemble/Settings';
import EnsembleRooms from './pages/ensemble/Rooms';
import Planner from './pages/Planner';

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
          <Route path="/fundraising/:campaignSlug/:token" element={<PublicDonationPage />} />
          <Route path="/student/fundraising" element={<StudentFundraising />} />

          <Route path="/director" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/director/today" replace />} />
            <Route path="today" element={<TodayDashboard />} />
            <Route path="recruiting" element={<Recruiting />} />
            <Route path="recruiting/pipeline" element={<RecruitingPipeline />} />
            <Route path="recruiting/new" element={<AddProspect />} />
            <Route path="recruiting/import" element={<ImportProspects />} />
            <Route path="recruiting/qr-code" element={<RecruitingQRCode />} />
            <Route path="recruiting/analytics" element={<RecruitingAnalytics />} />
            <Route path="recruiting/:id" element={<ProspectDetail />} />

            <Route path="fundraising" element={<FundraisingDashboard />} />
            <Route path="fundraising/new" element={<CreateCampaign />} />
            <Route path="fundraising/:id" element={<CampaignDetail />} />

            <Route path="calendar" element={<CalendarView />} />
            <Route path="messages" element={<Messages />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="tickets/events/new" element={<CreateEvent />} />

            {/* Ensembles Routes */}
            <Route path="ensembles" element={<EnsemblesList />} />
            <Route path="ensembles/:id" element={<EnsembleDetailLayout />}>
              <Route index element={<EnsembleOverview />} />
              <Route path="roster" element={<EnsembleRoster />} />
              <Route path="attendance" element={<EnsembleAttendance />} />
              <Route path="rooms" element={<EnsembleRooms />} />
              <Route path="assignments" element={<EnsembleAssignments />} />
              <Route path="assignments/:assignmentId" element={<AssignmentDetail />} />
              <Route path="library" element={<EnsembleLibrary />} />
              <Route path="messages" element={<EnsembleMessages />} />
              <Route path="events" element={<EnsembleEvents />} />
              <Route path="settings" element={<EnsembleSettings />} />
            </Route>

            <Route path="seating" element={<SeatingChart />} />
            <Route path="pieces/:pieceId/planner" element={<Planner />} />
          </Route>

          <Route path="*" element={<Navigate to="/director/today" replace />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;
