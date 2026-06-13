import { useEffect, useState } from 'react'

function App() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(setHealth)
      .catch(err => setHealth({ status: 'error', error: err.message }))
  }, [])

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Sistema ITAM</h1>
      <p>Estado del backend: {health ? JSON.stringify(health) : 'cargando...'}</p>
    </div>
  )
}

export default App
