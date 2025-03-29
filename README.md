# P_Dev_426 : Site de l'UNESCO

Ce projet consiste à développer une plateforme en ligne interactive permettant aux utilisateurs de découvrir, explorer et suivre les sites du patrimoine mondial de l'UNESCO. Il offre une expérience immersive grâce à une carte interactive, des informations détaillées sur chaque site, des fonctionnalités de personnalisation comme le suivi des visites, ainsi que des interactions communautaires pour partager des expériences et des conseils.

Ce projet à pour but de mettre en pratique les compétences qui seront acquis dans le [module n°426](https://www.modulbaukasten.ch/module/426/1/fr-FR?title=D%C3%A9velopper-un-logiciel-avec-des-m%C3%A9thodes-agiles) qui consiste à "développer un logiciel avec des méthodes agiles".

## Scrum Master & Product Owner

-   [Aurélie Curchod](https://github.com/zfpacd)

## Product Goal

Mettre en place une plateforme en ligne qui permettra aux utilisateurs de
découvrir, d'explorer et de suivre les sites du patrimoine mondial de
l'UNESCO de manière interactive.

## Installation

### Prérequis

-   [Git](https://git-scm.com/downloads)
-   [Node.js](https://nodejs.org/) (version 16 ou ultérieure recommandée)

### 1. Cloner le projet

Récupérez le code source depuis GitHub :

```bash
git clone https://github.com/TRichardVD/P_Dev_426.git
```

Naviguez vers le répertoire du projet :

```bash
cd P_Dev_426  # Attention à la casse du nom du dossier
```

### 2. Configuration des certificats HTTPS

> **Note importante** : Ces commandes doivent être exécutées dans un terminal Git Bash sous Windows ou dans un terminal standard sous macOS/Linux.

Créez un dossier pour stocker les certificats :

```bash
mkdir certificates
cd certificates
```

Générez une clé privée RSA de 2048 bits :

```bash
openssl genrsa -out server.key 2048
```

Créez une demande de signature de certificat (CSR) :

```bash
openssl req -new -key server.key -out server.csr
# Vous serez invité à fournir des informations comme le pays, l'organisation, etc. mais ce n'est pas obligatoire.
```

Générez un certificat auto-signé valide pour 365 jours :

```bash
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
```

Revenez au répertoire principal du projet :

```bash
cd ..
```

### 3. Installation des dépendances

Installez tous les packages nécessaires définis dans package.json :

```bash
npm install
```

### 4. Lancement de l'application

Pour lancer l'application en mode production :

```bash
npm run start
```

Pour le développement avec rechargement automatique :

```bash
npm run dev
```

Une fois démarré, accédez à l'application via https://localhost/ dans votre navigateur.

## Comment collaborer ?

Rendez-vous sur le document [`collaborate.md`](./doc/collaborate.md)

## Developpeurs

-   [Abiram Muthulingam](https://github.com/AbiramMuth)
-   [Benjamin Germain Blouin](https://github.com/benjaminnnnnnnnnnnnn)
-   [Eithan Sanchez Filipe](https://github.com/EithanSanchezFilipe)
-   [Emir Krasniqi](https://github.com/EmirKrasniqi06)
-   [Jerry Cleuet](https://github.com/JerryCleuet)
-   [Nicola Golaz](https://github.com/NicolaGolaz)
-   [Théo Nicola Richard](https://github.com/TRichardVD)
