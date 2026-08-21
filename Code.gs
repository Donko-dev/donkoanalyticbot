/**
 * ============================================================================
 * DONKO ANALYTIC BOT — Code.gs
 * ----------------------------------------------------------------------------
 * BACKEND GOOGLE APPS SCRIPT — Gestion des licences, webhook de paiement
 * ET liaison automatique des comptes Telegram des clients.
 * ----------------------------------------------------------------------------
 * Ce script doit être déployé en tant que "Web App" (Exécuter en tant que : Moi,
 * Accès : Tout le monde) depuis l'éditeur Apps Script lié à la Google Sheet.
 *
 * COLONNES DE LA FEUILLE "Abonnements" (créées automatiquement si absentes) :
 *   A: Email | B: Téléphone | C: Statut Abonnement | D: Type d'abonnement
 *   E: Passerelle | F: Date Fin Abonnement | G: Date Création
 *   H: Telegram Chat ID  | I: Lien Token (jeton utilisé dans le lien Telegram)
 *
 * ROUTES (via paramètre ?action=...) :
 *   - POST ?action=paymentWebhook   → Réception des paiements Kikiapay (+ placeholders Stripe/PayPal)
 *   - POST ?action=telegramWebhook  → Réception des mises à jour du bot Telegram (/start)
 *   - GET  ?action=checkStatus      → Vérification du statut PRO d'un email (bot Python)
 *   - GET  ?action=listSubscribers  → Liste des abonnés PRO + chat_id (bot Python, remplace USERS_TO_NOTIFY_JSON)
 *   - GET  ?action=getTelegramLink  → Récupère/génère le lien Telegram personnel d'un client (front-end)
 *
 * ----------------------------------------------------------------------------
 * COMMENT FONCTIONNE LA LIAISON TELEGRAM (pas de saisie manuelle de chat_id) :
 *   1. À chaque paiement, un "Lien Token" aléatoire est généré pour l'email.
 *   2. Le site (ou vous) fournit au client un lien :
 *        https://t.me/VOTRE_BOT?start=<token>
 *   3. Quand le client clique "Démarrer" sur Telegram, Telegram envoie une
 *      requête à notre webhook (telegramWebhook) contenant son chat_id réel
 *      et le token qu'il a utilisé.
 *   4. On retrouve la ligne correspondant au token, on y enregistre le
 *      chat_id, et le client reçoit une confirmation automatique.
 *   5. Le bot Python n'a plus besoin d'une liste statique : il appelle
 *      listSubscribers pour obtenir tous les couples (email, chat_id, isPro).
 * ============================================================================
 */

// ============================================================================
// CONFIGURATION — À adapter selon votre environnement
// ============================================================================
const SHEET_NAME = "Abonnements";
const HEADER_ROW = [
  "Email", "Téléphone", "Statut Abonnement", "Type d'abonnement",
  "Passerelle", "Date Fin Abonnement", "Date Création",
  "Telegram Chat ID", "Lien Token",
];
const COL = { EMAIL: 1, PHONE: 2, STATUS: 3, PLAN: 4, GATEWAY: 5, EXPIRY: 6, CREATED: 7, CHAT_ID: 8, TOKEN: 9 };

const PROPS = PropertiesService.getScriptProperties();

// ⚠️ Clés API à stocker dans les "Propriétés du script"
// (Extensions > Apps Script > Paramètres du projet > Propriétés du script)
const KIKIAPAY_API_KEY = PROPS.getProperty("KIKIAPAY_API_KEY") || "VOTRE_CLE_KIKIAPAY";
const KIKIAPAY_SECRET_KEY = PROPS.getProperty("KIKIAPAY_SECRET_KEY") || "VOTRE_SECRET_KIKIAPAY";

// Placeholders pour intégration future (marché européen / Allemagne)
const STRIPE_SECRET_KEY = PROPS.getProperty("STRIPE_SECRET_KEY") || "";
const PAYPAL_CLIENT_ID = PROPS.getProperty("PAYPAL_CLIENT_ID") || "";
const PAYPAL_CLIENT_SECRET = PROPS.getProperty("PAYPAL_CLIENT_SECRET") || "";

// Clé partagée entre ce script et le bot Python (sécurise checkStatus / listSubscribers)
const BOT_SHARED_SECRET = PROPS.getProperty("BOT_SHARED_SECRET") || "VOTRE_SECRET_PARTAGE";

// Identité du bot Telegram — créé une seule fois via @BotFather sur Telegram
const TELEGRAM_BOT_TOKEN = PROPS.getProperty("TELEGRAM_BOT_TOKEN") || "";
const TELEGRAM_BOT_USERNAME = PROPS.getProperty("TELEGRAM_BOT_USERNAME") || "VotreBotDonko";

