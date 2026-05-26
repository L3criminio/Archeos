# Archeos

Landing page immersive pour la chaîne YouTube **Archeos**.

Le site garde une direction archéologie futuriste avec une palette sombre dominée par le terracotta `#912810`. La section vidéo est une rupture volontaire : une descente abyssale autour du Titanic, avec scène 3D desktop-first et fallback image sur mobile ou si WebGL échoue.

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Modèle 3D Titanic

Place le modèle GLB ici :

```text
public/models/titanic.glb
```

Notes :
- Le modèle est chargé uniquement quand la section vidéo approche du viewport.
- Le GLB actuel est optimisé avec glTF Transform : compression Meshopt, textures WebP et taille ramenée à environ 3.3 MB.
- Desktop : scène Three.js avec modèle 3D, scan au curseur et capsule vidéo.
- Mobile, `prefers-reduced-motion` ou échec WebGL : fallback image premium, sans écran noir.
- Si le GLB source est remplacé plus tard, il faut viser une version finale sous 5 MB avant publication.

## Publication GitHub

```bash
git init
git add .
git commit -m "Initial Archeos landing page"
git branch -M main
git remote add origin https://github.com/<utilisateur>/<repo>.git
git push -u origin main
```

Remplace `<utilisateur>` et `<repo>` par le compte et le dépôt GitHub.

## Déploiement GitHub Pages

Le projet contient un workflow prêt à l'emploi :

```text
.github/workflows/deploy.yml
```

À vérifier dans GitHub :
- Va dans `Settings > Pages`.
- Dans `Build and deployment`, choisis `GitHub Actions`.
- Push sur `main`, puis attends la fin de l'action `Deploy GitHub Pages`.
- Si tu travailles depuis la branche `greg`, le workflow se lance aussi au push sur `greg`.

La config Vite ajuste automatiquement le `base` pour GitHub Pages avec `GITHUB_REPOSITORY`. Pour ce repo, le build Pages utilisera donc `/Archeos/`.
