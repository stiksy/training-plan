import { useState } from 'react'
import './PainFlagModal.css'

interface PainFlagModalProps {
  onSubmit: (painReported: boolean, painLocation?: string, notes?: string) => void
  onCancel: () => void
}

const BODY_PARTS = [
  'Lower back',
  'Knee',
  'Shoulder',
  'Neck',
  'Hip',
  'Ankle',
  'Wrist',
  'Elbow',
  'Abdomen',
  'Other',
]

export function PainFlagModal({ onSubmit, onCancel }: PainFlagModalProps) {
  const [painReported, setPainReported] = useState<boolean | null>(null)
  const [painLocation, setPainLocation] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(painReported || false, painLocation || undefined, notes || undefined)
  }

  return (
    <div className="pain-flag-overlay">
      <form className="pain-flag-modal" onSubmit={handleSubmit}>
        <h3>Post-Workout Check-In</h3>

        <div className="pain-question">
          <p className="question-text">Did you experience any pain or discomfort during this workout?</p>
          <div className="pain-options">
            <button
              type="button"
              className={`pain-option ${painReported === false ? 'selected' : ''}`}
              onClick={() => {
                setPainReported(false)
                setPainLocation('')
                setNotes('')
              }}
            >
              <span className="option-icon">✅</span>
              <span className="option-text">No Pain</span>
            </button>
            <button
              type="button"
              className={`pain-option ${painReported === true ? 'selected' : ''}`}
              onClick={() => setPainReported(true)}
            >
              <span className="option-icon">⚠️</span>
              <span className="option-text">I Felt Pain</span>
            </button>
          </div>
        </div>

        {painReported === true && (
          <div className="pain-details">
            <div className="form-group">
              <label htmlFor="pain-location">Which body part?</label>
              <select
                id="pain-location"
                value={painLocation}
                onChange={(e) => setPainLocation(e.target.value)}
                required
              >
                <option value="">Select body part...</option>
                {BODY_PARTS.map((part) => (
                  <option key={part} value={part}>
                    {part}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pain-notes">Additional notes (optional)</label>
              <textarea
                id="pain-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe the pain or which exercise caused it..."
                rows={3}
              />
            </div>

            <div className="pain-warning">
              <strong>⚠️ Important:</strong> Your workout recommendations will be automatically adjusted to avoid
              stressing this area for the next 3 days. If pain persists or worsens, please consult a healthcare
              professional.
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={painReported === null}>
            {painReported ? 'Submit & Adjust Plan' : 'Complete Workout'}
          </button>
        </div>
      </form>
    </div>
  )
}
