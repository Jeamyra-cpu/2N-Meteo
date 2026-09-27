CREATE TABLE station (
    id_station INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6)
);

CREATE TABLE weather_code (
    code INTEGER PRIMARY KEY,
    description VARCHAR(255) NOT NULL
);

CREATE TABLE utilisateur (
    id_utilisateur INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mail VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE observation (
    id_observation INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_station INTEGER NOT NULL REFERENCES station(id_station),
    date_heure TIMESTAMP NOT NULL,
    temperature NUMERIC(5,2),
    humidite NUMERIC(5,2),
    precipitation NUMERIC(8,2),
    couverture_nuages NUMERIC(5,2),
    vitesse_vent NUMERIC(6,2),
    snowfall NUMERIC(8,2),
    weather_code INTEGER,
    ressenti NUMERIC(5,2)
);

CREATE TABLE prediction (
    id_prediction INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_station INTEGER NOT NULL REFERENCES station(id_station),
    date_prediction TIMESTAMP NOT NULL,
    heure_cible TIMESTAMP NOT NULL,
    horizon INTEGER,
    temperature_moyenne NUMERIC(10,2),
    temperature_q10 NUMERIC(10,2),
    temperature_q50 NUMERIC(10,2),
    temperature_q90 NUMERIC(10,2),
    precipitation_moyenne NUMERIC(10,2),
    precipitation_q10 NUMERIC(10,2),
    precipitation_q50 NUMERIC(10,2),
    precipitation_q90 NUMERIC(10,2),
    humidite_moyenne NUMERIC(10,2),
    humidite_q10 NUMERIC(10,2),
    humidite_q50 NUMERIC(10,2),
    humidite_q90 NUMERIC(10,2),
    couverture_nuages_moyenne NUMERIC(10,2),
    couverture_nuages_q10 NUMERIC(10,2),
    couverture_nuages_q50 NUMERIC(10,2),
    couverture_nuages_q90 NUMERIC(10,2),
    snowfall_moyenne NUMERIC(10,2),
    snowfall_q10 NUMERIC(10,2),
    snowfall_q50 NUMERIC(10,2),
    snowfall_q90 NUMERIC(10,2),
    vitesse_vent_moyenne NUMERIC(10,2),
    vitesse_vent_q10 NUMERIC(10,2),
    vitesse_vent_q50 NUMERIC(10,2),
    vitesse_vent_q90 NUMERIC(10,2),
    ressenti_moyenne NUMERIC(10,2),
    ressenti_q10 NUMERIC(10,2),
    ressenti_q50 NUMERIC(10,2),
    ressenti_q90 NUMERIC(10,2)
);

CREATE TABLE station_utilisateur (
    id_station_utilisateur INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateur(id_utilisateur),
    id_station INTEGER NOT NULL REFERENCES station(id_station),
    date_recherche TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conseil (
    id_conseil INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code INTEGER NOT NULL REFERENCES weather_code(code),
    temperature_min NUMERIC(5,2),
    temperature_max NUMERIC(5,2),
    texte TEXT NOT NULL
);