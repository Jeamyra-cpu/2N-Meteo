/*lancement avec 

node index.js

une fois dans le dossier server*/

/* ce serveur est notre api , il recuperera les endpoints envoyé par REACT
en meme temps il enverra des requetes à l'api D'openMeteo


- express : est un framework web pour creer un serveur http

Il permet de :
créer des routes (API REST ou pages web)

gérer des middlewares

servir des fichiers statiques

gérer l’authentification, sessions, cookies

créer des applications web complètes, pas seulement des API


- CORS = Cross-Origin Resource Sharing.  
Il sert uniquement à autoriser ou bloquer les requêtes venant d’un autre domaine.

Exemples :

le frontend http://localhost:5173 veut appeler le backend http://localhost:3000

un site externe veut accéder à L API

CORS ne crée pas de serveur et ne crée pas d’API.
Il ne fait que contrôler l’accès. */

import express from 'express';
import cors from 'cors';

const app = express();  // création d'une instance de serveur express et on le fait ecouter sur le port 3001
app.use(cors({origin:true , credentials:true})); // app represente donc notre serveur express
// app.use(cors()); utorise React (origine http://localhost:5173) à faire des requêtes vers ce serveur (origine http://localhost:3001)
// sans ca le navigateur bloque les reponses du serveur 



/*************************************************************************************************************************************************
 * 
 *   Fonctions pour recuperer les données de l'API d'Open-Meteo
 * 
 ***************************************************************************************************************************************************/

/**fonction de recherche de coordonnées par nom de ville */
const URL_GEOCODAGE = "https://geocoding-api.open-meteo.com/v1/search"; // URL de l'API de geocodage d'Open-Meteo

async function trouverCoordonnes(ville) {
  const param = new URLSearchParams({
    name: ville,
    count: "1", // on ne veut qu'un seul resultat
    language: "fr",
    country: "FR"
  });

  const response = await fetch(`${URL_GEOCODAGE}?${param}`); // on attend la reponse de l'API de geocodage
  var donnees = await response.json();

  if (!donnees.results || donnees.results.length === 0) {
    console.log(`Aucune donnée trouvée pour la ville : ${ville}`);
    return null;
  }

  donnees = donnees.results[0]; // on prend le premier resultat

  return {
    nom: donnees.name,
    latitude: donnees.latitude,
    longitude: donnees.longitude,
    population: donnees.population,
    country: donnees.country,
  };

}


const URL_PREVISION = "https://api.open-meteo.com/v1/forecast"; // URL de l'API de prévision d'Open-Meteo


/**fonction de recupération de météo par nom de ville,prevsion sur 4 jours */
async function recupererPrevision(ville, latitude, longitude, modele) {

  const param = new URLSearchParams({  // les parametres de la requete à l'API de prévision necessaire pour une prevision appropriée
    latitude: latitude,
    longitude: longitude,
    daily: "temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,weather_code,wind_speed_10m_max", // car on veut les temperatures max et min et la somme des precipitations
    hourly: "temperature_2m,apparent_temperature,precipitation,relative_humidity_2m,weather_code,cloud_cover,wind_speed_10m,snowfall",
    models: modele,   // le modele de prevision a utiliser (AROME, ICON, ARPEGE)
    timezone: "Europe/Paris",
    forecast_days: "7", // on veut une prevision pour 7 jours  , mais le modele ne se limite qu'à 4 jours
  });

  const response = await fetch(`${URL_PREVISION}?${param}`);
  var donnees = await response.json();

  if (!donnees.daily) {
    console.log(`Erreur fonction recuperationPrevision`);
    console.log(`Aucune donnée de prévision trouvée pour ${ville} `);
    return null;
  }

  return {
    valeurs_par_jour: donnees.daily,
    unites_valeurs_par_jour: donnees.daily_units,
    valeurs_par_heure: donnees.hourly,
    unites_valeurs_par_heure: donnees.hourly_units,
  } // on renvoie les donnees de prévision et les unités de mesure

}

