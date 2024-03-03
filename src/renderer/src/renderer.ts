/* eslint-disable @typescript-eslint/no-explicit-any */
import 'animate.css'
import 'bootstrap'
import DataBase from '../src/db'
import { clearTable, createDbEntry } from './functions'

let db: DataBase = new DataBase('banlist', 1)

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
    const ban = document.getElementById('ban')
    ban?.addEventListener('click', async (event: Event) => {
      event.preventDefault()
      const name = document.getElementById('name') as HTMLTextAreaElement
      const reason = document.getElementById('reason') as HTMLTextAreaElement
      if (name.value === '') {
        return
      }
      const dbEntries = (await db?.getAllEntries()) as []
      const date = new Date().toJSON().split('T')[0]
      if (db) {
        const entry = {
          id: dbEntries!.length,
          name: name?.value,
          date: date,
          description: reason?.value
        }
        await db.add(entry)
        createDbEntry(entry, db)
      }
    })

    const deleteDatabase = document.getElementById('deletedb')
    deleteDatabase?.addEventListener('click', async () => {
      const alert = window.confirm('Are you sure you want to delete your banlist database?')
      if (alert) {
        db?.deleteDatabase()
        db = new DataBase('banlist', 1)
        window.location.reload()
      }
      // window.electron.ipcRenderer.send('deletedb')
    })

    const search = document.getElementById('search')
    if (search) {
      search.addEventListener('keydown', async (e: Event | any) => {
        const value = e.target?.value
        const dbEntries = (await db?.getAllEntries()) as []
        const filterEntries = [] as any[]
        const formatedSearch = value.includes('Backspace')
          ? e.target?.value.split('Backspace')[0]
          : e.target?.value
        dbEntries.forEach((x: any) => {
          if (
            (formatedSearch !== '' &&
              x.name.toLowerCase().includes(formatedSearch.toLowerCase())) ||
            x.description.toLowerCase().includes(formatedSearch.toLowerCase())
          ) {
            filterEntries.push(x)
          }
        })

        if (filterEntries.length > 0) {
          clearTable()
          filterEntries.forEach((entry) => {
            createDbEntry(entry, db)
          })
          return
        }
        if (filterEntries.length === 0 && formatedSearch !== '' && e.key !== 'Backspace') {
          clearTable()
          return
        }
        if (filterEntries.length === 0 && formatedSearch === '') {
          clearTable()
          dbEntries.forEach((entry) => {
            createDbEntry(entry, db)
          })
          return
        }
      })
    }
  })
}

init()
