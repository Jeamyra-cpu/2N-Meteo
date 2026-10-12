import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./style.css";
import logo from "../Images/logo.png";


function Accueil() {
    const { t } = useTranslation();
    const [menuOuvert, setMenuOuvert] = useState(false);

    return (
        <div>
            { /* Barre de navigation */}
            <header className="barre">
                <button
                    className="traits"
                    id="btnMenu"
                    onClick={() => setMenuOuvert(true)}
                    aria-expanded={menuOuvert}
                    aria-controls="menu"
                    aria-label="Ouvrir le menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </header>

            <nav
                className={`panneau ${menuOuvert ? "ouvert" : ""}`}
                id="menu"
                aria-label="Menu principal"
            >
                <div className="panneau-tete">
                    <button
                        className="fermer"
                        id="btnFermer"
                        onClick={() => setMenuOuvert(false)}
                        aria-label="Fermer le menu"
                    >
                        &times;
                    </button>
                </div>

                <ul className="liens">
                    <li>
                        <button onClick={() => setMenuOuvert(false)}>
                            Accueil
                        </button>
                    </li>

                    <li>
                        <button onClick={() => setMenuOuvert(false)}>
                            À propos de nous
                        </button>
                    </li>

                    <li>
                        <button onClick={() => setMenuOuvert(false)}>
                            Politique de confidentialité
                        </button>
                    </li>

                    <li>
                        <button onClick={() => setMenuOuvert(false)}>
                            Changer de Langue
                        </button>
                    </li>

                </ul>
            </nav>



            {/*Description de l'appli*/}
            <div>
                <main className="heros">
                    <h1>Le ciel, sans le bruit.</h1>
                    <p>Une prévision claire pour votre ville, lisible en trois secondes. Sans publicité, sans compte à créer, sans traceur.</p>
                    <div className="action">
                        <button className="bouton">Voir ma ville</button>

                    </div>
                    <p className="mention">Données Météo-France et modèles ouverts européens.</p>
                </main>

            {  /*  <div className="logo"><img src={logo} alt="logo" /></div>*/}
            </div>

        </div >
    );
}
export default Accueil;