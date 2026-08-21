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
 *   - SITE_CONFIG.seo       → Référencement (title, description, mots-clés, OG image)
 *   - SITE_CONFIG.theme     → Couleurs, polices, tailles, styles texte
 *   - SITE_CONFIG.brand     → Logo, nom de marque, favicon
 *   - SITE_CONFIG.header    → Contenu du menu / en-tête
 *   - SITE_CONFIG.hero      → Section d'accueil (titre, sous-titre, CTA)
 *   - SITE_CONFIG.markets   → Liste des marchés couverts (Forex, Crypto, etc.)
 *   - SITE_CONFIG.pricing   → Grille tarifaire (5 formules avec prix barrés)
 *   - SITE_CONFIG.footer    → Pied de page (copyright + coordonnées EMPIRE CODE)
 *   - SITE_CONFIG.api       → Endpoints backend (Google Apps Script)
 * ============================================================================
 */

const SITE_CONFIG = {

  // ==========================================================================
  // 1. SEO — Référencement naturel et partage réseaux sociaux (OG / Twitter)
  // ==========================================================================
  seo: {
    siteTitle: "DONKO ANALYTIC BOT — Signaux IA Forex, Crypto, Métaux & Actions",
    siteDescription:
      "Robot d'analyse financière multi-actifs propulsé par l'IA. Signaux techniques et fondamentaux en temps réel sur Forex, Crypto, Métaux (Or/XAUUSD) et Actions. Abonnement PRO dès 5 000 FCFA.",
    keywords:
      "trading bot, signaux forex, signaux crypto, analyse technique IA, XAUUSD, RSI, DONKO ANALYTIC BOT, EMPIRE CODE, trading Afrique, Kikiapay",
    siteUrl: "https://empirecode.github.io/donko-analytic-bot/",
    ogImage: "assets/donko.png",
    ogImageAlt: "Logo DONKO ANALYTIC BOT",
    twitterCard: "summary_large_image",
    themeColorMeta: "#0B0F1A",
    locale: "fr_FR",
    author: "EMPIRE CODE",
  },

  // ==========================================================================
  // 2. THEME — Design & styles CSS injectés dynamiquement via variables :root
  // ==========================================================================
  theme: {
    // Couleurs principales (format HEX)
    colorPrimary: "#F5B300",      // Or / Jaune DONKO — couleur signature du logo
    colorSecondary: "#0B0F1A",    // Bleu nuit profond
    colorAccent: "#25D96C",       // Vert (signaux haussiers / PRO)
    colorDanger: "#FF4D4D",       // Rouge (signaux baissiers / alertes)
    colorBackground: "#0B0F1A",   // Fond général du site
    colorBackgroundAlt: "#121826",// Fond alterné (sections, cartes)
    colorText: "#F4F4F5",         // Texte principal
    colorTextMuted: "#9CA3AF",    // Texte secondaire / description

    // Typographie
    fontFamilyHeading: "'Poppins', 'Segoe UI', sans-serif",
    fontFamilyBody: "'Inter', 'Segoe UI', sans-serif",
    fontSizeBase: "16px",
    fontSizeScaleRatio: 1.25,

    // Styles texte activables par section (booléens consommés par le rendu JS)
    textStyles: {
      heroTitleBold: true,
      heroTitleUnderline: false,
      heroSubtitleItalic: true,
      pricingOldPriceStrike: true,   // Active l'effet barré sur les anciens prix
      footerTextItalicTagline: true,
      sectionTitlesUppercase: true,
    },

    // Rayon des bordures / ombres (cohérence visuelle globale)
    borderRadius: "14px",
    boxShadow: "0 8px 30px rgba(245, 179, 0, 0.12)",
  },

  // ==========================================================================
  // 3. BRAND — Identité visuelle
  // ==========================================================================
  brand: {
    name: "DONKO ANALYTIC BOT",
    logoPath: "assets/donko.png",
    faviconPath: "assets/favicon.ico",
    tagline: "L'intelligence artificielle au service de vos décisions de trading",
  },

  // ==========================================================================
  // 4. HEADER — En-tête / navigation
  // ==========================================================================
  header: {
    menuItems: [
      { label: "Accueil", href: "#hero" },
      { label: "Marchés", href: "#markets" },
      { label: "Tarifs", href: "#pricing" },
      { label: "Contact", href: "#footer" },
    ],
    ctaButtonText: "Démarrer maintenant",
    ctaButtonHref: "#pricing",
  },

  // ==========================================================================
  // 5. HERO — Section d'accueil
  // ==========================================================================
  hero: {
    eyebrow: "IA MULTI-ACTIFS · 100% AUTOMATISÉ",
    title: "Des signaux de trading pilotés par l'intelligence artificielle",
    subtitle:
      "DONKO ANALYTIC BOT surveille Forex, Crypto, Métaux et Actions 24h/24, croise l'analyse technique et les données macroéconomiques mondiales, et vous livre un score de confiance clair — directement sur votre canal PRO.",
    primaryButtonText: "Voir les formules",
    primaryButtonHref: "#pricing",
    secondaryButtonText: "Marchés couverts",
    secondaryButtonHref: "#markets",
  },

  // ==========================================================================
  // 6. MARKETS — Marchés couverts par le bot
  // ==========================================================================
  markets: [
    { name: "Forex", example: "EUR/USD, GBP/USD", icon: "💱" },
    { name: "Crypto", example: "BTC/USD, ETH/USD", icon: "🪙" },
    { name: "Métaux", example: "OR / XAUUSD", icon: "🪙" },
    { name: "Actions", example: "Tesla, Apple", icon: "📈" },
  ],

  // ==========================================================================
  // 7. PRICING — Grille tarifaire (Stratégie -75%)
  // ==========================================================================
  pricing: {
    sectionTitle: "Choisissez votre formule PRO",
    sectionSubtitle: "Offre de lancement à -75% sur tous les abonnements",
    currency: "FCFA",
    plans: [
      {
        id: "monthly",
        name: "Formule Mensuelle",
        oldPrice: "20 000",
        newPrice: "5 000",
        duration: "1 mois",
        highlight: false,
      },
      {
        id: "bimonthly",
        name: "Formule Bimensuelle",
        oldPrice: "38 000",
        newPrice: "9 500",
        duration: "2 mois",
        highlight: false,
      },
      {
        id: "quarterly",
        name: "Formule Trimestrielle",
        oldPrice: "54 000",
        newPrice: "13 500",
        duration: "3 mois",
        highlight: true, // Formule mise en avant
      },
      {
        id: "semiannual",
        name: "Formule Semestrielle",
        oldPrice: "100 000",
        newPrice: "25 000",
        duration: "6 mois",
        highlight: false,
      },
      {
        id: "annual",
        name: "Formule Annuelle",
        oldPrice: "200 000",
        newPrice: "50 000",
        duration: "12 mois",
        highlight: false,
      },
    ],
    features: [
      "Signaux techniques + fondamentaux fusionnés",
      "Score de confiance IA sur chaque signal",
      "Alertes en temps réel via Telegram",
      "Couverture Forex, Crypto, Métaux, Actions",
      "Support client dédié",
    ],
    paymentGateways: ["Kikiapay"],
  },

  // ==========================================================================
  // 8. FOOTER — Pied de page (section obligatoire EMPIRE CODE)
  // ==========================================================================
  footer: {
    logoPath: "assets/donko.png",
    logoAlt: "EMPIRE CODE Footer Logo",
    copyrightText:
      "EMPIRE CODE &copy; 2026 — Tous droits réservés / All rights reserved / Alle Rechte vorbehalten",
    tagline: "Développeur Informatique Freelance & Expert IA",
    contacts: {
      whatsapp: {
        label: "WhatsApp",
        number: "+229 01 96 80 91 06",
        href: "https://wa.me/2290196809106",
        color: "25D366",
        logo: "whatsapp",
      },
      email: {
        label: "Email",
        address: "empiredonko@gmail.com",
        href: "mailto:empiredonko@gmail.com",
        color: "EA4335",
        logo: "gmail",
      },
      tiktok: {
        label: "TikTok",
        handle: "@donkodeutsch",
        href: "https://tiktok.com/@donkodeutsch",
        color: "000000",
        logo: "tiktok",
      },
      boutique: {
        label: "Boutique",
        name: "EMPIRE CODE STORE",
        href: "https://empirecode.mychariow.co/",
        color: "FF9900",
        logo: "shopify",
      },
    },
    disclaimer:
      "Avertissement : les signaux fournis par DONKO ANALYTIC BOT sont des outils d'aide à la décision et ne constituent pas un conseil en investissement. Le trading comporte des risques de perte en capital.",
  },

  // ==========================================================================
  // 8bis. TELEGRAM CONNECT — Widget d'auto-liaison du compte Telegram
  // ==========================================================================
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

  // ==========================================================================
  // 9. API — Endpoints backend (Google Apps Script déployé en Web App)
  // ==========================================================================
  api: {
    appsScriptWebAppUrl: "https://script.google.com/macros/s/AKfycby_yUWb-_XiH6xZouQ6KPwtOQsjXd8n7VIEq78aVlhLpFIO1f1HyUkXVtuo6UsvBguN/exec",
    statusCheckEndpoint: "?action=checkStatus",
    paymentWebhookEndpoint: "?action=paymentWebhook",
    getTelegramLinkEndpoint: "?action=getTelegramLink",
  },
};

// ============================================================================
// EXPORT — Rend SITE_CONFIG utilisable à la fois côté navigateur (index.html)
// et côté Node/build tools si besoin (bundlers, tests, etc.)
// ============================================================================
if (typeof module !== "undefined" && module.exports) {
  module.exports = SITE_CONFIG;
}
