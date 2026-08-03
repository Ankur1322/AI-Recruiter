import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CandidateProvider } from './context/CandidateContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Shortlist from './pages/Shortlist';
import AIInterview from './pages/AIInterview';
import Candidates from './pages/Candidates';
import Assessments from './pages/Assessments';

function App() {
  return (
    <ThemeProvider>
      <CandidateProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="assessments" element={<Assessments />} />
              <Route path="settings" element={<Settings />} />
              <Route path="shortlist" element={<Shortlist />} />
              <Route path="ai-interview" element={<AIInterview />} />
              <Route path="*" element={<Dashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CandidateProvider>
    </ThemeProvider>
  )
}

export default App;
