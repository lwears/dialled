import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { DataProvider } from './hooks/DataContext'
import { createDexieRepository } from './storage/dexieRepository'
import './index.css'

const repository = createDexieRepository()
const root = document.getElementById('root')

if (root) {
  createRoot(root).render(
    <StrictMode>
      <DataProvider repository={repository}>
        <App />
      </DataProvider>
    </StrictMode>,
  )
}
