import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import '../Styles/Footer.css'

function Footer() {
    const { t } = useTranslation()

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <h1 className="footer-title">{t('footer.app-name')}</h1>
                    <p className="footer-copyright">&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
                </div>

                <nav className="footer-links" aria-label="Liens utiles">
                    <Link to="/accueil">Accueil</Link>
                    <Link to="/meteo">Météo</Link>
                    <Link to="/parametre">Paramètres</Link>
                    <Link to="/a-propos">À propos</Link>
                    <Link to="/politique-confidentialite">Confidentialité</Link>
                </nav>
            </div>
        </footer>
    )
}

export default Footer