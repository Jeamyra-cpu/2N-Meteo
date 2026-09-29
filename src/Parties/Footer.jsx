import { useTranslation } from 'react-i18next'
import '../Styles/Footer.css'

function Footer() {
    const { t } = useTranslation()

    return (
        <footer className="footer">
            <div className="footer-container">
                <p className="footer-copyright">&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
                <h1 className="footer-title">{t('footer.app-name')}</h1>
            </div>
        </footer>
    )
}

export default Footer