/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable */
//@ts-ignore
import TIME_IMG from '../../renderer/assets/tp.png'
import DataBase from './db'

export function clearTable(): void {
  const banlistTable = document.getElementById('banlist')
  if (banlistTable) {
    banlistTable.innerHTML = ''
  }
}

export function initReplayUploadFunction(db){
  const fileInput = document.getElementById('replay');
  if(fileInput){
    fileInput.addEventListener("cancel", () => {
      console.log("Cancelled.");
    });
    fileInput.addEventListener("change", (event:any) => {
      const file = event.target.files[0];
      window.electron.ipcRenderer.send('parse-replay',file.path);
    })
  }
  //@ts-ignore
  window.electron.ipcRenderer.on('replay-parsed', async (event, parsedData) => {
    const dbEntries = await db?.getAllEntries() as []
    const message = confirm(`Found ${parsedData.bans.length} possible bans. Do you want to ban them?`);
    if(message){
      parsedData.bans.forEach(async (ban, i)=>{  
        const date = new Date().toDateString();
        const entry = {
          id: dbEntries!.length + i +1,
          name: ban,
          date: date,
          reason: 'Leaver[AUTOBAN]'
        }
        await db.add(entry)
        createDbEntry(entry, db)
      })
    }
    if (parsedData.error) {
      console.error(parsedData.error);
      return;
    }
    
    // Do something with parsedData
  });
}

export async function createDbEntry(entry, DB): Promise<void> {
  const banlistTable = document.getElementById('banlist')
  if (banlistTable) {
    const card = document.createElement('div')
    card.classList.add('card', 'text-bg-dark', 'my-1', 'bg-dark-soft')
    const cardBody = document.createElement('div')
    const deleteBtn = document.createElement('button')
    cardBody.classList.add('card-body')
    deleteBtn.classList.add('btn', 'delete', 'ms-auto')

    deleteBtn.addEventListener('click', async (e: Event | any) => {
      e.preventDefault()
      e.stopPropagation()
      const id = Number(e?.target.id)
      await DB?.remove(id)
      try {
        const dbEntries = (await DB?.getAllEntries()) as []
        clearTable()
        dbEntries?.forEach((entry) => {
          createDbEntry(entry, DB)
        });
        window.electron.ipcRenderer.send('db-data',dbEntries);
      } catch (error) {
        console.error(error)
      }
    })

    Object.entries(entry).forEach(([key, value]) => {

      if (key === 'name') {
        const div = document.createElement('div')
        const span = document.createElement('span')
        div.classList.add('d-flex', 'calibri')
        span.innerText = value as string
        div.id = key + 'Td'
        div.appendChild(span)
        div.appendChild(deleteBtn)
        cardBody.appendChild(div)
      }
      if (key !== 'id' && key !== 'name') {
        const div = document.createElement('div')
        div.classList.add('calibri')
        div.innerHTML = value as string
        div.id = key + 'Td'
        if (key === 'reason') {
          div.classList.add('text-goldenrod', 'w-100')
        }
        deleteBtn.id = entry.id
        cardBody.appendChild(div)
      }
    
    })

    card.addEventListener('click', async (e: any) => {
      e.preventDefault()
      const tooltip = document.getElementById('tooltip')
      if (tooltip) {
        const text = `BAN:[${entry.date}]::${entry.name} - REASON - ${entry.reason}`
        if (e.target && e.target.parentElement && e.target.id !== '') {
          const copyText = `Message copy`
          tooltip.innerText = copyText
          tooltip.classList.add('tooltip-banlist-entry')
          e.target.parentElement.title = copyText
          const position = e.target.getBoundingClientRect()
          tooltip.style.left = `${position.left}px`
          tooltip.style.top = `${position.top - 10}px`
          tooltip.style.fontSize = '0.9rem'
          tooltip.style.display = 'block'
          const timeout = setTimeout(() => {
            tooltip.style.display = 'none'
            clearTimeout(timeout)
          }, 1000)
          try {
            await navigator.clipboard.writeText(text)
          } catch (error) {
            console.error('Failed to copy text to clipboard:', error)
          }
        }
      }
    })
    card.appendChild(cardBody)
    banlistTable.appendChild(card)
  }
}

export function initBanFunction(db:DataBase){
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
          reason: reason?.value
        }
        await db.add(entry)
        createDbEntry(entry, db)
      }
    })
}

export function initDeleteBanlistFunction(db:DataBase){
    const deleteDatabase = document.getElementById('deleteDb')
    deleteDatabase?.addEventListener('click', async () => {
      const alert = window.confirm('Are you sure you want to delete your banlist database?')
      if (alert) {
        db?.deleteDatabase()
        db = new DataBase('banlist', 1)
        window.location.reload()
      }
    })

}

export function initSearchFunction(db:DataBase){
    
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
            x.reason.toLowerCase().includes(formatedSearch.toLowerCase())
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

}