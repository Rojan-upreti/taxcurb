import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomeRedirect from './components/HomeRedirect'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import Filing from './pages/Filing'
import Profile from './pages/Profile'
import Residency from './pages/Residency'
import VisaInfo from './pages/VisaInfo'
import Income from './pages/Income'
import IdentityTravelDocument from './pages/IdentityTravelDocument'
import ProgramUSPresence from './pages/ProgramUSPresence'
import PriorVisaHistory from './pages/PriorVisaHistory'
import Address from './pages/Address'
import Review from './pages/Review'
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
            path="/filing/profile" 
            element={
              <ProtectedRoute>
                <Profile />
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
          <Route 
            path="/filing/visa_status" 
            element={
              <ProtectedRoute>
                <VisaInfo />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/filing/income" 
            element={
              <ProtectedRoute>
                <Income />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/filing/identity&Traveldocument" 
            element={
              <ProtectedRoute>
                <IdentityTravelDocument />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/filing/program&USpresence" 
            element={
              <ProtectedRoute>
                <ProgramUSPresence />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/filing/prior_visa_history" 
            element={
              <ProtectedRoute>
                <PriorVisaHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/filing/address" 
            element={
              <ProtectedRoute>
                <Address />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/filing/review" 
            element={
              <ProtectedRoute>
                <Review />
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

