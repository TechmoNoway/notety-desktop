import React, { useState } from 'react'

export const DllHijackingDemo = () => {
  const [dllInfo, setDllInfo] = useState<{
    infoFilePath: string
    appPath: string
    userDataPath: string
    loadedDlls: string[]
  } | null>(null)

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'loaded' | 'exploit'>('info')

  const runDemo = async () => {
    setLoading(true)
    try {
      const result = await window.context.dllHijackDemo()
      if (typeof result === 'string') {
        const parsedResult = JSON.parse(result)
        setDllInfo(parsedResult)
      } else {
        setDllInfo(result)
      }
    } catch (error) {
      console.error('Error running DLL hijacking demo:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-zinc-900 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-yellow-500">DLL Hijacking Vulnerability Demo</h2>
      <p className="mb-4 text-zinc-300">
        DLL Hijacking occurs when Windows loads DLLs from insecure locations. Attackers can place
        malicious DLLs in these locations to execute code with the application&apos;s privileges.
      </p>

      <div className="mb-6">
        <button
          onClick={runDemo}
          disabled={loading}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-md font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze DLL Loading'}
        </button>
      </div>

      {dllInfo && (
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex gap-2 mb-4 border-b border-zinc-700">
            <button
              className={`px-3 py-1 ${activeTab === 'info' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-zinc-400'}`}
              onClick={() => setActiveTab('info')}
            >
              Search Paths
            </button>
            <button
              className={`px-3 py-1 ${activeTab === 'loaded' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-zinc-400'}`}
              onClick={() => setActiveTab('loaded')}
            >
              Loaded DLLs
            </button>
            <button
              className={`px-3 py-1 ${activeTab === 'exploit' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-zinc-400'}`}
              onClick={() => setActiveTab('exploit')}
            >
              Exploitation
            </button>
          </div>

          {activeTab === 'info' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">DLL Search Order:</h3>
              <ol className="list-decimal ml-5 mb-3 space-y-1">
                <li>The directory from which the application loaded</li>
                <li>System directory (C:\Windows\System32)</li>
                <li>16-bit system directory (C:\Windows\System)</li>
                <li>Windows directory (C:\Windows)</li>
                <li>Current working directory (CWD)</li>
                <li>Directories in the PATH environment variable</li>
              </ol>

              <h3 className="text-lg font-semibold mb-2 mt-4">Application Paths:</h3>
              <div className="bg-zinc-900 p-3 rounded mb-3 font-mono text-sm">
                <p>
                  <span className="text-yellow-400">App Directory:</span> {dllInfo.appPath}
                </p>
                <p>
                  <span className="text-yellow-400">User Data:</span> {dllInfo.userDataPath}
                </p>
                <p>
                  <span className="text-yellow-400">Info File:</span> {dllInfo.infoFilePath}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'loaded' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Currently Loaded DLLs:</h3>
              <p className="text-sm mb-2">This application is currently using these DLLs:</p>
              <div className="bg-zinc-900 p-3 rounded max-h-52 overflow-y-auto font-mono text-sm">
                <ul className="list-disc ml-5">
                  {dllInfo.loadedDlls.map((dll, index) => (
                    <li key={index} className="mb-1">
                      {dll}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs mt-2 italic">These are potential targets for hijacking.</p>
            </div>
          )}

          {activeTab === 'exploit' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">How DLL Hijacking Works:</h3>
              <div className="mb-4">
                <p className="mb-2">An attacker could exploit this vulnerability by:</p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Identifying a DLL that the application loads</li>
                  <li>Creating a malicious version with the same name</li>
                  <li>Placing it in a location with higher search priority</li>
                </ol>
              </div>

              <div className="bg-red-900/20 border border-red-800 p-3 rounded mt-4">
                <h4 className="font-bold text-red-400">Example Attack Scenario:</h4>
                <p className="mt-1">
                  If this application loads <code>example.dll</code> from its own directory:
                </p>
                <pre className="bg-zinc-900 p-2 mt-2 rounded text-xs overflow-x-auto">
                  {`// Malicious example.dll
#include <windows.h>

BOOL WINAPI DllMain(HINSTANCE hinstDLL, DWORD fdwReason, LPVOID lpvReserved) {
    if (fdwReason == DLL_PROCESS_ATTACH) {
        // Execute malicious payload
        WinExec("calc.exe", SW_SHOW);  // Launch calculator as proof
    }
    return TRUE;
}`}
                </pre>
                <p className="mt-2 text-sm">
                  Placing this in a higher priority location would execute the attacker&apos;s code.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
