import React, { useState, useEffect } from 'react'
import { FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa'

export const AdminStatusBanner = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [elevating, setElevating] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await window.context.checkAdminStatus()
        console.log('Admin status:', status)
        setIsAdmin(status)
      } catch (error) {
        console.error('Failed to check admin status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [])

  console.log(isAdmin)

  const handleElevateClick = async () => {
    console.log('Attempting to relaunch as admin...')
    setElevating(true)

    try {
      if (typeof window.context.relaunchAsAdmin === 'function') {
        await window.context.relaunchAsAdmin()
        console.log('Relaunch requested')
      } else {
        console.error('relaunchAsAdmin function is not defined')
      }
    } catch (error) {
      console.error('Error relaunching as admin:', error)
      setElevating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-zinc-800 text-zinc-300 px-4 py-2 text-sm flex items-center">
        <span className="animate-pulse">Checking privileges...</span>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div className="bg-red-900/50 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <FaShieldAlt className="mr-2 text-red-400" />
          <span className="font-medium">Running with Administrator Privileges</span>
        </div>
        <span className="text-xs bg-red-800 px-2 py-1 rounded">ELEVATED</span>
      </div>
    )
  }

  return (
    <div className="bg-zinc-800 text-zinc-300 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <FaExclamationTriangle className="mr-2 text-yellow-400" />
        <span>Running with Standard User Privileges</span>
      </div>
      <button
        onClick={handleElevateClick}
        disabled={elevating}
        className={`${elevating ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white text-xs px-2 py-1 rounded flex items-center z-50`}
        style={{ position: 'relative', zIndex: 100 }}
      >
        {elevating ? 'Elevating...' : 'Run as Administrator'}
      </button>
    </div>
  )
}
