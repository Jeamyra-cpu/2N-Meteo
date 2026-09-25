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
app.use(cors()); // app represente donc notre serveur express
// app.use(cors()); utorise React (origine http://localhost:5173) à faire des requêtes vers ce serveur (origine http://localhost:3001)
// sans ca le navigateur bloque les reponses du serveur 


/*definition des routes */
app.get("/api/test", (req, res) => {   // une fonction qui recoit deux parametres req et res (requete recu et response que l'on va renvoyer)
  res.json({ message: "L'API demarre normalement 😁😁 !" });
});


/**fonction de recherche de coordonnées par nom de ville */
const URL_GEOCODAGE = "https://geocoding-api.open-meteo.com/v1/search"; // URL de l'API de geocodage d'Open-Meteo

async function trouverCoordonnes(ville){
  const param = new URLSearchParams({
    name: ville,
    count: "1", // on ne veut qu'un seul resultat
    language: "fr",
    country:"FR"
  });

  const response = await fetch(`${URL_GEOCODAGE}?${param}`); // on attend la reponse de l'API de geocodage
  var donnees = await response.json();

  if(!donnees.results || donnees.results.length === 0) {
    console.log(`Aucune donnée trouvée pour la ville : ${ville}`);
    return null ;
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
/**fonction de recupération de météo par nom de ville */
async function recupererPrevision(ville,latitude,longitude,modele){

  const param = new URLSearchParams({  // les parametres de la requete à l'API de prévision necessaire pour une prevision appropriée
    latitude: latitude,
    longitude: longitude,
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,apparent_temperature_max,apparent_temperature_min,wind_speed_10m_max", // car on veut les temperatures max et min et la somme des precipitations
    hourly: "relative_humidity_2m,cloud_cover", 
    models: modele,   // le modele de prevision a utiliser (AROME, ICON, ARPEGE)
    timezone: "Europe/Paris", 
    forecast_days: "7", // on veut une prevision pour 7 jours  , mais le modele ne se limite qu'à 4 jours
  });

  const response = await fetch(`${URL_PREVISION}?${param}`);
  var donnees = await response.json();

  if(!donnees.daily) {
    console.log(`Aucune donnée de prévision trouvée pour ${ville} de coordonnées : ${latitude}, ${longitude}`);
    return null ;
  }

  return {
    valeurs1: donnees.daily,
    unites_valeurs1: donnees.daily_units,
    valeurs2: donnees.hourly,
    unites_valeurs2: donnees.hourly_units,
  } // on renvoie les donnees de prévision et les unités de mesure

}


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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Le serveur a demarrer sur le port :  ${PORT} donc acces avec http://localhost:${PORT}`);
});