import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import SignUp from './pages/SignUp';
import AddEnsemble from './pages/AddEnsemble';
import Today from './pages/Today';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* SIGNUP PAGE */}
        <Route path="/signup" element={<SignUp />} />

        {/* ADD ENSEMBLE PAGE */}
        <Route path="/ensembles/new" element={<AddEnsemble />} />

        {/* DIRECTOR DASHBOARD */}
        <Route path="/director/today" element={<Today />} />
      </Routes>
    </Router>
  );
}

export default App;