/**fonction de récupération de météo pour une ville , pour un jour d'une date données 
 * date au format : AAAA-MM-JJ
*/
async function recuperationPrevisionJour(ville, latitude, longitude, modele, date) {
  const param = new URLSearchParams({
    latitude: latitude,
    longitude: longitude,
    daily: "temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,weather_code,wind_speed_10m_max", // car on veut les temperatures max et min et la somme des precipitations
    hourly: "temperature_2m,apparent_temperature,precipitation,relative_humidity_2m,weather_code,cloud_cover,wind_speed_10m,snowfall",
    models: modele,
    timezone: "Europe/Paris",
    start_date: date,
    end_date: date,
  });

  const response = await fetch(`${URL_PREVISION}?${param}`);
  var donnees = await response.json();

  if (!donnees.daily) {
    console.log(`Erreur fonction recuperationPrevisionJour `);
    console.log(`Aucune donnée de prévision trouvée pour ${ville} pour la date : ${date}`);
    return null;
  }

  return {
    valeur_jour: donnees.daily,
    unites_valeur_jour: donnees.daily_units,
    valeur_par_heure: donnees.hourly,
    unites_valeur_par_heure: donnees.hourly_units,
  }
}


/**fonction de recuperation des donnees historiques (29 derniers jours) */

const URL_HISTORIQUE = "https://api.open-meteo.com/v1/forecast";
async function recuperationHistorique(latitude, longitude, date, modele) {
  // On récupère l'année, le mois et le jour de la date demandée
  var mois = (date.getMonth() + 1).toString().padStart(2, '0');
  var jour = date.getDate().toString().padStart(2, '0');
  var annee = date.getFullYear();

  var date_29_jours_precedents = new Date(date);  // la date à partir de la date demandée


  date_29_jours_precedents.setDate(date_29_jours_precedents.getDate() - 29);

  var mois_29 = (date_29_jours_precedents.getMonth() + 1).toString().padStart(2, '0');

  var jour_29 = date_29_jours_precedents.getDate().toString().padStart(2, '0');

  var annee_29 = date_29_jours_precedents.getFullYear();

  const params = new URLSearchParams({
    latitude: latitude,
    longitude: longitude,

    hourly: "temperature_2m,apparent_temperature,precipitation,relative_humidity_2m,cloud_cover,wind_speed_10m,snowfall",

    models: modele,

    timezone: "Europe/Paris",

    start_date: `${annee_29}-${mois_29}-${jour_29}`,
    end_date: `${annee}-${mois}-${jour}`,
  });

  const response = await fetch(`${URL_HISTORIQUE}?${params}`);

  var donnees = await response.json();

  if (!donnees.hourly) {
    console.log(`Erreur fonction recuperationHistorique`);
    console.log(
      `Aucune donnée historique trouvée pour la période : ${annee_29}-${mois_29}-${jour_29} à ${annee}-${mois}-${jour}`
    );

    return null;
  }

  return {
    valeur_historique: donnees.hourly,
    unites_des_valeurs: donnees.hourly_units,
  };
}


/** Fonction de recupération de nom de ville */

const api_key_LocationIQ = "pk.e91ebd5dcc170c6a4abdfd10d10a65c7"; // Clé API pour LocationIQ , recupération du nom de la ville en fonction de la latitude et la longitude
const URL_LOCATIONIQ = "https://us1.locationiq.com/v1/reverse";

async function recuperationNomVille(latitude,longitude){
    const params = new URLSearchParams({
      key: api_key_LocationIQ,
      lat: latitude,
      lon: longitude,
      format: "json",
    });

    const response = await fetch(`${URL_LOCATIONIQ}?${params}`);
    const data = await response.json();
    if (!data.address || !data.address.city) {
      console.log(`Erreur fonction recuperationNomVille`);
      console.log(`Aucune donnée de nom de ville trouvée pour la latitude : ${latitude} et la longitude : ${longitude}`);
      return null;
    }

    return  data.address ;
}

