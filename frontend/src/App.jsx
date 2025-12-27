import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomeRedirect from './components/HomeRedirect'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import Filing from './pages/Filing'
import Residency from './pages/Residency'
import Auth from './pages/Auth'
import About from './pages/About'
import Tutorial from './pages/Tutorial'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/filing" 
            element={
              <ProtectedRoute>
                <Filing />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/filing/residency" 
            element={
              <ProtectedRoute>
                <Residency />
              </ProtectedRoute>
            } 
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/tutorial" element={<Tutorial />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

