import { createNote, deleteNote, getNotes, readNote, writeNote } from '@/lib'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { CreateNote, DeleteNote, GetNotes, ReadNote, WriteNote } from '@shared/types'
import { BrowserWindow, app, ipcMain, shell, dialog } from 'electron'
import path, { join } from 'path'
import icon from '../../resources/icon.ico?asset'
import { exec } from 'child_process'
import fs from 'fs'
import ffi from 'ffi-napi'
import ref from 'ref-napi'

function createWindow(): void {
  // dll hijacking demo
  ipcMain.handle('dll-hijack-demo', async () => {
    // Get application paths
    const appPath = app.getAppPath()
    const userDataPath = app.getPath('userData')

    // Create a simple text file demonstrating potential DLL locations
    const dllInfoPath = path.join(userDataPath, 'dll-search-order.txt')
    const dllInfo = `
DLL Search Order:
1. The directory from which the application loaded
2. System directory (C:\\Windows\\System32)
3. 16-bit system directory (C:\\Windows\\System)
4. Windows directory (C:\\Windows)
5. Current working directory (CWD)
6. Directories in the PATH environment variable

Application directory: ${appPath}
Current working directory: ${process.cwd()}
User data directory: ${userDataPath}

Vulnerability: If a malicious DLL with the same name exists in these locations,
Windows may load it instead of the intended DLL.
`

    // Write information to file
    fs.writeFileSync(dllInfoPath, dllInfo)

    // Get a list of DLLs used by the app
    const dllList: string[] = []
    if (process.platform === 'win32') {
      try {
        // Use tasklist to show modules loaded by current process
        const pid = process.pid
        const { stdout } = await new Promise<{
          stdout: string
          stderr: string
          error: Error | null
        }>((resolve) => {
          exec(`tasklist /M /FI "PID eq ${pid}"`, (error, stdout, stderr) => {
            resolve({ stdout, stderr, error })
          })
        })

        // Extract DLL names from output
        const lines = stdout.split('\n')
        if (lines.length > 3) {
          for (let i = 3; i < lines.length; i++) {
            const line = lines[i].trim()
            if (line && line.includes('.dll')) {
              const modules = line.split(':')[1]?.trim()
              if (modules) {
                modules.split(',').forEach((dll) => {
                  if (dll.trim()) dllList.push(dll.trim())
                })
              }
            }
          }
        }
      } catch (error) {
        console.error('Error getting DLL list:', error)
      }
    }

    return {
      infoFilePath: dllInfoPath,
      appPath,
      userDataPath,
      loadedDlls: dllList.slice(0, 15) // Limit to 15 for display
    }
  })

  ipcMain.handle('load-dll', async () => {
    try {
      // Let user select a DLL file
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Select DLL to Load',
        filters: [{ name: 'DLL Files', extensions: ['dll'] }],
        properties: ['openFile']
      })

      if (canceled || !filePaths[0]) {
        return { success: false, message: 'No file selected' }
      }

      const dllPath = filePaths[0]

      // Create log file for demonstration
      const logPath = path.join(app.getPath('userData'), 'dll-loading-log.txt')
      fs.writeFileSync(
        logPath,
        `[SECURITY DEMO] Attempting to load DLL: ${dllPath}\n` +
          `Time: ${new Date().toISOString()}\n` +
          `This demonstration shows how applications with DLL loading vulnerabilities\n` +
          `can execute arbitrary code from untrusted locations.\n`
      )

      // VULNERABILITY: Attempting to load the DLL
      const results = {
        dllPath,
        logPath,
        loadAttempted: true,
        functions: []
      }

      try {
        // This is the vulnerable part - we're trying to load a user-selected DLL
        // In a real app, this would be extremely dangerous!
        const library = ffi.Library(dllPath, {
          // Common exports that might exist in the DLL
          DllMain: ['int', ['pointer', 'int', 'pointer']],
          MessageBoxA: ['int', ['int', 'string', 'string', 'int']]
        })

        // List available functions (this is demonstrative)
        results.functions = Object.keys(library)

        // Log successful load
        fs.appendFileSync(
          logPath,
          `\nDLL loaded successfully!\n` +
            `Available functions: ${results.functions.join(', ')}\n` +
            `\nWARNING: In a real attack scenario, malicious code would execute now!`
        )

        return {
          success: true,
          ...results
        }
      } catch (error) {
        // Log failure
        fs.appendFileSync(
          logPath,
          `\nFailed to load DLL: ${error.message}\n` +
            `This is actually good - applications should prevent loading untrusted DLLs.`
        )

        return {
          success: false,
          error: error.message,
          ...results
        }
      }
    } catch (error) {
      console.error('Error in load-dll handler:', error)
      return { success: false, error: error.message }
    }
  })

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '../../resources/icon.ico'),
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    center: true,
    title: 'Notety',
    backgroundMaterial: 'acrylic',
    visualEffectState: 'active',
    trafficLightPosition: { x: 15, y: 10 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('getNotes', (_, ...args: Parameters<GetNotes>) => getNotes(...args))
  ipcMain.handle('readNote', (_, ...args: Parameters<ReadNote>) => readNote(...args))
  ipcMain.handle('writeNote', (_, ...args: Parameters<WriteNote>) => writeNote(...args))
  ipcMain.handle('createNote', (_, ...args: Parameters<CreateNote>) => createNote(...args))
  ipcMain.handle('deleteNote', (_, ...args: Parameters<DeleteNote>) => deleteNote(...args))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
