import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom' 
import '../Styles/Header.css'

function Header() {
    const { t, i18n } = useTranslation()
    const [menuOuvert, setMenuOuvert] = useState(false)
    const [themeSombre, setThemeSombre] = useState(false)

    const location = useLocation()

    // Changer la langue
    const changerLangue = (langue) => {
        i18n.changeLanguage(langue)
    }

    // Basculer entre mode Clair et Sombre
    const basculerTheme = () => {
        setThemeSombre(!themeSombre)
        document.body.classList.toggle('dark-mode')
    }

    return (
        <>
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
                <h2 className="header-title">{t('header.app-name', '2N-Météo')}</h2>
            </header>

            {/* Overlay sombre pour fermer le menu en cliquant à l'extérieur */}
            {menuOuvert && (
                <div 
                    className="menu-overlay" 
                    onClick={() => setMenuOuvert(false)} 
                />
            )}

            {/* Navbar latérale glissante */}
            <nav id="menu" className={`navbar-drawer ${menuOuvert ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h3>Menu</h3>
                    <button 
                        className="btn-close" 
                        onClick={() => setMenuOuvert(false)}
                        aria-label="Fermer le menu"
                    >
                        &times;
                    </button>
                </div>

                <ul className="nav-links">
                    <li>
                        <Link to="/" onClick={() => setMenuOuvert(false)}>
                            {t('header.home', 'Accueil')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/politique-confidentialite" onClick={() => setMenuOuvert(false)}>
                            {t('header.privacy', 'Politique & Confidentialité')}
                        </Link>
                    </li>
                </ul>

                <div className="drawer-actions">
                    {/* Selecteur de Langue */}
                    <div className="action-item">
                        <span>{t('header.language', 'Langue')} :</span>
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
                    </div>

                    {/* Toggle Thème (Clair / Sombre) */}
                    <div className="action-item">
                        <span>{t('header.theme', 'Thème')} :</span>
                        <button className="btn-theme" onClick={basculerTheme}>
                            {themeSombre ? '☀️ Clair' : '🌙 Sombre'}
                        </button>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Header