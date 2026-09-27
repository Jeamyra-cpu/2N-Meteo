INSERT INTO station (nom,latitude,longitude)
VALUES
('Paris',48.8566,2.3522),
('Lyon',45.7640,4.8357),
('Marseille',43.2965,5.3698),
('Bordeaux',44.8378,-0.5792),
('Lille',50.6292,3.0573),
('Limoges',45.8315,1.2578);

INSERT INTO observation (
    id_station,
    date_heure,
    temperature,
    humidite,
    precipitation,
    couverture_nuages,
    vitesse_vent,
    snowfall,
    weather_code,
    ressenti
)
VALUES
(1,'2026-09-25 08:00:00',13.8,78,0.0,65,9.5,0.0,3,13.0),
(1,'2026-09-25 10:00:00',15.6,72,0.0,50,11.2,0.0,2,15.0),
(1,'2026-09-25 12:00:00',18.2,64,0.2,40,13.4,0.0,2,18.0),
(1,'2026-09-25 14:00:00',19.7,59,0.0,30,15.1,0.0,1,19.5),
(2,'2026-09-25 08:00:00',12.4,81,0.0,70,6.8,0.0,3,12.0),
(2,'2026-09-25 10:00:00',15.1,70,0.0,50,8.4,0.0,2,15.0),
(2,'2026-09-25 12:00:00',18.7,59,0.0,25,10.2,0.0,1,18.5),
(2,'2026-09-25 14:00:00',20.3,53,0.0,20,11.7,0.0,1,20.0),
(3,'2026-09-26 08:00:00',18.9,61,0.0,15,17.8,0.0,1,18.0),
(3,'2026-09-26 10:00:00',21.7,54,0.0,10,20.4,0.0,0,21.5),
(3,'2026-09-26 12:00:00',24.6,48,0.0,5,22.1,0.0,0,24.0),
(3,'2026-09-26 14:00:00',26.1,45,0.0,5,24.3,0.0,0,25.5),
(4,'2026-09-26 08:00:00',14.7,82,0.4,75,8.2,0.0,3,14.0),
(4,'2026-09-26 10:00:00',16.3,76,0.2,65,10.1,0.0,3,16.0),
(4,'2026-09-26 12:00:00',18.5,69,0.0,55,12.5,0.0,2,18.0),
(4,'2026-09-26 14:00:00',20.1,63,0.0,45,14.0,0.0,2,20.0),
(5,'2026-09-27 08:00:00',12.1,86,0.8,90,12.4,0.0,61,11.5),
(5,'2026-09-27 10:00:00',13.5,82,0.5,85,14.1,0.0,61,13.0),
(5,'2026-09-27 12:00:00',15.2,76,0.2,75,16.0,0.0,61,15.0),
(5,'2026-09-27 14:00:00',16.4,72,0.0,65,17.3,0.0,3,15.5),
(6,'2026-09-27 08:00:00',11.8,88,0.6,90,8.5,0.0,61,11.0),
(6,'2026-09-27 10:00:00',13.2,83,0.3,85,10.2,0.0,61,12.5),
(6,'2026-09-27 12:00:00',15.1,77,0.1,75,12.4,0.0,2,14.5),
(6,'2026-09-27 14:00:00',16.4,72,0.0,65,13.8,0.0,2,16.0);

INSERT INTO weather_code (code,description)
VALUES
(0,'Ciel dégagé'),
(1,'Principalement dégagé'),
(2,'Partiellement nuageux'),
(3,'Couvert'),
(45,'Brouillard'),
(48,'Brouillard givrant'),
(51,'Bruine légère'),
(53,'Bruine modérée'),
(55,'Bruine forte'),
(61,'Pluie légère'),
(63,'Pluie modérée'),
(65,'Pluie forte'),
(71,'Neige légère'),
(73,'Neige modérée'),
(75,'Neige forte'),
(80,'Averses de pluie légères'),
(81,'Averses de pluie modérées'),
(82,'Averses de pluie violentes'),
(85,'Averses de neige légères'),
(86,'Averses de neige fortes'),
(95,'Orage'),
(96,'Orage avec grêle légère'),
(99,'Orage avec grêle forte');

