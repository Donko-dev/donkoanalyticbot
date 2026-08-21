/**
 * ============================================================================
 * DONKO ANALYTIC BOT — data.js
 * ----------------------------------------------------------------------------
 * FICHIER DE CONFIGURATION CENTRAL — SITE ADMINISTRABLE SANS TOUCHER AU CODE
 * ============================================================================
 * Tout le contenu textuel, les couleurs, les polices et les liens du site
 * sont pilotés depuis cet unique fichier. L'administrateur du site peut
 * modifier n'importe quelle valeur ci-dessous : le rendu de la page (index.html)
 * se met à jour automatiquement au chargement, sans intervention dans le HTML/CSS.
 *
 * STRUCTURE :
 *   - SITE_CONFIG.seo        → Référencement (title, description, OG image absolue)
 *   - SITE_CONFIG.languages  → Langues disponibles (code, libellé, drapeau)
 *   - SITE_CONFIG.theme      → Typographie + palettes de couleurs clair/sombre
 *   - SITE_CONFIG.brand      → Logo, nom de marque, favicon
 *   - SITE_CONFIG.splash     → Écran de démarrage animé (logo qui tourne)
 *   - SITE_CONFIG.header     → Structure du menu (liens, sans le texte)
 *   - SITE_CONFIG.hero       → Structure de la section d'accueil (liens des CTA)
 *   - SITE_CONFIG.markets    → Icônes des marchés couverts (le texte est en i18n)
 *   - SITE_CONFIG.pricing    → Grille tarifaire (prix, IDs — le texte est en i18n)
 *   - SITE_CONFIG.footer     → Bloc EMPIRE CODE (texte EXACT, non traduit)
 *   - SITE_CONFIG.api        → Endpoints backend (Google Apps Script)
 *   - SITE_CONFIG.i18n       → TOUS les textes traduits : fr / en / de
 * ============================================================================
 */

