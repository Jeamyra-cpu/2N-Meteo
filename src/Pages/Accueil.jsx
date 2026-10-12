import React from "react";
import {Link} from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../Styles/Accueil.css";
import Header from '../Parties/Header.jsx';

function Accueil() {
    const { t } = useTranslation();

    return (
        <div className="accueil-page">
            <main className="accueil-heros">
                <h1>{t('home.title')}</h1>
                
                <p className="description">
                    {t('home.subtitle')}
                </p>

                <div className="accueil-action">
                    <Link to="/meteo" className="accueil-bouton">
                        {t('home.cta')}
                    </Link>
                </div>

                <p className="accueil-mention">
                    {t('home.source')}
                </p>
            </main>
        </div>
    );
}

export default Accueil;