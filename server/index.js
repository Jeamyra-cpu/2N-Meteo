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

/*recherche meteo avec le nom d'une ville  */
app.get("/api/meteo/:ville", async (req, res) => { //async pour une attente mm des reponses longues 
  const ville = req.params.ville;
  res.json({ message: `Recherche de la météo pour la ville : ${ville}` });

  });

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Le serveur a demarrer sur le port :  ${PORT} donc acces avec http://localhost:${PORT}`);
});