// Durée de chaque formule en jours (utilisée pour calculer la date de fin d'abonnement)
const PLAN_DURATIONS_DAYS = {
  "Mensuel": 30, "Bimensuel": 60, "Trimestriel": 90, "Semestriel": 180, "Annuel": 365,
};

// ============================================================================
// POINT D'ENTRÉE — Requêtes GET
// ============================================================================
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === "checkStatus") return handleCheckStatus(e);
    if (action === "listSubscribers") return handleListSubscribers(e);
    if (action === "getTelegramLink") return handleGetTelegramLink(e);

    return jsonResponse({ success: false, message: "Action GET inconnue." });
  } catch (err) {
    return jsonResponse({ success: false, message: "Erreur serveur : " + err.message });
  }
}

// ============================================================================
// POINT D'ENTRÉE — Requêtes POST
// ============================================================================
function doPost(e) {
  try {
    const action = e.parameter.action;

    if (action === "paymentWebhook") return handlePaymentWebhook(e);
    if (action === "telegramWebhook") return handleTelegramWebhook(e);

    return jsonResponse({ success: false, message: "Action POST inconnue." });
  } catch (err) {
    return jsonResponse({ success: false, message: "Erreur serveur : " + err.message });
  }
}

// ============================================================================
// HANDLER — Webhook unique de paiement (Kikiapay + placeholders Stripe/PayPal)
// ============================================================================
function handlePaymentWebhook(e) {
  const body = JSON.parse(e.postData.contents || "{}");
  const gateway = (body.gateway || "kikiapay").toLowerCase();

  let paymentData;

  switch (gateway) {
    case "kikiapay":
      paymentData = parseKikiapayPayload(body);
      break;

    case "stripe":
      // PLACEHOLDER STRIPE (marché Europe/Allemagne) — à implémenter
      // 1. Vérifier la signature (Stripe-Signature) 2. Extraire l'event
      // "checkout.session.completed" 3. Mapper vers paymentData
      return jsonResponse({ success: false, message: "Intégration Stripe non encore active." });

    case "paypal":
      // PLACEHOLDER PAYPAL (marché Europe/Allemagne) — à implémenter
      // 1. Vérifier via l'API de vérification PayPal 2. Extraire l'event
      // "PAYMENT.CAPTURE.COMPLETED" 3. Mapper vers paymentData
      return jsonResponse({ success: false, message: "Intégration PayPal non encore active." });

    default:
      return jsonResponse({ success: false, message: "Passerelle de paiement inconnue : " + gateway });
  }

  if (!paymentData || !paymentData.email || !paymentData.plan) {
    return jsonResponse({ success: false, message: "Données de paiement incomplètes." });
  }

  const token = upsertSubscription(paymentData);
  const telegramLink = buildTelegramDeepLink(token);

  return jsonResponse({
    success: true,
    message: "Abonnement enregistré/mis à jour avec succès.",
    email: paymentData.email,
    plan: paymentData.plan,
    expiration: paymentData.expirationDate,
    telegramLink: telegramLink, // À afficher/envoyer au client juste après paiement
  });
}

function parseKikiapayPayload(body) {
  if (body.apiKey && body.apiKey !== KIKIAPAY_API_KEY) {
    throw new Error("Clé API Kikiapay invalide.");
  }
  const email = body.email || (body.customer && body.customer.email);
  const telephone = body.phone || (body.customer && body.customer.phone) || "";
  const planLabel = normalizePlanLabel(body.plan || body.reference || "Mensuel");

  return {
    email: email,
    telephone: telephone,
    plan: planLabel,
    gateway: "Kikiapay",
    expirationDate: computeExpirationDate(planLabel),
  };
}

function normalizePlanLabel(rawPlan) {
  const map = {
    monthly: "Mensuel", bimonthly: "Bimensuel", quarterly: "Trimestriel",
    semiannual: "Semestriel", annual: "Annuel", mensuel: "Mensuel",
    bimensuel: "Bimensuel", trimestriel: "Trimestriel", semestriel: "Semestriel", annuel: "Annuel",
  };
  const key = String(rawPlan).toLowerCase().trim();
  return map[key] || "Mensuel";
}

