import React, { useState } from 'react'
import {
  FaLock,
  FaLockOpen,
  FaExclamationTriangle,
  FaEdit,
  FaUser,
  FaUserSecret,
  FaShieldAlt
} from 'react-icons/fa'

export const InsecureFilePermissionsDemo = () => {
  interface PermissionInfo {
    configFile?: string
    configData?: Record<string, unknown>
    isWorldWritable?: boolean
    exploitResult?: {
      modifiedContent?: string
    }
  }

  const [permissionInfo, setPermissionInfo] = useState<PermissionInfo | null>(null)
  const [secureFileInfo, setSecureFileInfo] = useState<PermissionInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [secureLoading, setSecureLoading] = useState(false)
  const [exploitMode, setExploitMode] = useState(false)
  const [modifiedContent, setModifiedContent] = useState('')
  const [viewMode, setViewMode] = useState<'vulnerable' | 'secure' | 'comparison'>('vulnerable')

  const runDemo = async () => {
    setLoading(true)
    try {
      const rawResult = await window.context.filePermissionDemo()
      const result: PermissionInfo =
        typeof rawResult === 'string' ? JSON.parse(rawResult) : rawResult
      setPermissionInfo(result)
      if (result.configData) {
        setModifiedContent(JSON.stringify(result.configData, null, 2))
      }
    } catch (error) {
      console.error('Error running file permissions demo:', error)
    } finally {
      setLoading(false)
    }
  }

  const createSecureFile = async () => {
    setSecureLoading(true)
    try {
      const rawResult = await window.context.secureFilePermissionDemo()
      const result: PermissionInfo =
        typeof rawResult === 'string' ? JSON.parse(rawResult) : rawResult
      setSecureFileInfo(result)
      if (permissionInfo && result) {
        setViewMode('comparison')
      }
    } catch (error) {
      console.error('Error creating secure file:', error)
    } finally {
      setSecureLoading(false)
    }
  }

  const simulateExploit = async () => {
    try {
      const rawResult = await window.context.exploitFilePermissions(modifiedContent)
      const result: { modifiedContent?: string } =
        typeof rawResult === 'string' ? JSON.parse(rawResult) : rawResult
      setPermissionInfo({
        ...permissionInfo,
        exploitResult: {
          modifiedContent:
            typeof result === 'string'
              ? JSON.parse(result).modifiedContent
              : result.modifiedContent || JSON.stringify(result)
        }
      })
      setExploitMode(false)
    } catch (error) {
      console.error('Error simulating exploit:', error)
    }
  }

  return (
    <div className="p-4 bg-zinc-900 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-purple-500">
        Insecure File Permissions Vulnerability Demo
      </h2>

      <p className="mb-4 text-zinc-300">
        Windows applications often create configuration files with sensitive data but fail to set
        proper access permissions, allowing unauthorized access and modification.
      </p>

      <div className="mb-6 flex gap-3 flex-wrap">
        <button
          onClick={runDemo}
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating Files...' : 'Create Vulnerable Config File'}
        </button>

        <button
          onClick={createSecureFile}
          disabled={secureLoading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md font-medium transition-colors disabled:opacity-50"
        >
          {secureLoading ? 'Creating File...' : 'Create Secure Config File'}
        </button>
      </div>

      {permissionInfo && secureFileInfo && (
        <div className="mb-4 border-b border-zinc-700">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('vulnerable')}
              className={`px-3 py-1.5 ${
                viewMode === 'vulnerable'
                  ? 'border-b-2 border-red-500 text-red-400'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <FaLockOpen className="inline mr-1" /> Vulnerable File
            </button>
            <button
              onClick={() => setViewMode('secure')}
              className={`px-3 py-1.5 ${
                viewMode === 'secure'
                  ? 'border-b-2 border-green-500 text-green-400'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <FaLock className="inline mr-1" /> Secure File
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1.5 ${
                viewMode === 'comparison'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <FaShieldAlt className="inline mr-1" /> Compare Both
            </button>
          </div>
        </div>
      )}

      {permissionInfo && (viewMode === 'vulnerable' || viewMode === 'comparison') && (
        <div className="mt-4">
          <div className="bg-zinc-800 rounded-md p-4 mb-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FaLockOpen className="text-red-500" />
              Vulnerable Configuration File
            </h3>
            <p className="text-sm mb-2">
              <span className="text-zinc-400">Location:</span> {permissionInfo.configFile}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-zinc-400 text-sm">Permissions:</span>
              {permissionInfo.isWorldWritable ? (
                <span className="bg-red-900/50 text-red-400 px-2 py-0.5 rounded text-xs">
                  World-Writable (Vulnerable)
                </span>
              ) : (
                <span className="bg-green-900/50 text-green-400 px-2 py-0.5 rounded text-xs">
                  Restricted (Secure)
                </span>
              )}
            </div>

            <h4 className="text-sm font-semibold text-zinc-300 mb-1">File Contents:</h4>
            {exploitMode ? (
              <div className="mb-3">
                <textarea
                  value={modifiedContent}
                  onChange={(e) => setModifiedContent(e.target.value)}
                  className="w-full h-40 bg-zinc-900 border border-zinc-700 rounded p-2 font-mono text-sm"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={simulateExploit}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    Save Modified File
                  </button>
                  <button
                    onClick={() => setExploitMode(false)}
                    className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <pre className="p-2 bg-zinc-900 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(permissionInfo.configData, null, 2)}
                </pre>
                {permissionInfo.isWorldWritable && (
                  <button
                    onClick={() => setExploitMode(true)}
                    className="absolute top-2 right-2 p-1 bg-zinc-800 hover:bg-zinc-700 rounded"
                    title="Modify file (simulate attack)"
                  >
                    <FaEdit />
                  </button>
                )}
              </div>
            )}
          </div>

          {permissionInfo.exploitResult && (
            <div className="bg-red-900/30 border border-red-900 rounded-md p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500" />
                Exploit Result
              </h3>

              <div className="mb-2">
                <span className="text-zinc-400">File Modified By:</span>
                <span className="ml-2 text-red-400">Attacker</span>
              </div>

              <h4 className="text-sm font-semibold text-zinc-300 mb-1">Modified Contents:</h4>
              <pre className="p-2 bg-zinc-900 rounded text-xs overflow-auto max-h-40">
                {permissionInfo.exploitResult.modifiedContent}
              </pre>

              <div className="mt-3 p-3 bg-black/50 rounded">
                <h4 className="font-semibold text-red-400 mb-2">Security Impact:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Attacker can steal sensitive credentials</li>
                  <li>Can modify server endpoints to point to malicious servers</li>
                  <li>Can inject malicious code that will be executed by the application</li>
                  <li>Can add themselves as an authorized admin user</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {secureFileInfo && (viewMode === 'secure' || viewMode === 'comparison') && (
        <div className={`mt-4 ${viewMode === 'comparison' ? 'border-t border-zinc-700 pt-4' : ''}`}>
          <div className="bg-zinc-800 rounded-md p-4 mb-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FaLock className="text-green-500" />
              Secure Configuration File
            </h3>
            <p className="text-sm mb-2">
              <span className="text-zinc-400">Location:</span> {secureFileInfo.configFile}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-zinc-400 text-sm">Permissions:</span>
              {secureFileInfo.isWorldWritable ? (
                <span className="bg-red-900/50 text-red-400 px-2 py-0.5 rounded text-xs">
                  World-Writable (Vulnerable)
                </span>
              ) : (
                <span className="bg-green-900/50 text-green-400 px-2 py-0.5 rounded text-xs">
                  Restricted (Secure)
                </span>
              )}
            </div>

            <h4 className="text-sm font-semibold text-zinc-300 mb-1">File Contents:</h4>
            <div className="relative">
              <pre className="p-2 bg-zinc-900 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(secureFileInfo.configData, null, 2)}
              </pre>
              <div
                className="absolute top-2 right-2 p-1 bg-zinc-800 rounded text-green-500"
                title="Protected file"
              >
                <FaLock />
              </div>
            </div>

            <div className="mt-3 p-3 bg-green-900/20 border border-green-800 rounded">
              <h4 className="font-semibold text-green-400 mb-2">Security Features:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Only the owner (current user) can read and modify this file</li>
                <li>Other users cannot access sensitive credentials</li>
                <li>Protected against lateral movement attacks</li>
                <li>Cannot be modified by lower-privileged processes</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'comparison' && permissionInfo && secureFileInfo && (
        <div className="bg-zinc-800 rounded-md p-4 mt-4">
          <h3 className="text-lg font-semibold mb-2">Comparing Secure vs. Insecure Approaches</h3>

          <table className="w-full border-collapse mt-3">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-2">Feature</th>
                <th className="text-left py-2 text-red-400">Insecure Approach</th>
                <th className="text-left py-2 text-green-400">Secure Approach</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-zinc-700">
                <td className="py-2">File Permissions</td>
                <td className="py-2">Writable by everyone</td>
                <td className="py-2">Only owner can access</td>
              </tr>
              <tr className="border-b border-zinc-700">
                <td className="py-2">Attack Surface</td>
                <td className="py-2">Can be modified by any user</td>
                <td className="py-2">Protected from unauthorized access</td>
              </tr>
              <tr className="border-b border-zinc-700">
                <td className="py-2">Privilege Escalation</td>
                <td className="py-2">Allows privilege escalation</td>
                <td className="py-2">Prevents elevation of privilege</td>
              </tr>
              <tr className="border-b border-zinc-700">
                <td className="py-2">Access Control</td>
                <td className="py-2">Relies on obscurity</td>
                <td className="py-2">Enforced by OS security</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
