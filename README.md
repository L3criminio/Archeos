# Archeos

Landing page immersive pour **Archeos**, une chaîne YouTube étudiante autour de l'archéologie, de l'exploration et des reconstructions 3D.

Le site prend la forme d'une expérience cinématique : identité sombre et premium, galerie de transition, vidéo récente de la chaîne, scène 3D du Titanic, Shorts intégrés et section équipe.

## Site en ligne

```text
https://l3criminio.github.io/Archeos/
```

## Fonctionnalités

- Hero immersif avec logo Archeos SVG.
- Galerie d'images en transition sous l'intro.
- Embed automatique de la dernière vidéo de la chaîne via playlist YouTube.
- Section Titanic desktop-first avec modèle `titanic.glb`, hotspot interactif et modale vidéo cinéma.
- Fallback mobile/reduced-motion pour éviter les écrans noirs WebGL.
- Section Shorts avec lecteur YouTube intégré.
- Carrousel équipe circulaire en CSS 3D.
- Footer avec mentions légales.
- Passe accessibilité : skip link, focus visible, titres/labels corrigés, modale clavier.

## Stack

| Usage | Outils |
| --- | --- |
| Build | Vite |
| CSS | Tailwind CSS v4 + CSS custom |
| Animations | GSAP, ScrollTrigger, Lenis |
| 3D | Three.js, GLTFLoader, Meshopt |
| Icônes | Lucide |
| Déploiement | GitHub Pages + GitHub Actions |

## Installation

```bash
npm install
npm run dev
```

Build production :

```bash
npm run build
npm run preview
```

## Assets importants

```text
public/Archeos.svg                 Logo principal
public/carousel/gallery-01..17.webp Galerie de transition
public/team/*.jpeg                 Photos de l'équipe
public/models/titanic.glb          Modèle 3D Titanic
public/site.webmanifest            Manifest PWA/favicons
```

La vidéo Titanic se configure dans `index.html` sur la section `#video` :

```html
data-titanic-video-id="REPLACE_WITH_VIDEO_ID"
```

Remplacer `REPLACE_WITH_VIDEO_ID` par l'ID YouTube réel quand la vidéo finale est prête.

## Checks qualité

Après un build :

```bash
npm run build
npx html-validate index.html
npx vnu-jar dist/index.html
```

Pour l'audit accessibilité :

```bash
npm run preview -- --host 127.0.0.1 --port 4175 --strictPort
npx pa11y http://127.0.0.1:4175/ --standard WCAG2AA --wait 1000 --timeout 60000
```

Pour Lighthouse/performance :

```bash
npm run preview -- --host 127.0.0.1 --port 4175 --strictPort
npx lighthouse http://127.0.0.1:4175/ --preset=desktop --only-categories=performance
npx lighthouse http://127.0.0.1:4175/ --only-categories=performance
```

Note : le validateur Nu peut afficher des infos sur les balises void autofermées générées/formatées côté HTML. Elles ne bloquent pas la validation tant qu'il n'y a pas d'erreur.

## Déploiement GitHub Pages

Le déploiement est automatisé depuis la branche `greg`.

À chaque push sur `greg`, le workflow `.github/workflows/deploy.yml` :

1. installe les dépendances avec `npm ci`;
2. lance `npm run build`;
3. publie `dist/` via GitHub Pages.

Dans GitHub, Pages doit être configuré sur :

```text
Settings > Pages > Build and deployment > Source: GitHub Actions
```

## Maintenance

Les consignes de mise à jour, de push et de dépannage sont dans [INSTRUCTIONS.md](./INSTRUCTIONS.md).
