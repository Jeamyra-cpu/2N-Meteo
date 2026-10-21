import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../Styles/Accueil.css";
import Header from '../Parties/Header.jsx';
import Footer from '../Parties/Footer.jsx';

function Accueil() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const dejaVu = Boolean(localStorage.getItem('deja_vu'));
    const villeEnregistree = localStorage.getItem('ville');

    const allerVersLeParcours = () => {
        if (dejaVu && villeEnregistree) {
            navigate('/meteo');
            return;
        }

        navigate('/information');
    };

    return (
        <div className="accueil-page">
            <Header />

            <main className="accueil-heros">
                {/* Ormements d'arrière-plan façon "Ciel & Atmosphère" */}
                <div className="sky-blob sky-blob-1" aria-hidden="true" />
                <div className="sky-blob sky-blob-2" aria-hidden="true" />

                <div className="accueil-hero-content">
                    <span className="badge-meteo">
                        {t('home.badge', 'Météo en temps réel')}
                    </span>

                    <h1>{t('home.title')}</h1>

                    <p className="description">
                        {t('home.subtitle')}
                    </p>

                    <div className="accueil-action">
                        <button className="accueil-bouton" onClick={allerVersLeParcours}>
                            {t('home.cta')}
                        </button>
                    </div>

                    <p className="accueil-mention">
                        {t('home.source')}
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Accueil;