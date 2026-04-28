'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEPARTMENTS = [
  { id: 'carcass_manufacturing', name: 'Carcass Manufacturing' },
  { id: 'polish', name: 'Polish' },
  { id: 'foaming', name: 'Foaming' },
  { id: 'upholstry', name: 'Upholstry' },
  { id: 'ready_for_qc', name: 'Quality Control (QC)' },
  { id: 'packing', name: 'Packing' },
  { id: 'ready_for_dispatch', name: 'Dispatch' }
]

export default function WorkerLogin() {
  const router = useRouter()
  const [department, setDepartment] = useState(DEPARTMENTS[0].id)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Hardcoded PIN for demo purposes. In production, verify against DB.
    if (pin === '1234') {
      // Set cookie to remember the department (expires in 12 hours)
      document.cookie = `worker_dept=${department}; path=/; max-age=43200`
      router.push('/worker/scan')
    } else {
      setError('Invalid PIN')
    }
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-playfair font-bold text-center mb-2">Worker Portal</h1>
        <p className="text-gray-500 text-center font-montserrat mb-8">Sign in to your department</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
            <select 
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-montserrat focus:outline-none focus:ring-2 focus:ring-emerald"
            >
              {DEPARTMENTS.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">PIN Code</label>
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN (Demo: 1234)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-montserrat focus:outline-none focus:ring-2 focus:ring-emerald"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald hover:bg-emerald-light text-white font-bold py-4 rounded-xl font-montserrat transition-colors"
          >
            Start Shift
          </button>
        </form>
      </div>
    </div>
  )
}
