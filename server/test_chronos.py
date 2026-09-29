"""
weather_chronos_dataset.py
============================
Construit un jeu de données météo (via l'API Open-Meteo) au format
attendu par le modèle de prévision de séries temporelles Chronos
(Amazon, https://github.com/amazon-science/chronos-forecasting).

Variables prédites par Chronos :
    - temperature_2m        (Température, °C)
    - relative_humidity_2m  (Humidité, %)
    - precipitation         (Précipitations, mm)
    - cloud_cover           (Couverture nuageuse, %)
    - wind_speed_10m        (Vitesse du vent, km/h)

Installation requise :
    pip install requests pandas numpy torch chronos-forecasting
"""

import requests
import pandas as pd
import torch
from datetime import date, timedelta


# ------------------------------------------------------------------
# 1. Variables à récupérer / prédire
# ------------------------------------------------------------------
VARIABLES = [
    "temperature_2m",
    "relative_humidity_2m",
    "precipitation",
    "cloud_cover",
    "wind_speed_10m",
    "snow"
]


# ------------------------------------------------------------------
# 2. Récupération des données historiques depuis Open-Meteo
# ------------------------------------------------------------------
def fetch_weather_data(
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str,
    timezone: str = "auto",
) -> pd.DataFrame:
    """
    Récupère l'historique météo horaire via l'API Open-Meteo Archive.

    start_date / end_date au format "YYYY-MM-DD".
    Retourne un DataFrame indexé par le temps, une colonne par variable.
    """
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": ",".join(VARIABLES),
        "timezone": timezone,
    }

    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()
    data = response.json()

    df = pd.DataFrame(data["hourly"])
    df["time"] = pd.to_datetime(df["time"])
    df = df.set_index("time").sort_index()
    return df


def fetch_weather_forecast(
    latitude: float,
    longitude: float,
    forecast_days: int = 7,
    timezone: str = "auto",
) -> pd.DataFrame:
    """
    Récupère les prévisions officielles Open-Meteo (utile pour comparer
    aux prédictions générées par Chronos).
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ",".join(VARIABLES),
        "forecast_days": forecast_days,
        "timezone": timezone,
    }
    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()
    data = response.json()

    df = pd.DataFrame(data["hourly"])
    df["time"] = pd.to_datetime(df["time"])
    df = df.set_index("time").sort_index()
    return df


# ------------------------------------------------------------------
# 3. Nettoyage / préparation
# ------------------------------------------------------------------
def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """Interpole les trous et retire les lignes encore incomplètes."""
    df = df.copy()
    df = df.interpolate(method="linear", limit_direction="both")
    df = df.dropna()
    return df


# ------------------------------------------------------------------
# 4. Conversion au format Chronos
# ------------------------------------------------------------------
def to_chronos_context(df: pd.DataFrame, variable: str) -> torch.Tensor:
    """
    Chronos attend un tenseur 1D (le "contexte") par série temporelle
    univariée. On construit un tenseur par variable à prédire.
    """
    if variable not in df.columns:
        raise ValueError(f"Variable inconnue : {variable}")
    return torch.tensor(df[variable].values, dtype=torch.float32)


def build_chronos_dataset(df: pd.DataFrame) -> dict:
    """
    Construit un dictionnaire {nom_variable: tensor_contexte}, prêt à
    être passé un par un à ChronosPipeline.predict().
    """
    return {var: to_chronos_context(df, var) for var in VARIABLES}


# ------------------------------------------------------------------
# 5. Sauvegarde
# ------------------------------------------------------------------
def save_dataset(df: pd.DataFrame, path: str = "weather_dataset.csv") -> None:
    df.to_csv(path)
    print(f"Dataset sauvegardé : {path}")


# ------------------------------------------------------------------
# 6. Exemple d'utilisation complète (récupération -> Chronos -> prédiction)
# ------------------------------------------------------------------
if __name__ == "__main__":
    # -- Paramètres à adapter --
    LATITUDE = 48.8566      # Paris (à remplacer par ta localisation)
    LONGITUDE = 2.3522
    HISTORY_DAYS = 90        # profondeur d'historique pour l'entraînement/contexte
    PREDICTION_LENGTH = 2   # nb de pas de temps à prédire (24 = 24h si horaire)

    END = date.today() - timedelta(days=1)
    START = END - timedelta(days=HISTORY_DAYS)

    # 1. Récupération de l'historique
    df_raw = fetch_weather_data(
        LATITUDE, LONGITUDE,
        start_date=START.isoformat(),
        end_date=END.isoformat(),
    )

    # 2. Nettoyage
    df_clean = clean_dataset(df_raw)

    # 3. Sauvegarde en CSV (réutilisable, inspectable)
    save_dataset(df_clean)

    # 4. Préparation du dataset pour Chronos
    chronos_data = build_chronos_dataset(df_clean)

    # 5. Prédiction avec Chronos (nécessite : pip install chronos-forecasting)
    try:
        from chronos import ChronosPipeline

        pipeline = ChronosPipeline.from_pretrained(
            "amazon/chronos-t5-small",   # ou -tiny / -base / -large
            device_map="cpu",            # "cuda" si GPU disponible
            torch_dtype=torch.float32,
        )

        forecasts = {}
        for var, context in chronos_data.items():
            forecast = pipeline.predict(
                context,
                prediction_length=PREDICTION_LENGTH,
            )
            # forecast: tensor de forme [num_series, num_samples, prediction_length]
            forecasts[var] = forecast
            median = forecast[0].median(dim=0).values
            print(f"{var} -> prévision médiane (2 pas) :")
            print(median.tolist())

    except ImportError:
        print(
            "Le package 'chronos-forecasting' n'est pas installé.\n"
            "Installe-le avec : pip install chronos-forecasting"
        )