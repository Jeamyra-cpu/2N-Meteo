import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import "../Styles/conseils.css";
// Header et Footer sont déjà affichés par App.jsx : on ne les réimporte pas ici.

// Ce composant reprend la charte graphique du site : marine / orange,
// Bricolage Grotesque pour les titres, IBM Plex Sans pour le texte,
// boutons plats à coins carrés, bordures fines. Si ces variables et ces
// polices sont déjà déclarées globalement sur le site, ce bloc les
// redéclare simplement au niveau du composant (sans effet de bord).


// --- Logique météo (déterministe à partir de ville + date + heure) ---

const CONDITIONS = {
  soleil: { nom: "Ensoleillé" },
  nuageux: { nom: "Nuageux" },
  pluie: { nom: "Pluvieux" },
  orage: { nom: "Orageux" },
  neige: { nom: "Neigeux" },
  brouillard: { nom: "Brumeux" },
};

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function calculerMeteo(ville, date, heure, tempReelle = null) {
  const mois = date.getMonth();
  const saisonnier = [4, 5, 9, 12, 16, 20, 23, 23, 19, 14, 8, 5][mois];
  const r = hashString(ville.toLowerCase() + date.toDateString());
  const r2 = hashString(String(r) + "x");
  const diurne = Math.round(-4 * Math.cos(((heure - 3) / 24) * 2 * Math.PI));
  // Si la vraie température a été transmise par la page Météo, on l'utilise ;
  // sinon on garde la valeur simulée.
  const temp = tempReelle != null
    ? Math.round(tempReelle)
    : saisonnier + diurne + ((r % 9) - 4);

  const k = r2 % 100;
  let condition;
  if (temp <= 1 && k < 45) condition = "neige";
  else if (k < 32) condition = "soleil";
  else if (k < 55) condition = "nuageux";
  else if (k < 78) condition = "pluie";
  else if (k < 88) condition = temp >= 14 ? "orage" : "pluie";
  else condition = "brouillard";

  return { condition, temp };
}

function estBonPourSport(condition, temp) {
  return (condition === "soleil" || condition === "nuageux") && temp >= 15 && temp <= 28;
}

function calculerConseils(condition, temp, nuit) {
  const base = {
    soleil: ["Mettez de la crème solaire et des lunettes de soleil.", "Buvez régulièrement de l'eau."],
    nuageux: ["Prenez une petite veste, au cas où.", "Le ciel peut se dégager : gardez vos lunettes à portée."],
    pluie: ["Emportez un parapluie ou un imperméable.", "Choisissez des chaussures étanches."],
    orage: ["Évitez les sorties en forêt et les zones dégagées.", "Débranchez les appareils sensibles."],
    neige: ["Habillez-vous en plusieurs couches, bonnet et gants.", "Attention aux trottoirs glissants."],
    brouillard: ["Allumez vos feux de croisement.", "Portez un vêtement visible si vous marchez."],
  };
  const conseils = [...base[condition]];
  if (estBonPourSport(condition, temp)) {
    conseils.push("Il fait bon dehors : c'est l'occasion idéale de faire du sport en extérieur !");
  }
  if (temp >= 28) conseils.push("Il fait très chaud : évitez l'effort aux heures chaudes.");
  else if (temp <= 5 && condition !== "neige") conseils.push("Il fait froid : pensez au manteau et à l'écharpe.");
  if (nuit) conseils.push("Il fait nuit : soyez bien visible si vous êtes à pied ou à vélo.");
  return conseils;
}

// --- Le bonhomme : sa tenue et sa posture suivent les conseils ---

