import { useState, useEffect } from 'react'
import './HealthDisclaimer.css'

const DISCLAIMER_KEY = 'health_disclaimer_accepted'

export function HealthDisclaimer() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasAccepted = localStorage.getItem(DISCLAIMER_KEY)
    if (!hasAccepted) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(DISCLAIMER_KEY, 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="disclaimer-overlay">
      <div className="disclaimer-modal">
        <div className="disclaimer-header">
          <h2>⚕️ Important Health Information</h2>
        </div>

        <div className="disclaimer-content">
          <p className="disclaimer-intro">
            This tool provides general fitness and nutrition suggestions for informational purposes only.
            It is <strong>not medical advice</strong> and does not replace consultation with qualified
            healthcare professionals.
          </p>

          <div className="disclaimer-section">
            <h3>Before starting any new exercise or nutrition programme:</h3>
            <ul>
              <li>Consult your GP, especially if you have existing health conditions</li>
              <li>Inform your physiotherapist of any exercises if you're receiving treatment</li>
              <li>Stop any activity that causes pain or discomfort</li>
            </ul>
          </div>

          <div className="disclaimer-section">
            <h3>Injury-aware modifications</h3>
            <p>
              This system includes injury-aware modifications based on known contraindications,
              but individual responses vary. Always listen to your body and seek professional
              guidance when needed.
            </p>
          </div>

          <div className="disclaimer-warning">
            <strong>⚠️ Warning:</strong> If you experience pain, dizziness, shortness of breath,
            or any concerning symptoms during exercise, stop immediately and consult a healthcare
            professional.
          </div>
        </div>

        <div className="disclaimer-footer">
          <button className="disclaimer-accept-btn" onClick={handleAccept}>
            I Understand
          </button>
          <p className="disclaimer-note">
            You can review this information anytime in the footer.
          </p>
        </div>
      </div>
    </div>
  )
}

export function HealthDisclaimerLink() {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <>
      <button
        className="health-info-link"
        onClick={() => setIsVisible(true)}
      >
        Health & Safety Information
      </button>

      {isVisible && (
        <div className="disclaimer-overlay">
          <div className="disclaimer-modal">
            <div className="disclaimer-header">
              <h2>⚕️ Important Health Information</h2>
              <button
                className="close-btn"
                onClick={() => setIsVisible(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="disclaimer-content">
              <p className="disclaimer-intro">
                This tool provides general fitness and nutrition suggestions for informational purposes only.
                It is <strong>not medical advice</strong> and does not replace consultation with qualified
                healthcare professionals.
              </p>

              <div className="disclaimer-section">
                <h3>Before starting any new exercise or nutrition programme:</h3>
                <ul>
                  <li>Consult your GP, especially if you have existing health conditions</li>
                  <li>Inform your physiotherapist of any exercises if you're receiving treatment</li>
                  <li>Stop any activity that causes pain or discomfort</li>
                </ul>
              </div>

              <div className="disclaimer-section">
                <h3>Injury-aware modifications</h3>
                <p>
                  This system includes injury-aware modifications based on known contraindications,
                  but individual responses vary. Always listen to your body and seek professional
                  guidance when needed.
                </p>
              </div>

              <div className="disclaimer-warning">
                <strong>⚠️ Warning:</strong> If you experience pain, dizziness, shortness of breath,
                or any concerning symptoms during exercise, stop immediately and consult a healthcare
                professional.
              </div>
            </div>

            <div className="disclaimer-footer">
              <button className="disclaimer-close-btn" onClick={() => setIsVisible(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
