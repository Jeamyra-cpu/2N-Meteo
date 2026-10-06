import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import APropos from './Pages/Apropos.jsx'
import Politique from './Pages/PolitiqueConfidentialite.jsx'
import Accueil from './Pages/Accueil.jsx'
import Meteo from "./Pages/Meteo.jsx"
import Header from './Parties/Header.jsx'
import Footer from './Parties/Footer.jsx'

function App() {

  return (
    <BrowserRouter>
      <Header/>
      <Routes>
        <Route path="/" element={<APropos />} />
        <Route path="/a-propos" element={<APropos />} />
        <Route path="/politique-confidentialite" element={<Politique />} />
        <Route path="/accueil" element={<Accueil />} />
        <Route path="/meteo" element={<Meteo />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App