function computeExpirationDate(planLabel) {
  const days = PLAN_DURATIONS_DAYS[planLabel] || 30;
  const now = new Date();
  const expiration = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return Utilities.formatDate(expiration, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

// ============================================================================
// HANDLER — Vérification de statut d'UN email (usage ponctuel / debug)
// ============================================================================
function handleCheckStatus(e) {
  requireBotSecret(e);

  const email = e.parameter.email;
  if (!email) return jsonResponse({ success: false, message: "Paramètre 'email' manquant." });

  const row = findRowByEmail(email);
  if (!row) {
    return jsonResponse({ success: true, isPro: false, statut: "Introuvable", message: "Aucun abonnement trouvé pour cet email." });
  }

  const statut = computeLiveStatus(row.values[COL.EXPIRY - 1]);
  return jsonResponse({
    success: true,
    email: row.values[COL.EMAIL - 1],
    telephone: row.values[COL.PHONE - 1],
    statut: statut,
    typeAbonnement: row.values[COL.PLAN - 1],
    passerelle: row.values[COL.GATEWAY - 1],
    dateFinAbonnement: row.values[COL.EXPIRY - 1],
    isPro: statut === "Actif",
  });
}

// ============================================================================
// HANDLER — Liste complète des abonnés avec chat_id Telegram connu
// C'est CETTE route que bot.py appelle désormais : plus besoin de maintenir
// USERS_TO_NOTIFY_JSON à la main, tout vient de la Google Sheet.
// ============================================================================
function handleListSubscribers(e) {
  requireBotSecret(e);

  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  const subscribers = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const chatId = row[COL.CHAT_ID - 1];
    if (!chatId) continue; // Le client n'a pas encore connecté son Telegram

    subscribers.push({
      email: row[COL.EMAIL - 1],
      chat_id: String(chatId),
      isPro: computeLiveStatus(row[COL.EXPIRY - 1]) === "Actif",
    });
  }

  return jsonResponse({ success: true, count: subscribers.length, subscribers: subscribers });
}

function requireBotSecret(e) {
  const secret = e.parameter.secret;
  if (BOT_SHARED_SECRET && secret !== BOT_SHARED_SECRET) {
    throw new Error("Accès non autorisé (secret invalide).");
  }
}

/**
 * Détermine si un abonnement est encore actif (recalcul à la volée).
 */
function computeLiveStatus(expirationDateValue) {
  if (!expirationDateValue) return "Expiré";
  const expDate = new Date(expirationDateValue);
  const now = new Date();
  return expDate.getTime() >= now.getTime() ? "Actif" : "Expiré";
}

// ============================================================================
// TELEGRAM — Webhook de liaison automatique (/start <token>)
// ============================================================================

/**
 * Reçoit les "updates" Telegram. À configurer une seule fois via :
 *   https://api.telegram.org/bot<TOKEN>/setWebhook?url=<URL_WEB_APP>?action=telegramWebhook
 */
function handleTelegramWebhook(e) {
  const update = JSON.parse(e.postData.contents || "{}");
  const message = update.message;

  if (!message || !message.text) {
    return jsonResponse({ success: true }); // Rien à traiter (autre type d'update)
  }

  const chatId = message.chat.id;
  const text = message.text.trim();

  // Format attendu : "/start <token>" (deep link https://t.me/Bot?start=token)
  if (text.indexOf("/start") === 0) {
    const parts = text.split(" ");
    const token = parts.length > 1 ? parts[1].trim() : "";

    if (!token) {
      sendTelegramMessage(chatId,
        "👋 Bienvenue sur DONKO ANALYTIC BOT !\n\n" +
        "Pour connecter votre abonnement, utilisez le lien personnalisé fourni " +
        "après votre paiement (bouton \"Recevoir mes signaux sur Telegram\" sur le site)."
      );
      return jsonResponse({ success: true });
    }

    const linked = linkTelegramChatIdByToken(token, chatId);

    if (linked) {
      sendTelegramMessage(chatId,
        "✅ Votre compte Telegram est connecté avec succès à DONKO ANALYTIC BOT !\n\n" +
        "Vous recevrez désormais vos signaux directement ici, selon votre formule d'abonnement."
      );
    } else {
      sendTelegramMessage(chatId,
        "⚠️ Ce lien n'est plus valide ou a déjà été utilisé.\n" +
        "Contactez le support si le problème persiste : empiredonko@gmail.com"
      );
    }
  }

  return jsonResponse({ success: true });
}

/**
 * Associe un chat_id Telegram à la ligne correspondant au token fourni.
 * Retourne true si la liaison a réussi, false si le token est introuvable.
 */
function linkTelegramChatIdByToken(token, chatId) {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][COL.TOKEN - 1]) === String(token)) {
      sheet.getRange(i + 1, COL.CHAT_ID).setValue(String(chatId));
      return true;
    }
  }
  return false;
}

/**
 * Envoie un message texte via l'API Telegram Bot.
 */
function sendTelegramMessage(chatId, text) {
  if (!TELEGRAM_BOT_TOKEN) {
    Logger.log("TELEGRAM_BOT_TOKEN absent : message non envoyé.");
    return;
  }
  const url = "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage";
  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ chat_id: chatId, text: text }),
    muteHttpExceptions: true,
  });
}

/**
 * Construit le lien de connexion Telegram (deep link /start) pour un token donné.
 */
function buildTelegramDeepLink(token) {
  if (!token) return "";
  return "https://t.me/" + TELEGRAM_BOT_USERNAME + "?start=" + token;
}

