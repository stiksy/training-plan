import { useState, useEffect } from 'react'
import { useProfile } from '@/services/profiles/ProfileContext'
import { getExercisesForUser } from '@/services/workouts'
import type { Exercise, ExerciseCategory, ExerciseIntensity } from '@/types'
import './ExerciseLibrary.css'

export function ExerciseLibrary() {
  const { activeProfile } = useProfile()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all')
  const [selectedIntensity, setSelectedIntensity] = useState<ExerciseIntensity | 'all'>('all')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  useEffect(() => {
    loadExercises()
  }, [activeProfile])

  useEffect(() => {
    applyFilters()
  }, [exercises, searchQuery, selectedCategory, selectedIntensity])

  const loadExercises = async () => {
    if (!activeProfile) return

    setLoading(true)
    try {
      const userExercises = await getExercisesForUser(activeProfile.id)
      setExercises(userExercises)
    } catch (error) {
      console.error('Error loading exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...exercises]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        ex =>
          ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ex.subcategory?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ex => ex.category === selectedCategory)
    }

    // Intensity filter
    if (selectedIntensity !== 'all') {
      filtered = filtered.filter(ex => ex.intensity === selectedIntensity)
    }

    setFilteredExercises(filtered)
  }

  const getCategoryLabel = (category: ExerciseCategory): string => {
    const labels: Record<ExerciseCategory, string> = {
      cardio: 'Cardio',
      strength: 'Strength',
      flexibility: 'Flexibility',
      sport: 'Sport',
    }
    return labels[category]
  }

  const getIntensityLabel = (intensity: ExerciseIntensity): string => {
    const labels: Record<ExerciseIntensity, string> = {
      low: 'Low',
      moderate: 'Moderate',
      high: 'High',
    }
    return labels[intensity]
  }

  const getIntensityColor = (intensity: ExerciseIntensity): string => {
    const colors: Record<ExerciseIntensity, string> = {
      low: 'intensity-low',
      moderate: 'intensity-moderate',
      high: 'intensity-high',
    }
    return colors[intensity]
  }

  if (loading) {
    return (
      <div className="exercise-library">
        <p>Loading exercises...</p>
      </div>
    )
  }

  return (
    <div className="exercise-library">
      <div className="library-header">
        <h2>Exercise Library</h2>
        <p className="library-subtitle">
          Showing {filteredExercises.length} safe exercises for {activeProfile?.name}
        </p>
        {activeProfile?.health_constraints && activeProfile.health_constraints.length > 0 && (
          <div className="constraints-info">
            <span className="constraints-label">Filtered for:</span>
            {activeProfile.health_constraints.map(constraint => (
              <span key={constraint} className="constraint-badge">
                {constraint}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="library-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as ExerciseCategory | 'all')}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="cardio">Cardio</option>
            <option value="strength">Strength</option>
            <option value="flexibility">Flexibility</option>
            <option value="sport">Sport</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="intensity-filter">Intensity:</label>
          <select
            id="intensity-filter"
            value={selectedIntensity}
            onChange={e => setSelectedIntensity(e.target.value as ExerciseIntensity | 'all')}
            className="filter-select"
          >
            <option value="all">All Intensities</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {filteredExercises.length === 0 ? (
        <div className="no-results">
          <p>No exercises found matching your filters.</p>
          <button onClick={() => {
            setSearchQuery('')
            setSelectedCategory('all')
            setSelectedIntensity('all')
          }} className="clear-filters-button">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="exercise-grid">
          {filteredExercises.map(exercise => (
            <div
              key={exercise.id}
              className="exercise-card"
              onClick={() => setSelectedExercise(exercise)}
            >
              <div className="exercise-card-header">
                <h3 className="exercise-name">{exercise.name}</h3>
                <span className={`intensity-badge ${getIntensityColor(exercise.intensity)}`}>
                  {getIntensityLabel(exercise.intensity)}
                </span>
              </div>

              <div className="exercise-card-body">
                <div className="exercise-meta">
                  <span className="category-badge">{getCategoryLabel(exercise.category)}</span>
                  {exercise.subcategory && (
                    <span className="subcategory-badge">{exercise.subcategory}</span>
                  )}
                </div>

                <div className="exercise-duration">
                  <span className="duration-icon">⏱️</span>
                  <span>{exercise.duration_min} minutes</span>
                </div>

                {exercise.equipment && exercise.equipment.length > 0 && (
                  <div className="exercise-equipment">
                    <span className="equipment-icon">🏋️</span>
                    <span>{exercise.equipment.join(', ')}</span>
                  </div>
                )}

                {exercise.contraindications && exercise.contraindications.length === 0 && (
                  <div className="safety-badge safe-all">
                    ✓ Safe for all
                  </div>
                )}
              </div>

              <div className="exercise-card-footer">
                <button className="view-details-button">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="modal-overlay" onClick={() => setSelectedExercise(null)}>
          <div className="modal-content exercise-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedExercise.name}</h2>
              <button className="modal-close" onClick={() => setSelectedExercise(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Category:</span>
                <span>{getCategoryLabel(selectedExercise.category)}</span>
                {selectedExercise.subcategory && (
                  <>
                    <span className="detail-separator">›</span>
                    <span>{selectedExercise.subcategory}</span>
                  </>
                )}
              </div>

              <div className="detail-row">
                <span className="detail-label">Duration:</span>
                <span>{selectedExercise.duration_min} minutes</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Intensity:</span>
                <span className={`intensity-badge ${getIntensityColor(selectedExercise.intensity)}`}>
                  {getIntensityLabel(selectedExercise.intensity)}
                </span>
              </div>

              {selectedExercise.equipment && selectedExercise.equipment.length > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Equipment:</span>
                  <span>{selectedExercise.equipment.join(', ')}</span>
                </div>
              )}

              {selectedExercise.modifications && (
                <div className="detail-section">
                  <h4>Modifications:</h4>
                  <p>{selectedExercise.modifications}</p>
                </div>
              )}

              {selectedExercise.safety_notes && (
                <div className="detail-section safety-notes">
                  <h4>Safety Notes:</h4>
                  <p>{selectedExercise.safety_notes}</p>
                </div>
              )}

              {selectedExercise.youtube_url && (
                <div className="detail-section">
                  <a
                    href={selectedExercise.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="youtube-link"
                  >
                    📺 Watch Video Tutorial
                  </a>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="modal-button secondary" onClick={() => setSelectedExercise(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
