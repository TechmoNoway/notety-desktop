import React, { useState, useEffect } from 'react'
import {
  FaExclamationTriangle,
  FaTerminal,
  FaCheck,
  FaTimes,
  FaLock,
  FaUnlock
} from 'react-icons/fa'

export const CommandExecutionDemo = () => {
  const [command, setCommand] = useState('echo Hello World')
  const [safeCommand, setSafeCommand] = useState('echo Hello World')
  const [allowedCommands] = useState([
    'echo',
    'dir',
    'ls',
    'pwd',
    'whoami',
    'hostname',
    'date',
    'time'
  ])

  const [commandResult, setCommandResult] = useState('')
  const [safeCommandResult, setSafeCommandResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [safeLoading, setSafeLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'vulnerable' | 'secure'>('vulnerable')

  const [exploitExamples] = useState([
    { cmd: 'echo Hello && calc', desc: 'Command chaining to launch calculator' },
    { cmd: 'echo Hello & net user', desc: 'Launch secondary command to show users' },
    { cmd: 'ping & ipconfig /all', desc: 'Leak system network configuration' },
    { cmd: 'echo Injected > %TEMP%\\malicious.bat', desc: 'Create a file on the system' }
  ])

  const executeCommand = async () => {
    setLoading(true)
    setCommandResult('')
    try {
      const result = await window.context.executeUnsafeCommand(command)
      setCommandResult(result as string)
    } catch (error) {
      setCommandResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const executeSafeCommand = async () => {
    setSafeLoading(true)
    setSafeCommandResult('')
    try {
      const result = await window.context.executeSafeCommand(safeCommand)
      setSafeCommandResult(result as string)
    } catch (error) {
      setSafeCommandResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setSafeLoading(false)
    }
  }

  return (
    <div className="p-4 bg-zinc-900 rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-900/30 rounded-full">
          <FaTerminal className="text-xl text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-red-500">Command Execution IPC Vulnerability</h2>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 border-b border-zinc-700">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('vulnerable')}
            className={`px-3 py-1.5 ${
              activeTab === 'vulnerable'
                ? 'border-b-2 border-red-500 text-red-400'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <FaUnlock className="inline mr-1" /> Vulnerable Implementation
          </button>
          <button
            onClick={() => setActiveTab('secure')}
            className={`px-3 py-1.5 ${
              activeTab === 'secure'
                ? 'border-b-2 border-green-500 text-green-400'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <FaLock className="inline mr-1" /> Secure Implementation
          </button>
        </div>
      </div>

      {/* Vulnerable implementation */}
      {activeTab === 'vulnerable' && (
        <div>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-zinc-300">Enter a command:</label>
            <div className="flex">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                className="flex-grow px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-l text-sm"
                placeholder="Enter command (e.g. echo Hello)"
              />
              <button
                onClick={executeCommand}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-r font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Executing...' : 'Execute'}
              </button>
            </div>

            <div className="mt-1 text-xs text-zinc-500">
              Try a simple command like &quot;echo Hello&quot; or an exploit like &quot;echo Hello
              &amp;&amp; calc&quot;
            </div>
          </div>

          {/* Command result */}
          {commandResult && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1 text-zinc-300">Output:</h4>
              <pre className="p-2 bg-black rounded text-xs text-green-400 overflow-auto max-h-40">
                {commandResult}
              </pre>
            </div>
          )}

          {/* Exploit examples */}
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2 text-zinc-300">Common Exploit Examples:</h4>
            <div className="grid grid-cols-1 gap-2">
              {exploitExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setCommand(example.cmd)}
                  className="text-left p-2 bg-zinc-800 hover:bg-zinc-750 rounded border border-zinc-700"
                >
                  <div className="font-mono text-xs text-yellow-400">{example.cmd}</div>
                  <div className="text-xs text-zinc-400 mt-1">{example.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Secure implementation */}
      {activeTab === 'secure' && (
        <div>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-zinc-300">Enter a command:</label>
            <div className="flex">
              <input
                type="text"
                value={safeCommand}
                onChange={(e) => setSafeCommand(e.target.value)}
                className="flex-grow px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-l text-sm"
                placeholder="Enter command (e.g. echo Hello)"
              />
              <button
                onClick={executeSafeCommand}
                disabled={safeLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-r font-medium transition-colors disabled:opacity-50"
              >
                {safeLoading ? 'Executing...' : 'Execute'}
              </button>
            </div>
            <div className="mt-1 text-xs text-zinc-400">
              Allowed commands: {allowedCommands.join(', ')}
            </div>
          </div>

          {/* Safe command result */}
          {safeCommandResult && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1 text-zinc-300">Output:</h4>
              <pre className="p-2 bg-black rounded text-xs text-green-400 overflow-auto max-h-40">
                {safeCommandResult}
              </pre>
            </div>
          )}

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2 text-zinc-300">Try these tests:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                onClick={() => setSafeCommand('echo Hello World')}
                className="text-left p-2 bg-zinc-800 hover:bg-zinc-750 rounded border border-green-900 flex items-center"
              >
                <FaCheck className="text-green-500 mr-2" />
                <span>echo Hello World</span>
              </button>

              <button
                onClick={() => setSafeCommand('echo Hello && calc')}
                className="text-left p-2 bg-zinc-800 hover:bg-zinc-750 rounded border border-red-900 flex items-center"
              >
                <FaTimes className="text-red-500 mr-2" />
                <span>echo Hello && calc</span>
              </button>

              <button
                onClick={() => setSafeCommand('whoami')}
                className="text-left p-2 bg-zinc-800 hover:bg-zinc-750 rounded border border-green-900 flex items-center"
              >
                <FaCheck className="text-green-500 mr-2" />
                <span>whoami</span>
              </button>

              <button
                onClick={() => setSafeCommand('rm -rf /')}
                className="text-left p-2 bg-zinc-800 hover:bg-zinc-750 rounded border border-red-900 flex items-center"
              >
                <FaTimes className="text-red-500 mr-2" />
                <span>rm -rf /</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
