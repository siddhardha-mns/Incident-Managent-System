import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import VoiceAgentTest from './pages/VoiceAgentTest';
import Analytics from './pages/Analytics';
import { IncidentProvider } from './context/IncidentContext';

const App: React.FC = () => {
  return (
    <IncidentProvider>
      <Router>
        <div className="flex h-screen w-screen overflow-hidden bg-beige-light">
          <Sidebar />
          <main className="flex-1 ml-64 h-full overflow-hidden relative">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/voice-agent" element={<VoiceAgentTest />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </main>
        </div>
      </Router>
    </IncidentProvider>
  );
};

export default App;