import "../Styles/Meteo.css";
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, CalendarDays, Check, Cloud, CloudDrizzle, CloudFog, CloudLightning,
  CloudRain, CloudSnow, CloudSun, Compass, Droplets, ExternalLink, Gauge,
  LocateFixed, MapPin, Moon, Search, Snowflake, Sun, Sunrise, Sunset,
  Thermometer, Wind, X,
} from 'lucide-react';


const LIMOGES = { name: 'Limoges', country: 'France', latitude: 45.8315, longitude: 1.2578, timezone: 'Europe/Paris' };
const POPULAR = [
  LIMOGES,
  { name: 'Paris', country: 'France', latitude: 48.8534, longitude: 2.3488, timezone: 'Europe/Paris' },
  { name: 'Lyon', country: 'France', latitude: 45.7485, longitude: 4.8467, timezone: 'Europe/Paris' },
  { name: 'Bordeaux', country: 'France', latitude: 44.8404, longitude: -0.5805, timezone: 'Europe/Paris' },
];
// Replace this path when the team's advice page is added to this repository.
const ADVICE_PATH = '/conseils';

function condition(code, isDay = true) {
  if (code === 0) return { label: 'Ciel dégagé', icon: isDay ? Sun : Moon };
  if (code <= 2) return { label: 'Éclaircies', icon: isDay ? CloudSun : Moon };
  if (code === 3) return { label: 'Nuageux', icon: Cloud };
  if (code <= 48) return { label: 'Brouillard', icon: CloudFog };
  if (code <= 57) return { label: 'Bruine', icon: CloudDrizzle };
  if (code <= 67 || (code >= 80 && code <= 82)) return { label: 'Pluie', icon: CloudRain };
  if (code <= 77 || (code >= 85 && code <= 86)) return { label: 'Neige', icon: CloudSnow };
  if (code >= 95) return { label: 'Orage', icon: CloudLightning };
  return { label: 'Variable', icon: CloudSun };
}

function temp(value, unit) {
  if (value == null) return '-°';

  return `${Math.round( unit === 'C' ? value : value *9/5 + 32)} °`;
} 

function dateLabel(date, options) {
  return new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', ...options }).format(new Date(`${date.slice(0, 10)}T12:00:00Z`));
}

function timeLabel(date) { return date.slice(11, 16); }

