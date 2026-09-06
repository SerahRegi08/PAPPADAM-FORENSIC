import React, { useState } from 'react'
import Landing from './Landing'
import Home from './home'
import Forensic from './forensic'
import './App.css'

function App() {
  const [page, setPage] = useState('landing')
  const [image, setImage] = useState(null)

  const handleAnalyze = (img) => {
    setImage(img)
    setPage('forensic')
  }

  return (
    <div className="App">
      {page === 'landing' && <Landing onStart={() => setPage('home')} />}
      {page === 'home' && <Home onAnalyze={handleAnalyze} onBack={() => setPage('landing')} />}
      {page === 'forensic' && <Forensic image={image} onBack={() => setPage('home')} />}
    </div>
  )
}

export default App
