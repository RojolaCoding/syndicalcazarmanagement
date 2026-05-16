# Syndic Alcazar

Application web de gestion transparente de la résidence Alcazar (Casablanca).

**Stack** : HTML / JavaScript vanilla + Firebase (Auth + Firestore + Storage) + Netlify pour le hosting.

---

## Architecture du projet

```
syndic-alcazar/
├── index.html               ← page de connexion
├── inscription.html         ← création de compte avec code d'invitation
├── setup.html               ← initialisation (à utiliser UNE SEULE FOIS)
│
├── admin/
│   └── dashboard.html       ← espace syndic (admin)
│       (biens, cotisations, dépenses, plaintes, propositions à venir)
│
├── copro/
│   └── accueil.html         ← espace copropriétaire
│       (mes biens, paiements, plaintes, propositions à venir)
│
├── assets/
│   ├── css/main.css         ← styles globaux (mobile-first)
│   └── js/
│       ├── firebase-init.js ← init Firebase
│       ├── auth.js          ← login, logout, garde-fous
│       ├── shell.js         ← sidebar + burger menu
│       └── utils.js         ← format MAD, dates, normalisation tel, etc.
│
├── firestore.rules.SETUP.txt       ← règles à coller AVANT le setup
├── firestore.rules.PRODUCTION.txt  ← règles à coller APRÈS le setup
├── storage.rules.txt               ← règles Storage à coller
├── netlify.toml                    ← config Netlify
└── README.md
```

---

## Première mise en ligne (à faire UNE SEULE FOIS)

### Étape 1 — Configurer Firestore en mode "setup"

1. Va sur https://console.firebase.google.com → projet **syndicalcazar2**
2. Menu gauche → **Firestore Database** → onglet **« Règles »**
3. Copie tout le contenu de `firestore.rules.SETUP.txt` et **colle-le** en remplaçant ce qu'il y a
4. Clique **« Publier »**

### Étape 2 — Configurer Storage

1. Menu gauche → **Storage** → onglet **« Règles »**
2. Copie tout le contenu de `storage.rules.txt` et colle-le
3. Clique **« Publier »**

### Étape 3 — Déployer sur Netlify

**Option A — Drag and drop (le plus simple)**

1. Va sur https://app.netlify.com
2. Clique **« Add new site »** → **« Deploy manually »**
3. Glisse-dépose tout le contenu du dossier `syndic-alcazar` (ou zippe-le et upload le zip)
4. Netlify te donne une URL du genre `https://random-name-12345.netlify.app`
5. (Optionnel) Renomme le site dans Site settings → Site name

**Option B — Via git** (recommandé si tu connais git)

1. Init un repo git, push sur GitHub
2. Sur Netlify : « Add new site » → « Import from Git » → choisir le repo
3. Build command : (laisser vide), Publish directory : `.`

### Étape 4 — Initialiser le compte admin et les 47 biens

1. Ouvre l'URL Netlify suivie de `/setup.html` (ex. `https://syndic-alcazar.netlify.app/setup.html`)
2. Le formulaire est pré-rempli avec les infos de Saad
3. Choisis un **PIN solide** (≥ 8 caractères, mélange chiffres/lettres)
4. Clique **« Initialiser le syndic »**
5. Attends ~10 secondes → message de succès
6. Note ton PIN quelque part de sûr

### Étape 5 — Basculer Firestore en mode production

🚨 **Crucial** : tant que tu ne fais pas cette étape, n'importe quel utilisateur connecté peut lire/écrire dans la base.

1. Retour console Firebase → Firestore → Règles
2. Copie tout le contenu de `firestore.rules.PRODUCTION.txt` et colle-le en remplaçant
3. Clique **« Publier »**

### Étape 6 — Tester la connexion

1. Va sur l'URL Netlify (sans `/setup.html`) → tu vois la page de connexion
2. Saisis ton email + ton PIN
3. Tu arrives sur `/admin/dashboard.html`
4. Tu vois 47 biens, 0 copros inscrits

---

## Tester en local (optionnel, pour développer)

Les imports ES modules + Firebase ne marchent **pas** depuis `file://`. Il faut un serveur HTTP local. Le plus simple :

```powershell
cd "D:\claude code\syndic-alcazar"
npx serve -p 3000
```

Puis ouvre http://localhost:3000.

(Si `serve` n'est pas installé, `npx` te le téléchargera tout seul.)

---

## Ajouter un copropriétaire

1. (Module admin à venir) — créer une invitation depuis l'espace admin
2. L'admin reçoit un **code à 6 chiffres** et un lien d'invitation
3. Il envoie le code par WhatsApp au copropriétaire
4. Le copropriétaire va sur `/inscription.html`, saisit son code, choisit son PIN
5. Il accède à son espace

---

## Réinitialiser le PIN d'un copropriétaire (admin)

1. (Module admin à venir) — bouton "Reset PIN" sur la fiche du copro
2. Génère un PIN temporaire
3. L'envoie par WhatsApp au copro (lien wa.me)
4. Le copro se connecte avec le PIN temporaire → forcé à en choisir un nouveau

---

## Sécurité

- PINs : stockés via Firebase Auth (hashage géré par Google, jamais en clair)
- Sessions : tokens JWT Firebase (httpOnly côté Auth)
- Firestore Rules : isolation par rôle (admin vs copro)
- Storage Rules : isolation par dossier + limite de taille / type
- HTTPS : géré automatiquement par Netlify

---

## Statut du développement

✅ **Fondations (Phase 0)** : auth, layouts, comptes, biens, charges récurrentes  
🚧 **À venir** : édition biens, invitations, cotisations, transparence, plaintes, propositions
