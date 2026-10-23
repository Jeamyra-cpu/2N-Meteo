import { useTranslation } from "react-i18next";
import { ArrowRight, Cloud, CloudRain, Sun, Wind } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../Styles/Accueil.css";
import Header from '../Parties/Header.jsx';
import Footer from '../Parties/Footer.jsx';

function Accueil({ theme = 'light', onToggleTheme = () => {} }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dejaVu = Boolean(localStorage.getItem('deja_vu'));
    const villeEnregistree = localStorage.getItem('ville');

    const allerVersLeParcours = () => {
        navigate(dejaVu && villeEnregistree ? '/meteo' : '/information');
    };

    return (
        <div className="accueil-page">
            <Header theme={theme} onToggleTheme={onToggleTheme} />
            <main className="accueil-main">
                <section className="accueil-heros">
                    <div className="hero-sky-glow" aria-hidden="true" />
                    <div className="hero-layout">
                        <div className="accueil-hero-content">
                            <span className="badge-meteo"><span className="badge-dot" />{t('home.badge', 'Votre météo, en un regard')}</span>
                            <h1>{t('home.title')}</h1>
                            <p className="description">{t('home.subtitle')}</p>
                            <div className="accueil-action">
                                <button className="accueil-bouton" onClick={allerVersLeParcours}>
                                    {t('home.cta')} <ArrowRight size={18} aria-hidden="true" />
                                </button>
                                <span className="hero-cta-note">{t('home.ctaNote', 'Simple, clair et toujours à portée de main')}</span>
                            </div>
                            <div className="home-trust-row">
                                <span><Cloud size={17} /> {t('home.featureForecast', 'Prévisions fiables')}</span>
                                <span><Wind size={17} /> {t('home.featureLocal', 'Pour votre ville')}</span>
                            </div>
                        </div>

                        <div className="hero-visual" aria-label={t('home.illustrationAlt', 'Illustration d’un ciel ensoleillé au-dessus des montagnes')}>
                            <div className="sun-orbit" aria-hidden="true"><span className="sun-core" /></div>
                            <div className="hero-cloud hero-cloud-back" aria-hidden="true"><i /><i /><i /></div>
                            <div className="hero-cloud hero-cloud-front" aria-hidden="true"><i /><i /><i /></div>
                            <svg className="mountain-art" viewBox="0 0 760 420" preserveAspectRatio="none" aria-hidden="true">
                                <path className="mountain-far" d="M0 300 120 194l65 58 115-139 102 129 88-76 130 132 66-56 74 69v109H0Z" />
                                <path className="mountain-snow" d="m300 113 42 54-35-12-26 19Zm190 53 43 52-41-17-23 15Z" />
                                <path className="mountain-near" d="m0 325 112-94 82 66 111-121 108 112 97-72 110 87 72-55 68 55v117H0Z" />
                                <path className="mountain-light" d="m305 176 32 66-34-29-30 24Zm205 27 40 62-44-28-29 20Z" />
                                <path className="mountain-foreground" d="m0 354 124-46 82 37 106-67 96 55 104-50 105 56 71-31 72 35v77H0Z" />
                            </svg>
                            <div className="weather-glass-card">
                                <div className="weather-glass-top"><span>{t('home.previewLabel', 'APERÇU MÉTÉO')}</span><span className="live-indicator" /></div>
                                <div className="weather-glass-now"><div><small>{t('home.previewCity', 'Quelque part en France')}</small><strong>18°</strong><span>{t('home.previewCondition', 'Éclaircies')}</span></div><Sun className="preview-sun" size={52} strokeWidth={1.5} /></div>
                                <div className="weather-glass-divider" />
                                <div className="weather-glass-days">
                                    <span><small>{t('home.previewToday', 'AUJ.')}</small><Sun size={19} /><b>18°</b></span>
                                    <span><small>{t('home.previewTomorrow', 'DEMAIN')}</small><Cloud size={19} /><b>16°</b></span>
                                    <span><small>{t('home.previewNextDay', 'VEN.')}</small><CloudRain size={19} /><b>14°</b></span>
                                </div>
                            </div>
                            <span className="scene-caption"><span />{t('home.sceneCaption', 'Le ciel change. Gardez une longueur d’avance.')}</span>
                        </div>
                    </div>
                    <div className="hero-bottom-fade" aria-hidden="true" />
                </section>
                <section className="home-source-line"><span className="source-mark"><Cloud size={18} /></span><p>{t('home.source')}</p></section>
            </main>
            <Footer />
        </div>
    );
}

export default Accueil;
