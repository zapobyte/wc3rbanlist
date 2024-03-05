/* eslint-disable @typescript-eslint/no-explicit-any */
import 'animate.css'
import 'bootstrap'
import DataBase from '../src/db'
import {
  createDbEntry,
  initBanFunction,
  initDeleteBanlistFunction,
  initReplayUploadFunction,
  initSearchFunction
} from './functions'

// import Tesseract from 'tesseract.js'

const db: DataBase = new DataBase('banlist', 1)

function init(): void {
  const versions = window.electron.process.versions
  console.log('.electron-version', `Electron v${versions.electron}`)
  console.log('.chrome-version', `Chromium v${versions.chrome}`)
  console.log('.node-version', `Node v${versions.node}`)

  window.addEventListener('DOMContentLoaded', async () => {
    const dbEntries = (await db?.getAllEntries()) as []
    dbEntries?.forEach((entry) => {
      createDbEntry(entry, db)
    })
    initBanFunction(db)
    initDeleteBanlistFunction(db)
    initSearchFunction(db)
    initReplayUploadFunction(db)
  })
}

init()
