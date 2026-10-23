import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft, Bike, Calendar, Car, Clock, Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow,
  Droplets, Eye, Footprints, Gauge, Glasses, Lightbulb, MapPin, Moon, Shirt, ShieldCheck, Sun,
  Thermometer, Umbrella, Zap,
} from "lucide-react";
import Header from '../Parties/Header.jsx';
import Footer from '../Parties/Footer.jsx';
import "../Styles/Conseils.css";

const CONDITIONS = {
  soleil: { nom: "Ensoleillé" },
  nuageux: { nom: "Nuageux" },
  pluie: { nom: "Pluvieux" },
  orage: { nom: "Orageux" },
  neige: { nom: "Neigeux" },
  brouillard: { nom: "Brumeux" },
};

// Icône de moto dessinée ici, pour ne pas dépendre de la version de lucide-react.
function IconeMoto({ size = 24, strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5" cy="17" r="3" />
      <circle cx="19" cy="17" r="3" />
      <path d="M5 17l4-6h6l4 6" />
      <path d="M15 11l-1-4h3" />
      <path d="M9 11l-1-2H6" />
    </svg>
  );
}

const VEHICULES = [
  { id: "voiture", nom: "Voiture", icone: Car },
  { id: "moto", nom: "Moto", icone: IconeMoto },
  { id: "velo", nom: "Vélo", icone: Bike },
];

const NIVEAUX = {
  faible: "Conditions plutôt favorables",
  modere: "Restez vigilant",
  eleve: "Prudence renforcée",
};

// Nombre de barres allumées dans la jauge de risque.
const RANG_NIVEAU = {
  faible: 1,
  modere: 2,
  eleve: 3,
};

function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Traduit un code météo Open-Meteo (envoyé par la page Météo) en type de temps de cette page.
// Les regroupements suivent ceux de la page Météo : même code, même type de temps.
function conditionDepuisCode(code) {
  if (code === 0) return "soleil";
  if (code <= 3) return "nuageux";
  if (code <= 48) return "brouillard";
  if (code <= 67 || (code >= 80 && code <= 82)) return "pluie";
  if (code <= 77 || (code >= 85 && code <= 86)) return "neige";
  if (code >= 95) return "orage";
  return "nuageux";
}

function calculerMeteo(ville, date, heure, tempReelle = null, codeReel = null) {
  const mois = date.getMonth();
  const saisonnier = [4, 5, 9, 12, 16, 20, 23, 23, 19, 14, 8, 5][mois];
  const aleatoire = hashString(ville.toLowerCase() + date.toDateString());
  const secondAleatoire = hashString(String(aleatoire) + "x");
  const diurne = Math.round(-4 * Math.cos(((heure - 3) / 24) * 2 * Math.PI));
  const temp = tempReelle !== null
    ? Math.round(tempReelle)
    : saisonnier + diurne + ((aleatoire % 9) - 4);

  let condition;

  if (Number.isInteger(codeReel)) {
    condition = conditionDepuisCode(codeReel);
  } else {
    const valeurCondition = secondAleatoire % 100;
    if (temp <= 1 && valeurCondition < 45) condition = "neige";
    else if (valeurCondition < 32) condition = "soleil";
    else if (valeurCondition < 55) condition = "nuageux";
    else if (valeurCondition < 78) condition = "pluie";
    else if (valeurCondition < 88) condition = temp >= 14 ? "orage" : "pluie";
    else condition = "brouillard";
  }

  return { condition, temp };
}

// Chaque conseil a une icône (icone) et un texte.
function calculerConseils(condition, temp, nuit, t) {
  const conseilsParCondition = {
    soleil: [
      { icone: Glasses, texte: t('advicePage.tips.sunny.1') },
      { icone: Droplets, texte: t('advicePage.tips.sunny.2') },
    ],
    nuageux: [
      { icone: Shirt, texte: t('advicePage.tips.cloudy.1') },
      { icone: Glasses, texte: t('advicePage.tips.cloudy.2') },
    ],
    pluie: [
      { icone: Umbrella, texte: t('advicePage.tips.rain.1') },
      { icone: Footprints, texte: t('advicePage.tips.rain.2') },
    ],
    orage: [
      { icone: Zap, texte: t('advicePage.tips.storm.1') },
      { icone: ShieldCheck, texte: t('advicePage.tips.storm.2') },
    ],
    neige: [
      { icone: Shirt, texte: t('advicePage.tips.snow.1') },
      { icone: Footprints, texte: t('advicePage.tips.snow.2') },
    ],
    brouillard: [
      { icone: Lightbulb, texte: t('advicePage.tips.fog.1') },
      { icone: Eye, texte: t('advicePage.tips.fog.2') },
    ],
  };
  const conseils = [...conseilsParCondition[condition]];
  if (temp >= 28) conseils.push({ icone: Thermometer, texte: t('advicePage.tips.heat') });
  else if (temp <= 5 && condition !== "neige") conseils.push({ icone: Thermometer, texte: t('advicePage.tips.cold') });
  if (nuit) conseils.push({ icone: Moon, texte: t('advicePage.tips.night') });
  return conseils;
}