function Bonhomme({ condition, temp, nuit }) {
  const peau = "#f0c8a0";
  const habit = nuit ? "#e7edf2" : "#2d3b46";
  const accent = "#E8A33D";
  const sportif = estBonPourSport(condition, temp);

  if (condition === "pluie" || condition === "orage") {
    const couleurParapluie = condition === "orage" ? "#c0392b" : "#1b6ca8";
    return (
      <g>
        <ellipse cx="0" cy="52" rx="16" ry="4" fill="#000" opacity="0.12" />
        <circle cx="0" cy="-30" r="10" fill={peau} />
        <line x1="0" y1="-20" x2="0" y2="12" stroke={habit} strokeWidth="7" strokeLinecap="round" />
        <line x1="0" y1="-14" x2="-12" y2="-30" stroke={habit} strokeWidth="6" strokeLinecap="round" />
        <line x1="0" y1="-14" x2="10" y2="2" stroke={habit} strokeWidth="6" strokeLinecap="round" />
        <line x1="0" y1="12" x2="-9" y2="40" stroke={habit} strokeWidth="7" strokeLinecap="round" />
        <line x1="0" y1="12" x2="9" y2="40" stroke={habit} strokeWidth="7" strokeLinecap="round" />
        <line x1="-12" y1="-30" x2="-14" y2="-58" stroke="#8a5a2b" strokeWidth="5" strokeLinecap="round" />
        <path d="M -34 -58 A 22 20 0 0 1 6 -58 Z" fill={couleurParapluie} />
        <circle cx="-14" cy="-58" r="2.5" fill="#fff" />
      </g>
    );
  }

  if (condition === "neige") {
    return (
      <g>
        <ellipse cx="0" cy="52" rx="16" ry="4" fill="#000" opacity="0.12" />
        <circle cx="0" cy="-28" r="10" fill={peau} />
        <path d="M -11 -34 Q 0 -46 11 -34 L 11 -30 Q 0 -38 -11 -30 Z" fill="#c0392b" />
        <circle cx="0" cy="-42" r="4" fill="#fff" />
        <rect x="-9" y="-19" width="18" height="7" rx="3" fill={accent} />
        <line x1="0" y1="-12" x2="0" y2="16" stroke="#3f5972" strokeWidth="9" strokeLinecap="round" />
        <line x1="0" y1="-6" x2="-15" y2="6" stroke="#3f5972" strokeWidth="7" strokeLinecap="round" />
        <line x1="0" y1="-6" x2="15" y2="6" stroke="#3f5972" strokeWidth="7" strokeLinecap="round" />
        <circle cx="-15" cy="6" r="4" fill="#c0392b" />
        <circle cx="15" cy="6" r="4" fill="#c0392b" />
        <line x1="0" y1="16" x2="-9" y2="42" stroke={habit} strokeWidth="8" strokeLinecap="round" />
        <line x1="0" y1="16" x2="9" y2="42" stroke={habit} strokeWidth="8" strokeLinecap="round" />
      </g>
    );
  }

  if (condition === "brouillard") {
    return (
      <g>
        <ellipse cx="0" cy="52" rx="16" ry="4" fill="#000" opacity="0.12" />
        <circle cx="0" cy="-30" r="10" fill={peau} />
        <line x1="0" y1="-20" x2="0" y2="12" stroke={habit} strokeWidth="7" strokeLinecap="round" />
        <rect x="-7" y="-16" width="14" height="16" fill={accent} opacity="0.9" transform="rotate(20)" />
        <line x1="0" y1="-14" x2="-14" y2="-2" stroke={habit} strokeWidth="6" strokeLinecap="round" />
        <line x1="0" y1="-14" x2="13" y2="4" stroke={habit} strokeWidth="6" strokeLinecap="round" />
        <circle cx="16" cy="8" r="5" fill={accent} />
        <circle cx="16" cy="8" r="9" fill={accent} opacity="0.35" />
        <line x1="0" y1="12" x2="-11" y2="26" stroke={habit} strokeWidth="7" strokeLinecap="round" />
        <line x1="-11" y1="26" x2="-9" y2="42" stroke={habit} strokeWidth="7" strokeLinecap="round" />
        <line x1="0" y1="12" x2="10" y2="30" stroke={habit} strokeWidth="7" strokeLinecap="round" />
        <line x1="10" y1="30" x2="11" y2="42" stroke={habit} strokeWidth="7" strokeLinecap="round" />
      </g>
    );
  }

  if (sportif) {
    return (
      <g>
        <line x1="-30" y1="34" x2="-14" y2="34" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="-26" y1="22" x2="-12" y2="22" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <circle cx="0" cy="-30" r="10" fill={peau} />
        <rect x="-8" y="-36" width="16" height="4" rx="2" fill={accent} />
        <line x1="0" y1="-20" x2="4" y2="8" stroke={accent} strokeWidth="7" strokeLinecap="round" />
        <line x1="2" y1="-14" x2="18" y2="-22" stroke={peau} strokeWidth="6" strokeLinecap="round" />
        <line x1="2" y1="-10" x2="-14" y2="0" stroke={peau} strokeWidth="6" strokeLinecap="round" />
        <line x1="4" y1="8" x2="18" y2="18" stroke="#2d3b46" strokeWidth="7" strokeLinecap="round" />
        <line x1="18" y1="18" x2="14" y2="40" stroke="#2d3b46" strokeWidth="7" strokeLinecap="round" />
        <line x1="4" y1="8" x2="-12" y2="14" stroke="#2d3b46" strokeWidth="7" strokeLinecap="round" />
        <line x1="-12" y1="14" x2="-18" y2="38" stroke="#2d3b46" strokeWidth="7" strokeLinecap="round" />
      </g>
    );
  }

  return (
    <g>
      <ellipse cx="0" cy="52" rx="16" ry="4" fill="#000" opacity="0.12" />
      <circle cx="0" cy="-30" r="10" fill={peau} />
      {condition === "soleil" && <rect x="-8" y="-32" width="16" height="4.5" rx="2" fill="#222" />}
      <line x1="0" y1="-20" x2="0" y2="12" stroke={habit} strokeWidth="7" strokeLinecap="round" />
      <line x1="0" y1="-14" x2="-13" y2="-2" stroke={habit} strokeWidth="6" strokeLinecap="round" />
      <line x1="0" y1="-14" x2="12" y2="-2" stroke={habit} strokeWidth="6" strokeLinecap="round" />
      <line x1="0" y1="12" x2="-10" y2="40" stroke={habit} strokeWidth="7" strokeLinecap="round" />
      <line x1="0" y1="12" x2="9" y2="38" stroke={habit} strokeWidth="7" strokeLinecap="round" />
    </g>
  );
}

