import { useState, useEffect } from 'react'
import { useProfile } from '@/services/profiles/ProfileContext'
import { getWeightLogs, addWeightLog, deleteWeightLog, getCyclingLogs, addCyclingLog, deleteCyclingLog } from '@/services/progress'
import type { WeightLog, CyclingLog } from '@/services/progress'
import './ProgressTracker.css'

type Tab = 'weight' | 'cycling'

export function ProgressTracker() {
  const { activeProfile } = useProfile()
  const [activeTab, setActiveTab] = useState<Tab>('weight')
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([])
  const [cyclingLogs, setCyclingLogs] = useState<CyclingLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddWeight, setShowAddWeight] = useState(false)
  const [showAddCycling, setShowAddCycling] = useState(false)

  useEffect(() => {
    loadProgress()
  }, [activeProfile])

  const loadProgress = async () => {
    if (!activeProfile) return

    setLoading(true)
    try {
      const [weights, cycling] = await Promise.all([
        getWeightLogs(activeProfile.id),
        getCyclingLogs(activeProfile.id),
      ])

      setWeightLogs(weights)
      setCyclingLogs(cycling)
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddWeight = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!activeProfile) return

    const formData = new FormData(e.currentTarget)
    const date = formData.get('date') as string
    const weight = parseFloat(formData.get('weight') as string)

    try {
      await addWeightLog(activeProfile.id, date, weight)
      await loadProgress()
      setShowAddWeight(false)
    } catch (error) {
      console.error('Error adding weight log:', error)
      alert('Failed to add weight log')
    }
  }

  const handleDeleteWeight = async (id: string) => {
    if (!confirm('Are you sure you want to delete this weight entry?')) return

    try {
      await deleteWeightLog(id)
      await loadProgress()
    } catch (error) {
      console.error('Error deleting weight log:', error)
      alert('Failed to delete weight log')
    }
  }

  const handleAddCycling = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!activeProfile) return

    const formData = new FormData(e.currentTarget)
    const log: Omit<CyclingLog, 'id'> = {
      user_id: activeProfile.id,
      date: formData.get('date') as string,
      distance_km: parseFloat(formData.get('distance') as string),
      duration_min: parseInt(formData.get('duration') as string),
      avg_speed_kph: formData.get('speed') ? parseFloat(formData.get('speed') as string) : undefined,
      elevation_m: formData.get('elevation') ? parseInt(formData.get('elevation') as string) : undefined,
      notes: formData.get('notes') as string || undefined,
    }

    try {
      await addCyclingLog(log)
      await loadProgress()
      setShowAddCycling(false)
    } catch (error) {
      console.error('Error adding cycling log:', error)
      alert('Failed to add cycling log')
    }
  }

  const handleDeleteCycling = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cycling entry?')) return

    try {
      await deleteCyclingLog(id)
      await loadProgress()
    } catch (error) {
      console.error('Error deleting cycling log:', error)
      alert('Failed to delete cycling log')
    }
  }

  if (loading) {
    return (
      <div className="progress-tracker">
        <p>Loading progress data...</p>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <h2>Progress Tracker</h2>
        <div className="tab-selector">
          <button
            className={`tab-btn ${activeTab === 'weight' ? 'active' : ''}`}
            onClick={() => setActiveTab('weight')}
          >
            Weight Log
          </button>
          <button
            className={`tab-btn ${activeTab === 'cycling' ? 'active' : ''}`}
            onClick={() => setActiveTab('cycling')}
          >
            Cycling Log
          </button>
        </div>
      </div>

      {activeTab === 'weight' && (
        <div className="weight-log-section">
          <div className="section-header">
            <h3>Weight Progress</h3>
            <button
              className="add-btn"
              onClick={() => setShowAddWeight(true)}
            >
              + Add Entry
            </button>
          </div>

          {showAddWeight && (
            <div className="add-form-overlay">
              <form className="add-form" onSubmit={handleAddWeight}>
                <h4>Add Weight Entry</h4>
                <div className="form-group">
                  <label htmlFor="weight-date">Date</label>
                  <input
                    type="date"
                    id="weight-date"
                    name="date"
                    max={today}
                    defaultValue={today}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="weight">Weight (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    step="0.1"
                    min="30"
                    max="300"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setShowAddWeight(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary">
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}

          {weightLogs.length === 0 ? (
            <div className="empty-state">
              <p>No weight entries yet. Add your first one to track progress!</p>
            </div>
          ) : (
            <div className="log-list">
              {weightLogs.map((log) => (
                <div key={log.id} className="log-entry">
                  <div className="log-date">{new Date(log.date).toLocaleDateString('en-GB')}</div>
                  <div className="log-value">{log.weight_kg} kg</div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteWeight(log.id)}
                    aria-label="Delete entry"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'cycling' && (
        <div className="cycling-log-section">
          <div className="section-header">
            <h3>Cycling Rides</h3>
            <button
              className="add-btn"
              onClick={() => setShowAddCycling(true)}
            >
              + Add Ride
            </button>
          </div>

          {showAddCycling && (
            <div className="add-form-overlay">
              <form className="add-form cycling-form" onSubmit={handleAddCycling}>
                <h4>Add Cycling Ride</h4>
                <div className="form-group">
                  <label htmlFor="cycling-date">Date</label>
                  <input
                    type="date"
                    id="cycling-date"
                    name="date"
                    max={today}
                    defaultValue={today}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="distance">Distance (km)</label>
                  <input
                    type="number"
                    id="distance"
                    name="distance"
                    step="0.1"
                    min="0.1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="duration">Duration (minutes)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="speed">Avg Speed (km/h)</label>
                  <input
                    type="number"
                    id="speed"
                    name="speed"
                    step="0.1"
                    min="0.1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="elevation">Elevation (m)</label>
                  <input
                    type="number"
                    id="elevation"
                    name="elevation"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cycling-notes">Notes</label>
                  <textarea
                    id="cycling-notes"
                    name="notes"
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => setShowAddCycling(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary">
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}

          {cyclingLogs.length === 0 ? (
            <div className="empty-state">
              <p>No cycling rides logged yet. Add your first ride to track progress!</p>
            </div>
          ) : (
            <div className="cycling-list">
              {cyclingLogs.map((log) => (
                <div key={log.id} className="cycling-entry">
                  <div className="cycling-header">
                    <div className="cycling-date">{new Date(log.date).toLocaleDateString('en-GB')}</div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteCycling(log.id)}
                      aria-label="Delete entry"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="cycling-stats">
                    <div className="stat">
                      <span className="stat-label">Distance</span>
                      <span className="stat-value">{log.distance_km} km</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Duration</span>
                      <span className="stat-value">{log.duration_min} min</span>
                    </div>
                    {log.avg_speed_kph && (
                      <div className="stat">
                        <span className="stat-label">Avg Speed</span>
                        <span className="stat-value">{log.avg_speed_kph.toFixed(1)} km/h</span>
                      </div>
                    )}
                    {log.elevation_m !== undefined && (
                      <div className="stat">
                        <span className="stat-label">Elevation</span>
                        <span className="stat-value">{log.elevation_m} m</span>
                      </div>
                    )}
                  </div>
                  {log.notes && (
                    <div className="cycling-notes">{log.notes}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
