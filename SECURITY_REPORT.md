# Security Report - Archeos

## Résumé des changements

- Projet inspecté : landing page Vite + Tailwind CSS, sans backend maison.
- Ajout d'une CSP statique via `index.html`, adaptée aux ressources réellement utilisées.
- Durcissement léger du formulaire sans changer son interface : validation native conservée, limite email, valeurs nettoyées, messages d'erreur génériques.
- Complément de `.gitignore` pour éviter de versionner les fichiers sensibles ou les builds.
- Documentation ajoutée dans `README.md` pour prévisualiser, relire les diffs et préparer un push GitHub.

## Headers et protections

GitHub Pages ne permet pas d'ajouter de vrais headers serveur personnalisés au projet. Les protections suivantes sont donc documentées comme limites GitHub Pages :

- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Permissions-Policy`

Protections statiques ajoutées dans `index.html` :

- `Referrer-Policy` via `<meta name="referrer" content="strict-origin-when-cross-origin">`
- `Content-Security-Policy` via `<meta http-equiv="Content-Security-Policy">`
- `rel="noopener noreferrer"` sur les liens externes ouverts dans un nouvel onglet

Sources externes autorisées par la CSP :

- `https://fonts.googleapis.com` et `https://fonts.gstatic.com` pour Google Fonts.
- `https://i.ytimg.com` pour les images YouTube utilisées par la page.
- `https://www.youtube.com` et `https://www.youtube-nocookie.com` pour l'iframe vidéo.
- `https://hook.eu1.make.com` pour conserver l'envoi actuel du formulaire Make.
- `ws:` pour le rechargement Vite en développement local.
- `'unsafe-inline'` dans `style-src` pour conserver les styles inline déjà présents dans la page et le `srcdoc` vidéo sans casser le design.

## Formulaire

- Les champs actuels `nom`, `email` et `message` sont conservés.
- Le champ email reste en `type="email"` et reçoit `maxlength="254"` et `autocomplete="email"`.
- Le JavaScript utilise `textContent`, pas `innerHTML`, pour les messages utilisateur.
- Les valeurs envoyées sont nettoyées avec `trim()`.
- Les erreurs affichées sont génériques et ne révèlent pas de détail technique.
- Le bouton est désactivé pendant l'envoi pour limiter les soumissions multiples.

## Anti-spam

- La protection contre les soumissions multiples côté interface est active.
- Aucun honeypot ou CAPTCHA n'a été ajouté afin de conserver le formulaire actuel inchangé.
- À vérifier côté Make : activer si possible un rate limit, un double opt-in ou une validation anti-abus côté scénario/provider.

## RGPD et consentement

- Le formulaire actuel a été conservé sans ajout de case de consentement, conformément au plan validé.
- Point à vérifier manuellement : si ce formulaire sert réellement à une newsletter, ajouter plus tard un consentement explicite non précoché et un lien vers une politique de confidentialité.
- Le message utilisateur ne doit jamais indiquer clairement qu'un email existe déjà.

## Secrets et variables d'environnement

- Aucun fichier `.env` n'a été ajouté.
- `.gitignore` exclut maintenant `.env`, `.env.local`, `.env.*.local`, `node_modules`, `dist` et `build`.
- Risque accepté pour cette version : le webhook Make reste exposé dans le JavaScript front afin de conserver le formulaire actuel. Cette URL peut être appelée hors du site.
- Ne jamais placer de clé API privée, token ou secret dans le JavaScript front, le HTML ou le README.

## Commandes pour tester

```bash
npm audit --audit-level=low
npm run build
npm run preview
```

## Points à vérifier manuellement

- Activer **Enforce HTTPS** dans les réglages GitHub Pages.
- Tester le formulaire après publication.
- Vérifier que la CSP ne bloque pas Google Fonts, les images YouTube, l'iframe YouTube, les assets Vite ni l'appel Make.
- Vérifier dans Make que les inscriptions ou messages sont filtrés correctement.
- Relire le diff avant commit avec `git diff --stat`, `git diff --name-only` et `git diff`.