/**
 * Génère un jeton aléatoire alphanumérique (compatible avec le paramètre
 * "start" de Telegram : uniquement [A-Za-z0-9_-], max 64 caractères).
 */
function generateLinkToken() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ============================================================================
// FRONT-END — Récupération du lien Telegram personnel par email
// (utilisé par le site : formulaire "Connecter mon Telegram")
// ============================================================================
function handleGetTelegramLink(e) {
  const email = e.parameter.email;
  if (!email) return jsonResponse({ success: false, message: "Paramètre 'email' manquant." });

  const row = findRowByEmail(email);
  if (!row) {
    return jsonResponse({ success: false, message: "Aucun abonnement trouvé pour cet email. Vérifiez votre paiement." });
  }

  let token = row.values[COL.TOKEN - 1];
  if (!token) {
    token = generateLinkToken();
    getOrCreateSheet().getRange(row.rowIndex, COL.TOKEN).setValue(token);
  }

  const alreadyLinked = !!row.values[COL.CHAT_ID - 1];

  return jsonResponse({
    success: true,
    telegramLink: buildTelegramDeepLink(token),
    alreadyLinked: alreadyLinked,
  });
}

// ============================================================================
// GESTION DE LA FEUILLE GOOGLE SHEETS
// ============================================================================
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADER_ROW);
    sheet.getRange(1, 1, 1, HEADER_ROW.length).setFontWeight("bold");
  }

  return sheet;
}

/**
 * Recherche une ligne par email. Retourne { rowIndex, values } ou null.
 * rowIndex est 1-based (compatible avec sheet.getRange).
 */
function findRowByEmail(email) {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][COL.EMAIL - 1]).toLowerCase() === String(email).toLowerCase()) {
      return { rowIndex: i + 1, values: data[i] };
    }
  }
  return null;
}

/**
 * Insère un nouvel abonnement ou met à jour la ligne existante pour cet email.
 * Génère (ou conserve) le "Lien Token" Telegram associé.
 * Retourne le token, pour construire immédiatement le lien Telegram.
 */
function upsertSubscription(paymentData) {
  const sheet = getOrCreateSheet();
  const existing = findRowByEmail(paymentData.email);

  if (existing) {
    const rowIndex = existing.rowIndex;
    let token = existing.values[COL.TOKEN - 1];
    if (!token) {
      token = generateLinkToken();
      sheet.getRange(rowIndex, COL.TOKEN).setValue(token);
    }

    sheet.getRange(rowIndex, COL.PHONE).setValue(paymentData.telephone || existing.values[COL.PHONE - 1]);
    sheet.getRange(rowIndex, COL.STATUS).setValue("Actif");
    sheet.getRange(rowIndex, COL.PLAN).setValue(paymentData.plan);
    sheet.getRange(rowIndex, COL.GATEWAY).setValue(paymentData.gateway);
    sheet.getRange(rowIndex, COL.EXPIRY).setValue(paymentData.expirationDate);

    return token;
  }

  // Aucune ligne existante trouvée : on ajoute une nouvelle ligne avec un nouveau token
  const newToken = generateLinkToken();
  sheet.appendRow([
    paymentData.email,
    paymentData.telephone || "",
    "Actif",
    paymentData.plan,
    paymentData.gateway,
    paymentData.expirationDate,
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    "",         // Telegram Chat ID — vide tant que le client n'a pas cliqué /start
    newToken,   // Lien Token
  ]);

  return newToken;
}

// ============================================================================
// UTILITAIRE — Réponse JSON standardisée
// ============================================================================
function jsonResponse(payload) {
  const output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ============================================================================
// TÂCHE PLANIFIÉE (optionnelle) — Met à jour automatiquement le statut
// "Expiré" en colonne C. À configurer via Extensions > Apps Script > Déclencheurs.
// ============================================================================
function updateExpiredSubscriptionsDaily() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const statutCalcule = computeLiveStatus(data[i][COL.EXPIRY - 1]);
    if (data[i][COL.STATUS - 1] !== statutCalcule) {
      sheet.getRange(i + 1, COL.STATUS).setValue(statutCalcule);
    }
  }
}

// ============================================================================
// SETUP UNIQUE — À exécuter UNE FOIS manuellement depuis l'éditeur Apps Script
// pour enregistrer l'URL de webhook auprès de Telegram.
// ============================================================================
function setupTelegramWebhookOnce() {
  const webAppUrl = ScriptApp.getService().getUrl(); // URL du déploiement actif
  const targetUrl = webAppUrl + "?action=telegramWebhook";
  const setUrl = "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/setWebhook?url=" + encodeURIComponent(targetUrl);

  const response = UrlFetchApp.fetch(setUrl, { muteHttpExceptions: true });
  Logger.log(response.getContentText());
}
