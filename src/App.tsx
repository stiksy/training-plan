import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './services/auth/AuthContext'
import { ProfileProvider, useProfile } from './services/profiles/ProfileContext'
import { ProfileSwitcher } from './components/ProfileSwitcher'
import { MealPlanner } from './components/MealPlanner'
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
      <header className="app-header">
        <div className="app-header-left">
          <h1>Training Plan</h1>
          <nav className="app-nav">
            <Link to="/">Dashboard</Link>
            <Link to="/meals">Meal Planner</Link>
            <Link to="/shopping">Shopping List</Link>
            <Link to="/workouts">Workouts</Link>
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
          <Route path="/" element={
            <div className="dashboard-placeholder">
              <h2>Welcome, {activeProfile.name}!</h2>
              <p>Your dashboard will appear here.</p>
              <div className="quick-links">
                <Link to="/meals" className="quick-link-card">
                  <h3>Meal Planner</h3>
                  <p>Plan your weekly meals</p>
                </Link>
                <Link to="/shopping" className="quick-link-card">
                  <h3>Shopping List</h3>
                  <p>Generate your grocery list</p>
                </Link>
                <Link to="/workouts" className="quick-link-card">
                  <h3>Workouts</h3>
                  <p>View your exercise schedule</p>
                </Link>
              </div>
            </div>
          } />
          <Route path="/meals" element={<MealPlanner />} />
          <Route path="/shopping" element={
            <div className="page-placeholder">
              <h2>Shopping List</h2>
              <p>Coming soon...</p>
            </div>
          } />
          <Route path="/workouts" element={
            <div className="page-placeholder">
              <h2>Workouts</h2>
              <p>Coming soon...</p>
            </div>
          } />
        </Routes>
      </main>
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
