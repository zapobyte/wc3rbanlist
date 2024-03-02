import { openDB, deleteDB, DBSchema, IDBPDatabase } from 'idb'

interface DataEntry {
  id: number
  name: string
  date: string
  description: string
}

interface MyDB extends DBSchema {
  data: {
    value: DataEntry
    key: number
    indexes: { id: number }
  }
}

export default class DataBase {
  private dbPromise: Promise<IDBPDatabase<MyDB>>

  constructor(dbName: string, version: number) {
    this.dbPromise = openDB<MyDB>(dbName, version, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrade from ${oldVersion} to ${newVersion}`)
        if (!db.objectStoreNames.contains('data')) {
          const dataStore = db.createObjectStore('data', {
            keyPath: 'id',
            autoIncrement: true
          })
          dataStore.createIndex('id', 'id', { unique: true })
        } else {
          const dataStore = transaction.objectStore('data')
          if (!dataStore.indexNames.contains('id')) {
            dataStore.createIndex('id', 'id', { unique: true })
            console.log("Index 'id' created successfully.")
          } else {
            console.log("Index 'id' already exists.")
          }
        }
      }
    })
  }

  async add(data: DataEntry): Promise<void> {
    const db = await this.dbPromise
    await db.add('data', data)
  }

  async remove(id: number): Promise<void> {
    const db = await this.dbPromise
    try {
      const deletionResult = await db.delete('data', id)
      if (deletionResult === undefined) {
        console.log('No entry found with the provided ID.')
      } else {
        console.log('Entry deleted successfully.')
      }
    } catch (error) {
      if (error instanceof DOMException) {
        // Handle specific DOMException errors here (e.g., NotFoundError)
        console.error('Error deleting entry:', error.message)
      } else {
        console.error('Unexpected error:', error)
      }
    }
  }

  async get(id: number): Promise<DataEntry | undefined> {
    const db = await this.dbPromise
    return db.get('data', id)
  }

  async getAllEntries(): Promise<DataEntry[]> {
    const db = await this.dbPromise
    return await db.getAll('data') // Use optional chaining
  }

  async deleteDatabase(): Promise<void> {
    await deleteDB('banlist')
    console.log('Database deleted successfully.')
  }
}
