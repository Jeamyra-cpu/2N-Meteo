import { BrowserRouter, Routes, Route } from "react-router-dom"
import './App.css'
import APropos from './Pages/Apropos.jsx'
import Politique from './Pages/PolitiqueConfidentialite.jsx'
import Accueil from './Pages/Accueil.jsx'
import Information from './Pages/Information.jsx'

import Meteo from "./Pages/Meteo.jsx"
import Header from './Parties/Header.jsx'
import Footer from './Parties/Footer.jsx'
import Conseils from "./Pages/Conseils.jsx"

import Parametre from './Pages/Parametre.jsx'

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
        <Route path="/conseil" element={<Conseils />} />

        <Route path="/parametre" element={<Parametre />} />
 
        <Route path="/information" element={<Information />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App