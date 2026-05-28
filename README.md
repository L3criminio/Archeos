# Archeos

Landing page immersive pour la chaîne YouTube **Archeos**.

Le site garde une direction archéologie futuriste avec une palette sombre dominée par l'ambre bronze `#CA8A24`. La section vidéo est une rupture volontaire : une descente abyssale autour du Titanic, avec scène 3D desktop-first et fallback image sur mobile ou si WebGL échoue.

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

<<<<<<< HEAD
## Assets de marque

Les logos, favicons et icônes d'installation sont dans `public/`.

```text
public/favicon-archeos-16px.png
public/favicon-archeos-32px.png
public/apple-touch-icon.png
public/android-chrome-192x192.png
public/android-chrome-512x512.png
public/site.webmanifest
```

Le HTML utilise `%BASE_URL%` pour que ces assets fonctionnent aussi sur GitHub Pages quand le site est publié dans un sous-dossier de dépôt.

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
=======
## Prévisualisation production
>>>>>>> origin/sheedan

```bash
npm run preview
```

<<<<<<< HEAD
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
=======
## Sécurité et GitHub Pages

GitHub Pages sert automatiquement le site en HTTPS si l'option est activée dans les réglages du dépôt. Active l'option **Enforce HTTPS**, vérifie le domaine publié, puis teste le formulaire après publication.

Cette landing ajoute une CSP via une balise `<meta>` dans `index.html`. Elle autorise uniquement les ressources locales, Google Fonts, les images et iframes YouTube utilisées par la page, et le webhook Make actuel pour l'envoi du formulaire.

GitHub Pages ne permet pas de configurer proprement les headers serveur suivants sans plateforme ou proxy supplémentaire : `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options` et `Permissions-Policy`. Si ces headers deviennent obligatoires, il faudra passer par une plateforme qui accepte des headers personnalisés.

Le webhook Make reste exposé dans le JavaScript front pour conserver le formulaire actuel. Ne place jamais de clé API privée, token ou secret dans le front.

## Avant de push sur GitHub

Vérifier l'état du dépôt :

```bash
git status
git diff --stat
git diff --name-only
git diff
```

Vérifier le site :

```bash
npm run build
npm run preview
```

Workflow conseillé :

```bash
git checkout -b chore/security-landing-page
git status
git diff --stat
npm run build
git add .
git commit -m "Secure landing page newsletter form"
git push origin chore/security-landing-page
```

Ne push pas automatiquement sans avoir relu le diff.
>>>>>>> origin/sheedan
