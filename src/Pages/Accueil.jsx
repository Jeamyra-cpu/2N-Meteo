import React from "react";
import { useTranslation } from "react-i18next";
import "../Styles/Accueil.css";
import Header from '../Parties/Header.jsx';

function Accueil() {

    const { t } = useTranslation();

    return (
        <div className="accueil-page">
            <Header />

            <main className="accueil-heros">
                <h1>{t('home.title')}</h1>
                
                <p className="description">
                    {t('home.subtitle')}
                </p>

                <div className="accueil-action">
                    {
                        localStorage.getItem('deja_vu') && (
                            <button className="accueil-bouton" onClick={() => window.location.href = '/a-propos'}>
                                {t('home.cta')} 
                            </button>
                        )
                    }
                    
                    {
                        !localStorage.getItem('deja_vu') && (
                            <button className="accueil-bouton" onClick={() => window.location.href = '/Information'}>
                                {t('home.cta')} 
                            </button>
                        )
                    }
                    
                </div>

                <p className="accueil-mention">
                    {t('home.source')}
                </p>
            </main>

        </div>
    );
}

export default Accueil;