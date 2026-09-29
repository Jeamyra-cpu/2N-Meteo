import { useTranslation } from 'react-i18next';
import Footer from '../Parties/Footer.jsx'
import Header from '../Parties/Header.jsx'
import '../Styles/Politique.css'

const SECTIONS = [
  { id: 'introduction', label: 'privacy-policy.introduction', content: 'privacy-policy.content' },
  { id: 'data-collected', label: 'privacy-policy.data-collected', content: 'privacy-policy.data-collected-content' },
  { id: 'localisation', label: 'privacy-policy.localisation', content: 'privacy-policy.localisation-content' },
  { id: 'meteo-data', label: 'privacy-policy.meteo-data', content: 'privacy-policy.meteo-data-content' },
  { id: 'other-services', label: 'privacy-policy.other-services', content: 'privacy-policy.other-services-content' },
  { id: 'cookies', label: 'privacy-policy.cookies', content: 'privacy-policy.cookies-content' },
  { id: 'data-retention', label: 'privacy-policy.data-retention', content: 'privacy-policy.data-retention-content' },
  { id: 'security', label: 'privacy-policy.security', content: 'privacy-policy.security-content' },
  { id: 'rights', label: 'privacy-policy.rights', content: 'privacy-policy.rights-content' },
]

function Politique() {
    const { t } = useTranslation();

    return (
        <div className="privacy-policy-page">
            <Header />
            <main>
                <section className="privacy-hero">
                    <h1 className="privacy-hero__title">{t('privacy-policy.title')}</h1>
                </section>

                <div className="privacy-layout">
                    <nav className="privacy-toc" aria-label="Sommaire">
                        <ol>
                            {SECTIONS.map((section) => (
                                <li key={section.id}>
                                    <a href={`#${section.id}`}>{t(section.label)}</a>
                                </li>
                            ))}
                        </ol>
                    </nav>

                    <article className="privacy-body">
                        {SECTIONS.map((section) => (
                            <section key={section.id} id={section.id} className="privacy-section">
                                <h2>{t(section.label)}</h2>
                                <p>{t(section.content)}</p>
                            </section>
                        ))}
                    </article>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default Politique