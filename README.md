# Archeos

Landing page Vite + Tailwind CSS pour la chaîne YouTube Archeos.

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

## Prévisualisation production

```bash
npm run preview
```

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
