import { createNote, deleteNote, getNotes, readNote, writeNote } from '@/lib'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { CreateNote, DeleteNote, GetNotes, ReadNote, WriteNote } from '@shared/types'
import { BrowserWindow, app, ipcMain, shell } from 'electron'
import path, { join } from 'path'
import icon from '../../resources/icon.ico?asset'
import fs from 'fs'
import sudoPrompt from 'sudo-prompt'

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

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

ipcMain.on('write-log', (event, text: string, path: string) => {
  try {
    // VULNERABILITY: This allows writing to ANY path on the system without validation
    fs.writeFileSync(path, text)
    console.log('Log written to', path)

    // Send a success response
    event.reply('write-log-result', { success: true, path })
  } catch (err) {
    console.error('Write failed:', err)
    event.reply('write-log-result', {
      success: false,
      error: err instanceof Error ? err.message : 'An unknown error occurred'
    })
  }
})

ipcMain.handle('relaunch-as-admin', () => {
  const execPath = process.execPath
  const options = {
    name: 'Notety-Desktop'
  }

  console.log('Attempting to relaunch with admin privileges...')
  sudoPrompt.exec(`"${execPath}"`, options, (error) => {
    if (error) {
      console.error('Failed to relaunch as admin:', error)
    }
  })

  // We'll close the current instance since we're relaunching
  setTimeout(() => app.quit(), 1000)
  return true
})

ipcMain.handle('check-admin-status', () => {
  // Try writing to a truly protected directory (not Temp which might be writable by standard users)
  try {
    const testFile = path.join('C:\\Windows\\System32', `admin-test-${Date.now()}.txt`)
    fs.writeFileSync(testFile, 'Admin test')
    // If we get here, we have admin rights
    try {
      fs.unlinkSync(testFile) // Clean up
    } catch (e) {
      console.error('Could not clean up test file:', e)
    }
    return true
  } catch (err) {
    console.log(
      'Not running with admin rights:',
      err instanceof Error ? err.message : 'Unknown error'
    )
    return false
  }
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
