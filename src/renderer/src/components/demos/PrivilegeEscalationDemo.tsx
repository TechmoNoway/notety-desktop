import React, { useState } from 'react'
import {
  FaLock,
  FaArrowUp,
  FaChevronRight,
  FaUserCog,
  FaUser,
  FaUserSecret,
  FaCalendarAlt,
  FaCog,
  FaExclamationTriangle
} from 'react-icons/fa'

export const PrivilegeEscalationDemo = () => {
  const [activeVector, setActiveVector] = useState<string>('unquoted')
  interface ScanResult {
    vulnerabilities: Record<
      string,
      { name: string; found: boolean; description?: string; details?: string }
    >
    riskScore: number
  }

  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [exploitRunning, setExploitRunning] = useState(false)
  interface ExploitResult {
    simulationSteps: string[]
    success: boolean
    gainedPrivilege: string
  }

  const [exploitResult, setExploitResult] = useState<ExploitResult | null>(null)

  const runVulnerabilityScan = async () => {
    setLoading(true)
    try {
      const result = await window.context.scanPrivilegeEscalation()
      if (typeof result === 'string') {
        console.error('Unexpected result type:', result)
      } else {
        setScanResult(result)
      }
    } catch (error) {
      console.error('Error scanning for privilege escalation:', error)
    } finally {
      setLoading(false)
    }
  }

  const simulateExploit = async (vector: string) => {
    setExploitRunning(true)
    setExploitResult(null)
    try {
      const result = (await window.context.simulatePrivilegeEscalation(
        vector
      )) as unknown as ExploitResult
      setExploitResult(result)
    } catch (error) {
      console.error(`Error simulating ${vector} exploit:`, error)
    } finally {
      setExploitRunning(false)
    }
  }

  const resetExploitDemo = () => {
    setExploitResult(null)
  }

  return (
    <div className="p-4 bg-zinc-900 rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-900/30 rounded-full">
          <FaArrowUp className="text-xl text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-orange-500">Windows Privilege Escalation Demo</h2>
      </div>

      <p className="mb-6 text-zinc-300">
        Privilege escalation occurs when a user or application gains higher-level permissions than
        intended. These vulnerabilities allow attackers to move from limited user accounts to
        administrator or system privileges.
      </p>

      <div className="mb-6">
        <button
          onClick={runVulnerabilityScan}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Scanning...' : 'Scan for Vulnerabilities'}
        </button>
      </div>

      {/* Vulnerability vectors selector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Common Privilege Escalation Vectors:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              id: 'unquoted',
              name: 'Unquoted Service Path',
              icon: <FaCog />,
              color: 'blue'
            },
            {
              id: 'service-perms',
              name: 'Weak Service Permissions',
              icon: <FaLock />,
              color: 'purple'
            },
            {
              id: 'scheduled-tasks',
              name: 'Scheduled Tasks',
              icon: <FaCalendarAlt />,
              color: 'green'
            },
            {
              id: 'uac-bypass',
              name: 'UAC Bypass',
              icon: <FaUserCog />,
              color: 'red'
            }
          ].map((vector) => (
            <button
              key={vector.id}
              onClick={() => {
                setActiveVector(vector.id)
                resetExploitDemo()
              }}
              className={`flex items-center p-3 rounded-md border transition-colors ${
                activeVector === vector.id
                  ? `bg-${vector.color}-900/30 border-${vector.color}-700 text-${vector.color}-400`
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <div className={`mr-3 text-${vector.color}-500`}>{vector.icon}</div>
              <span>{vector.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active vulnerability details */}
      <div className="bg-zinc-800 rounded-lg p-4 mb-6">
        {/* Unquoted Service Path */}
        {activeVector === 'unquoted' && (
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2 flex items-center">
              <FaCog className="mr-2" />
              Unquoted Service Path Vulnerability
            </h3>

            <p className="mb-3">
              Windows services with unquoted paths and spaces in their names create an opportunity
              for privilege escalation. If a service path is not enclosed in quotes, Windows will
              attempt to execute spaces as break points.
            </p>

            <div className="bg-zinc-900 p-3 rounded mb-3 font-mono text-sm">
              <div className="text-zinc-400">Example vulnerable service path:</div>
              <div className="mt-1">C:\Program Files\My Service\service.exe</div>
              <div className="mt-2 text-zinc-400">Windows will try to execute in this order:</div>
              <ol className="list-decimal ml-5 mt-1">
                <li>C:\Program.exe</li>
                <li>C:\Program Files\My.exe</li>
                <li>C:\Program Files\My Service\service.exe</li>
              </ol>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-zinc-300 mb-2">Exploit Process:</h4>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Identify a service with an unquoted path containing spaces</li>
                <li>Check if you have write permissions to any parent directories</li>
                <li>Place a malicious executable in that location with the parsed name</li>
                <li>Wait for service restart or system reboot</li>
                <li>Your code runs with SYSTEM privileges</li>
              </ol>
            </div>

            <button
              onClick={() => simulateExploit('unquoted')}
              disabled={exploitRunning}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors disabled:opacity-50"
            >
              {exploitRunning ? 'Simulating...' : 'Simulate Exploitation'}
            </button>
          </div>
        )}

        {/* Weak Service Permissions */}
        {activeVector === 'service-perms' && (
          <div>
            <h3 className="text-lg font-semibold text-purple-400 mb-2 flex items-center">
              <FaLock className="mr-2" />
              Weak Service Permissions Vulnerability
            </h3>

            <p className="mb-3">
              Services with misconfigured permissions may allow non-privileged users to modify their
              properties, including the executable path, enabling privilege escalation to SYSTEM
              level access.
            </p>

            <div className="bg-zinc-900 p-3 rounded mb-3 font-mono text-sm">
              <div className="text-zinc-400">Checking service permissions with PowerShell:</div>
              <div className="mt-1">
                Get-Acl -Path HKLM:\System\CurrentControlSet\Services\ServiceName | Format-List
              </div>

              <div className="mt-2 text-zinc-400">Vulnerable permission example:</div>
              <div className="mt-1 text-red-500">NT AUTHORITY\Authenticated Users: (M)</div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-zinc-300 mb-2">Exploit Process:</h4>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Identify a service with weak permissions</li>
                <li>Modify the service configuration to point to a malicious executable</li>
                <li>Restart the service</li>
                <li>Your code executes with SYSTEM privileges</li>
              </ol>
            </div>

            <button
              onClick={() => simulateExploit('service-perms')}
              disabled={exploitRunning}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-medium transition-colors disabled:opacity-50"
            >
              {exploitRunning ? 'Simulating...' : 'Simulate Exploitation'}
            </button>
          </div>
        )}

        {/* Scheduled Tasks */}
        {activeVector === 'scheduled-tasks' && (
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-2 flex items-center">
              <FaCalendarAlt className="mr-2" />
              Scheduled Tasks Vulnerability
            </h3>

            <p className="mb-3">
              Scheduled tasks often run with SYSTEM or administrative privileges. Tasks with weak
              permissions or those that execute writable scripts/executables provide privilege
              escalation opportunities.
            </p>

            <div className="bg-zinc-900 p-3 rounded mb-3 font-mono text-sm">
              <div className="text-zinc-400">Enumerating scheduled tasks with cmd:</div>
              <div className="mt-1">schtasks /query /fo LIST /v</div>

              <div className="mt-2 text-zinc-400">Checking file permissions:</div>
              <div className="mt-1">icacls &quot;C:\Path\To\Scheduled\Task.exe&quot;</div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-zinc-300 mb-2">Exploit Process:</h4>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Find scheduled tasks running as SYSTEM/Administrator</li>
                <li>Check if the executable or its directory is writable</li>
                <li>Replace or modify the target with malicious code</li>
                <li>Wait for the task to execute</li>
                <li>Your code runs with elevated privileges</li>
              </ol>
            </div>

            <button
              onClick={() => simulateExploit('scheduled-tasks')}
              disabled={exploitRunning}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium transition-colors disabled:opacity-50"
            >
              {exploitRunning ? 'Simulating...' : 'Simulate Exploitation'}
            </button>
          </div>
        )}

        {/* UAC Bypass */}
        {activeVector === 'uac-bypass' && (
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center">
              <FaUserCog className="mr-2" />
              UAC Bypass Techniques
            </h3>

            <p className="mb-3">
              User Account Control (UAC) is designed to prevent unauthorized changes to Windows.
              However, numerous bypass techniques exist that can elevate privileges without
              prompting the user.
            </p>

            <div className="bg-zinc-900 p-3 rounded mb-3">
              <p className="text-zinc-400 mb-2">Common UAC bypass methods:</p>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                <li>
                  Auto-elevation of trusted Windows binaries (fodhelper.exe, computerdefaults.exe)
                </li>
                <li>DLL hijacking of auto-elevating processes</li>
                <li>COM object hijacking</li>
                <li>Environment variable manipulation</li>
                <li>Registry key manipulation</li>
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-zinc-300 mb-2">Exploit Process:</h4>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Identify an auto-elevating Windows binary</li>
                <li>Manipulate registry keys it reads from</li>
                <li>Point those keys to your malicious payload</li>
                <li>
                  Execute the trusted binary, which loads your payload with elevated privileges
                </li>
                <li>Bypass UAC without any prompt</li>
              </ol>
            </div>

            <button
              onClick={() => simulateExploit('uac-bypass')}
              disabled={exploitRunning}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium transition-colors disabled:opacity-50"
            >
              {exploitRunning ? 'Simulating...' : 'Simulate Exploitation'}
            </button>
          </div>
        )}
      </div>

      {/* Exploitation simulation result */}
      {exploitResult && (
        <div className="bg-zinc-800 rounded-lg p-4 mb-6 border border-orange-700">
          <h3 className="text-lg font-semibold mb-3 text-orange-400 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            Privilege Escalation Simulation
          </h3>

          <div className="bg-zinc-900 p-3 rounded mb-4">
            <div className="flex mb-4">
              <div className="flex-1 flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center bg-zinc-800 rounded-full mb-2">
                  <FaUser className="text-xl text-blue-400" />
                </div>
                <div className="text-sm">Standard User</div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center">
                <FaArrowUp className="text-xl text-orange-500" />
                <FaChevronRight className="text-xl text-orange-500 mt-2" />
                <div className="text-xs text-orange-400 mt-1">Privilege Escalation</div>
              </div>

              <div className="flex-1 flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center bg-zinc-800 rounded-full mb-2">
                  <FaUserSecret className="text-xl text-red-400" />
                </div>
                <div className="text-sm">SYSTEM / Admin</div>
              </div>
            </div>

            <div className="font-mono text-sm overflow-auto max-h-48 bg-black p-2 rounded">
              {exploitResult.simulationSteps.map((step: string, index: number) => (
                <div key={index} className={index % 2 === 0 ? 'text-green-400' : 'text-zinc-300'}>
                  {step}
                </div>
              ))}

              {exploitResult.success && (
                <div className="text-red-500 font-bold mt-2">
                  [!] Privilege escalation successful - gained {exploitResult.gainedPrivilege}{' '}
                  access
                </div>
              )}
            </div>
          </div>

          <div className="bg-orange-900/20 border border-orange-800 p-3 rounded">
            <h4 className="font-semibold text-orange-400 mb-2">Security Impact:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Complete system compromise</li>
              <li>Access to all files and sensitive data</li>
              <li>Ability to install persistent backdoors</li>
              <li>Bypass of security software</li>
              <li>Access to password hashes and credentials</li>
            </ul>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={resetExploitDemo}
              className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm"
            >
              Reset Demo
            </button>
          </div>
        </div>
      )}

      {/* Scan Results */}
      {scanResult && (
        <div className="bg-zinc-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">System Vulnerability Scan Results</h3>

          <div className="space-y-3">
            {Object.entries(scanResult.vulnerabilities).map(
              ([key, value]: [
                string,
                { name: string; found: boolean; description?: string; details?: string }
              ]) => (
                <div key={key} className="bg-zinc-900 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold flex items-center">
                      {key === 'unquoted' && <FaCog className="mr-2 text-blue-500" />}
                      {key === 'servicePerms' && <FaLock className="mr-2 text-purple-500" />}
                      {key === 'scheduledTasks' && (
                        <FaCalendarAlt className="mr-2 text-green-500" />
                      )}
                      {key === 'uacBypass' && <FaUserCog className="mr-2 text-red-500" />}
                      {value.name}
                    </h4>

                    <span
                      className={`px-2 py-0.5 text-xs rounded ${value.found ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}
                    >
                      {value.found ? 'Vulnerable' : 'Secure'}
                    </span>
                  </div>

                  {value.found && (
                    <div className="text-sm">
                      <p>{value.description}</p>
                      {value.details && (
                        <div className="mt-2 font-mono text-xs bg-black p-2 rounded overflow-auto max-h-32">
                          {value.details}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          <div className="mt-4 p-3 bg-zinc-900 rounded">
            <h4 className="font-semibold mb-2">Overall Security Assessment</h4>
            <div className="flex items-center">
              <div className="w-full bg-zinc-700 rounded-full h-2.5 mr-2">
                <div
                  className={`h-2.5 rounded-full ${
                    scanResult.riskScore > 75
                      ? 'bg-red-600'
                      : scanResult.riskScore > 50
                        ? 'bg-orange-500'
                        : scanResult.riskScore > 25
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                  }`}
                  style={{ width: `${scanResult.riskScore}%` }}
                ></div>
              </div>
              <span className="text-sm">{scanResult.riskScore}% Risk</span>
            </div>
          </div>
        </div>
      )}

      {/* Prevention measures */}
      <div className="bg-zinc-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">How to Prevent Privilege Escalation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900 p-3 rounded">
            <h4 className="font-semibold text-blue-400 mb-2">Service Security</h4>
            <ul className="list-disc ml-5 text-sm space-y-1">
              <li>Always use quotes around service paths</li>
              <li>Restrict service modification permissions</li>
              <li>Run services with the least privilege necessary</li>
              <li>Use strong ACLs on service executables</li>
            </ul>
          </div>

          <div className="bg-zinc-900 p-3 rounded">
            <h4 className="font-semibold text-purple-400 mb-2">Scheduled Task Security</h4>
            <ul className="list-disc ml-5 text-sm space-y-1">
              <li>Verify file permissions on task executables</li>
              <li>Ensure parent directories aren&apos;t writable</li>
              <li>Avoid running tasks as SYSTEM when unnecessary</li>
              <li>Use absolute paths with quotes</li>
            </ul>
          </div>

          <div className="bg-zinc-900 p-3 rounded">
            <h4 className="font-semibold text-green-400 mb-2">UAC Configuration</h4>
            <ul className="list-disc ml-5 text-sm space-y-1">
              <li>Set UAC to the highest level</li>
              <li>Be suspicious of processes that don&apos;t trigger UAC</li>
              <li>Apply updates that patch known UAC bypass techniques</li>
              <li>Use AppLocker or similar application control</li>
            </ul>
          </div>

          <div className="bg-zinc-900 p-3 rounded">
            <h4 className="font-semibold text-red-400 mb-2">General Hardening</h4>
            <ul className="list-disc ml-5 text-sm space-y-1">
              <li>Apply the principle of least privilege</li>
              <li>Keep systems patched and updated</li>
              <li>Use proper file and directory permissions</li>
              <li>Monitor for suspicious privilege changes</li>
              <li>Use privileges analysis tools regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
