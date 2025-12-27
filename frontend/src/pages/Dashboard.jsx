import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'

function Dashboard() {
  const { currentUser } = useAuth()

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-2">Dashboard</h1>
            <p className="text-xl text-slate-700">
              Welcome back{currentUser?.email ? `, ${currentUser.email.split('@')[0]}` : ''}!
            </p>
          </div>
          <div className="bg-white border border-slate-300 p-8 rounded-lg">
            <p className="text-slate-600">Tax filing form will be implemented here.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
