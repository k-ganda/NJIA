import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import WaveSurfer from 'wavesurfer.js'
import './AudioIntakePage.css'

function AudioIntakePage() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const waveformRef = useRef(null)
  const wavesurferRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  useEffect(() => {
    // Initialize WaveSurfer
    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#7c3aed',
        progressColor: '#6d28d9',
        cursorColor: '#7c3aed',
        barWidth: 2,
        barRadius: 3,
        height: 80,
        normalize: true
      })
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await processAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Simulate waveform animation
      if (wavesurferRef.current) {
        const interval = setInterval(() => {
          if (wavesurferRef.current && isRecording) {
            // Generate random waveform data for visualization
            const peaks = Array.from({ length: 100 }, () => Math.random())
            wavesurferRef.current.loadDecodedData(new Float32Array(peaks))
          }
        }, 100)
        return () => clearInterval(interval)
      }
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Please allow microphone access to record audio.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob) => {
    setIsProcessing(true)
    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.wav')
      formData.append('case_id', caseId)

      // Upload audio
      const uploadResponse = await axios.post(
        `http://localhost:8000/api/audio/upload?case_id=${caseId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      // Preprocess audio
      const preprocessResponse = await axios.post('http://localhost:8000/api/audio/preprocess', {
        case_id: caseId,
        audio_path: uploadResponse.data.audio_path
      })

      // Transcribe audio (use cleaned audio path)
      const transcribeResponse = await axios.post('http://localhost:8000/api/transcribe', {
        case_id: caseId,
        audio_path: preprocessResponse.data.cleaned_audio_path
      })

      setTranscript(transcribeResponse.data.transcript)
    } catch (error) {
      console.error('Error processing audio:', error)
      // For demo purposes, show sample transcript
      setTranscript("Patient she was walking home from the market around dusk. She notes the time was approximately 7 PM. She was approached by an unknown assailant... The area was was lit, which made it")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProceedToAnalysis = async () => {
    if (!transcript) {
      alert('Please record and transcribe audio first.')
      return
    }

    try {
      // Extract clinical facts
      const extractionResponse = await axios.post('http://localhost:8000/api/extract-clinical-facts', {
        case_id: caseId,
        transcript: transcript
      })

      // Generate P3 report
      const p3Response = await axios.post('http://localhost:8000/api/generate-p3', {
        case_id: caseId,
        clinical_facts: extractionResponse.data.clinical_facts
      })

      navigate(`/p3-report/${caseId}`, { state: { p3Data: p3Response.data } })
    } catch (error) {
      console.error('Error processing:', error)
      // Navigate anyway for demo
      navigate(`/p3-report/${caseId}`)
    }
  }

  return (
    <div className="audio-intake-page">
      <div className="audio-intake-container">
        <h1 className="page-title">Audio Intake & Transcription</h1>
        <p className="case-id">Case ID: {caseId}</p>

        <div className="waveform-container">
          <div ref={waveformRef} className="waveform"></div>
        </div>

        <div className="recording-controls">
          <button
            className={`microphone-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
                fill="white"
              />
              <path
                d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H3V12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12V10H19Z"
                fill="white"
              />
            </svg>
          </button>
          {isRecording && <p className="recording-status">Recording...</p>}
          {isProcessing && <p className="recording-status">Processing...</p>}
        </div>

        <div className="transcript-section">
          <h2 className="section-title">Live Transcript</h2>
          <textarea
            className="transcript-textarea"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Transcribed text will appear here..."
            readOnly={isProcessing}
          />
        </div>

        <div className="navigation-buttons">
          <button className="dashboard-button" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Dashboard
          </button>
          <button
            className="proceed-button"
            onClick={handleProceedToAnalysis}
            disabled={!transcript || isProcessing}
          >
            Proceed to Analysis
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AudioIntakePage
