import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AudioIntakePage from './pages/AudioIntakePage'
import P3ReportPage from './pages/P3ReportPage'
import EvidenceUploadPage from './pages/EvidenceUploadPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/audio-intake/:caseId" element={<AudioIntakePage />} />
        <Route path="/p3-report/:caseId" element={<P3ReportPage />} />
        <Route path="/evidence/:caseId" element={<EvidenceUploadPage />} />
      </Routes>
    </Router>
  )
}

export default App
