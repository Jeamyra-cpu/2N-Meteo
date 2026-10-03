import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback, useRef } from 'react';

import Footer from '../Parties/Footer.jsx';
import Header from '../Parties/Header.jsx';

import '../Styles/Information.css';


function Information() {

    const { t } = useTranslation();

    const [ville, setVille] = useState("");
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");
    const [confirmation, setConfirmation] = useState("");

    const villeDetectee = useRef("");
    const villeModifiee = useRef(false);
    


    const recupererLocalisation = useCallback(() => {

        setChargement(true);
        setErreur("");
        setConfirmation("");
        villeModifiee.current = false;

        if (!navigator.geolocation) {

            setErreur(
                t('information.erreur1')
            );

            setChargement(false);

            return;
        }

        navigator.geolocation.getCurrentPosition(

            async (position) => {

                try {

                    const { latitude, longitude } = position.coords;

                    localStorage.setItem("latitude", latitude);
                    localStorage.setItem("longitude", longitude);

                    const response = await fetch(
                        `http://localhost:3001/api/ville/${latitude}/${longitude}`
                    );

                    if (!response.ok) {
                        throw new Error("Impossible de récupérer la ville.");
                    }
                    localStorage.setItem("deja_vu", "true");

                    const data = await response.json();

                    if (!data.ville) {
                        throw new Error("Aucune ville n'a été trouvée.");
                    }

                    villeDetectee.current = data.ville;

                    if (!villeModifiee.current) {
                        setVille(data.ville);
                    }

                } catch (error) {

                    console.error(
                        "Erreur lors de la récupération de la ville :",
                        error
                    );

                    setErreur(
                        "Impossible de récupérer votre localisation. Réessayez ou saisissez votre ville manuellement."
                    );

                } finally {

                    setChargement(false);

                }

            },

            (error) => {

                console.error("Erreur de géolocalisation :", error);

                if (error.code === error.PERMISSION_DENIED) {

                    setErreur(
                        t('information.erreur2')
                    );

                } else {

                    setErreur(
                        t('information.error')
                    );

                }

                setChargement(false);

            }

        );

    }, []);


    useEffect(() => {

        const verifierBackend = async () => {

            try {

                const response = await fetch("http://localhost:3001/api/test");

                if (!response.ok) {
                    console.error("Le serveur backend semble indisponible.");
                }

            } catch (error) {

                console.error("Impossible de contacter le backend :", error);

            }

        };

        verifierBackend();
        recupererLocalisation();

    }, [recupererLocalisation]);


    const modifierVille = (event) => {

        villeModifiee.current = true;

        setVille(event.target.value);
        setErreur("");
        setConfirmation("");

    };


    const validerVille = (event) => {

        event.preventDefault();

        const villeSaisie = ville.trim();

        if (villeSaisie === "") {
            setErreur("Veuillez saisir le nom d'une ville.");
            return;
        }

        localStorage.setItem("ville", villeSaisie);

        if (villeSaisie !== villeDetectee.current) {
            localStorage.removeItem("latitude");
            localStorage.removeItem("longitude");
        }

        setVille(villeSaisie);
        setErreur("");
        setConfirmation(`${t('information.confirmation')} : ${villeSaisie}`);

        localStorage.setItem("deja_vu", "true");

    };


    return (

        <div className="information-page">

            <Header />

            <main className="information-hero">

                <div className="information-container">

                    <section className="information-card">

                        <div className="information-location-icon">
                            📍
                        </div>

                        <h1 className="information-title">
                            {t('information.title')}
                        </h1>

                        <p className="information-subtitle">
                            {t('information.sous_titre_formulaire')}
                        </p>

                        <form onSubmit={validerVille} noValidate>

                            <div className="information-location-box">

                                <label
                                    className="information-location-label"
                                    htmlFor="ville"
                                >
                                    {t('information.label1')}
                                </label>

                                <input
                                    className="information-location-input"
                                    type="text"
                                    id="ville"
                                    name="ville"
                                    value={ville}
                                    onChange={modifierVille}
                                    placeholder={
                                        chargement
                                            ? t('information.detection')
                                            : t('information.placeholder')
                                    }
                                    autoComplete="address-level2"
                                />

                            </div>

                            {chargement && (

                                <div className="information-status">

                                    <span className="information-spinner"></span>

                                    <span>
                                        {t('information.detection')}
                                    </span>

                                </div>

                            )}

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
                                disabled={chargement || ville.trim() === ""}
                                
                                onClick={() => {
                                    window.location.href = '/Alerte';
                                }}
                            >
                                {t('information.bouton1')}

                                
                            </button>

                            {!chargement && (

                                <button
                                    type="button"
                                    className="information-button"
                                    onClick={recupererLocalisation}
                                >
                                    📍 {t('information.bouton2')}
                                </button>

                            )}

                        </form>

                        <p className="information-note">
                            {t('information.fin_formulaire')}
                        </p>

                    </section> 

                </div>

            </main>

            <Footer />

        </div>

    );

}

export default Information;