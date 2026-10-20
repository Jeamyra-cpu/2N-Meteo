import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../Styles/Conseils.css";

const CONDITIONS = {
  soleil: { nom: "Ensoleillé" },
  nuageux: { nom: "Nuageux" },
  pluie: { nom: "Pluvieux" },
  orage: { nom: "Orageux" },
  neige: { nom: "Neigeux" },
  brouillard: { nom: "Brumeux" },
};

const VEHICULES = [
  { id: "voiture", nom: "Voiture" },
  { id: "moto", nom: "Moto" },
  { id: "velo", nom: "Vélo" },
];

const NIVEAUX = {
  faible: "Conditions plutôt favorables",
  modere: "Restez vigilant",
  eleve: "Prudence renforcée",
};

function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function calculerMeteo(ville, date, heure, tempReelle = null) {
  const mois = date.getMonth();
  const saisonnier = [4, 5, 9, 12, 16, 20, 23, 23, 19, 14, 8, 5][mois];
  const aleatoire = hashString(ville.toLowerCase() + date.toDateString());
  const secondAleatoire = hashString(String(aleatoire) + "x");
  const diurne = Math.round(-4 * Math.cos(((heure - 3) / 24) * 2 * Math.PI));
  const temp = tempReelle !== null
    ? Math.round(tempReelle)
    : saisonnier + diurne + ((aleatoire % 9) - 4);

  const valeurCondition = secondAleatoire % 100;
  let condition;
  if (temp <= 1 && valeurCondition < 45) condition = "neige";
  else if (valeurCondition < 32) condition = "soleil";
  else if (valeurCondition < 55) condition = "nuageux";
  else if (valeurCondition < 78) condition = "pluie";
  else if (valeurCondition < 88) condition = temp >= 14 ? "orage" : "pluie";
  else condition = "brouillard";

  return { condition, temp };
}

function calculerConseils(condition, temp, nuit) {
  const conseilsParCondition = {
    soleil: ["Mettez de la crème solaire et des lunettes de soleil.", "Buvez régulièrement de l'eau."],
    nuageux: ["Prenez une petite veste, au cas où.", "Gardez vos lunettes à portée si le ciel se dégage."],
    pluie: ["Emportez un parapluie ou un imperméable.", "Choisissez des chaussures étanches."],
    orage: ["Évitez les zones dégagées et les sorties en forêt.", "Mettez-vous à l'abri pendant l'orage."],
    neige: ["Habillez-vous en plusieurs couches, avec bonnet et gants.", "Attention aux trottoirs glissants."],
    brouillard: ["Allumez vos feux de croisement.", "Portez un vêtement visible si vous marchez."],
  };
  const conseils = [...conseilsParCondition[condition]];
  if (temp >= 28) conseils.push("Il fait très chaud : évitez les efforts aux heures les plus chaudes.");
  else if (temp <= 5 && condition !== "neige") conseils.push("Il fait froid : pensez au manteau et à l'écharpe.");
  if (nuit) conseils.push("Il fait nuit : soyez bien visible si vous êtes à pied ou à vélo.");
  return conseils;
}

function conseilsVehicule(vehicule, condition, temp, nuit) {
  const niveau = condition === "soleil" && temp > 5
    ? "faible"
    : condition === "orage" || condition === "neige" || condition === "brouillard"
      ? "eleve"
      : "modere";
  const items = [];

  if (condition === "pluie" || condition === "orage") {
    items.push({ t: "Adhérence", d: "Réduisez votre vitesse et augmentez les distances de sécurité.", n: "attention" });
  }
  if (condition === "neige" || condition === "brouillard") {
    items.push({ t: "Visibilité", d: "Rendez-vous visible et adaptez votre allure aux conditions.", n: "danger" });
  }
  if (nuit) {
    items.push({ t: "De nuit", d: "Vérifiez votre éclairage avant de partir.", n: "attention" });
  }
  if (vehicule === "moto") {
    items.push({ t: "Équipement", d: "Portez un équipement protecteur et restez particulièrement prudent sur chaussée humide.", n: "attention" });
  } else if (vehicule === "velo") {
    items.push({ t: "Équipement", d: "Portez un casque et assurez-vous d'être visible des autres usagers.", n: "attention" });
  } else {
    items.push({ t: "Conduite", d: "Gardez une bonne distance avec le véhicule qui vous précède.", n: "conseil" });
  }
  return { niveau, items };
}

