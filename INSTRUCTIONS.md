# Instructions Archeos

Guide interne pour maintenir, tester et publier la landing page Archeos.

## Workflow pour les futures updates

1. Fais tes modifications dans le projet.
2. Teste localement :

```bash
npm run dev
```

3. Vérifie le build avant de push :

```bash
npm run build
```

4. Commit puis push sur la branche `greg` :

```bash
git add .
git commit -m "Describe update"
git push origin greg
```

5. Va dans l'onglet `Actions` du repo GitHub.
6. Attends que l'action `Deploy GitHub Pages` soit terminée.
7. Vérifie le site publié :

```text
https://l3criminio.github.io/Archeos/
```

## Configuration GitHub Pages

Dans GitHub :

- Va dans `Settings > Pages`.
- Dans `Build and deployment`, choisis `GitHub Actions`.
- Ne choisis pas `Deploy from a branch`, sinon GitHub servira le fichier `index.html` brut et le CSS ne chargera pas.

Le workflow utilisé est :

```text
.github/workflows/deploy.yml
```

Il construit le dossier `dist`, l'envoie comme artifact, puis publie le site avec l'action officielle GitHub Pages.

## Commandes projet

Installer les dépendances :

```bash
npm install
```

Lancer le serveur local :

```bash
npm run dev
```

Créer le build production :

```bash
npm run build
```

Prévisualiser le build :

```bash
npm run preview
```

## Assets de marque

Les logos, favicons et icônes sont dans `public/`.

```text
public/Archeos.svg
public/favicon-archeos-16px.png
public/favicon-archeos-32px.png
public/apple-touch-icon.png
public/android-chrome-192x192.png
public/android-chrome-512x512.png
public/site.webmanifest
```

Le HTML utilise `%BASE_URL%` pour que les assets fonctionnent sur GitHub Pages avec le sous-dossier `/Archeos/`.

## Modèle 3D Titanic

Le modèle GLB doit rester ici :

```text
public/models/titanic.glb
```

Notes :

- Le modèle est chargé seulement quand la section vidéo approche du viewport.
- Desktop : scène Three.js avec modèle 3D, scan au curseur et reveal vidéo.
- Mobile, `prefers-reduced-motion` ou échec WebGL : fallback image, sans écran noir.
- Le GLB actuel est optimisé avec glTF Transform : Meshopt, textures WebP, environ 3.3 MB.
- Si le modèle est remplacé, viser idéalement moins de 5 MB.

## Points importants

- Branche de travail et de déploiement : `greg`.
- Ne pas push `dist/`; le workflow le génère.
- Si le site publié affiche du HTML brut sans style, vérifier que Pages est bien sur `GitHub Actions`.
- Le warning Vite sur le chunk Three.js est connu et non bloquant.
