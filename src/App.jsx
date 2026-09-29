import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import APropos from './Pages/Apropos.jsx'
import Politique from './Pages/PolitiqueConfidentialite.jsx'
import Accueil from './Pages/Acceuil.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/Mon_Accueil" element={<Accueil />} />
        <Route path="/politique-confidentialite" element={<Politique />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