function todayStr() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function nowStr() {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function IllustrationMeteo({ condition, temp, nuit }) {
  const symboles = {
    soleil: "☀",
    nuageux: "☁",
    pluie: "☂",
    orage: "ϟ",
    neige: "❄",
    brouillard: "≋",
  };
  return (
    <svg className="cv-illustration-meteo" viewBox="0 0 120 100" role="img" aria-label={`${CONDITIONS[condition].nom}, ${temp} degrés`}>
      <circle cx="60" cy="50" r="43" fill={nuit ? "#1b3555" : "#fff2d8"} />
      <text x="60" y="66" textAnchor="middle" fontSize="46" fill={nuit ? "#eef4fa" : "#e8a33d"}>{symboles[condition]}</text>
    </svg>
  );
}

function BonhommeGrand({ condition, temp, nuit }) {
  const manteau = condition === "pluie" || condition === "orage"
    ? "#e8a33d"
    : condition === "neige" || temp <= 5
      ? "#397b91"
      : condition === "soleil" || temp >= 25
        ? "#e88755"
        : "#536b89";
  const pantalon = nuit ? "#263a55" : "#34475d";
  const echarpe = condition === "neige" || temp <= 5;
  const parapluie = condition === "pluie" || condition === "orage";

  return (
    <svg className="cv-bonhomme" viewBox="0 0 200 230" role="img" aria-label={`Personnage habillé pour ${CONDITIONS[condition].nom.toLowerCase()} à ${temp} degrés`}>
      <defs>
        <linearGradient id="cv-veste" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={manteau} />
          <stop offset="100%" stopColor={nuit ? "#263b57" : "#334d69"} />
        </linearGradient>
      </defs>
      <ellipse cx="101" cy="211" rx="48" ry="8" fill="#18283a" opacity=".12" />

      {condition === "soleil" && (
        <g className="cv-soleil" aria-hidden="true" stroke="#e8a33d" strokeWidth="3" strokeLinecap="round">
          <circle cx="155" cy="43" r="13" fill="#ffe4a8" stroke="none" />
          <path d="M155 20v-6m0 58v-6m23-23h6m-58 0h6m39-16 5-5m-41 41 5-5m31 0 5 5m-41-41 5 5" />
        </g>
      )}
      {condition === "neige" && (
        <g aria-hidden="true" fill="#8fc9df" fontSize="17" fontWeight="600">
          <text x="32" y="68">✳</text><text x="153" y="105">✳</text><text x="40" y="150">✳</text>
        </g>
      )}
      {condition === "brouillard" && (
        <g aria-hidden="true" fill="none" stroke="#9aabba" strokeWidth="3" strokeLinecap="round">
          <path d="M28 66h27m-34 10h32m107-12h21m-27 10h31" />
        </g>
      )}
      {parapluie && (
        <g aria-hidden="true">
          <path d="M35 76Q39 37 75 37q36 0 40 39-10-11-20 0-10-11-20 0-10-11-20 0-10-11-20 0Z" fill={condition === "orage" ? "#6075a5" : "#4389a8"} />
          <path d="M75 38v54q0 11-9 11" fill="none" stroke="#35475b" strokeWidth="4" strokeLinecap="round" />
          <path d="M48 50q-8 12-8 21m26-29q-9 11-10 22m34-18q8 10 9 20" fill="none" stroke="#ffffff" strokeWidth="2" opacity=".55" />
        </g>
      )}

      <path d="M77 75q23-18 46 0l-3 28H79Z" fill="#49352f" />
      <ellipse cx="100" cy="77" rx="23" ry="27" fill="#f1c7a2" />
      <path d="M78 70q2-25 24-25 19 0 22 22-9-8-17-12-11 10-29 10Z" fill="#49352f" />
      <path d="M82 77q3-3 7 0m21 0q3-3 7 0" fill="none" stroke="#49352f" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="87" cy="82" r="1.8" fill="#263546" /><circle cx="113" cy="82" r="1.8" fill="#263546" />
      <path d="M95 87q5 5 10 0" fill="none" stroke="#a75b51" strokeWidth="2" strokeLinecap="round" />
      <circle cx="82" cy="86" r="4" fill="#e99987" opacity=".55" /><circle cx="118" cy="86" r="4" fill="#e99987" opacity=".55" />

      <path d="M88 101v9h24v-9" fill="#e8b590" />
      <path d="M73 111q27-17 54 0l9 49q-36 15-72 0Z" fill="url(#cv-veste)" />
      <path d="m84 107 16 18 16-18 8 5-12 22h-24l-12-22Z" fill="#f4f0e8" />
      <path d="M100 125v34m-4-22h8" fill="none" stroke="#e8d9c5" strokeWidth="2" />

      {echarpe && (
        <g>
          <path d="M81 105q19 11 38 0l-2 10q-18 9-35 0Z" fill="#e16c58" />
          <path d="M108 111h8v22q-4 4-8 0Z" fill="#e16c58" />
        </g>
      )}

      {parapluie ? (
        <g fill="none" stroke="url(#cv-veste)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
          <path d="M77 119 63 91 69 77" />
          <circle cx="69" cy="76" r="5" fill="#f1c7a2" stroke="none" />
        </g>
      ) : (
        <g fill="none" stroke="url(#cv-veste)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
          <path d="m76 119-13 25 4 9" />
          <path d="m124 119 13 25-4 9" />
          <circle cx="67" cy="154" r="5" fill="#f1c7a2" stroke="none" />
          <circle cx="133" cy="154" r="5" fill="#f1c7a2" stroke="none" />
        </g>
      )}

      <path d="M82 158h16l-3 34-3 9H76l2-9Z" fill={pantalon} />
      <path d="M102 158h16l4 34 3 9h-16l-3-9Z" fill={pantalon} />
      <path d="M74 197q10-4 19 0l-1 8H69q0-5 5-8Zm36 0q9-4 18 0l5 8h-23Z" fill="#39404a" />
      <path d="M73 203h18m37 0h-17" stroke="#f3eee5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function phraseBonhomme(condition, temp) {
  if (condition === "pluie" || condition === "orage") return "Pensez à vous protéger de la pluie.";
  if (condition === "neige") return "Couvrez-vous bien et marchez prudemment.";
  if (temp >= 28) return "Pensez à boire régulièrement.";
  if (temp <= 5) return "Une couche chaude sera la bienvenue.";
  return "Adaptez votre tenue à la météo du jour.";
}

export default function Conseils() {
  // Données envoyées par la page Météo via <Link state={{ ville, temperature }}>
  const { state } = useLocation();
  const ville = (typeof state?.ville === "string" ? state.ville : "").trim() || "Paris";
  const tempTransmise = Number.isFinite(state?.temperature) ? state.temperature : null;

  const [vehicule, setVehicule] = useState("voiture");

  // Date et heure figées à l'ouverture de la page
  const maintenant = useMemo(() => ({ date: todayStr(), heure: nowStr() }), []);

  const resultat = useMemo(() => {
    const d = new Date(`${maintenant.date}T12:00:00`);
    const [hStr, mStr] = maintenant.heure.split(":");
    const h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    const nuit = h < 7 || h >= 21;
    const tempValide = tempTransmise !== null;

    const { condition, temp } = calculerMeteo(ville, d, h, tempValide ? tempTransmise : null);

    const conseils = calculerConseils(condition, temp, nuit);
    const route = conseilsVehicule(vehicule, condition, temp, nuit);
    const dateTexte = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    return { dateTexte, h, m, nuit, condition, temp, conseils, route, tempValide };
  }, [maintenant, ville, tempTransmise, vehicule]);

  return (
    <>
      <div className="meteo-app">
        <div className="cv-retour-zone">
          <Link to="/meteo" className="meteo-bouton cv-retour">← Retour à la météo</Link>
        </div>

        {/* En-tête : météo du moment + illustration */}
        <section className="meteo-carte cv-entete">
          <div>
            <div className="meteo-badge">
              <span className="point" />
              <b>{resultat.temp}°C</b>
              <span>{CONDITIONS[resultat.condition].nom}</span>
            </div>
            <p className="meteo-lieu">
              {ville} – {resultat.dateTexte} à {String(resultat.h).padStart(2, "0")}h
              {String(resultat.m).padStart(2, "0")} ({resultat.nuit ? "nuit" : "jour"})
            </p>
          </div>
          <div className="cv-illu">
            <IllustrationMeteo condition={resultat.condition} temp={resultat.temp} nuit={resultat.nuit} />
          </div>
        </section>

        <div className="cv-grille">
          {/* Colonne gauche : le bonhomme */}
          <div className="meteo-carte meteo-illustration">
            <p className="cv-bulle">{phraseBonhomme(resultat.condition, resultat.temp)}</p>
            <BonhommeGrand condition={resultat.condition} temp={resultat.temp} nuit={resultat.nuit} />
          </div>

          {/* Colonne droite : conseils généraux puis véhicule */}
          <div className="cv-colonne">
            <section className="meteo-carte cv-conseils-carte">
              <h2>Nos conseils</h2>
              <ul>
                {resultat.conseils.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </section>

            <section className="meteo-carte cv-panneau" aria-labelledby="cv-titre-veh">
              <h2 id="cv-titre-veh">Vous prenez un véhicule ?</h2>
              <p className="cv-aide">Choisissez le vôtre pour voir les précautions adaptées à la météo.</p>

              <div className="cv-onglets" role="tablist" aria-label="Type de véhicule">
                {VEHICULES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    role="tab"
                    className="cv-onglet"
                    aria-selected={vehicule === v.id}
                    onClick={() => setVehicule(v.id)}
                  >
                    {v.nom}
                  </button>
                ))}
              </div>

              <p className={`cv-risque cv-risque--${resultat.route.niveau}`}>{NIVEAUX[resultat.route.niveau]}</p>

              <ul className="cv-liste">
                {resultat.route.items.map((it, i) => (
                  <li key={vehicule + i} className={`cv-item cv-item--${it.n}`}>
                    <b>{it.t}</b>
                    <span>{it.d}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <p className="meteo-note">
          {resultat.tempValide
            ? "La température provient de la page Météo ; le type de temps affiché est simulé."
            : "Les valeurs sont simulées à partir de la ville, de la date et de l'heure : ce composant n'accède pas à un service météo en direct."}{" "}
          Les conseils véhicule suivent le code de la route français.
        </p>
      </div>
    </>
  );
}