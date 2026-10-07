import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import Footer from '../Parties/Footer.jsx';
import Header from '../Parties/Header.jsx';

import '../Styles/Information.css';
import '../Styles/Alerte.css';


// Le libellé n'est plus stocké ici : il est traduit à l'affichage grâce à l'id (clé alerte.types.<id>)
const TYPES_METEO = [
    { id: "pluie", codes: [51, 53, 55, 61, 63, 65, 80, 81, 82] },
    { id: "orage", codes: [95, 96, 97, 99] },
    { id: "neige", codes: [71, 73, 75, 77, 85, 86] },
    { id: "verglas", codes: [56, 57, 66, 67] },
    { id: "brouillard", codes: [45, 48] },
    { id: "soleil", codes: [0, 1] }
];


function Alerte() {

    const { t } = useTranslation();

    const [email, setEmail] = useState("");
    const [typesChoisis, setTypesChoisis] = useState([]);
    const [envoi, setEnvoi] = useState(false);
    const [erreur, setErreur] = useState("");
    const [confirmation, setConfirmation] = useState("");


    const modifierEmail = (event) => { // Met à jour l'état de l'e-mail saisi par l'utilisateur

        setEmail(event.target.value); // Met à jour l'état de l'e-mail avec la valeur saisie par l'utilisateur .event permet d'accéder à l'événement déclenché par l'utilisateur, et target.value récupère la valeur actuelle de l'input.
        setErreur("");
        setConfirmation("");

    };


    const basculerType = (id) => {

        setTypesChoisis((precedent) =>
            precedent.includes(id)
                ? precedent.filter((element) => element !== id)
                : [...precedent, id]
        );

        setErreur("");
        setConfirmation("");

    };


    const validerAlerte = async (event) => {

        event.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire

        const emailSaisi = email.trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailSaisi)) {
            setErreur(t('alerte.erreur_email'));
            return;
        }

        if (typesChoisis.length === 0) {
            setErreur(t('alerte.erreur_type'));
            return;
        }

        const codes = TYPES_METEO
            .filter((type) => typesChoisis.includes(type.id))
            .flatMap((type) => type.codes);

        setEnvoi(true);
        setErreur("");
        setConfirmation("");

        try {

            const response = await fetch("http://localhost:3001/api/alertes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: emailSaisi,
                    types: typesChoisis,
                    codes: codes,
                    ville: localStorage.getItem("ville"),
                    latitude: localStorage.getItem("latitude"),
                    longitude: localStorage.getItem("longitude")
                })
            });

            if (!response.ok) {
                throw new Error("Impossible d'enregistrer l'alerte.");
            }

            setConfirmation(t('alerte.confirmation', { email: emailSaisi }));

        } catch (error) {

            console.error("Erreur lors de l'enregistrement de l'alerte :", error);

            setErreur(t('alerte.erreur_enregistrement'));

        } finally {

            setEnvoi(false);

        }

    };


    const sauterEtape = () => {

        setErreur("");
        setConfirmation(t('alerte.etape_ignoree'));

    };


    return (

        <div className="information-page">

            <Header />

            <main className="information-hero">

                <div className="information-container">

                    <section className="information-card">

                        <div className="information-location-icon">
                            🔔
                        </div>

                        <h1 className="information-title">
                            {t('alerte.title')}
                        </h1>

                        <p className="information-subtitle">
                            {t('alerte.subtitle')}
                        </p>

                        <form onSubmit={validerAlerte} noValidate>

                            <div className="information-location-box">

                                <label
                                    className="information-location-label"
                                    htmlFor="email"
                                >
                                    {t('alerte.label_email')}
                                </label>

                                <input
                                    className="information-location-input"
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={modifierEmail}
                                    placeholder={t('alerte.placeholder_email')}
                                    autoComplete="email"
                                />

                            </div>

                            <div className="information-location-box">

                                <span className="information-location-label">
                                    {t('alerte.label_types')}
                                </span>

                                <div className="alerte-types">

                                    {TYPES_METEO.map((type) => ( // Parcourt chaque type de météo défini dans le tableau TYPES_METEO et crée un élément d'interface utilisateur pour chaque type. Chaque élément est un label contenant une case à cocher et le libellé du type de météo. Le label a une classe CSS qui change en fonction de si le type est sélectionné ou non, ce qui permet de styliser visuellement les types choisis par l'utilisateur.

                                        <label
                                            key={type.id}
                                            className={
                                                typesChoisis.includes(type.id) // permet de vérifier si le type de météo actuel est inclus dans le tableau typesChoisis. Si c'est le cas, la classe CSS "alerte-type-actif" est ajoutée pour indiquer visuellement que ce type est sélectionné. Sinon, seule la classe "alerte-type" est appliquée.
                                                    ? "alerte-type alerte-type-actif"
                                                    : "alerte-type"
                                            }
                                        >

                                            <input
                                                type="checkbox"
                                                checked={typesChoisis.includes(type.id)}
                                                onChange={() => basculerType(type.id)} // permet de basculer l'état de sélection du type de météo lorsque l'utilisateur clique sur la case à cocher. Si le type est déjà sélectionné, il sera désélectionné, et vice versa.
                                            />

                                            <span>{t(`alerte.types.${type.id}`)}</span>

                                        </label>

                                    ))}

                                </div>

                            </div>

                            {erreur && (

                                <div className="information-error">
                                    {erreur}
                                </div>

                            )}

                            {confirmation && (

                                <div className="information-status">
                                    <span>{confirmation}</span>
                                </div>

                            )}

                            <button
                                type="submit"
                                className="information-button"
                                disabled={envoi} // Désactive le bouton pendant l'envoi pour éviter les soumissions multiples
                            >
                                {envoi ? t('alerte.bouton_envoi') : t('alerte.bouton_activer')} {/* Si envoi est true, le texte d'enregistrement est affiché pour indiquer que le formulaire est en cours d'envoi. Sinon, le texte d'activation est affiché pour inviter l'utilisateur à soumettre le formulaire. */}
                            </button>

                            <button
                                type="button"
                                className="information-button alerte-bouton-secondaire"
                                onClick={sauterEtape}
                                disabled={envoi}
                            >
                                {t('alerte.bouton_sauter')}
                            </button>

                        </form>

                        <p className="information-note">
                            {t('alerte.note')}
                        </p>

                    </section>

                </div>

            </main>

            <Footer />

        </div>

    );

}

export default Alerte;