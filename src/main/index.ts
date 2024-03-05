/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  app,
  shell,
  BrowserWindow,
  ipcMain
  // globalShortcut
} from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.ico?asset'
// import W3GReplay from 'w3gjs'

let DATA = [] as object[]

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 480,
    height: 560,
    center: true,
    autoHideMenuBar: import.meta.env.MODE === 'development' ? false : true,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
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

  // IPC test
  ipcMain.on('db-data', (event, data) => {
    console.log('trigger', event)
    DATA = DATA.filter((x: any) => x.id !== data.id)
    data.forEach((x: { name: string }) => {
      DATA.push(x)
    })
  })

  createWindow()
  // globalShortcut.register('Ctrl+P', async () => {
  //   const parser = new W3GReplay()
  //   const result = await parser.parse('replay.w3g')
  //   console.log(result)

  // desktopCapturer
  // .getSources({
  //   types: ['screen'],
  //   thumbnailSize: {
  //     height: 4000,
  //     width: 4000
  //   }
  // })
  // .then(async (sources) => {
  //   const img = sources[0].thumbnail
  //   const worker = await createWorker('eng')
  //   const imageCreated = img.toPNG()
  //   const ret = await worker.recognize(imageCreated)
  //   DATA.forEach((entry: any) => {
  //     console.log(ret.data.text.toLowerCase())
  //     console.log(entry)
  //     if (ret.data.text.toLowerCase().includes(entry.name.toLowerCase())) {
  //       const text = `BAN:[${entry.date}]::${entry.name} - REASON - ${entry.description}`
  //       clipboard.writeText(text)
  //     }
  //   })
  //   await worker.terminate()
  //   // clipboard.writeImage(img)
  //   // The image to display the screenshot
  // })
  // })
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