INSERT INTO conseil (
    code,
    temperature_min,
    temperature_max,
    texte
)
VALUES
(0,15,30,'Profitez du beau temps pour vos activités extérieures.'),
(1,15,30,'Les conditions sont favorables aux activités extérieures.'),
(2,10,25,'Temps partiellement nuageux : prévoyez éventuellement une veste légère.'),
(3,5,20,'Ciel couvert : une veste peut être recommandée.'),
(45,0,15,'Brouillard : soyez prudents lors de vos déplacements.'),
(51,5,20,'Bruine légère : pensez à prendre un vêtement imperméable.'),
(61,5,20,'Risque de pluie : prévoyez un parapluie.'),
(63,5,20,'Pluie modérée : prévoyez un équipement adapté à la pluie.'),
(65,0,20,'Fortes pluies : limitez les activités extérieures si possible.'),
(71,-5,5,'Neige légère : soyez prudents lors de vos déplacements.'),
(73,-5,5,'Neige modérée : prévoyez des conditions de circulation difficiles.'),
(75,-10,5,'Fortes chutes de neige : soyez particulièrement prudents.'),
(80,10,25,'Averses possibles : gardez un parapluie à portée de main.'),
(81,5,20,'Averses modérées : prévoyez une protection contre la pluie.'),
(82,5,20,'Fortes averses : évitez si possible les activités extérieures.'),
(85,-5,5,'Averses de neige : soyez prudents sur les routes.'),
(86,-10,5,'Fortes averses de neige : déplacements potentiellement difficiles.'),
(95,10,30,'Orage : évitez les activités extérieures exposées.');

INSERT INTO station_utilisateur (
    id_utilisateur,
    id_station,
    date_recherche
)
VALUES
(1,1,'2026-09-25 08:15:00'),
(1,3,'2026-09-25 09:30:00'),
(2,1,'2026-09-25 10:05:00'),
(2,2,'2026-09-26 10:20:00'),
(3,4,'2026-09-26 11:10:00'),
(3,5,'2026-09-26 11:35:00'),
(4,3,'2026-09-27 12:15:00'),
(1,1,'2026-09-27 13:00:00'),
(1,6,'2026-09-27 13:15:00');

INSERT INTO prediction (
    id_station,
    date_prediction,
    heure_cible,
    horizon,
    temperature_moyenne,
    temperature_q10,
    temperature_q50,
    temperature_q90,
    precipitation_moyenne,
    precipitation_q10,
    precipitation_q50,
    precipitation_q90,
    humidite_moyenne,
    humidite_q10,
    humidite_q50,
    humidite_q90,
    couverture_nuages_moyenne,
    couverture_nuages_q10,
    couverture_nuages_q50,
    couverture_nuages_q90,
    snowfall_moyenne,
    snowfall_q10,
    snowfall_q50,
    snowfall_q90,
    vitesse_vent_moyenne,
    vitesse_vent_q10,
    vitesse_vent_q50,
    vitesse_vent_q90,
    ressenti_moyenne,
    ressenti_q10,
    ressenti_q50,
    ressenti_q90
)
VALUES
(1,'2026-09-25 14:00:00','2026-09-27 20:00:00',6,17.8,16.2,17.7,19.5,0.3,0.0,0.2,0.8,65,56,64,75,35,15,35,55,0.0,0.0,0.0,0.0,14.0,9.0,13.5,19.0,17.3,15.8,17.2,19.0),
(2,'2026-09-25 14:00:00','2026-09-27 20:00:00',6,18.9,17.1,18.8,20.5,0.1,0.0,0.0,0.4,59,50,58,69,25,10,25,45,0.0,0.0,0.0,0.0,10.5,6.0,10.0,15.5,18.4,16.7,18.3,20.0),
(3,'2026-09-26 14:00:00','2026-09-27 20:00:00',6,24.1,22.5,24.0,26.0,0.0,0.0,0.0,0.1,48,40,47,57,10,0,10,25,0.0,0.0,0.0,0.0,21.5,16.0,21.0,27.0,23.7,22.0,23.6,25.5),
(4,'2026-09-26 14:00:00','2026-09-27 20:00:00',6,19.2,17.5,19.1,21.0,0.5,0.1,0.4,1.2,68,58,67,78,50,30,50,70,0.0,0.0,0.0,0.0,13.0,8.0,12.5,18.0,18.5,16.8,18.4,20.3),
(5,'2026-09-27 14:00:00','2026-09-27 20:00:00',6,15.7,14.1,15.6,17.2,0.7,0.1,0.5,1.8,77,67,76,87,70,50,70,90,0.0,0.0,0.0,0.0,16.0,11.0,15.5,21.0,14.8,13.2,14.7,16.5),
(6,'2026-09-27 14:00:00','2026-09-27 20:00:00',6,14.8,13.2,14.7,16.5,0.8,0.1,0.6,2.0,78,69,77,88,70,50,70,90,0.0,0.0,0.0,0.0,12.5,8.0,12.0,18.0,14.1,12.6,14.0,15.8);

INSERT INTO utilisateur (
    id_utilisateur,
    mail
)
VALUES
(1,"alexandra.sophie@example.com"),
(2,"mercy.alice@example.com"),
(3,"nobel.bernard@example.com"),
(4,"stephane.martin@example.com");
