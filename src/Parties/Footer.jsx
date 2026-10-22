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

                <nav className="footer-links" aria-label={t('footer.links', 'Liens utiles')}>
                    <Link to="/accueil">{t('header.home')}</Link>
                    <Link to="/meteo">{t('header.meteo')}</Link>
                    <Link to="/parametre">{t('header.settings')}</Link>
                    <Link to="/a-propos">{t('header.about')}</Link>
                    <Link to="/politique-confidentialite">{t('header.privacy')}</Link>
                </nav>
            </div>
        </footer>
    )
}

export default Footer