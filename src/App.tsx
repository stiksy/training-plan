import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
// import { AuthProvider } from './services/auth/AuthContext'
import { MockAuthProvider as AuthProvider } from './services/auth/MockAuth'
import { ProfileProvider, useProfile } from './services/profiles/ProfileContext'
import { ProfileSwitcher } from './components/ProfileSwitcher'
import { MealPlanner } from './components/MealPlanner'
import { EnhancedShoppingList } from './components/EnhancedShoppingList'
import { Dashboard } from './components/Dashboard'
import { WorkoutSchedule } from './components/WorkoutSchedule'
import { ExerciseLibrary } from './components/ExerciseLibrary'
import { ProgressTracker } from './components/ProgressTracker'
import { FavouriteMeals } from './components/FavouriteMeals'
import { RecipeDetail } from './components/RecipeDetail'
import { HealthDisclaimer, HealthDisclaimerLink } from './components/HealthDisclaimer'
import './App.css'

function AppContent() {
  const { activeProfile, householdMembers, setActiveProfile } = useProfile()

  if (householdMembers.length === 0) {
    return (
      <div className="app">
        <h1>Exercise & Nutrition Tracker</h1>
        <p>Loading household data...</p>
      </div>
    )
  }

  if (!activeProfile) {
    return <ProfileSwitcher />
  }

  return (
    <div className="app">
      <HealthDisclaimer />
      <header className="app-header">
        <div className="app-header-left">
          <h1>Training Plan</h1>
          <nav className="app-nav">
            <Link to="/">Dashboard</Link>
            <Link to="/meals">Meal Planner</Link>
            <Link to="/shopping">Shopping List</Link>
            <Link to="/workouts">Workouts</Link>
            <Link to="/exercises">Exercises</Link>
            <Link to="/progress">Progress</Link>
            <Link to="/favourites">Favourites</Link>
          </nav>
        </div>
        <div className="app-header-right">
          <div className="active-profile">
            <div className="profile-avatar-small">
              {activeProfile.name.charAt(0).toUpperCase()}
            </div>
            <span>{activeProfile.name}</span>
            <button
              className="switch-profile-btn"
              onClick={() => setActiveProfile(null)}
            >
              Switch
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/meals" element={<MealPlanner />} />
          <Route path="/shopping" element={<EnhancedShoppingList />} />
          <Route path="/workouts" element={<WorkoutSchedule />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/progress" element={<ProgressTracker />} />
          <Route path="/favourites" element={<FavouriteMeals />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>
          <HealthDisclaimerLink />
        </p>
        <p className="footer-note">
          This tool provides general fitness and nutrition suggestions for informational purposes
          only. Not medical advice.
        </p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <Router basename="/training-plan">
          <AppContent />
        </Router>
      </ProfileProvider>
    </AuthProvider>
  )
}

export default App
