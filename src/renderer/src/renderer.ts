/* eslint-disable @typescript-eslint/no-explicit-any */
import 'animate.css'
import DataBase from '../src/db'
import 'bootstrap'

let DB: DataBase | null = null
let DB_ENTRIES: object[] = []

function clearTable(): void {
  const banlistTable = document.getElementById('banlist')
  if (banlistTable) {
    banlistTable.innerHTML = ''
  }
}

async function createDbEntry(entry): Promise<void> {
  const banlistTable = document.getElementById('banlist')

  if (banlistTable) {
    const card = document.createElement('div')
    card.classList.add('card', 'text-bg-dark', 'my-1', 'bg-dark-soft')
    const cardBody = document.createElement('div')
    const deleteBtn = document.createElement('button')
    cardBody.classList.add('card-body')
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
      if (key === 'name') {
        const div = document.createElement('div')
        div.classList.add('d-flex', 'justify-content-between', 'calibri')
        div.innerHTML = value as string
        div.id = key + 'Td'
        div.appendChild(deleteBtn)

        cardBody.appendChild(div)
      } else {
        if (key !== 'id') {
          const div = document.createElement('div')
          div.classList.add('calibri')
          div.innerHTML = value as string
          div.id = key + 'Td'
          if (key === 'description') {
            div.classList.add('text-goldenrod')
          }
          if (key === 'date') {
            div.classList.add('badge', 'text-bg-secondary', 'bade-sm')
          }
          deleteBtn.id = entry.id
          cardBody.appendChild(div)
        }
      }
    })
    card.addEventListener('click', async (e: any) => {
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
    card.appendChild(cardBody)
    banlistTable.appendChild(card)
  }
}

function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    const versions = window.electron.process.versions
    console.log('.electron-version', `Electron v${versions.electron}`)
    console.log('.chrome-version', `Chromium v${versions.chrome}`)
    console.log('.node-version', `Node v${versions.node}`)
    initDb()

    const ban = document.getElementById('ban')
    ban?.addEventListener('click', async (event: Event) => {
      event.preventDefault()
      const dbEntries = (await DB?.getAllEntries()) as []
      DB_ENTRIES = [...dbEntries]
      const name = document.getElementById('name') as HTMLTextAreaElement
      const reason = document.getElementById('reason') as HTMLTextAreaElement
      const date = new Date().toJSON().split('T')[0]
      if (DB) {
        const entry = {
          id: dbEntries!.length,
          name: name?.value,
          date: date,
          description: reason?.value
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
