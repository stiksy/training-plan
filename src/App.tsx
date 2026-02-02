import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './services/auth/AuthContext'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router basename="/training-plan">
        <Routes>
          <Route path="/" element={
            <div className="app">
              <h1>Exercise & Nutrition Tracker</h1>
              <p>Phase 0: Foundation Setup Complete</p>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
