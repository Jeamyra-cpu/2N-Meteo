import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "../Styles/Parametre.css";
import Header from '../Parties/Header.jsx';
import Footer from '../Parties/Footer.jsx';

function Parametre() {
    const { t, i18n } = useTranslation();
    const [themeSombre, setThemeSombre] = useState(false);
    
    // États pour les formulaires
    const [villeParDefaut, setVilleParDefaut] = useState("Paris");
    const [email, setEmail] = useState("utilisateur@exemple.fr");
    const [historiqueEfface, setHistoriqueEfface] = useState(false);
    
    // État pour la modal de confirmation
    const [afficherModal, setAfficherModal] = useState(false);

    // Changer la langue
    const changerLangue = (langue) => {
        i18n.changeLanguage(langue);
    };

    // Basculer entre le mode clair et le mode sombre
    const basculerTheme = () => {
        setThemeSombre(!themeSombre);
        document.body.classList.toggle('dark-mode');
    };

    // Sauvegarder la ville par défaut
    const enregistrerVille = (e) => {
        e.preventDefault();
        // Logique de sauvegarde local/API
        alert(t('settings.section3.success'));
    };

    // Enregistrer ou modifier l'email
    const enregistrerEmail = (e) => {
        e.preventDefault();
        alert(t('settings.section4.emailSuccess'));
    };

    // Effacer l'historique de recherche (Suggestion 2)
    const effacerHistorique = () => {
        localStorage.removeItem("historique_villes");
        setHistoriqueEfface(true);
        setTimeout(() => setHistoriqueEfface(false), 3000);
    };

    // Supprimer toutes les données (Suggestion 5 - Modal)
    const confirmerSuppressionDonnees = () => {
        localStorage.clear();
        setAfficherModal(false);
        alert(t('settings.section4.deleteSuccess'));
    };

    return (
        <div className="parametre-page">
            <Header />

            <main className="parametre-main">
                <h1 className="parametre-title">{t('settings.title')}</h1>

                {/* Section 1 : Langue */}
                <section className="parametre-card">
                    <h2>{t('settings.section1.title')}</h2>
                    <p>{t('settings.section1.description')}</p>

                    <div className="lang-buttons">
                        <button 
                            className={i18n.language === 'fr' ? 'active' : ''} 
                            onClick={() => changerLangue('fr')}
                        >
                            FR
                        </button>
                        <button 
                            className={i18n.language === 'en' ? 'active' : ''} 
                            onClick={() => changerLangue('en')}
                        >
                            EN
                        </button>
                    </div>
                </section>

                {/* Section 2 : Thème */}
                <section className="parametre-card">
                    <h2>{t('settings.section2.title')}</h2>
                    <p>{t('settings.section2.description')}</p>

                    <button className="btn-theme" onClick={basculerTheme}>
                        {themeSombre ? '☀️ ' + t('header.light', 'Mode Clair') : '🌙 ' + t('header.dark', 'Mode Sombre')}
                    </button>
                </section>

                {/* Section 3 : Ville par défaut */}
                <section className="parametre-card">
                    <h2>{t('settings.section3.title')}</h2>
                    <p>{t('settings.section3.description')}</p>

                    <form onSubmit={enregistrerVille} className="parametre-form">
                        <input 
                            type="text" 
                            className="parametre-input"
                            value={villeParDefaut}
                            onChange={(e) => setVilleParDefaut(e.target.value)}
                            placeholder={t('settings.section3.placeholder')}
                        />
                        <button type="submit" className="btn-primary">
                            {t('settings.save')}
                        </button>
                    </form>
                </section>

                {/* Section 4 : Gestion du compte & Historique */}
                <section className="parametre-card">
                    <h2>{t('settings.section4.title')}</h2>
                    <p>{t('settings.section4.description')}</p>
                    
                    <form onSubmit={enregistrerEmail} className="parametre-form">
                        <input 
                            type="email" 
                            className="parametre-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="adresse@email.com"
                        />
                        <button type="submit" className="btn-primary">
                            {t('settings.section4.updateEmail')}
                        </button>
                    </form>

                    <hr className="parametre-divider" />

                    <div className="action-row">
                        <div>
                            <strong>{t('settings.history.title')}</strong>
                            <p className="sub-text">{t('settings.history.desc')}</p>
                        </div>
                        <button className="btn-secondary" onClick={effacerHistorique}>
                            {t('settings.history.clear')}
                        </button>
                    </div>
                    {historiqueEfface && (
                        <p className="success-msg">{t('settings.history.cleared')}</p>
                    )}

                    <hr className="parametre-divider" />

                    <div className="action-row">
                        <div>
                            <strong>{t('settings.delete.title')}</strong>
                            <p className="sub-text">{t('settings.delete.desc')}</p>
                        </div>
                        <button className="btn-danger" onClick={() => setAfficherModal(true)}>
                            {t('settings.delete.button')}
                        </button>
                    </div>
                </section>
            </main>

            {/* Modal de confirmation de suppression */}
            {afficherModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{t('settings.modal.title')}</h3>
                        <p>{t('settings.modal.desc')}</p>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setAfficherModal(false)}>
                                {t('settings.modal.cancel')}
                            </button>
                            <button className="btn-danger" onClick={confirmerSuppressionDonnees}>
                                {t('settings.modal.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default Parametre;