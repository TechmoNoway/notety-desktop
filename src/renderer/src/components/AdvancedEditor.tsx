import React, { useState, useEffect } from 'react'
import { FaSave, FaExclamationTriangle, FaFolder, FaFileAlt } from 'react-icons/fa'
import path from 'path'
import fs from 'fs'

export const AdvancedEditor = () => {
  const [content, setContent] = useState('')
  const [filePath, setFilePath] = useState('C:\\Users\\Public\\note.txt')
  const [savedPath, setSavedPath] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showWarning, setShowWarning] = useState(false)
  const [dangerousPaths] = useState([
    'C:\\Windows\\System32\\',
    'C:\\Program Files\\',
    'C:\\Windows\\Tasks\\',
    'C:\\ProgramData\\',
    'C:\\Windows\\Temp\\'
  ])

  // Check if the chosen path might be dangerous
  const isDangerousPath = () => {
    return dangerousPaths.some((path) => filePath.startsWith(path))
  }

  useEffect(() => {
    if (isDangerousPath()) {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }
  }, [filePath])

  const handleSave = () => {
    try {
      // This is intentionally vulnerable - it allows writing to any path
      window.context.writeLogToPath(content, filePath)
      setSavedPath(filePath)
      setSaveStatus('success')

      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    } catch (error) {
      console.error('Failed to save file:', error)
      setSaveStatus('error')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Editor header */}
      <div className="bg-zinc-800 p-3 border-b border-zinc-700 flex items-center justify-between">
        <div className="flex items-center">
          <FaFileAlt className="text-zinc-400 mr-2" />
          <span className="font-medium">Advanced Editor</span>
        </div>

        <div className="flex items-center text-sm text-zinc-400">
          {saveStatus === 'success' && (
            <span className="text-green-400 mr-2">✓ Saved successfully</span>
          )}
          {saveStatus === 'error' && <span className="text-red-400 mr-2">✗ Save failed</span>}
          {savedPath && saveStatus === 'idle' && (
            <span className="mr-2">Last saved to: {savedPath}</span>
          )}
        </div>
      </div>

      {/* Path input and save button */}
      <div className="bg-zinc-800/50 p-3 border-b border-zinc-700 flex items-center space-x-2">
        <div className="flex-grow">
          <label htmlFor="filePath" className="sr-only">
            File path
          </label>
          <div className="flex items-center bg-zinc-900 rounded border border-zinc-700 focus-within:border-blue-500">
            <FaFolder className="text-zinc-500 ml-2" />
            <input
              id="filePath"
              type="text"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              className="flex-grow bg-transparent border-none outline-none py-2 px-2 text-sm w-full"
              placeholder="Enter file path (e.g. C:\path\to\file.txt)"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
        >
          <FaSave className="mr-2" />
          Save
        </button>
      </div>

      {/* Warning banner for dangerous paths */}
      {showWarning && (
        <div className="bg-yellow-900/30 border border-yellow-800 p-3 text-yellow-300 flex items-start">
          <FaExclamationTriangle className="mt-1 mr-2 flex-shrink-0" />
          <div>
            <p className="font-bold">Warning: Potentially dangerous path detected!</p>
            <p className="text-sm mt-1">
              Writing to system directories can cause serious problems or be used for privilege
              escalation attacks. This is a security vulnerability demonstration.
            </p>
          </div>
        </div>
      )}

      {/* Text editor */}
      <div className="flex-grow p-0 relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full p-4 bg-zinc-900 border-none outline-none resize-none font-mono text-sm leading-relaxed"
          placeholder="Enter your text content here..."
        />
      </div>
    </div>
  )
}
