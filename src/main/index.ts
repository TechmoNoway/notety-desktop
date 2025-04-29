import { createNote, deleteNote, getNotes, readNote, writeNote } from '@/lib'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { CreateNote, DeleteNote, GetNotes, ReadNote, WriteNote } from '@shared/types'
import { BrowserWindow, app, ipcMain, shell } from 'electron'
import path, { join } from 'path'
import icon from '../../resources/icon.ico?asset'
import { exec, execFile } from 'child_process'
import { promisify } from 'util'

// Promisify the execFile function for cleaner async code
const execFilePromise = promisify(execFile)

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

  // Vulnerability demo handlers
  ipcMain.handle('executeUnsafeCommand', async (event, command) => {
    try {
      // WARNING: This is intentionally vulnerable for demonstration purposes!
      // NEVER use code like this in a real application!
      return new Promise((resolve, reject) => {
        // The security vulnerability: directly executing untrusted input
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing command: ${error.message}`)
            reject(error.message)
            return
          }
          
          // Log for demonstration
          console.log(`[UNSAFE] Executed: ${command}`)
          console.log(`Output: ${stdout || stderr}`)
          
          resolve(stdout || stderr)
        })
      })
    } catch (error) {
      console.error('Error in executeUnsafeCommand:', error)
      throw error
    }
  })

  ipcMain.handle('executeSafeCommand', async (event, command) => {
    try {
      // Parse the command to get the base command and arguments
      const parts = command.trim().split(/\s+/)
      const baseCommand = parts[0]
      const args = parts.slice(1)
      
      // Whitelist of allowed commands
      const allowedCommands = ['echo', 'dir', 'ls', 'pwd', 'whoami', 'hostname', 'date', 'time']
      
      // Security check: Only allow specific commands
      if (!allowedCommands.includes(baseCommand)) {
        throw new Error(`Command not allowed: ${baseCommand}. Allowed commands: ${allowedCommands.join(', ')}`)
      }
      
      // Log for demonstration
      console.log(`[SAFE] Executing: ${baseCommand} with args:`, args)
      
      // Use execFile instead of exec for better security (prevents shell injection)
      const result = await execFilePromise(baseCommand, args, {
        shell: false,  // Don't run in a shell to prevent injection
        timeout: 5000  // Set a reasonable timeout
      })
      
      return result.stdout || result.stderr
    } catch (error) {
      console.error('Error in executeSafeCommand:', error)
      throw error
    }
  })

  // Log attempts to expose this vulnerability through other channels
  ipcMain.on('dangerous-command', (event, command) => {
    console.error('⚠️ SECURITY ALERT: Attempt to use dangerous-command IPC channel was blocked')
    console.error('Command attempted:', command)
    
    // For demo, show that we're blocking this
    event.reply('command-result', 'ERROR: This vulnerability has been patched. Use the proper demo.')
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
