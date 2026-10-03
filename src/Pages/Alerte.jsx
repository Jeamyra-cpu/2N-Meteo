import { useState } from 'react';

import Footer from '../Parties/Footer.jsx';
import Header from '../Parties/Header.jsx';

import '../Styles/Information.css';
import '../Styles/Alerte.css';


const TYPES_METEO = [
    { id: "pluie", libelle: "Pluie", codes: [51, 53, 55, 61, 63, 65, 80, 81, 82] },
    { id: "orage", libelle: "Orage", codes: [95, 96, 97, 99] },
    { id: "neige", libelle: "Neige", codes: [71, 73, 75, 77, 85, 86] },
    { id: "verglas", libelle: "Pluie verglaçante", codes: [56, 57, 66, 67] },
    { id: "brouillard", libelle: "Brouillard", codes: [45, 48] },
    { id: "soleil", libelle: "Ciel dégagé", codes: [0, 1] }
];


function Alerte() {

    const [email, setEmail] = useState("");
    const [typesChoisis, setTypesChoisis] = useState([]);
    const [envoi, setEnvoi] = useState(false);
    const [erreur, setErreur] = useState("");
    const [confirmation, setConfirmation] = useState("");


    const modifierEmail = (event) => {

        setEmail(event.target.value);
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

        event.preventDefault();

        const emailSaisi = email.trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailSaisi)) {
            setErreur("Veuillez saisir une adresse e-mail valide.");
            return;
        }

        if (typesChoisis.length === 0) {
            setErreur("Veuillez sélectionner au moins un type de météo.");
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

            setConfirmation(`Alertes activées pour ${emailSaisi}`);

        } catch (error) {

            console.error("Erreur lors de l'enregistrement de l'alerte :", error);

            setErreur(
                "Impossible d'enregistrer vos alertes pour le moment. Veuillez réessayer."
            );

        } finally {

            setEnvoi(false);

        }

    };


    const sauterEtape = () => {

        setErreur("");
        setConfirmation("Étape ignorée. Vous pourrez activer les alertes plus tard.");

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
                            Alertes météo par e-mail
                        </h1>

                        <p className="information-subtitle">
                            Recevez un e-mail lorsque le type de météo
                            que vous avez choisi est prévu pour votre ville.
                        </p>

                        <form onSubmit={validerAlerte} noValidate>

                            <div className="information-location-box">

                                <label
                                    className="information-location-label"
                                    htmlFor="email"
                                >
                                    Votre adresse e-mail
                                </label>

                                <input
                                    className="information-location-input"
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={modifierEmail}
                                    placeholder="exemple@mail.com"
                                    autoComplete="email"
                                />

                            </div>

                            <div className="information-location-box">

                                <span className="information-location-label">
                                    Types de météo à surveiller
                                </span>

                                <div className="alerte-types">

                                    {TYPES_METEO.map((type) => (

                                        <label
                                            key={type.id}
                                            className={
                                                typesChoisis.includes(type.id)
                                                    ? "alerte-type alerte-type-actif"
                                                    : "alerte-type"
                                            }
                                        >

                                            <input
                                                type="checkbox"
                                                checked={typesChoisis.includes(type.id)}
                                                onChange={() => basculerType(type.id)}
                                            />

                                            <span>{type.libelle}</span>

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
                                disabled={envoi}
                            >
                                {envoi ? "Enregistrement..." : "Activer mes alertes"}
                            </button>

                            <button
                                type="button"
                                className="information-button alerte-bouton-secondaire"
                                onClick={sauterEtape}
                                disabled={envoi}
                            >
                                Non, sauter cette étape
                            </button>

                        </form>

                        <p className="information-note">
                            Votre adresse e-mail est utilisée uniquement
                            pour vous envoyer les alertes météo que vous avez
                            choisies. Vous pouvez modifier ces choix à tout moment.
                        </p>

                    </section>

                </div>

            </main>

            <Footer />

        </div>

    );

}

export default Alerte;