async function findCities(query, signal) {
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=fr&format=json`, { signal });
  if (!response.ok) throw new Error('Recherche indisponible. Réessayez.');
  const data = await response.json();
  return data.results ?? [];
}

function WeatherIcon({ code, size = 26, isDay = true, className = '' }) {
  if (code == null){
    return <Cloud size={size} strokeWidth={1.7} className={className} aria-hidden="true" />;
  }
  const Icon = condition(code, isDay).icon;
  return <Icon size={size} strokeWidth={1.7} className={className} aria-hidden="true" />;
}

function Metric({ icon: Icon, label, value, detail, tone }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={23} strokeWidth={1.8} /></div><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className="metric-detail">{detail}</span></div>;
}

export default function Meteo() {
  const [city, setCity] = useState(LIMOGES);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [unit, setUnit] = useState('C');
  const [selectedDay, setSelectedDay] = useState(0);
  const searchRef = useRef(null);

  // Recharge la météo quand la ville change ; annule l'ancienne requête si nécessaire.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);       //Indiquer à React que les données sont en cours de chargement
    setError('');           //On efface l'ancienne erreur
    setWeather(null);       //On efface les anciennes données météo pendant le chargement

    const ville = encodeURIComponent(city.name);
    
    //On appelle notre serveur Express
    fetch(`http://localhost:3001/api/meteo/${ville}`,{signal: controller.signal})
      .then((response) => {if (!response.ok) {throw new Error('Méteo indisponible');} return response.json();})
      .then((data) => { setWeather(data.prevision); setSelectedDay(0); setLoading(false);})
      .catch((cause) => {if (cause.name === 'AbortError') { return;} setError('Impossible de charger les données météo. Vérifiez que le serveur est démarré et réessayez'); setLoading(false);});
    return () => controller.abort();
  }, [city]);

  // Attend la fin de la saisie avant de chercher des suggestions de villes.
  useEffect(() => {
    if (query.trim().length < 2) { setSuggestions([]); setSearching(false); return; }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setSearching(true);
      findCities(query.trim(), controller.signal)
        .then((results) => { setSuggestions(results); setSearchError(''); })
        .catch((cause) => { if (cause.name !== 'AbortError') setSearchError('Recherche indisponible. Réessayez.'); })
        .finally(() => { if (!controller.signal.aborted) setSearching(false); });
    }, 300);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [query]);

  useEffect(() => {
    function dismiss(event) { if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false); }
    document.addEventListener('mousedown', dismiss);
    return () => document.removeEventListener('mousedown', dismiss);
  }, []);

  function chooseCity(next) {
    setCity(next);
    setQuery(''); setSuggestions([]); setSearchOpen(false); setSearchError('');
  }

  async function submitSearch(event) {
    event.preventDefault();
    if (!query.trim()) return;
    if (suggestions.length) { chooseCity(suggestions[0]); return; }
    setSearching(true);
    try {
      const results = await findCities(query.trim());
      if (results.length) chooseCity(results[0]);
      else { setSearchError('Aucune ville trouvée. Essayez une autre recherche.'); setSearchOpen(true); }
    } catch { setSearchError('Recherche indisponible. Réessayez.'); setSearchOpen(true); }
    finally { setSearching(false); }
  }

  /*  J'ai remplacé, à intervertir après si on recupere les coordonnées au lieu du nom de la ville
  function locate() {
    if (!navigator.geolocation) { setSearchError('La géolocalisation n’est pas disponible.'); setSearchOpen(true); return; }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      chooseCity({ name: 'Ma position', country: '', latitude: coords.latitude, longitude: coords.longitude });
    }, () => { setSearchError('Autorisez la localisation ou recherchez une ville.'); setSearchOpen(true); });
  }
*/

  function locate(){
    setSearchError('La géolocalisation sera disponible prochainement');
    setSearchOpen(true);
  }

  const daily = weather?.valeurs_par_jour;    //Data quotidiennes
  const hourly = weather?.valeurs_par_heure;  //-- horaires
  const now = new Date();                     //Heure actuelle

  const currentHourString = 
    `${now.getFullYear()}-` +
    `${String(now.getMonth() +1).padStart(2,'0')}-` +
    `${String(now.getDate()).padStart(2, '0')}T` +
    `${String(now.getHours()).padStart(2, '0')}:00`;
  
  const currentHourIndex = hourly   //Index de l'heure actuelle
    ? hourly.time.findIndex((time) => time === currentHourString)
    : -1;
  
    //Données meteo actuelles
  const current = hourly && currentHourIndex !== -1 ? {
      time: hourly.time[currentHourIndex],
      temperature_2m: hourly.temperature_2m?.[currentHourIndex],
      apparent_temperature: hourly.apparent_temperature?.[currentHourIndex],
      precipitation: hourly.precipitation?.[currentHourIndex],
      relative_humidity_2m: hourly.relative_humidity_2m?.[currentHourIndex],
      weather_code: hourly.weather_code?.[currentHourIndex],
      cloud_cover: hourly.cloud_cover?.[currentHourIndex],
      wind_speed_10m: hourly.wind_speed_10m?.[currentHourIndex],
      snowfall: hourly.snowfall?.[currentHourIndex],
    }: null;

  //Premiere heure à afficher dans les previsions horaires
  const firstHour = hourly
    ? Math.max(0, hourly.time.findIndex((hour) => hour >= current?.time))
    :0;
  
  //Les 8 prochaines heures
  const hours = hourly ? hourly.time.slice(firstHour,firstHour + 8).map((time,offset) => ({
    time,
    temperature: hourly.temperature_2m[firstHour + offset],
    rain: hourly.precipitation[firstHour + offset],
    code: hourly.weather_code[firstHour + offset],
  }))
  : [];


  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${city.longitude - 0.09}%2C${city.latitude - 0.055}%2C${city.longitude + 0.09}%2C${city.latitude + 0.055}&layer=mapnik&marker=${city.latitude}%2C${city.longitude}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${city.latitude}&mlon=${city.longitude}#map=12/${city.latitude}/${city.longitude}`;
  const degrees = current?.temperature_2m ?? 16;
  const mapTone = degrees < 5 ? 'cold' : degrees >= 25 ? 'hot' : 'mild';

  return (
    <main className="weather-main">
      <div className="content-wrap">
        <div className="page-heading">
          <div><div className="eyebrow"><span className="eyebrow-line" /> VOTRE MÉTÉO, EN TEMPS RÉEL</div><h1>Le temps, en un regard<span>.</span></h1><p>Tout ce qu’il faut savoir sur la météo, où que vous soyez.</p></div>
          <div className="heading-actions">
            <div className="search-wrap" ref={searchRef}>
              <form className="search-box" onSubmit={submitSearch}><Search size={19} aria-hidden="true" /><input aria-label="Rechercher une ville" placeholder="Rechercher une ville..." value={query} onChange={(event) => { setQuery(event.target.value); setSuggestions([]); setSearching(event.target.value.trim().length >= 2); setSearchError(''); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} />{query && <button type="button" className="clear-search" aria-label="Effacer la recherche" onClick={() => { setQuery(''); setSuggestions([]); }}><X size={16} /></button>}</form>
              {searchOpen && (query.trim().length >= 2 || searchError) && <div className="search-results">{searchError ? <p>{searchError}</p> : searching && !suggestions.length ? <p>Recherche en cours...</p> : suggestions.length ? suggestions.map((result) => <button key={`${result.name}-${result.latitude}-${result.longitude}`} onClick={() => chooseCity(result)}><MapPin size={17} /><span><strong>{result.name}</strong><small>{[result.admin1, result.country].filter(Boolean).join(', ')}</small></span><ArrowRight size={15} /></button>) : <p>Aucune ville trouvée.</p>}</div>}
            </div>
            <button className="icon-button" onClick={locate} title="Utiliser ma position" aria-label="Utiliser ma position"><LocateFixed size={19} /></button>
            <button className="unit-button" onClick={() => setUnit(unit === 'C' ? 'F' : 'C')} aria-label={`Passer en degrés ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}>°{unit}</button>
          </div>
        </div>

        <div className="city-strip"><span className="city-strip-label">VILLES</span>{POPULAR.map((place) => <button key={place.name} className={city.name === place.name && city.country === place.country ? 'selected' : ''} onClick={() => chooseCity(place)}>{place.name}</button>)}<span className="strip-date"><CalendarDays size={15} />{daily ? dateLabel(daily.time[0], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</span></div>
        {error && <div className="error-banner" role="alert">{error}<button onClick={() => setCity({ ...city })}>Réessayer <ArrowRight size={15} /></button></div>}

        <div className="top-grid">
          <section className="current-card" aria-label="Conditions météo actuelles">
            <div className="current-card-top"><span className="live-pill"><span /> MÉTÉO ACTUELLE</span><span className="updated-at">{current ? `Mis à jour à ${timeLabel(current.time)}` : loading ? 'Chargement...' : 'Indisponible'}</span></div>
            <div className="current-card-content"><div className="current-location"><MapPin size={19} />{city.name}{city.country && <span>, {city.country}</span>}</div><div className="current-reading"><div className="big-temperature">{temp(current?.temperature_2m, unit)}<span>{unit}</span></div><WeatherIcon code={current?.weather_code} isDay={true} size={80} className="big-weather-icon" /></div><div className="current-description">{current ? condition(current.weather_code, true).label : loading ? 'La météo arrive...' : 'Données indisponibles'}</div><p className="current-feels">Ressenti {temp(current?.apparent_temperature, unit)} <span>·</span> Max {temp(daily?.temperature_2m_max[0], unit)} / Min {temp(daily?.temperature_2m_min[0], unit)}</p></div>
            <div className="current-card-bottom"><div><Sunrise size={19} /><span>Lever du soleil</span><strong>-</strong></div></div>
          </section>

          <section className="map-card" aria-label={`Carte de ${city.name}`}>
            <div className="map-header"><div><span className="section-kicker">REPÈRE GÉOGRAPHIQUE</span><h2>{city.name}, sur la carte</h2></div><div className="map-header-icon"><MapPin size={21} /></div></div>
            <p className="map-subtitle">La météo, exactement là où vous la cherchez.</p>
            <div className="map-frame"><iframe key={`${city.latitude}-${city.longitude}`} title={`Carte OpenStreetMap de ${city.name}`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><div className={`map-temperature ${mapTone}`}><WeatherIcon code={current?.weather_code} size={18} />{temp(current?.temperature_2m, unit)}{unit}</div></div>
            <div className="map-bottom"><div className="map-place"><div className="map-place-icon"><MapPin size={19} /></div><div><strong>{city.name}{city.country ? `, ${city.country}` : ''}</strong><span>{city.latitude.toFixed(3)}° N · {Math.abs(city.longitude).toFixed(3)}° {city.longitude < 0 ? 'O' : 'E'}</span></div></div><a href={osmUrl} target="_blank" rel="noreferrer" aria-label={`Ouvrir la carte de ${city.name} dans OpenStreetMap`}><ExternalLink size={17} /></a></div>
          </section>
        </div>

        <section className="section-block" aria-labelledby="metrics-title"><div className="section-heading"><div><span className="section-kicker">EN UN COUP D’ŒIL</span><h2 id="metrics-title">Les conditions en détail</h2></div><span className="section-aside">Valeurs actuelles à {city.name}</span></div><div className="metrics-grid">
          <Metric icon={Droplets} label="Précipitations" value={current ? `${current.precipitation} mm` : '—'} detail="En ce moment" tone="blue" />
          <Metric icon={Snowflake} label="Chutes de neige" value={current ? `${current.snowfall} cm` : '—'} detail="En ce moment" tone="ice" />
          <Metric icon={Droplets} label="Humidité" value={current ? `${current.relative_humidity_2m}%` : '—'} detail="Dans l’air" tone="purple" />
          <Metric icon={Wind} label="Vitesse du vent" value={current ? `${Math.round(current.wind_speed_10m)} km/h` : '—'} detail="À 10 m du sol" tone="mint" />
          <Metric icon={Cloud} label="Couverture nuageuse" value={current ? `${current.cloud_cover}%` : '—'} detail="Part du ciel couvert" tone="slate" />
          <Metric icon={Thermometer} label="Température ressentie" value={temp(current?.apparent_temperature, unit)} detail="Ressenti extérieur" tone="peach" />
        </div></section>

        <div className="lower-grid">
          <section className="hourly-block" aria-labelledby="hourly-title">
            <div className="section-heading">
              <div>
                <span className="section-kicker">HEURE PAR HEURE</span>
                <h2 id="hourly-title">Les prochaines heures</h2>
              </div>
              <span className="section-aside">Aujourd’hui <ArrowRight size={16} /></span>
            </div>
            <div className="hourly-card">{hours.length ? hours.map((hour, index) => 
              <div className={`hour-cell ${index === 0 ? 'active' : ''}`} key={hour.time}>
                <span>{index === 0 ? 'Maintenant' : timeLabel(hour.time)}</span>
                <WeatherIcon code={hour.code} size={29} />
                <strong>{temp(hour.temperature, unit)}</strong>
                <small><Droplets size={12} fill="currentColor" />{hour.rain} mm</small>
              </div>
              ) : Array.from({ length: 8 }, (_, index) => <div className="hour-cell" key={index}><span>—</span><Cloud size={29} /><strong>—°</strong><small>—</small></div>)}
            </div>
          </section>
          <a className="advice-card" href={ADVICE_PATH} style={{ display: 'grid', flexDirection: 'row', alignContent: 'space-between' }}>
            {/* Toute la carte mène à la page Conseils. */}
            <div className="advice-top">
              <span>POUR ALLER PLUS LOIN</span>
              <span className="advice-arrow"><ArrowRight size={20} /></span>
            </div>
            <div className="advice-orbit"><Sun size={35} /></div>
            <div>
              <h2>Un temps d’avance<br />sur votre journée.</h2>
              <p>Découvrez les bons réflexes et nos conseils adaptés à la météo.</p>
              <span className="advice-link">Voir les conseils <ArrowRight size={16} /></span>
            </div>
          </a>
        </div>

        <section className="forecast-section" aria-labelledby="forecast-title">
          <div className="section-heading">
            <div>
              <span className="section-kicker">POUR LES JOURS À VENIR</span>
              <h2 id="forecast-title">Prévisions sur 7 jours</h2>
            </div>
            <span className="source-label">Prévisions Open-Meteo</span>
          </div>
          <div className="forecast-grid">
            {Array.from({ length: 7 }, (_, index) => { const code = daily?.weather_code[index]; return <button key={index} className={`day-card ${selectedDay === index ? 'selected' : ''}`} onClick={() => setSelectedDay(index)} aria-pressed={selectedDay === index}>
              <span className="day-name">{index === 0 ? 'Aujourd’hui' : daily ? dateLabel(daily.time[index], { weekday: 'short' }) : '—'}</span>
              <span className="day-date">{daily ? dateLabel(daily.time[index], { day: 'numeric', month: 'short' }) : '—'}</span>
              <WeatherIcon code={code} size={32} />
              <span className="day-condition">{code != null ? condition(code).label : '—'}</span>
              <span className="day-temps"><strong>{temp(daily?.temperature_2m_max[index], unit)}</strong><span>{temp(daily?.temperature_2m_min[index], unit)}</span></span>
              <span className="day-rain"><Droplets size={12} />{daily ? `${daily.precipitation_sum[index]} mm` : '-'}</span></button>; 
            })}
          </div>
          <div className="forecast-detail">
            <span className="detail-check"><Check size={15} /></span>
            <span>
              {daily 
              ? `${selectedDay === 0 ? 'Aujourd’hui' : dateLabel(daily.time[selectedDay], { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })} : ${daily.weather_code[selectedDay] != null
                  ?  condition(daily.weather_code[selectedDay]).label.toLowerCase()
                  : 'Données indisponibles'
                }, précipitations prévues ${
                  daily.precipitation_sum[selectedDay] ?? '-'
                } mm.` 
              : 'Sélectionnez un jour pour voir ses prévisions.'}
            </span>
            <span className="forecast-credit">Données : Open-Meteo</span>
          </div>
        </section>
      </div>
    </main>
  );
}