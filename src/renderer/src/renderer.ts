/* eslint-disable @typescript-eslint/no-explicit-any */
import 'animate.css'
import DataBase from '../src/db'
import 'animate.css'
import 'bootstrap'

let DB: DataBase | null = null
let DB_ENTRIES: object[] = []

function clearTable(): void {
  const banlistTable = document.getElementById('banlist-body')
  if (banlistTable) {
    banlistTable.innerHTML = ''
  }
}

async function createDbEntry(entry): Promise<void> {
  const banlistTable = document.getElementById('banlist-body')

  if (banlistTable) {
    const tr = document.createElement('tr')
    tr.classList.add('p-x', 'p-y')
    const tdButton = document.createElement('td')
    const deleteBtn = document.createElement('button')
    tdButton.classList.add('text-right')
    deleteBtn.classList.add('btn', 'delete')
    deleteBtn.addEventListener('click', async (e: Event | any) => {
      e.preventDefault()
      e.stopPropagation()
      const id = Number(e?.target.id)
      await DB?.remove(id)
      try {
        const dbEntries = (await DB?.getAllEntries()) as []
        DB_ENTRIES = [...dbEntries]
        clearTable()
        DB_ENTRIES.forEach((entry) => {
          createDbEntry(entry)
        })
      } catch (error) {
        console.error(error)
      }
    })
    Object.entries(entry).forEach(([key, value]) => {
      const td = document.createElement('td')
      td.innerHTML = value as string
      td.id = key + 'Td'
      if (key === 'description') {
        td.classList.add('text-goldenrod')
        td.style.width = '100%'
      }
      td.style.width = 'auto !important'
      td.style.minWidth = '175px'
      deleteBtn.id = entry.id
      tr.appendChild(td)
    })
    tr.addEventListener('click', async (e: any) => {
      e.preventDefault()
      e.stopImmediatePropagation()
      // e.stopPropagation()
      const tooltip = document.createElement('div')
      const text = `BAN:[${entry.date}]::${entry.name} - REASON - ${entry.description}`
      tooltip.id = e.target.id + '_tooltip'
      if (e.target && e.target.parentElement && e.target.id !== '') {
        document.body.appendChild(tooltip)
        const copyText = `Message copy`
        tooltip.innerText = copyText
        tooltip.style.display = 'none'
        tooltip.classList.add('tooltip-banlist-entry')
        e.target.parentElement.title = copyText
        if (tooltip) {
          const position = e.target.getBoundingClientRect()
          tooltip.style.left = `${position.left}px`
          tooltip.style.top = `${position.top - 10}px`
          tooltip.style.display = 'block'
          tooltip.style.fontSize = '0.9rem'
          const timeout = setTimeout(() => {
            tooltip.style.display = 'none'
            document.body.removeChild(tooltip)
            clearTimeout(timeout)
          }, 1000)
        }
        try {
          await navigator.clipboard.writeText(text)
        } catch (error) {
          console.error('Failed to copy text to clipboard:', error)
        }
      }
    })
    tdButton.appendChild(deleteBtn)
    tr.appendChild(tdButton)
    banlistTable.appendChild(tr)
  }
}

function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    const versions = window.electron.process.versions
    const appVersion = window.electron.process.env.npm_package_version
    console.log('.electron-version', `Electron v${versions.electron}`)
    console.log('.chrome-version', `Chromium v${versions.chrome}`)
    console.log('.node-version', `Node v${versions.node}`)
    console.log('.app-version', appVersion)
    const versionElement = document.getElementById('appVersion')
    if (versionElement) {
      versionElement.style.fontSize = '0.8rem'
      versionElement.innerText = `v${appVersion}`
    }

    initDb()

    const ban = document.getElementById('ban')
    ban?.addEventListener('click', async (event: Event) => {
      event.preventDefault()
      const dbEntries = (await DB?.getAllEntries()) as []
      DB_ENTRIES = [...dbEntries]
      const name = document.getElementById('name') as HTMLTextAreaElement
      const reason = document.getElementById('reason') as HTMLTextAreaElement
      const date = new Date().toDateString()
      if (DB) {
        const entry = {
          id: dbEntries!.length,
          name: name?.value,
          description: reason?.value,
          date: date
        }
        await DB.add(entry)
        DB_ENTRIES.push({ entry })
        createDbEntry(entry)
      }
    })

    const deleteDatabase = document.getElementById('deleteDb')
    deleteDatabase?.addEventListener('click', async () => {
      const alert = window.confirm('Are you sure you want to delete your banlist database?')
      if (alert) {
        DB?.deleteDatabase()
        DB = new DataBase('banlist', 1)
        window.location.reload()
      }
      // window.electron.ipcRenderer.send('deleteDb')
    })
  })
}

async function initDb(): Promise<void> {
  // window.electron.ipcRenderer.send('Banlist initiated')
  if (DB === null) {
    DB = new DataBase('banlist', 1)
  }

  try {
    const dbEntries = (await DB?.getAllEntries()) as []
    DB_ENTRIES = [...dbEntries]
    DB_ENTRIES.forEach((entry) => {
      createDbEntry(entry)
    })
  } catch (error) {
    console.error(error)
  }
}

init()
