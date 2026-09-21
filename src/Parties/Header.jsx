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
                <h2 className="header-title">{t('header.app-name')}</h2>
            </header>

            {menuOuvert && (
                <div 
                    className="menu-overlay" 
                    onClick={() => setMenuOuvert(false)} 
                />
            )}

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
                        <Link to="/accueil" onClick={() => setMenuOuvert(false)}>
                            {t('header.home')}
                        </Link>
                    </li>
                    {location.pathname !== '/politique-confidentialite' && (
                        <li>
                            <Link to="/politique-confidentialite" onClick={() => setMenuOuvert(false)}>
                                {t('header.privacy')}
                            </Link>
                        </li>
                    )}
                    
                    {location.pathname !== '/a-propos' && (
                        <li>
                            <Link to="/a-propos" onClick={() => setMenuOuvert(false)}>
                                {t('header.about')}
                            </Link>
                        </li>
                    )}
                </ul>

                <div className="drawer-actions">
                    <div className="action-item">
                        <span>{t('header.language')} :</span>
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

                    <div className="action-item">
                        <span>{t('header.theme')} :</span>
                        <button className="btn-theme" onClick={basculerTheme}>
                            {themeSombre ? '☀️' + t('header.light') : '🌙' + t('header.dark')}
                        </button>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Header