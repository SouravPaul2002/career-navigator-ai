import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './pages/Dashboard';
import EditResume from './components/resume/EditResume';
import ResumeAnalysis from './pages/ResumeAnalysis';
import MockInterview from './pages/MockInterview';
import CareerGuidance from './pages/CareerGuidance';
import PastAnalyses from './pages/PastAnalyses';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/edit-resume" element={<EditResume />} />
          <Route path="/resume-analysis" element={<ResumeAnalysis />} />
          <Route path="/history" element={<PastAnalyses />} />
          <Route path="/mock-interview" element={<MockInterview />} />
          <Route path="/career-guidance" element={<CareerGuidance />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