const SITE_CONFIG = {

  // ==========================================================================
  // 1. SEO — Référencement naturel et partage réseaux sociaux (OG / Twitter)
  // ----------------------------------------------------------------------------
  // ⚠️ IMPORTANT : les robots qui génèrent les aperçus de partage (Facebook,
  // WhatsApp, Telegram, Twitter/X, LinkedIn...) N'EXÉCUTENT PAS le JavaScript.
  // Ils ne lisent QUE les balises <meta> statiques présentes dans index.html.
  // Les valeurs ci-dessous ne mettent donc à jour QUE l'onglet du navigateur
  // pour un vrai visiteur ; la vraie source pour le partage reste index.html.
  // C'est pourquoi ogImage doit être une URL ABSOLUE (pas juste "donko.png") :
  // une URL relative ne fonctionne pas de façon fiable pour ces robots.
  // ==========================================================================
  seo: {
    siteUrl: "https://donko-dev.github.io/donkoanalyticbot/",
    ogImage: "https://donko-dev.github.io/donkoanalyticbot/icon-512x512.png",
    ogImageAlt: "Logo DONKO ANALYTIC BOT",
    ogImageWidth: 512,
    ogImageHeight: 512,
    twitterCard: "summary_large_image",
    author: "EMPIRE CODE",
    keywords:
      "trading bot, signaux forex, signaux crypto, analyse technique IA, XAUUSD, RSI, DONKO ANALYTIC BOT, EMPIRE CODE, trading Afrique, Kikiapay",
  },

  // ==========================================================================
  // 2. LANGUAGES — Langues disponibles dans le sélecteur (avec drapeau emoji,
  // donc aucune image supplémentaire à gérer). L'ordre ici = ordre d'affichage
  // dans le menu déroulant du sélecteur de langue.
  // ==========================================================================
  languages: [
    { code: "fr", label: "Français", flag: "🇫🇷", locale: "fr_FR" },
    { code: "en", label: "English", flag: "🇬🇧", locale: "en_GB" },
    { code: "de", label: "Deutsch", flag: "🇩🇪", locale: "de_DE" },
  ],
  defaultLanguage: "fr",

  // ==========================================================================
  // 3. THEME — Typographie (partagée) + palettes de couleurs clair/sombre
  // ----------------------------------------------------------------------------
  // Le sélecteur de thème bascule entre theme.palettes.dark et .light : toutes
  // les couleurs du site sont réinjectées en variables CSS à chaque bascule.
  // ==========================================================================
  theme: {
    // Typographie — indépendante du thème clair/sombre
    fontFamilyHeading: "'Poppins', 'Segoe UI', sans-serif",
    fontFamilyBody: "'Inter', 'Segoe UI', sans-serif",
    fontSizeBase: "16px",
    fontSizeScaleRatio: 1.25,
    borderRadius: "14px",

    // Styles texte activables par section (booléens consommés par le rendu JS)
    textStyles: {
      heroTitleBold: true,
      heroTitleUnderline: false,
      heroSubtitleItalic: true,
      pricingOldPriceStrike: true,
      footerTextItalicTagline: true,
      sectionTitlesUppercase: true,
    },

    // Mode par défaut si le visiteur n'a pas encore de préférence enregistrée
    // et que son appareil ne signale pas non plus de préférence système.
    defaultMode: "dark",

    // Palettes — une par thème. Les deux exposent EXACTEMENT les mêmes clés.
    palettes: {
      dark: {
        colorPrimary: "#F5B300",       // Or / Jaune DONKO — couleur signature du logo
        colorSecondary: "#0B0F1A",     // Bleu nuit profond (texte sur boutons or)
        colorAccent: "#25D96C",        // Vert (signaux haussiers / PRO)
        colorDanger: "#FF4D4D",        // Rouge (signaux baissiers / alertes)
        colorBackground: "#0B0F1A",    // Fond général du site
        colorBackgroundAlt: "#121826", // Fond alterné (sections, cartes)
        colorText: "#F4F4F5",          // Texte principal
        colorTextMuted: "#9CA3AF",     // Texte secondaire / description
        boxShadow: "0 8px 30px rgba(245, 179, 0, 0.12)",
      },
      light: {
        colorPrimary: "#F5B300",       // Même or, pour garder l'identité de marque
        colorSecondary: "#0B0F1A",
        colorAccent: "#1FA858",        // Vert légèrement plus foncé (contraste sur blanc)
        colorDanger: "#E14545",        // Rouge légèrement plus foncé (contraste sur blanc)
        colorBackground: "#FFFFFF",
        colorBackgroundAlt: "#F3F4F7",
        colorText: "#14161C",
        colorTextMuted: "#5B6472",
        boxShadow: "0 8px 24px rgba(20, 22, 28, 0.08)",
      },
    },
  },

  // ==========================================================================
  // 4. BRAND — Identité visuelle
  // ==========================================================================
  brand: {
    name: "DONKO ANALYTIC BOT",
    logoPath: "donko.png",
    faviconPath: "favicon.ico",
  },

  // ==========================================================================
  // 5. SPLASH — Écran de démarrage animé (logo qui tourne à l'ouverture)
  // ==========================================================================
  splash: {
    enabled: true,
    durationMs: 4000, // Entre 3000 et 5000 ms comme demandé
    logoPath: "donko.png",
  },

  // ==========================================================================
  // 6. HEADER — Structure du menu (les libellés traduits sont dans i18n)
  // ==========================================================================
  header: {
    menuItems: [
      { id: "home", href: "#hero" },
      { id: "markets", href: "#markets" },
      { id: "pricing", href: "#pricing" },
      { id: "contact", href: "#footer" },
    ],
    ctaButtonHref: "#pricing",
  },

  // ==========================================================================
  // 7. HERO — Liens des CTA (le texte traduit est dans i18n)
  // ==========================================================================
  hero: {
    primaryButtonHref: "#pricing",
    secondaryButtonHref: "#markets",
  },

  // ==========================================================================
  // 8. MARKETS — Icônes des marchés (le nom/exemple traduit est dans i18n)
  // ==========================================================================
  markets: [
    { id: "forex", icon: "💱" },
    { id: "crypto", icon: "🪙" },
    { id: "metals", icon: "🪙" },
    { id: "stocks", icon: "📈" },
  ],

  // ==========================================================================
  // 9. PRICING — Prix, IDs, mise en avant (le nom/durée traduits sont en i18n)
  // ==========================================================================
  pricing: {
    currency: "FCFA",
    plans: [
      { id: "monthly", oldPrice: "20 000", newPrice: "5 000", highlight: false },
      { id: "bimonthly", oldPrice: "38 000", newPrice: "9 500", highlight: false },
      { id: "quarterly", oldPrice: "54 000", newPrice: "13 500", highlight: true },
      { id: "semiannual", oldPrice: "100 000", newPrice: "25 000", highlight: false },
      { id: "annual", oldPrice: "200 000", newPrice: "50 000", highlight: false },
    ],
    paymentGateways: ["Kikiapay"],
  },

  // ==========================================================================
  // 10. FOOTER — Bloc EMPIRE CODE — TEXTE EXACT, NON TRADUIT
  // ----------------------------------------------------------------------------
  // Ce bloc (logo, copyright, tagline, coordonnées) a été spécifié comme
  // "section exacte" dès le cahier des charges initial : il reste identique
  // dans les 3 langues, par choix (mentions légales / signature de marque).
  // Seul le texte d'avertissement sur les risques (disclaimer) est traduit,
  // car ce n'est pas une mention imposée mais un ajout informatif.
  // ==========================================================================
  footer: {
    logoPath: "donko.png",
    logoAlt: "EMPIRE CODE Footer Logo",
    copyrightText:
      "EMPIRE CODE &copy; 2026 — Tous droits réservés / All rights reserved / Alle Rechte vorbehalten",
    tagline: "Développeur Informatique Freelance & Expert IA",
    contacts: {
      whatsapp: {
        label: "WhatsApp",
        number: "+229 01 96 80 91 06",
        href: "https://wa.me/2290196809106",
      },
      email: {
        label: "Email",
        address: "empiredonko@gmail.com",
        href: "mailto:empiredonko@gmail.com",
      },
      tiktok: {
        label: "TikTok",
        handle: "@donkodeutsch",
        href: "https://tiktok.com/@donkodeutsch",
      },
      boutique: {
        label: "Boutique",
        name: "EMPIRE CODE STORE",
        href: "https://empirecode.mychariow.co/",
      },
    },
  },

  // ==========================================================================
  // 11. API — Endpoints backend (Google Apps Script déployé en Web App)
  // ==========================================================================
  api: {
    appsScriptWebAppUrl: "https://script.google.com/macros/s/AKfycby_yUWb-_XiH6xZouQ6KPwtOQsjXd8n7VIEq78aVlhLpFIO1f1HyUkXVtuo6UsvBguN/exec",
    statusCheckEndpoint: "?action=checkStatus",
    paymentWebhookEndpoint: "?action=paymentWebhook",
    getTelegramLinkEndpoint: "?action=getTelegramLink",
  },

  // ==========================================================================
  // 12. I18N — Tous les textes traduits, une clé par langue.
  // Les 3 objets (fr / en / de) doivent TOUJOURS exposer exactement les mêmes
  // clés entre eux : c'est ce que vérifie le script de contrôle en fin de
  // fichier (utile si vous ajoutez une langue ou un texte plus tard).
  // ==========================================================================
  i18n: {
    // ------------------------------------------------------------------------
    // FRANÇAIS
    // ------------------------------------------------------------------------
    fr: {
      seo: {
        siteTitle: "DONKO ANALYTIC BOT — Signaux IA Forex, Crypto, Métaux & Actions",
        siteDescription:
          "Robot d'analyse financière multi-actifs propulsé par l'IA. Signaux techniques et fondamentaux en temps réel sur Forex, Crypto, Métaux (Or/XAUUSD) et Actions. Abonnement PRO dès 5 000 FCFA.",
      },
      header: {
        menuLabels: { home: "Accueil", markets: "Marchés", pricing: "Tarifs", contact: "Contact" },
        ctaButtonText: "Démarrer maintenant",
      },
      hero: {
        eyebrow: "IA MULTI-ACTIFS · 100% AUTOMATISÉ",
        title: "Des signaux de trading pilotés par l'intelligence artificielle",
        subtitle:
          "DONKO ANALYTIC BOT surveille Forex, Crypto, Métaux et Actions 24h/24, croise l'analyse technique et les données macroéconomiques mondiales, et vous livre un score de confiance clair — directement sur votre canal PRO.",
        primaryButtonText: "Voir les formules",
        secondaryButtonText: "Marchés couverts",
      },
      markets: {
        sectionTitle: "Marchés couverts",
        items: {
          forex: { name: "Forex", example: "EUR/USD, GBP/USD" },
          crypto: { name: "Crypto", example: "BTC/USD, ETH/USD" },
          metals: { name: "Métaux", example: "OR / XAUUSD" },
          stocks: { name: "Actions", example: "Tesla, Apple" },
        },
      },
      pricing: {
        sectionTitle: "Choisissez votre formule PRO",
        sectionSubtitle: "Offre de lancement à -75% sur tous les abonnements",
        subscribeButtonText: "S'abonner",
        planText: {
          monthly: { name: "Formule Mensuelle", duration: "1 mois" },
          bimonthly: { name: "Formule Bimensuelle", duration: "2 mois" },
          quarterly: { name: "Formule Trimestrielle", duration: "3 mois" },
          semiannual: { name: "Formule Semestrielle", duration: "6 mois" },
          annual: { name: "Formule Annuelle", duration: "12 mois" },
        },
        features: [
          "Signaux techniques + fondamentaux fusionnés",
          "Score de confiance IA sur chaque signal",
          "Alertes en temps réel via Telegram",
          "Couverture Forex, Crypto, Métaux, Actions",
          "Support client dédié",
        ],
      },
      telegramConnect: {
        sectionTitle: "Recevez vos signaux sur Telegram",
        sectionSubtitle:
          "Entrez l'email utilisé lors de votre paiement pour générer votre lien de connexion personnel.",
        inputPlaceholder: "votre-email@exemple.com",
        buttonText: "Obtenir mon lien Telegram",
        loadingText: "Génération du lien...",
        successAlreadyLinked: "✅ Votre Telegram est déjà connecté. Vous recevez vos signaux normalement.",
        successNewLink: "🔗 Cliquez sur le bouton ci-dessous pour ouvrir Telegram et finaliser la connexion.",
        openTelegramButtonText: "Ouvrir Telegram",
        errorNotFound: "Aucun abonnement actif trouvé pour cet email. Vérifiez votre paiement ou contactez le support.",
        errorGeneric: "Une erreur est survenue. Réessayez dans quelques instants.",
      },
      footer: {
        disclaimer:
          "Avertissement : les signaux fournis par DONKO ANALYTIC BOT sont des outils d'aide à la décision et ne constituent pas un conseil en investissement. Le trading comporte des risques de perte en capital.",
      },
      splash: {
        loadingText: "Chargement...",
      },
    },

    // ------------------------------------------------------------------------
    // ENGLISH
    // ------------------------------------------------------------------------
    en: {
      seo: {
        siteTitle: "DONKO ANALYTIC BOT — AI Signals for Forex, Crypto, Metals & Stocks",
        siteDescription:
          "AI-powered multi-asset financial analysis bot. Real-time technical and fundamental signals for Forex, Crypto, Metals (Gold/XAUUSD) and Stocks. PRO subscription from 5,000 FCFA.",
      },
      header: {
        menuLabels: { home: "Home", markets: "Markets", pricing: "Pricing", contact: "Contact" },
        ctaButtonText: "Get started",
      },
      hero: {
        eyebrow: "MULTI-ASSET AI · 100% AUTOMATED",
        title: "AI-powered trading signals for smarter decisions",
        subtitle:
          "DONKO ANALYTIC BOT watches Forex, Crypto, Metals and Stocks around the clock, blends technical analysis with global macroeconomic data, and delivers a clear confidence score — straight to your PRO channel.",
        primaryButtonText: "View plans",
        secondaryButtonText: "Markets covered",
      },
      markets: {
        sectionTitle: "Markets covered",
        items: {
          forex: { name: "Forex", example: "EUR/USD, GBP/USD" },
          crypto: { name: "Crypto", example: "BTC/USD, ETH/USD" },
          metals: { name: "Metals", example: "Gold / XAUUSD" },
          stocks: { name: "Stocks", example: "Tesla, Apple" },
        },
      },
      pricing: {
        sectionTitle: "Choose your PRO plan",
        sectionSubtitle: "Launch offer: -75% on every plan",
        subscribeButtonText: "Subscribe",
        planText: {
          monthly: { name: "Monthly Plan", duration: "1 month" },
          bimonthly: { name: "Bimonthly Plan", duration: "2 months" },
          quarterly: { name: "Quarterly Plan", duration: "3 months" },
          semiannual: { name: "Semiannual Plan", duration: "6 months" },
          annual: { name: "Annual Plan", duration: "12 months" },
        },
        features: [
          "Merged technical + fundamental signals",
          "AI confidence score on every signal",
          "Real-time alerts via Telegram",
          "Coverage across Forex, Crypto, Metals, Stocks",
          "Dedicated customer support",
        ],
      },
      telegramConnect: {
        sectionTitle: "Get your signals on Telegram",
        sectionSubtitle: "Enter the email used at checkout to generate your personal connection link.",
        inputPlaceholder: "your-email@example.com",
        buttonText: "Get my Telegram link",
        loadingText: "Generating your link...",
        successAlreadyLinked: "✅ Your Telegram is already connected. You're receiving your signals normally.",
        successNewLink: "🔗 Tap the button below to open Telegram and finish connecting.",
        openTelegramButtonText: "Open Telegram",
        errorNotFound: "No active subscription found for this email. Check your payment or contact support.",
        errorGeneric: "Something went wrong. Please try again in a moment.",
      },
      footer: {
        disclaimer:
          "Disclaimer: the signals provided by DONKO ANALYTIC BOT are decision-support tools and do not constitute personalized investment advice. Trading involves a risk of capital loss.",
      },
      splash: {
        loadingText: "Loading...",
      },
    },

    // ------------------------------------------------------------------------
    // DEUTSCH
    // ------------------------------------------------------------------------
    de: {
      seo: {
        siteTitle: "DONKO ANALYTIC BOT — KI-Signale für Forex, Krypto, Metalle & Aktien",
        siteDescription:
          "KI-gestützter Multi-Asset-Finanzanalyse-Bot. Technische und fundamentale Echtzeitsignale für Forex, Krypto, Metalle (Gold/XAUUSD) und Aktien. PRO-Abonnement ab 5.000 FCFA.",
      },
      header: {
        menuLabels: { home: "Start", markets: "Märkte", pricing: "Preise", contact: "Kontakt" },
        ctaButtonText: "Jetzt starten",
      },
      hero: {
        eyebrow: "MULTI-ASSET-KI · 100 % AUTOMATISIERT",
        title: "KI-gestützte Handelssignale für bessere Entscheidungen",
        subtitle:
          "DONKO ANALYTIC BOT beobachtet rund um die Uhr Forex, Krypto, Metalle und Aktien, verbindet die technische Analyse mit globalen Makrodaten und liefert einen klaren Konfidenz-Score – direkt auf Ihrem PRO-Kanal.",
        primaryButtonText: "Tarife ansehen",
        secondaryButtonText: "Abgedeckte Märkte",
      },
      markets: {
        sectionTitle: "Abgedeckte Märkte",
        items: {
          forex: { name: "Forex", example: "EUR/USD, GBP/USD" },
          crypto: { name: "Krypto", example: "BTC/USD, ETH/USD" },
          metals: { name: "Metalle", example: "Gold / XAUUSD" },
          stocks: { name: "Aktien", example: "Tesla, Apple" },
        },
      },
      pricing: {
        sectionTitle: "Wählen Sie Ihr PRO-Paket",
        sectionSubtitle: "Startangebot: -75 % auf alle Abonnements",
        subscribeButtonText: "Abonnieren",
        planText: {
          monthly: { name: "Monatspaket", duration: "1 Monat" },
          bimonthly: { name: "Zweimonatspaket", duration: "2 Monate" },
          quarterly: { name: "Quartalspaket", duration: "3 Monate" },
          semiannual: { name: "Halbjahrespaket", duration: "6 Monate" },
          annual: { name: "Jahrespaket", duration: "12 Monate" },
        },
        features: [
          "Fusion aus technischen und fundamentalen Signalen",
          "KI-Konfidenz-Score für jedes Signal",
          "Echtzeit-Alerts über Telegram",
          "Abdeckung von Forex, Krypto, Metallen, Aktien",
          "Persönlicher Kundensupport",
        ],
      },
      telegramConnect: {
        sectionTitle: "Erhalten Sie Ihre Signale auf Telegram",
        sectionSubtitle:
          "Geben Sie die beim Kauf verwendete E-Mail-Adresse ein, um Ihren persönlichen Verbindungslink zu erstellen.",
        inputPlaceholder: "ihre-email@beispiel.com",
        buttonText: "Meinen Telegram-Link erhalten",
        loadingText: "Link wird erstellt...",
        successAlreadyLinked: "✅ Ihr Telegram-Konto ist bereits verbunden. Sie erhalten Ihre Signale normal.",
        successNewLink: "🔗 Tippen Sie auf die Schaltfläche unten, um Telegram zu öffnen und die Verbindung abzuschließen.",
        openTelegramButtonText: "Telegram öffnen",
        errorNotFound: "Kein aktives Abonnement für diese E-Mail-Adresse gefunden. Überprüfen Sie Ihre Zahlung oder kontaktieren Sie den Support.",
        errorGeneric: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es in Kürze erneut.",
      },
      footer: {
        disclaimer:
          "Hinweis: Die von DONKO ANALYTIC BOT bereitgestellten Signale sind Entscheidungshilfen und stellen keine persönliche Anlageberatung dar. Der Handel birgt das Risiko von Kapitalverlusten.",
      },
      splash: {
        loadingText: "Wird geladen...",
      },
    },
  },
};

// ============================================================================
// EXPORT — Rend SITE_CONFIG utilisable à la fois côté navigateur (index.html)
// et côté Node/build tools si besoin (bundlers, tests, etc.)
// ============================================================================
if (typeof module !== "undefined" && module.exports) {
  module.exports = SITE_CONFIG;
}
