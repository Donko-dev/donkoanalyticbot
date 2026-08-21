<p align="center">
  <img src="donko.png" alt="EMPIRE CODE Logo" width="140"/><br><br>
  <b>DONKO ANALYTIC BOT</b><br>

<p align="center">
  <a href="#-français">🇫🇷 Français</a> &nbsp;|&nbsp;
  
  # DONKO ANALYTIC BOT

  **Robot d'aide à la décision et d'analyse financière IA multi-actifs**
  Forex · Crypto · Métaux · Actions

  Hébergement 100% gratuit via GitHub Actions · Backend Google Sheets · Paiements Kikiapay
</div>

---

## 📦 Architecture du projet

```
donko-analytic-bot/
├── index.html              # Page d'accueil (meta SEO, OG, Twitter Cards, PWA)
├── manifest.json            # Manifest PWA (icônes, couleurs, mode standalone)
├── service-worker.js        # Cache hors-ligne basique
├── data.js                  # ⭐ Fichier de configuration central du site
├── app.js                   # Moteur de rendu — injecte data.js dans le DOM
├── style.css                # Styles, pilotés par variables CSS dynamiques
├── assets/
│   ├── donko.png             # Logo principal (obligatoire)
│   ├── favicon.ico / favicon-16x16.png / favicon-32x32.png
│   ├── apple-touch-icon.png
│   └── icons/                # Favicons PWA : 72,96,128,144,152,192,384,512 px
├── backend-gas/
│   └── Code.gs               # Backend Google Apps Script (licences + webhook)
├── bot/
│   ├── bot.py                 # Bot Python d'analyse technique + macro (Claude)
│   └── requirements.txt
└── .github/workflows/
    └── workflow.yml           # Exécution planifiée via GitHub Actions
```

## ⚙️ Personnalisation du site (sans toucher au code)

Toute l'apparence et tous les textes du site sont pilotés depuis **`data.js`**.
Modifiez les valeurs de `SITE_CONFIG` (couleurs, polices, titres, tarifs, liens
de contact...) : `app.js` réinjecte automatiquement ces données dans la page
au chargement.

## 💳 Grille tarifaire (offre de lancement -75%)

| Formule | Prix barré | Prix promo | Durée |
|---|---|---|---|
| Mensuelle | ~~20 000 FCFA~~ | **5 000 FCFA** | 1 mois |
| Bimensuelle | ~~38 000 FCFA~~ | **9 500 FCFA** | 2 mois |
| Trimestrielle | ~~54 000 FCFA~~ | **13 500 FCFA** | 3 mois |
| Semestrielle | ~~100 000 FCFA~~ | **25 000 FCFA** | 6 mois |
| Annuelle | ~~200 000 FCFA~~ | **50 000 FCFA** | 12 mois |

## 🚀 Déploiement

### 1. Frontend (GitHub Pages)
1. Poussez ce dépôt sur GitHub.
2. Activez **GitHub Pages** sur la branche `main`, dossier racine.
3. Le site est servi gratuitement à l'URL `https://<votre-user>.github.io/<repo>/`.
4. Mettez à jour `SITE_CONFIG.seo.siteUrl` dans `data.js` avec cette URL.

### 2. Backend (Google Apps Script)
1. Créez une Google Sheet vide.
2. Extensions → Apps Script → collez le contenu de `backend-gas/Code.gs`.
3. Renseignez vos clés dans **Paramètres du projet → Propriétés du script** :
   `KIKIAPAY_API_KEY`, `KIKIAPAY_SECRET_KEY`, `BOT_SHARED_SECRET`, etc.
4. Déployez en **Web App** (accès : Tout le monde) et copiez l'URL générée.
5. Reportez cette URL dans `data.js` (`SITE_CONFIG.api.appsScriptWebAppUrl`)
   et dans le secret GitHub `APPS_SCRIPT_WEBAPP_URL`.

### 3. Bot Telegram — création & connexion automatique des clients
1. Sur Telegram, parlez à **@BotFather** → `/newbot` → suivez les instructions.
   Vous obtenez un **token** (ex: `123456:AAF...`) et un **username**
   (ex: `DonkoAnalyticBot`).
2. Dans Apps Script (**Paramètres du projet → Propriétés du script**), ajoutez :
   `TELEGRAM_BOT_TOKEN` (le token) et `TELEGRAM_BOT_USERNAME` (le username,
   sans le @).
3. Exécutez **une seule fois**, depuis l'éditeur Apps Script, la fonction
   `setupTelegramWebhookOnce()` (menu Exécuter). Cela indique à Telegram
   d'envoyer les messages `/start` vers votre Web App.
4. **Comment un client se connecte concrètement** :
   - Après paiement, `Code.gs` génère un lien unique
     `https://t.me/VotreBot?start=<token>` (renvoyé dans la réponse du
     webhook de paiement, champ `telegramLink`).
   - Le site expose aussi un formulaire "Recevez vos signaux sur Telegram" :
     le client saisit son email, récupère son lien, clique dessus.
   - Telegram redirige vers le bot, le client clique **Démarrer**.
   - Le `chat_id` réel est automatiquement enregistré dans la Google Sheet
     (colonne H) — aucune saisie manuelle nécessaire.

### 4. Bot d'analyse (GitHub Actions)
1. Dans **Settings → Secrets and variables → Actions**, ajoutez :
   `ANTHROPIC_API_KEY`, `APPS_SCRIPT_WEBAPP_URL`, `BOT_SHARED_SECRET`,
   `TELEGRAM_BOT_TOKEN`.
   *(`USERS_TO_NOTIFY_JSON` est optionnel — repli de secours uniquement ;
   en fonctionnement normal, `bot.py` récupère automatiquement la liste des
   abonnés connectés via `listSubscribers` sur votre Google Sheet.)*
2. Le workflow `workflow.yml` s'exécute automatiquement selon le cron défini,
   ou manuellement via l'onglet **Actions → Run workflow**.

## ⚠️ Avertissement

Les signaux fournis par DONKO ANALYTIC BOT sont des outils d'aide à la
décision et ne constituent pas un conseil en investissement personnalisé.
Le trading comporte des risques de perte en capital.

---

<br>

<div align="center">

<img src="donko.png" alt="EMPIRE CODE Footer Logo" width="100"/>

<br><br>

**EMPIRE CODE &copy; 2026 — Tous droits réservés / All rights reserved / Alle Rechte vorbehalten**  
*Développeur Informatique Freelance & Expert IA*

<br>

[![WhatsApp](https://img.shields.io/badge/WhatsApp-+229%2001%2096%2080%2091%2006-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/2290196809106)
[![Email](https://img.shields.io/badge/Email-empiredonko@gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:empiredonko@gmail.com)
[![TikTok](https://img.shields.io/badge/TikTok-@donkodeutsch-000000?style=for-the-badge&logo=tiktok&logoColor=white)](https://tiktok.com/@donkodeutsch)
[![Boutique](https://img.shields.io/badge/Boutique-EMPIRE%20CODE%20STORE-FF9900?style=for-the-badge&logo=shopify&logoColor=white)](https://empirecode.mychariow.co/)

</div>