// --- Le bonhomme seul, en grand, hors de la scène météo ---

function BonhommeGrand({ condition, temp, nuit }) {
  const fondHaut = nuit ? "#101F38" : "#eaf3fb";
  const fondBas = nuit ? "#0C1626" : "#dcecf7";
  return (
    <svg viewBox="0 0 200 260" role="img" aria-label="Bonhomme habillé selon la météo" style={{ display: "block", width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="fond-bonhomme" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={fondHaut} />
          <stop offset="1" stopColor={fondBas} />
        </linearGradient>
      </defs>
      <rect width="200" height="260" fill="url(#fond-bonhomme)" />
      <ellipse cx="100" cy="235" rx="55" ry="10" fill={nuit ? "#000" : "#1B2837"} opacity="0.15" />
      <g transform="translate(100,150) scale(3.2)">
        <Bonhomme condition={condition} temp={temp} nuit={nuit} />
      </g>
    </svg>
  );
}

// --- Illustration complète : ciel + météo (sans le bonhomme) ---

function IllustrationMeteo({ condition, temp, nuit }) {
  const nuages = (x, y, k, fill) => (
    <g transform={`translate(${x},${y}) scale(${k})`} fill={fill}>
      <ellipse cx="40" cy="30" rx="40" ry="20" />
      <circle cx="30" cy="18" r="20" />
      <circle cx="58" cy="14" r="24" />
    </g>
  );

  let haut = nuit ? "#0b1d3a" : "#5aa9e6";
  let bas = nuit ? "#26406b" : "#cfe8fa";
  const grisTemps = condition === "pluie" || condition === "orage" || condition === "neige" || condition === "brouillard";
  if (grisTemps) {
    haut = nuit ? "#1a2332" : "#7d8b99";
    bas = nuit ? "#2c3a4b" : "#b8c4cf";
  }
  const cf = nuit ? "#5d6f88" : "#fff";
  const cd = nuit ? "#3f4f66" : "#9aa8b5";
  const accent = "#E8A33D";
  const gradId = `g-${condition}-${nuit ? "n" : "j"}`;

  const etoiles = useMemo(
    () =>
      nuit
        ? Array.from({ length: 18 }, (_, i) => ({
            x: (hashString("s" + i) % 380) + 10,
            y: (hashString("y" + i) % 90) + 8,
            r: 1 + (i % 2),
          }))
        : [],
    [nuit]
  );

  const flocons = useMemo(
    () =>
      condition === "neige"
        ? Array.from({ length: 22 }, (_, i) => ({
            cx: (hashString("n" + i) % 390) + 5,
            cy: (hashString("m" + i) % 90) + 90,
            r: 2 + (i % 3),
          }))
        : [],
    [condition]
  );

  return (
    <svg viewBox="0 0 400 220" role="img" aria-label={`Illustration : ${CONDITIONS[condition].nom.toLowerCase()}${nuit ? ", de nuit" : ", de jour"}`} style={{ display: "block", width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={haut} />
          <stop offset="1" stopColor={bas} />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill={`url(#${gradId})`} />

      {nuit && (condition === "soleil" || condition === "nuageux") &&
        etoiles.map((e, i) => <circle key={i} cx={e.x} cy={e.y} r={e.r} fill="#fff" opacity="0.85" />)}

      {!grisTemps && nuit && (
        <>
          <circle cx="310" cy="46" r="24" fill="#f4efd0" />
          <circle cx="321" cy="39" r="22" fill={haut} />
        </>
      )}

      {!grisTemps && !nuit && (
        <>
          <g stroke={accent} strokeWidth="4" strokeLinecap="round">
            {Array.from({ length: 8 }, (_, a) => {
              const rad = (a * Math.PI) / 4;
              return (
                <line key={a} x1={310 + Math.cos(rad) * 32} y1={46 + Math.sin(rad) * 32} x2={310 + Math.cos(rad) * 45} y2={46 + Math.sin(rad) * 45} />
              );
            })}
          </g>
          <circle cx="310" cy="46" r="24" fill={accent} />
        </>
      )}

      {condition === "nuageux" && (
        <>
          {nuages(200, 26, 1.1, cf)}
          {nuages(300, 60, 0.9, cf)}
        </>
      )}
      {condition === "soleil" && !nuit && nuages(190, 90, 0.6, cf)}

      {(condition === "pluie" || condition === "orage") && (
        <>
          {nuages(160, 14, 1.5, cd)}
          {nuages(280, 30, 1.2, cd)}
          <g stroke={nuit ? "#8fb8e8" : "#2f6fb0"} strokeWidth="3" strokeLinecap="round">
            {Array.from({ length: 14 }, (_, j) => {
              const rx = 150 + j * 18 + (j % 2) * 8;
              const ry = 95 + (j % 3) * 18;
              return <line key={j} x1={rx} y1={ry} x2={rx - 8} y2={ry + 18} />;
            })}
          </g>
          {condition === "orage" && <polygon points="255,80 232,120 252,120 240,158 280,108 258,108 270,80" fill={accent} />}
        </>
      )}

      {condition === "neige" && (
        <>
          {nuages(160, 14, 1.5, cd)}
          {nuages(280, 30, 1.2, cd)}
          {flocons.map((f, i) => (
            <circle key={i} cx={f.cx} cy={f.cy} r={f.r} fill="#fff" />
          ))}
        </>
      )}

      {condition === "brouillard" && (
        <g fill={nuit ? "#8a98a8" : "#f0f4f7"} opacity="0.75">
          {Array.from({ length: 5 }, (_, b) => (
            <rect key={b} x={150 + (b % 2) * 40} y={30 + b * 16} width={230 - (b % 3) * 30} height="10" rx="5" />
          ))}
        </g>
      )}

      <rect x="0" y="200" width="400" height="20" fill={nuit ? "#0a1420" : "#7fae6f"} opacity={grisTemps ? 0.4 : 0.5} />
    </svg>
  );
}

// --- Composant principal ---

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function nowStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function Conseils() {
  // Données envoyées par la page Météo via <Link state={{ ville, temperature }}>
  const { state } = useLocation();
  const villeTransmise = state?.ville ?? "Paris";
  const tempTransmise = typeof state?.temperature === "number" ? state.temperature : null;

  const [ville, setVille] = useState(villeTransmise);
  const [date, setDate] = useState(todayStr());
  const [heure, setHeure] = useState(nowStr());
  const [requete, setRequete] = useState({ ville: villeTransmise, date: todayStr(), heure: nowStr() });

  const resultat = useMemo(() => {
    const d = new Date(`${requete.date || todayStr()}T12:00:00`);
    const validDate = isNaN(d) ? new Date() : d;
    const [hStr, mStr] = (requete.heure || "12:00").split(":");
    const h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    const villeAffichee = requete.ville.trim() || "Paris";
    const nuit = h < 7 || h >= 21;
    // La température transmise n'est valable que pour la même ville et le jour même
    const tempValide =
      tempTransmise !== null &&
      villeAffichee.toLowerCase() === villeTransmise.toLowerCase() &&
      requete.date === todayStr();
    const { condition, temp } = calculerMeteo(villeAffichee, validDate, h, tempValide ? tempTransmise : null);
    const conseils = calculerConseils(condition, temp, nuit);
    const dateTexte = validDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    return { villeAffichee, dateTexte, h, m, nuit, condition, temp, conseils, tempValide };
  }, [requete, villeTransmise, tempTransmise]);

  function afficher() {
    setRequete({ ville, date, heure });
  }

  return (
    <>
    <div className="meteo-app">
      <section className="meteo-carte meteo-haut">
        <div>
          <div className="meteo-badge">
            <span className="point" />
            <b>{resultat.temp}°C</b>
            <span>{CONDITIONS[resultat.condition].nom}</span>
          </div>
          <p className="meteo-lieu">
            {resultat.villeAffichee} – {resultat.dateTexte} à {String(resultat.h).padStart(2, "0")}h
            {String(resultat.m).padStart(2, "0")} ({resultat.nuit ? "nuit" : "jour"})
          </p>
        </div>

        <div className="meteo-conseils">
          <h2>Nos conseils</h2>
          <ul>
            {resultat.conseils.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>

        <div style={{ flex: "none", width: 150, borderRadius: 4, overflow: "hidden" }}>
          <IllustrationMeteo condition={resultat.condition} temp={resultat.temp} nuit={resultat.nuit} />
        </div>
      </section>

      <div className="meteo-rangee">
        <div className="meteo-carte meteo-illustration">
          <BonhommeGrand condition={resultat.condition} temp={resultat.temp} nuit={resultat.nuit} />
        </div>

        <form
          className="meteo-carte meteo-form"
          onSubmit={(e) => {
            e.preventDefault();
            afficher();
          }}
        >
          <label className="meteo-champ" style={{ gridColumn: "1 / -1" }}>
            Ville
            <input value={ville} onChange={(e) => setVille(e.target.value)} required autoComplete="off" />
          </label>
          <label className="meteo-champ">
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="meteo-champ">
            Heure
            <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} required />
          </label>
          <button type="submit" className="meteo-bouton">Afficher la météo</button>
        </form>
      </div>

      <p className="meteo-note">
        {resultat.tempValide
          ? "La température provient de la page Météo ; le type de temps affiché est simulé."
          : "Les valeurs sont simulées à partir de la ville, de la date et de l'heure : ce composant n'accède pas à un service météo en direct."}
      </p>
    </div>
    </>
  );
}
