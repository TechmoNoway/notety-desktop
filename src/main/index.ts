import { createNote, deleteNote, getNotes, readNote, writeNote } from '@/lib'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { CreateNote, DeleteNote, GetNotes, ReadNote, WriteNote } from '@shared/types'
import { BrowserWindow, app, ipcMain, shell } from 'electron'
import path, { join } from 'path'
import icon from '../../resources/icon.ico?asset'
import { execSync } from 'child_process'
import fs from 'fs'

function createWindow(): void {
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

  ipcMain.handle('filePermissionDemo', async () => {
    try {
      const userDataPath = app.getPath('userData')
      const configFile = path.join(userDataPath, 'insecure-config.json')

      // Create a "configuration file" with sensitive data
      // Add this later

      fs.writeFileSync(configFile, JSON.stringify(configData, null, 2))

      // Determine if file is world-writable
      let isWorldWritable = false

      try {
        if (process.platform === 'win32') {
          // On Windows, use icacls to check permissions
          const output = execSync(`icacls "${configFile}"`).toString()
          isWorldWritable =
            output.includes('Everyone:(F)') ||
            output.includes('Everyone:(M)') ||
            output.includes('Everyone:(W)')

          // For demo purposes, make it world-writable
          execSync(`icacls "${configFile}" /grant Everyone:F`)

          // Check again after modifying
          const newOutput = execSync(`icacls "${configFile}"`).toString()
          isWorldWritable =
            newOutput.includes('Everyone:(F)') ||
            newOutput.includes('Everyone:(M)') ||
            newOutput.includes('Everyone:(W)')
        } else {
          // On Unix-like systems, check file mode
          const stats = fs.statSync(configFile)
          isWorldWritable = !!(stats.mode & 0o002) // Check if world-writable

          // Make it world-writable for the demo
          fs.chmodSync(configFile, 0o666)

          // Check again
          const newStats = fs.statSync(configFile)
          isWorldWritable = !!(newStats.mode & 0o002)
        }
      } catch (error) {
        console.error('Error checking file permissions:', error)
      }

      // Create a log file explaining the vulnerability
      const logPath = path.join(userDataPath, 'insecure-permissions-log.txt')
      fs.writeFileSync(
        logPath,
        `[SECURITY VULNERABILITY: INSECURE FILE PERMISSIONS]\n` +
          `Time: ${new Date().toISOString()}\n\n` +
          `Created vulnerable config file at: ${configFile}\n` +
          `This file is ${isWorldWritable ? 'world-writable (VULNERABLE)' : 'not world-writable'}\n\n` +
          `Security Impact:\n` +
          `- Sensitive credentials could be stolen\n` +
          `- Configuration could be modified by attackers\n` +
          `- Server endpoints could be redirected to malicious servers\n` +
          `- Malicious commands could be injected into config options\n\n` +
          `Proper security would require restricting file permissions to only the application user.`
      )

      return {
        configFile,
        logPath,
        isWorldWritable,
        configData
      }
    } catch (error) {
      console.error('Error in filePermissionDemo:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('secureFilePermissionDemo', async () => {
    try {
      const userDataPath = app.getPath('userData')
      const secureConfigFile = path.join(userDataPath, 'secure-config.json')

      // Create a "configuration file" with the same sensitive data
      // Add this later

      fs.writeFileSync(secureConfigFile, JSON.stringify(configData, null, 2))

      // Apply secure permissions - only owner can access
      if (process.platform === 'win32') {
        // Remove inherited permissions
        execSync(`icacls "${secureConfigFile}" /inheritance:r`)
        // Grant only current user full control
        execSync(`icacls "${secureConfigFile}" /grant:r "${process.env.USERNAME}:(F)"`)
      } else {
        // On Unix-like systems, only owner can read/write (0o600)
        fs.chmodSync(secureConfigFile, 0o600)
      }

      // Check if file is world-writable (should be false)
      let isWorldWritable = false
      try {
        if (process.platform === 'win32') {
          const output = execSync(`icacls "${secureConfigFile}"`).toString()
          isWorldWritable =
            output.includes('Everyone:(F)') ||
            output.includes('Everyone:(M)') ||
            output.includes('Everyone:(W)')
        } else {
          const stats = fs.statSync(secureConfigFile)
          isWorldWritable = !!(stats.mode & 0o002)
        }
      } catch (error) {
        console.error('Error checking secure file permissions:', error)
      }

      return {
        configFile: secureConfigFile,
        isWorldWritable,
        configData
      }
    } catch (error) {
      console.error('Error in secureFilePermissionDemo:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('exploitFilePermissions', async (_, modifiedContent) => {
    try {
      const userDataPath = app.getPath('userData')
      const configFile = path.join(userDataPath, 'insecure-config.json')

      // Write the modified content to the file
      fs.writeFileSync(configFile, modifiedContent)

      // Parse the content to see what was changed (removed unused variable)
      JSON.parse(modifiedContent)

      // Log the exploitation
      const exploitLogPath = path.join(userDataPath, 'exploitation-log.txt')
      fs.writeFileSync(
        exploitLogPath,
        `[SECURITY EXPLOITATION LOG]\n` +
          `Time: ${new Date().toISOString()}\n\n` +
          `Vulnerable file was modified: ${configFile}\n\n` +
          `Modified content:\n${modifiedContent}\n\n` +
          `This demonstrates how an attacker with lower privileges could modify\n` +
          `configuration used by a higher-privileged application, potentially leading\n` +
          `to credential theft, data exfiltration, or code execution.`
      )

      return {
        success: true,
        modifiedContent,
        exploitLogPath,
        message: 'File successfully modified by "attacker"'
      }
    } catch (error) {
      console.error('Error in exploitFilePermissions:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

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
