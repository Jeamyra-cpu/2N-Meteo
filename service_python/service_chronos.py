import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from chronos import BaseChronosPipeline

# Instanciation de l'application FastAPI
# C'est l'objet principal qui va gérer les routes et les requêtes HTTP
app = FastAPI(title="Service Météo Chronos")

# Chargement du modèle au démarrage du serveur
# On le charge une seule fois au lancement pour éviter d'impacter les temps de réponse lors des requêtes
print("Chargement du modèle Chronos...")
pipeline = BaseChronosPipeline.from_pretrained(
    "amazon/chronos-bolt-tiny",  # Modèle pré-entraîné léger pour séries temporelles
    device_map="cpu",             # Exécution sur le processeur (CPU)
    torch_dtype=torch.float32     # Précision des données numériques PyTorch
)
print("Modèle Chronos chargé avec succès !")

# Définition de la structure de données attendue dans le corps de la requête (Body)
# Pydantic valide automatiquement le type des données envoyées par Node.js
class RequetePrediction(BaseModel):
    historique: list[float]       # Liste de nombres flottants (ex. températures sur 29 jours)
    prediction_length: int = 72   # Durée de prédiction souhaitée en heures (72h par défaut)

# Déclaration d'une route POST '/predict'
# On utilise POST car on transmet un tableau volumineux dans le corps de la requête
@app.post("/predict")
def predire_temperature(donnees: RequetePrediction):
    # Vérification : rejet de la requête si le tableau d'historique est vide
    if not donnees.historique:
        raise HTTPException(status_code=400, detail="L'historique ne peut pas être vide")

    try:
        # Conversion de la liste Python en tenseur PyTorch
        # .unsqueeze(0) transforme la forme 1D en 2D (1, N) car le modèle attend un lot (batch_size=1)
        contexte = torch.tensor(donnees.historique, dtype=torch.float32).unsqueeze(0)

        # Inférence du modèle Chronos
        # inputs : le tenseur contenant l'historique
        # prediction_length : le nombre de pas de temps futurs à estimer
        # quantile_levels : calcul des quantiles 0.1 (bas), 0.5 (médian/moyen) et 0.9 (haut)
        quantiles, moyenne = pipeline.predict_quantiles(
            inputs=contexte,
            prediction_length=donnees.prediction_length,
            quantile_levels=[0.1, 0.5, 0.9]
        )

        # Extraction du quantile médian (index 1) et conversion du tenseur PyTorch en liste Python
        q_05_brut = quantiles[0, :, 1].tolist()
        
        # Arrondi de chaque température à 1 chiffre après la virgule pour un affichage propre
        q_05_arrondi = [round(temp, 1) for temp in q_05_brut]

        # Découpage du tableau de 72 heures en 3 tranches de 24 heures
        jour_1 = q_05_arrondi[0:24]
        jour_2 = q_05_arrondi[24:48]
        jour_3 = q_05_arrondi[48:72]

        # Structure de la réponse JSON renvoyée à Express / React
        return {
            "prediction_par_jour": {
                "jour_1": jour_1,
                "jour_2": jour_2,
                "jour_3": jour_3
            },
            "total_heures": q_05_arrondi
        }

    except Exception as erreur:
        # Journalisation de l'erreur brute dans la console Python pour le débogage
        print("Erreur brute Python :", type(erreur), erreur)
        # Renvoi d'une erreur 500 au client avec le détail de l'exception
        raise HTTPException(status_code=500, detail=str(erreur))