import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()

  const handleStartNewCase = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/cases/create')
      const caseId = response.data.case_id
      navigate(`/audio-intake/${caseId}`)
    } catch (error) {
      console.error('Error creating case:', error)
      // Fallback: generate case ID client-side
      const caseId = `NJ-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`
      navigate(`/audio-intake/${caseId}`)
    }
  }

  return (
    <div className="landing-page">
      <div className="landing-card">
        <h1 className="landing-title">Njia</h1>
        <p className="landing-subtitle">
          A trauma-informed toolkit for SGBV evidence collection.
        </p>
        <p className="landing-description">
          Begin the evidence collection process by creating a new case file. Each session is private, secure, and designed to be supportive.
        </p>
        <button className="start-case-button" onClick={handleStartNewCase}>
          Start New Case
        </button>
      </div>
    </div>
  )
}

export default LandingPage
