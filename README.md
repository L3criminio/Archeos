# Archeos

Landing page immersive pour **Archeos**, une chaîne YouTube étudiante autour de la technologie dans l'archéologie, de l'exploration et des reconstructions 3D.

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

## Assets importants

```text
public/Archeos.svg                 Logo principal
public/carousel/gallery-01..17.webp Galerie de transition
public/team/*.jpeg                 Photos de l'équipe
public/models/titanic.glb          Modèle 3D Titanic
public/site.webmanifest            Manifest PWA/favicons
```
## Maintenance

Les consignes de mise à jour, de push et de dépannage sont dans [INSTRUCTIONS.md](./INSTRUCTIONS.md).
