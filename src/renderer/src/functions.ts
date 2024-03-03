/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable */
//@ts-ignore
import TIME_IMG from '../../renderer/assets/tp.png'

export function clearTable(): void {
  const banlistTable = document.getElementById('banlist')
  if (banlistTable) {
    banlistTable.innerHTML = ''
  }
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
        })
      } catch (error) {
        console.error(error)
      }
    })

    Object.entries(entry).forEach(([key, value]) => {
      if (key === 'name') {
        const img = document.createElement('img')
        img.width = 32
        img.height = 32
        img.src = TIME_IMG
        const div = document.createElement('div')
        const span = document.createElement('span')
        div.classList.add('d-flex', 'calibri')
        img.classList.add('rounded')
        span.innerText = value as string
        div.id = key + 'Td'
        img.style.marginRight = '5px'
        div.appendChild(img)
        div.appendChild(span)
        div.appendChild(deleteBtn)

        cardBody.appendChild(div)
      } else {
        if (key !== 'id') {
          const div = document.createElement('div')
          div.classList.add('calibri')
          div.innerHTML = value as string
          div.id = key + 'Td'
          if (key === 'description') {
            div.classList.add('text-goldenrod', 'w-100')
          }
          if (key === 'date') {
            div.classList.add('badge', 'text-bg-secondary', 'bade-sm', 'my-2')
          }
          deleteBtn.id = entry.id
          cardBody.appendChild(div)
        }
      }
    })

    card.addEventListener('click', async (e: any) => {
      e.preventDefault()
      const tooltip = document.getElementById('tooltip')
      if (tooltip) {
        const text = `BAN:[${entry.date}]::${entry.name} - REASON - ${entry.description}`
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
