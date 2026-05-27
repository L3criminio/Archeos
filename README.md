# Archeos

**Archeos** is an immersive landing page prototype for a YouTube project about archaeology, exploration and 3D reconstruction.

The experience is designed as a cinematic digital artifact: dark, mineral, atmospheric, and built around a premium amber identity. The main video section breaks into an abyssal Titanic sequence, with a desktop-first Three.js model, scroll depth, cursor scanning and a cinematic video reveal.

## Live Site

```text
https://l3criminio.github.io/Archeos/
```

## Concept

Archeos presents historical subjects as visual investigations.

The landing page follows the idea of descending through digital layers:

- the surface identity of the channel;
- editorial and visual concept cards;
- an abyssal Titanic reconstruction sequence;
- short-form content teasers;
- a final subscription call to action.

The visual direction mixes archaeology, dark sci-fi interfaces, cinematic documentary language and restrained premium motion.

## Highlights

- Immersive hero with custom Archeos SVG wordmark.
- Dark amber visual identity based around `#CA8A24`.
- Smooth scroll and parallax motion with Lenis and GSAP.
- Desktop-first Titanic 3D scene using Three.js.
- Mobile and reduced-motion fallbacks.
- Main video reveal modes:
  - `?reveal=archive`
  - `?reveal=scan`
  - `?reveal=vortex`
- GitHub Pages deployment through GitHub Actions.

## Tech Stack

| Layer | Tools |
| --- | --- |
| Build | Vite |
| Styling | Tailwind CSS + custom CSS |
| Motion | GSAP, ScrollTrigger, Lenis |
| 3D | Three.js, GLTFLoader, Meshopt |
| Icons | Lucide |
| Hosting | GitHub Pages |

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```text
.
|-- index.html
|-- src/
|   |-- main.js
|   |-- styles.css
|   `-- titanicExperience.js
|-- public/
|   |-- Archeos.svg
|   |-- models/titanic.glb
|   `-- site.webmanifest
`-- .github/workflows/deploy.yml
```

## Deployment

The project deploys to GitHub Pages from the `greg` branch.

On every push to `greg`, the workflow:

1. installs dependencies with `npm ci`;
2. builds the Vite project;
3. uploads `dist` as a GitHub Pages artifact;
4. deploys the artifact with the official Pages action.

GitHub Pages must be configured like this:

```text
Settings > Pages > Build and deployment > Source: GitHub Actions
```

## Maintenance

Operational notes, update workflow, asset locations and deployment troubleshooting are documented in:

[INSTRUCTIONS.md](./INSTRUCTIONS.md)

## Credits

Designed and developed as part of a student YouTube competition project.