function conseilsVehicule(vehicule, condition, temp, nuit, t) {
  const niveau = condition === "soleil" && temp > 5
    ? "faible"
    : condition === "orage" || condition === "neige" || condition === "brouillard"
      ? "eleve"
      : "modere";
  const items = [];

  if (condition === "pluie" || condition === "orage") {
    items.push({ icone: Droplets, t: t('advicePage.route.grip'), d: t('advicePage.route.gripDesc'), n: "attention" });
  }
  if (condition === "neige" || condition === "brouillard") {
    items.push({ icone: Eye, t: t('advicePage.route.visibility'), d: t('advicePage.route.visibilityDesc'), n: "danger" });
  }
  if (nuit) {
    items.push({ icone: Moon, t: t('advicePage.route.night'), d: t('advicePage.route.nightDesc'), n: "attention" });
  }
  if (vehicule === "moto") {
    items.push({ icone: ShieldCheck, t: t('advicePage.route.equipment'), d: t('advicePage.route.motoDesc'), n: "attention" });
  } else if (vehicule === "velo") {
    items.push({ icone: ShieldCheck, t: t('advicePage.route.equipment'), d: t('advicePage.route.bikeDesc'), n: "attention" });
  } else {
    items.push({ icone: Gauge, t: t('advicePage.route.driving'), d: t('advicePage.route.drivingDesc'), n: "conseil" });
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
  const icones = {
    soleil: nuit ? Moon : Sun,
    nuageux: Cloud,
    pluie: CloudRain,
    orage: CloudLightning,
    neige: CloudSnow,
    brouillard: CloudFog,
  };
  const Icone = icones[condition];
  return (
    <div className="cv-illu-badge" role="img" aria-label={`${CONDITIONS[condition].nom}, ${temp} degrés`}>
      <Icone size={66} strokeWidth={1.5} aria-hidden="true" />
    </div>
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

function phraseBonhomme(condition, temp, t) {
  if (condition === "pluie" || condition === "orage") return t('advicePage.outfit.rain');
  if (condition === "neige") return t('advicePage.outfit.snow');
  if (temp >= 28) return t('advicePage.outfit.heat');
  if (temp <= 5) return t('advicePage.outfit.cold');
  return t('advicePage.outfit.default');
}

export default function Conseils({ theme = 'light', onToggleTheme = () => {} }) {
  const { t, i18n } = useTranslation();
  const { state } = useLocation();

  // La page Météo transmet : ville, température, code météo et, pour un autre jour que
  // aujourd'hui, la date (AAAA-MM-JJ). Sans cela (page rechargée), on relit la ville du localStorage.
  const villeStockee = localStorage.getItem("ville") || "";
  const ville = (typeof state?.ville === "string" ? state.ville : "").trim() || villeStockee.trim() || "Paris";
  const tempTransmise = Number.isFinite(state?.temperature) ? state.temperature : null;
  const codeTransmis = Number.isInteger(state?.code) ? state.code : null;
  const dateTransmise = typeof state?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(state.date) ? state.date : null;

  const [vehicule, setVehicule] = useState("voiture");

  // Aujourd'hui : date et heure réelles. Autre jour : la date transmise, à midi.
  const maintenant = useMemo(() => {
    const aujourdhui = todayStr();
    const estAujourdhui = !dateTransmise || dateTransmise === aujourdhui;

    return {
      date: estAujourdhui ? aujourdhui : dateTransmise,
      heure: estAujourdhui ? nowStr() : "12:00",
      estAujourdhui,
    };
  }, [dateTransmise]);

  const localeDate = i18n.language?.startsWith("en") ? "en-US" : "fr-FR";

  const resultat = useMemo(() => {
    const d = new Date(`${maintenant.date}T12:00:00`);
    const [hStr, mStr] = maintenant.heure.split(":");
    const h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    const nuit = h < 7 || h >= 21;
    const tempValide = tempTransmise !== null;
    const codeValide = codeTransmis !== null;

    const { condition, temp } = calculerMeteo(ville, d, h, tempValide ? tempTransmise : null, codeValide ? codeTransmis : null);

    const conseils = calculerConseils(condition, temp, nuit, t);
    const route = conseilsVehicule(vehicule, condition, temp, nuit, t);
    const dateTexte = d.toLocaleDateString(localeDate, { weekday: "long", day: "numeric", month: "long" });
    return { dateTexte, h, m, nuit, condition, temp, conseils, route, tempValide, codeValide, estAujourdhui: maintenant.estAujourdhui };
  }, [maintenant, ville, tempTransmise, codeTransmis, vehicule, t, localeDate]);

  let noteSource;
  if (resultat.tempValide && resultat.codeValide) {
    noteSource = t('advicePage.source.tempAndWeather');
  } else if (resultat.tempValide) {
    noteSource = t('advicePage.source.tempOnly');
  } else if (resultat.codeValide) {
    noteSource = t('advicePage.source.weatherOnly');
  } else {
    noteSource = t('advicePage.source.simulated');
  }

  const heureTexte = `${String(resultat.h).padStart(2, "0")}h${String(resultat.m).padStart(2, "0")}`;

  return (
    <>
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <div className="meteo-app">
        <div className="cv-wrap">
          <div className="cv-retour-zone">
            <Link to="/meteo" className="cv-retour-link">
              <ArrowLeft size={16} aria-hidden="true" />
              {t('advicePage.backToWeather')}
            </Link>
          </div>

          <section className="cv-hero">
            <div className="cv-hero-haut">
              <div>
                <span className="cv-kicker">{resultat.estAujourdhui ? t('advicePage.adviceOfDay') : t('advicePage.adviceOfTheDay')}</span>
                <p className="cv-lieu"><MapPin size={19} aria-hidden="true" />{ville}</p>
                <div className="cv-temperature">{resultat.temp}<span>°C</span></div>
                <p className="cv-condition">{t(`advicePage.conditions.${resultat.condition}`)}</p>
              </div>
              <div className="cv-illu">
                <IllustrationMeteo condition={resultat.condition} temp={resultat.temp} nuit={resultat.nuit} />
              </div>
            </div>

            <div className="cv-hero-bas">
              <div>
                <Calendar size={19} aria-hidden="true" />
                <span>{t('advicePage.date')}</span>
                <strong>{resultat.dateTexte}</strong>
              </div>
              <div>
                <Clock size={19} aria-hidden="true" />
                <span>{resultat.estAujourdhui ? t('advicePage.time') : t('advicePage.type')}</span>
                <strong>{resultat.estAujourdhui ? heureTexte : t('advicePage.forecastOfTheDay')}</strong>
              </div>
              {resultat.estAujourdhui && (
                <div>
                  {resultat.nuit ? <Moon size={19} aria-hidden="true" /> : <Sun size={19} aria-hidden="true" />}
                  <span>{t('advicePage.moment')}</span>
                  <strong>{resultat.nuit ? t('advicePage.night') : t('advicePage.day')}</strong>
                </div>
              )}
            </div>
          </section>

          <div className="cv-grille">
            <aside className="cv-tenue" aria-label={t('advicePage.yourOutfit')}>
              <span className="cv-kicker">{t('advicePage.yourOutfit')}</span>
              <p className="cv-bulle">{phraseBonhomme(resultat.condition, resultat.temp, t)}</p>
              <div className="cv-bonhomme-wrapper">
                <BonhommeGrand condition={resultat.condition} temp={resultat.temp} nuit={resultat.nuit} />
              </div>
            </aside>

            <div className="cv-colonne">
              <section className="cv-bloc" aria-labelledby="cv-titre-conseils">
                <span className="cv-kicker">{t('advicePage.toPlan')}</span>
                <h2 id="cv-titre-conseils">{t('advicePage.ourAdvice')}</h2>
                <ul className={`cv-conseils-list cv-ton-${resultat.condition}`}>
                  {resultat.conseils.map((c, i) => {
                    const Icone = c.icone;
                    return (
                      <li className="cv-conseil" key={i}>
                        <span className="cv-icone"><Icone size={20} strokeWidth={1.8} aria-hidden="true" /></span>
                        <p>{c.texte}</p>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="cv-bloc" aria-labelledby="cv-titre-veh">
                <span className="cv-kicker">{t('advicePage.onRoad')}</span>
                <h2 id="cv-titre-veh">{t('advicePage.vehicleQuestion')}</h2>
                <p className="cv-aide">{t('advicePage.vehicleHint')}</p>

                <div className="cv-onglets" role="tablist" aria-label={t('advicePage.vehicleType')}>
                  {VEHICULES.map((v) => {
                    const Icone = v.icone;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        role="tab"
                        className="cv-onglet"
                        aria-selected={vehicule === v.id}
                        onClick={() => setVehicule(v.id)}
                      >
                        <Icone size={18} strokeWidth={1.8} />
                        <span>{t(`advicePage.vehicle.${v.id}`)}</span>
                      </button>
                    );
                  })}
                </div>

                <div className={`cv-risque cv-risque--${resultat.route.niveau}`}>
                  <span className="cv-jauge" aria-hidden="true">
                    {[0, 1, 2].map((n) => (
                      <i key={n} className={n < RANG_NIVEAU[resultat.route.niveau] ? "on" : ""} />
                    ))}
                  </span>
                  {t(`advicePage.risk.${resultat.route.niveau}`)}
                </div>

                <ul className="cv-liste">
                  {resultat.route.items.map((it, i) => {
                    const Icone = it.icone;
                    return (
                      <li key={vehicule + i} className={`cv-item cv-item--${it.n}`}>
                        <span className="cv-icone"><Icone size={20} strokeWidth={1.8} aria-hidden="true" /></span>
                        <b>{it.t}</b>
                        <p>{it.d}</p>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          </div>

          <p className="meteo-note">
            {noteSource}{" "}
            {t('advicePage.roadRules')}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
