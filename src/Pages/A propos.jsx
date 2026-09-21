import { useTranslation } from 'react-i18next';
import Footer from '../Parties/Footer.jsx'
import Header from '../Parties/Header.jsx'
import '../Styles/APropos.css'

function APropos() {
    const { t } = useTranslation();

    return (
        <div className="about-page">
            <Header />
            <main>
                <section className="about-hero">
                    <h1 className="about-hero__title">{t('about-us.title')}</h1>
                    <svg
                        className="about-hero__wave"
                        viewBox="0 0 1440 90"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M0,32 C240,80 480,0 720,24 C960,48 1200,88 1440,40 L1440,90 L0,90 Z"
                            fill="var(--cloud-white)"
                        />
                    </svg>
                </section>
                <section className="about-content">
                    <p className="about-content__text">{t('about-us.description')}</p>
                </section>
            </main>
            <Footer />
        </div>
    )
}

export default APropos