/*************************************************************************************************************************************************
 * 
 *   definition des Routes de l'api  
 * 
 ***************************************************************************************************************************************************/

app.get("/api/test", (req, res) => {   // une fonction qui recoit deux parametres req et res (requete recu et response que l'on va renvoyer)
  res.json({ message: "L'API demarre normalement 😁😁 !" });
});

/*recherche d'une ville avec la latitude et la longitude  */
app.get("/api/ville/:latitude/:longitude", async (req, res) => { //async pour une attente mm des reponses longues 
  const latitude = req.params.latitude;
  const longitude = req.params.longitude;

  const Ville = await recuperationNomVille(latitude, longitude);

  if (!Ville) {
    return res.status(404).json({ error: "Nom de ville non trouvé" });
  } 

  res.json({
    ville: Ville.city || Ville.town || Ville.village || Ville.hamlet || "Nom de ville non disponible",
    latitude: latitude,
    longitude: longitude,
    country: Ville.country || "Pays non disponible"
  });

});

/*recherche meteo avec le nom d'une ville  */
app.get("/api/meteo/:ville", async (req, res) => { //async pour une attente mm des reponses longues 
  const nomville = req.params.ville;
  const ville = await trouverCoordonnes(nomville); // on attend la reponse de la fonction trouverCoordonnes

  if (!ville) {
    return res.status(404).json({ error: "Ville non trouvée" });
  }

  const prevision = await recupererPrevision(nomville, ville.latitude, ville.longitude, "meteofrance_seamless"); // on attend la reponse de la fonction recupererPrevision

  if (!prevision) {
    return res.status(404).json({ error: "Prévision non trouvée" });
  }

  res.json({
    ville: ville.nom,
    latitude: ville.latitude,
    longitude: ville.longitude,
    prevision: prevision,

  });


});

app.get("/api/meteo/:ville/:date", async (req, res) => { // ,date au format AAAA-MM-JJ
  const nomville = req.params.ville;
  const date = req.params.date;

  const ville = await trouverCoordonnes(nomville); // on attend la reponse de la fonction trouverCoordonnes

  if (!ville) {
    return res.status(404).json({ error: "Ville non trouvée" });
  }

  const prevision = await recuperationPrevisionJour(nomville, ville.latitude, ville.longitude, "meteofrance_seamless", date); // on attend la reponse de la fonction recuperationPrevisionJour

  if (!prevision) {
    return res.status(404).json({ error: "Prévision non trouvée lors de l'appel pour la date : " + date });
  }

  res.json({
    ville: ville.nom,
    latitude: ville.latitude,
    longitude: ville.longitude,
    prevision: prevision,
  })

});

app.get("/api/meteo/historique/:ville/:date", async (req, res) => { // date au format AAAA-MM-JJ

  const nomville = req.params.ville;
  let date = req.params.date;

  const ville = await trouverCoordonnes(nomville); // on attend la réponse de la fonction trouverCoordonnes

  if (!ville) {
    return res.status(404).json({ error: "Ville non trouvée" });
  }

  let [annee, mois, jour] = date.split("-").map(Number); // conversion en nombres

  date = new Date(annee, mois - 1, jour); // mois - 1 car les mois sont indexés à partir de 0 en JS

  const historique = await recuperationHistorique(
    ville.latitude,
    ville.longitude,
    date,
    "meteofrance_seamless"
  );

  if (!historique) {
    return res.status(404).json({
      error: "Historique non trouvé lors de l'appel pour la date : " + date
    });
  }

  res.json({
    ville: ville.nom,
    latitude: ville.latitude,
    longitude: ville.longitude,
    historique: historique,
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Le serveur a demarrer sur le port :  ${PORT} donc acces avec http://localhost:${PORT}`);
});