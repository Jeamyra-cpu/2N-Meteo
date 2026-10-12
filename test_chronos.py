"""
Script d'exploration n°2 : tester Chronos (modèle de prévision de
séries temporelles pré-entraîné, développé par Amazon).

Objectif : vérifier qu'on sait charger le modèle et obtenir une
prédiction, avant de le brancher sur de vraies données Open-Meteo.

Installation préalable (une seule fois, dans un environnement virtuel
de préférence) :
    python -m venv venv
    venv\\Scripts\\activate        (Windows)
    source venv/bin/activate      (Mac/Linux)
    pip install chronos-forecasting

IMPORTANT : `pip install` installe uniquement la bibliothèque (le code).
Le fichier de poids du modèle (quelques dizaines de Mo pour la version
"tiny") est téléchargé automatiquement au moment de la première exécution
de ce script, via Hugging Face — il faut donc une connexion internet
active la première fois. Ensuite, le modèle reste en cache localement
(dans le dossier .cache de l'utilisateur) et les exécutions suivantes
ne re-téléchargent rien.
"""

import torch
from chronos import BaseChronosPipeline

# Exemple de données : à remplacer plus tard par un vrai historique
# de températures récupéré via test_open_meteo.py (voir tester_historique)
historique_temperatures = torch.tensor(
    [18.2, 19.0, 19.5, 21.0, 22.3, 21.8, 20.5, 19.9, 18.7, 19.2]
)

print("Chargement du modèle Chronos (tiny)...")
pipeline = BaseChronosPipeline.from_pretrained(
    "amazon/chronos-bolt-tiny",
    device_map="cpu",  # on force le CPU, pas besoin de GPU pour ce modèle
)

print("Calcul de la prédiction pour les 3 prochains jours...")
# predict_quantiles renvoie (quantiles, moyenne) : quantiles = plusieurs scénarios
# possibles (pessimiste/médian/optimiste), moyenne = la valeur la plus probable.
quantiles, moyenne = pipeline.predict_quantiles(
    inputs=historique_temperatures,
    prediction_length=3,
    quantile_levels=[0.1, 0.5, 0.9],
)

print("Prédiction moyenne (3 prochains jours) :", moyenne)
print("Quantiles [10%, 50%, 90%] :", quantiles)