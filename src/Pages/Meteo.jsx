import "../Styles/Meteo.css";
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";import Header from '../Parties/Header.jsx';
import Footer from '../Parties/Footer.jsx';
import {
  ArrowRight, Check, Cloud, CloudDrizzle, CloudFog, CloudLightning,
  CloudRain, CloudSnow, CloudSun, Droplets, ExternalLink,
  LocateFixed, MapPin, Moon, Search, Snowflake, Sun, Sunrise,
  Thermometer, Wind, X,
} from 'lucide-react';


// Chemin de la page de conseils (doit être identique à la <Route> déclarée dans App.jsx).
const ADVICE_PATH = '/conseils';

// Vérifie qu'une paire latitude / longitude est exploitable.
function validCoordinates(latitude, longitude) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

// Convertit une valeur du localStorage en nombre, ou null si elle est absente ou invalide.
function toNumberOrNull(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

// Information.jsx est la source de référence : aucune ville de secours.
// Les trois variables lues ici sont : ville, latitude, longitude.
function readStoredCity() {
  const savedName = localStorage.getItem('ville');
  if (!savedName || !savedName.trim()) return null;

  const savedLatitude = toNumberOrNull(localStorage.getItem('latitude'));
  const savedLongitude = toNumberOrNull(localStorage.getItem('longitude'));
  const hasValid = validCoordinates(savedLatitude, savedLongitude);

  return {
    name: savedName.trim(),
    country: 'France',
    latitude: hasValid ? savedLatitude : null,
    longitude: hasValid ? savedLongitude : null,
    timezone: 'Europe/Paris',
  };
}

function condition(code, isDay = true) {
  if (code === 0) return { labelKey: 'meteo.conditions.clear', icon: isDay ? Sun : Moon };
  if (code <= 2) return { labelKey: 'meteo.conditions.partlyCloudy', icon: isDay ? CloudSun : Moon };
  if (code === 3) return { labelKey: 'meteo.conditions.cloudy', icon: Cloud };
  if (code <= 48) return { labelKey: 'meteo.conditions.fog', icon: CloudFog };
  if (code <= 57) return { labelKey: 'meteo.conditions.drizzle', icon: CloudDrizzle };
  if (code <= 67 || (code >= 80 && code <= 82)) return { labelKey: 'meteo.conditions.rain', icon: CloudRain };
  if (code <= 77 || (code >= 85 && code <= 86)) return { labelKey: 'meteo.conditions.snow', icon: CloudSnow };
  if (code >= 95) return { labelKey: 'meteo.conditions.storm', icon: CloudLightning };
  return { labelKey: 'meteo.conditions.variable', icon: CloudSun };
}

function temp(value, unit) {
  if (value == null) return '-°';

  return `${Math.round(unit === 'C' ? value : value * 9 / 5 + 32)} °`;
}

function dateLabel(date, options, language = 'fr') {
  return new Intl.DateTimeFormat(language, { timeZone: 'UTC', ...options }).format(new Date(`${date.slice(0, 10)}T12:00:00Z`));
}

function timeLabel(date) { return date.slice(11, 16); }

// Open-Meteo attend un code de langue court (« fr »), pas « fr-FR ».
function shortLanguage(language) {
  return (language || 'fr').split('-')[0];
}

async function findCities(query, signal, language) {
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=${shortLanguage(language)}&format=json`, { signal });
  if (!response.ok) throw new Error('Search unavailable');
  const data = await response.json();
  return data.results ?? [];
}

// Retrouve les coordonnées d'une ville à partir de son nom (API gratuite, sans clé).
// Les résultats français sont privilégiés, puisque la ville vient de Information.jsx.
async function findCoordinates(name, signal, language) {
  const results = await findCities(name, signal, language);
  return (
    results.find((place) => place.country_code === 'FR' && validCoordinates(place.latitude, place.longitude)) ??
    results.find((place) => validCoordinates(place.latitude, place.longitude)) ??
    null
  );
}

function WeatherIcon({ code, size = 26, isDay = true, className = '' }) {
  if (code == null) {
    return <Cloud size={size} strokeWidth={1.7} className={className} aria-hidden="true" />;
  }
  const Icon = condition(code, isDay).icon;
  return <Icon size={size} strokeWidth={1.7} className={className} aria-hidden="true" />;
}

function Metric({ icon: Icon, label, value, detail, tone }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={23} strokeWidth={1.8} /></div><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className="metric-detail">{detail}</span></div>;
}

export default function Meteo() {
  const { t, i18n } = useTranslation();
  // La ville et ses coordonnées viennent du localStorage renseigné
  // dans Information.jsx (variables : ville, latitude, longitude).
  const [city, setCity] = useState(() => readStoredCity());
  const [weather, setWeather] = useState(null);
  const [chronos, setChronos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [unit, setUnit] = useState('C');
  const [selectedDay, setSelectedDay] = useState(0);
  const [locating, setLocating] = useState(false);       // Recherche des coordonnées en cours
  const [coordsFailed, setCoordsFailed] = useState(false); // Coordonnées introuvables
  const searchRef = useRef(null);

  // Complète les coordonnées manquantes.
  // Information.jsx supprime latitude et longitude du localStorage quand la ville saisie
  // à la main diffère de la ville détectée par GPS. Dans ce cas, la ville est géocodée
  // ici à partir de son nom, puis les coordonnées sont enregistrées dans le localStorage.
  useEffect(() => {
    if (!city?.name) {
      setLocating(false);
      setCoordsFailed(false);
      return undefined;
    }

    if (validCoordinates(city.latitude, city.longitude)) {
      setLocating(false);
      setCoordsFailed(false);
      return undefined;
    }

    const controller = new AbortController();
    setLocating(true);
    setCoordsFailed(false);

    findCoordinates(city.name, controller.signal, i18n.language)
      .then((place) => {
        if (controller.signal.aborted) return;

        if (!place) {
          setCoordsFailed(true);
          setLocating(false);
          return;
        }

        const latitude = Number(place.latitude);
        const longitude = Number(place.longitude);

        localStorage.setItem('latitude', String(latitude));
        localStorage.setItem('longitude', String(longitude));

        setCity((previous) =>
          previous && previous.name === city.name
            ? { ...previous, latitude, longitude }
            : previous
        );
        setLocating(false);
      })
      .catch((cause) => {
        if (cause.name === 'AbortError') return;
        setCoordsFailed(true);
        setLocating(false);
      });

    return () => controller.abort();
  }, [city?.name, city?.latitude, city?.longitude, i18n.language]);

  // Recharge la météo quand la ville change ; annule l'ancienne requête si nécessaire.
  // La dépendance porte sur le nom : l'ajout tardif des coordonnées ne relance pas l'appel.
  useEffect(() => {
    if (!city?.name) {
      setLoading(false);
      setWeather(null);
      setError('');
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);       // Indiquer à React que les données sont en cours de chargement
    setError('');           // On efface l'ancienne erreur
    setWeather(null);       // On efface les anciennes données météo pendant le chargement

    const ville = encodeURIComponent(city.name);

    // On appelle notre serveur Express
    fetch(`http://localhost:3001/api/meteo/${ville}`, { signal: controller.signal })
      .then((response) => { if (!response.ok) { throw new Error('Méteo indisponible'); } return response.json(); })
      .then((data) => { setWeather(data.prevision); setSelectedDay(0); setLoading(false); })
      .catch((cause) => { if (cause.name === 'AbortError') { return; } setError(t('meteo.weatherLoadError')); setLoading(false); });
    return () => controller.abort();
  }, [city?.name]);

  // Récupère séparément les prévisions Chronos pour les jours 5 à 7.
  // Si Chronos échoue, les quatre premiers jours Open-Meteo restent affichés.
  useEffect(() => {
    if (!city?.name) {
      setChronos(null);
      return undefined;
    }

    const controller = new AbortController();
    setChronos(null);

    const ville = encodeURIComponent(city.name);

    fetch(`http://localhost:3001/api/meteo/prediction/chronos/${ville}`, {
      signal: controller.signal
    })
      .then((response) => {
        if (!response.ok) throw new Error("Prévision Chronos indisponible");
        return response.json();
      })
      .then((data) => setChronos(data))
      .catch((cause) => {
        if (cause.name !== "AbortError") {
          console.error("Impossible de charger les prévisions Chronos :", cause);
          setChronos(null);
        }
      });

    return () => controller.abort();
  }, [city?.name]);

  // Attend la fin de la saisie avant de chercher des suggestions de villes.
  useEffect(() => {
    if (query.trim().length < 2) { setSuggestions([]); setSearching(false); return; }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setSearching(true);
      findCities(query.trim(), controller.signal, i18n.language)
        .then((results) => { setSuggestions(results); setSearchError(''); })
        .catch((cause) => { if (cause.name !== 'AbortError') setSearchError(t('meteo.searchUnavailable')); })
        .finally(() => { if (!controller.signal.aborted) setSearching(false); });
    }, 300);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [query, i18n.language]);

  useEffect(() => {
    function dismiss(event) { if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false); }
    document.addEventListener('mousedown', dismiss);
    return () => document.removeEventListener('mousedown', dismiss);
  }, []);

  function chooseCity(next) {
    const nextLatitude = toNumberOrNull(next.latitude);
    const nextLongitude = toNumberOrNull(next.longitude);
    const hasValid = validCoordinates(nextLatitude, nextLongitude);

    const nextCity = {
      ...next,
      latitude: hasValid ? nextLatitude : null,
      longitude: hasValid ? nextLongitude : null,
    };

    setCity(nextCity);
    setQuery('');
    setSuggestions([]);
    setSearchOpen(false);
    setSearchError('');

    // Les trois variables de référence : ville, latitude, longitude.
    localStorage.setItem('ville', nextCity.name);

    if (hasValid) {
      localStorage.setItem('latitude', String(nextLatitude));
      localStorage.setItem('longitude', String(nextLongitude));
    } else {
      // Ne pas laisser les coordonnées de l'ancienne ville associées à la nouvelle.
      localStorage.removeItem('latitude');
      localStorage.removeItem('longitude');
    }

    localStorage.setItem('deja_vu', 'true');
  }

  async function submitSearch(event) {
    event.preventDefault();
    if (!query.trim()) return;
    if (suggestions.length) { chooseCity(suggestions[0]); return; }
    setSearching(true);
    try {
      const results = await findCities(query.trim(), undefined, i18n.language);
      if (results.length) chooseCity(results[0]);
      else { setSearchError(t('meteo.noCityFound')); setSearchOpen(true); }
    } catch { setSearchError(t('meteo.searchUnavailable')); setSearchOpen(true); }
    finally { setSearching(false); }
  }

  function locate() {
    setSearchError(t('meteo.locationComingSoon'));
    setSearchOpen(true);
  }

  // Sans ville enregistrée par Information.jsx, on n'invente aucune localisation.
  if (!city?.name) {
    return (
      <main className="weather-main">
        <div className="content-wrap">
          <section className="map-card" role="status">
            <h2>Aucune ville enregistrée</h2>
            <p>La page Météo attend la ville, la latitude et la longitude enregistrées dans le localStorage par la page Information.</p>
            <p>Retournez sur la page Information, autorisez la localisation ou choisissez une ville, puis ouvrez de nouveau la page Météo.</p>
          </section>
        </div>
      </main>
    );
  }

  const daily = weather?.valeurs_par_jour;    // Données quotidiennes Open-Meteo
  const hourly = weather?.valeurs_par_heure;   // Données horaires Open-Meteo

  // Prépare une liste de 7 jours : 4 jours Open-Meteo + 3 jours Chronos.
  // Chronos fournit 24 températures horaires par jour, pas les précipitations.
  const predictionChronos = chronos?.prediction?.prediction_par_jour;

  const forecastDays = Array.from({ length: 7 }, (_, index) => {
    if (index < 4) {
      return {
        source: "Open-Meteo",
        date: daily?.time?.[index],
        code: daily?.weather_code?.[index] ?? null,
        max: daily?.temperature_2m_max?.[index] ?? null,
        min: daily?.temperature_2m_min?.[index] ?? null,
        rain: daily?.precipitation_sum?.[index] ?? null,
        mean: null,
      };
    }

    const hourlyTemperatures = predictionChronos?.[`jour_${index - 3}`];
    const validTemperatures = Array.isArray(hourlyTemperatures)
      ? hourlyTemperatures.filter((value) => typeof value === "number" && Number.isFinite(value))
      : [];

    return {
      source: "Chronos",
      // Les dates sont celles des jours 5 à 7 de la prévision Open-Meteo.
      date: daily?.time?.[index],
      code: null,
      max: validTemperatures.length ? Math.max(...validTemperatures) : null,
      min: validTemperatures.length ? Math.min(...validTemperatures) : null,
      rain: null,
      mean: validTemperatures.length
        ? validTemperatures.reduce((sum, value) => sum + value, 0) / validTemperatures.length
        : null,
    };
  });

  const now = new Date();                     // Heure actuelle

  const currentHourString =
    `${now.getFullYear()}-` +
    `${String(now.getMonth() + 1).padStart(2, '0')}-` +
    `${String(now.getDate()).padStart(2, '0')}T` +
    `${String(now.getHours()).padStart(2, '0')}:00`;

  const currentHourIndex = hourly   // Index de l'heure actuelle
    ? hourly.time.findIndex((time) => time === currentHourString)
    : -1;

  // Données météo actuelles
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
  } : null;

  // Première heure à afficher dans les prévisions horaires
  const firstHour = hourly
    ? Math.max(0, hourly.time.findIndex((hour) => hour >= current?.time))
    : 0;

  // Les 8 prochaines heures
  const hours = hourly ? hourly.time.slice(firstHour, firstHour + 8).map((time, offset) => ({
    time,
    temperature: hourly.temperature_2m[firstHour + offset],
    rain: hourly.precipitation[firstHour + offset],
    code: hourly.weather_code[firstHour + offset],
  }))
    : [];

  const hasCoordinates = validCoordinates(city.latitude, city.longitude);

  // OpenStreetMap attend bbox=longitudeMin,latitudeMin,longitudeMax,latitudeMax.
  // Le marqueur reçoit latitude, puis longitude.
  const mapParams = hasCoordinates
    ? new URLSearchParams({
        bbox: `${city.longitude - 0.09},${city.latitude - 0.055},${city.longitude + 0.09},${city.latitude + 0.055}`,
        layer: 'mapnik',
        marker: `${city.latitude},${city.longitude}`,
      })
    : null;
  const mapUrl = mapParams
    ? `https://www.openstreetmap.org/export/embed.html?${mapParams.toString()}`
    : '';

  const osmUrl = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${encodeURIComponent(city.latitude)}&mlon=${encodeURIComponent(city.longitude)}#map=14/${city.latitude}/${city.longitude}`
    : '#';
  const degrees = current?.temperature_2m ?? 16;
  const mapTone = degrees < 5 ? 'cold' : degrees >= 25 ? 'hot' : 'mild';

  return (
    <>
      <Header />
      <main className="weather-main">
        <div className="content-wrap">
          <div className="page-heading">
          <div><div className="eyebrow"><span className="eyebrow-line" />{t('meteo.realtime')}</div><h1>{t('meteo.title')}</h1><p>{t('meteo.subtitle')}</p></div>
          <div className="heading-actions">
            <div className="search-wrap" ref={searchRef}>
              <form className="search-box" onSubmit={submitSearch}><Search size={19} aria-hidden="true" /><input aria-label={t('meteo.searchPlaceholder')} placeholder={t('meteo.searchPlaceholder')} value={query} onChange={(event) => { setQuery(event.target.value); setSuggestions([]); setSearching(event.target.value.trim().length >= 2); setSearchError(''); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} />{query && <button type="button" className="clear-search" aria-label={t('meteo.clearSearch')} onClick={() => { setQuery(''); setSuggestions([]); }}><X size={16} /></button>}</form>
              {searchOpen && (query.trim().length >= 2 || searchError) && <div className="search-results">{searchError ? <p>{searchError}</p> : searching && !suggestions.length ? <p>{t('meteo.searching')}</p> : suggestions.length ? suggestions.map((result) => <button key={`${result.name}-${result.latitude}-${result.longitude}`} onClick={() => chooseCity(result)}><MapPin size={17} /><span><strong>{result.name}</strong><small>{[result.admin1, result.country].filter(Boolean).join(', ')}</small></span><ArrowRight size={15} /></button>) : <p>{t('meteo.noCityFound')}</p>}</div>}
            </div>
            <button className="icon-button" onClick={locate} title={t('meteo.myLocation')} aria-label={t('meteo.myLocation')}><LocateFixed size={19} /></button>
            <button className="unit-button" onClick={() => setUnit(unit === 'C' ? 'F' : 'C')} aria-label={t(unit === 'C' ? 'meteo.switchToFahrenheit' : 'meteo.switchToCelsius')}>°{unit}</button>
          </div>
        </div>

        {error && <div className="error-banner" role="alert">{error}</div>}

        <div className="top-grid">
          <section className="current-card" aria-label={t('meteo.currentWeather')}>
            <div className="current-card-top"><span className="live-pill">{t('meteo.actual')}</span><span className="updated-at">{current ? `${t('meteo.updatedAt')} ${timeLabel(current.time)}` : loading ? t('meteo.loading') : t('meteo.unavailable')}</span></div>
            <div className="current-card-content"><div className="current-location"><MapPin size={19} />{city.name}{city.country && <span>, {city.country}</span>}</div><div className="current-reading"><div className="big-temperature">{temp(current?.temperature_2m, unit)}<span>{unit}</span></div><WeatherIcon code={current?.weather_code} isDay={true} size={80} className="big-weather-icon" /></div><div className="current-description">{current ? t(condition(current.weather_code, true).labelKey) : loading ? t('meteo.weatherComing') : t('meteo.dataUnavailable')}</div><p className="current-feels">{t('meteo.feels')} {temp(current?.apparent_temperature, unit)} <span>·</span> {t('meteo.max')} {temp(daily?.temperature_2m_max?.[0], unit)} / {t('meteo.min')} {temp(daily?.temperature_2m_min?.[0], unit)}</p></div>
            <div className="current-card-bottom"><div><Sunrise size={19} /><span>{t('meteo.sunrise')}</span><strong>-</strong></div></div>
          </section>

          <section className="map-card" aria-label={`Carte de ${city.name}`}>
            <div className="map-header"><div><span className="section-kicker">{t('meteo.geographicMarker')}</span><h2>{city.name},{t('meteo.onMap')}</h2></div><div className="map-header-icon"><MapPin size={21} /></div></div>
            <p className="map-subtitle">{t('meteo.mapSubtitle')}</p>
            {hasCoordinates ? (
              <>
                <div className="map-frame"><iframe key={`${city.latitude}-${city.longitude}`} title={`Carte OpenStreetMap de ${city.name}`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><div className={`map-temperature ${mapTone}`}><WeatherIcon code={current?.weather_code} size={18} />{temp(current?.temperature_2m, unit)}{unit}</div></div>
                <div className="map-bottom"><div className="map-place"><div className="map-place-icon"><MapPin size={19} /></div><div><strong>{city.name}{city.country ? `, ${city.country}` : ''}</strong><span>{Math.abs(city.latitude).toFixed(3)}° {city.latitude < 0 ? 'S' : 'N'} · {Math.abs(city.longitude).toFixed(3)}° {city.longitude < 0 ? 'O' : 'E'}</span></div></div><a href={osmUrl} target="_blank" rel="noreferrer" aria-label={`Ouvrir la carte de ${city.name} dans OpenStreetMap`}><ExternalLink size={17} /></a></div>
              </>
            ) : (
              <div className="map-frame" style={{ display: 'grid', placeItems: 'center', minHeight: 180, color: '#7f8ca3', textAlign: 'center', padding: 16 }}>
                {locating
                  ? 'Recherche de la position de la ville…'
                  : coordsFailed
                    ? 'Coordonnées de localisation introuvables pour cette ville.'
                    : 'Chargement de la carte…'}
              </div>
            )}
          </section>
        </div>

        <section className="section-block" aria-labelledby="metrics-title"><div className="section-heading"><div><span className="section-kicker">EN UN COUP D’ŒIL</span><h2 id="metrics-title">Les conditions en détail</h2></div><span className="section-aside">Valeurs actuelles à {city.name}</span></div><div className="metrics-grid">
          <Metric icon={Droplets} label={t('meteo.precipitation')} value={current ? `${current.precipitation} mm` : '—'} detail={t('meteo.currently')} tone="blue" />
          <Metric icon={Snowflake} label={t('meteo.snowfall')} value={current ? `${current.snowfall} cm` : '—'} detail={t('meteo.currently')} tone="ice" />
          <Metric icon={Droplets} label={t('meteo.humidity')} value={current ? `${current.relative_humidity_2m}%` : '—'} detail={t('meteo.inAir')} tone="purple" />
          <Metric icon={Wind} label={t('meteo.windSpeed')} value={current ? `${Math.round(current.wind_speed_10m)} km/h` : '—'} detail={t('meteo.at10m')} tone="mint" />
          <Metric icon={Cloud} label={t('meteo.cloudCover')} value={current ? `${current.cloud_cover}%` : '—'} detail={t('meteo.skyCovered')} tone="slate" />
          <Metric icon={Thermometer} label={t('meteo.feelsLike')} value={temp(current?.apparent_temperature, unit)} detail={t('meteo.outdoorFeeling')} tone="peach" />
        </div></section>

        <div className="lower-grid">
          <section className="hourly-block" aria-labelledby="hourly-title">
            <div className="section-heading">
              <div>
                <span className="section-kicker">{t('meteo.hourByHour')}</span>
                <h2 id="hourly-title">{t('meteo.nextHours')}</h2>
              </div>
              <span className="section-aside">{t('meteo.today')}<ArrowRight size={16} /></span>
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

          <Link className="advice-card" to={ADVICE_PATH} state={{ ville: city.name, temperature: current?.temperature_2m }} style={{ display: 'grid', flexDirection: 'row', alignContent: 'space-between' }}>
            {/* Toute la carte mène à la page Conseils. */}
            <div className="advice-top">
              <span>{t('meteo.advice.goFurther')}</span>
              <span className="advice-arrow"><ArrowRight size={20} /></span>
            </div>
            <div className="advice-orbit"><Sun size={35} /></div>
            <div>
              <h2>{t('meteo.title')}<br />{t('meteo.advice.titleLine2')}</h2>
              <p>{t('meteo.advice.description')}</p>
              <span className="advice-link">{t('meteo.advice.link')}<ArrowRight size={16} /></span>
            </div>
          </Link>
        </div>

        <section className="forecast-section" aria-labelledby="forecast-title">
          <div className="section-heading">
            <div>
              <span className="section-kicker">{t('meteo.upcomingDays')}</span>
              <h2 id="forecast-title">{t('meteo.sevenDayForecast')}</h2>
            </div>
            <span className="source-label">Jours 1–4 : Open-Meteo · Jours 5–7 : Chronos</span>
          </div>
          <div className="forecast-grid">
            {forecastDays.map((day, index) => {
              const chronosDay = index >= 4;
              const hourlyTemperatures = chronosDay
                ? predictionChronos?.[`jour_${index - 3}`]
                : null;
              const hasChronosValues = Array.isArray(hourlyTemperatures) && hourlyTemperatures.length > 0;

              return (
                <button
                  key={`${day.source}-${day.date ?? index}`}
                  className={`day-card ${selectedDay === index ? 'selected' : ''}`}
                  onClick={() => setSelectedDay(index)}
                  aria-pressed={selectedDay === index}
                >
                  <span className="day-name">
                    {index === 0 ? 'Aujourd’hui' : day.date ? dateLabel(day.date, { weekday: 'short' }) : '—'}
                  </span>
                  <span className="day-date">
                    {day.date ? dateLabel(day.date, { day: 'numeric', month: 'short' }) : '—'}
                  </span>
                  <WeatherIcon code={day.code} size={32} />
                  <span className="day-condition">
                    {chronosDay
                      ? (hasChronosValues ? 'Température prédite' : 'Chronos indisponible')
                      : day.code != null ? t(condition(day.code).labelKey) : '—'}
                  </span>
                  <span className="day-temps">
                    <strong>{temp(day.max, unit)}</strong>
                    <span>{temp(day.min, unit)}</span>
                  </span>
                  <span className="day-rain">
                    {chronosDay
                      ? (day.mean != null ? `Moy. ${temp(day.mean, unit)}` : '—')
                      : <><Droplets size={12} />{day.rain != null ? `${day.rain} mm` : '—'}</>}
                  </span>
                  <span className="forecast-credit">{day.source}</span>
                </button>
              );
            })}
          </div>
          <div className="forecast-detail">
            <span className="detail-check"><Check size={15} /></span>
            <span>
              {forecastDays[selectedDay]?.date
                ? `${selectedDay === 0 ? 'Aujourd’hui' : dateLabel(forecastDays[selectedDay].date, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })} — Source : ${forecastDays[selectedDay].source}. ${
                    selectedDay < 4
                      ? `Précipitations prévues : ${forecastDays[selectedDay].rain ?? '—'} mm.`
                      : forecastDays[selectedDay].mean != null
                        ? `Température moyenne estimée : ${temp(forecastDays[selectedDay].mean, unit)}. Chronos ne prédit pas les précipitations.`
                        : 'Les températures Chronos ne sont pas disponibles pour le moment.'
                  }`
                : t('meteo.selectDay')}
            </span>
            <span className="forecast-credit">
              {selectedDay < 4 ? 'Données : Open-Meteo' : 'Estimation : Chronos'}
            </span>
          </div>
        </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
