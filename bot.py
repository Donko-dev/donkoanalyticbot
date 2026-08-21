#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================================================
DONKO ANALYTIC BOT — bot.py
----------------------------------------------------------------------------
Script principal exécuté périodiquement via GitHub Actions (voir
.github/workflows/workflow.yml). Il :
  1. Récupère les cours des marchés surveillés (Forex, Crypto, Métaux, Actions)
  2. Calcule les indicateurs techniques (RSI, moyennes mobiles, tendance)
  3. Interroge Claude (Anthropic) pour une analyse fondamentale/macro fusionnée
  4. Vérifie le statut d'abonnement de chaque utilisateur via le backend
     Google Apps Script
  5. Envoie le signal adapté (basique flouté pour Free, complet pour PRO)
     sur Telegram
============================================================================
"""

import os
import sys
import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone

import requests
import yfinance as yf
import pandas as pd

# ============================================================================
# CONFIGURATION — Variables d'environnement (à définir en GitHub Secrets)
# ============================================================================
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
APPS_SCRIPT_WEBAPP_URL = os.environ.get("APPS_SCRIPT_WEBAPP_URL", "")
BOT_SHARED_SECRET = os.environ.get("BOT_SHARED_SECRET", "")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")

# Repli optionnel : liste statique d'utilisateurs (email <-> chat_id), utile
# en test local. En production, la liste vient automatiquement de la Google
# Sheet via listSubscribers() — voir fetch_subscribers() plus bas — donc ce
# secret n'a normalement plus besoin d'être rempli.
USERS_TO_NOTIFY_FALLBACK = json.loads(os.environ.get("USERS_TO_NOTIFY_JSON", "[]"))

# Marchés surveillés — symbole Yahoo Finance : libellé affiché
MARKETS = {
    "EURUSD=X": "EUR/USD (Forex)",
    "BTC-USD": "BTC/USD (Crypto)",
    "GC=F": "OR / XAUUSD (Métaux)",
    "TSLA": "Tesla (Actions)",
    "AAPL": "Apple (Actions)",
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("donko_bot")


# ============================================================================
# STRUCTURES DE DONNÉES
# ============================================================================
@dataclass
class TechnicalSignal:
    symbol: str
    label: str
    last_price: float
    rsi: float
    sma_20: float
    sma_50: float
    trend: str  # "Haussier" | "Baissier" | "Neutre"
    confidence_technical: int  # 0-100


@dataclass
class FusedReport:
    signal: TechnicalSignal
    macro_summary: str = ""
    confidence_score: int = 0
    recommendation: str = ""


# ============================================================================
# 1. EXTRACTION DES DONNÉES DE MARCHÉ (yfinance)
# ============================================================================
def fetch_market_data(symbol: str, period: str = "3mo", interval: str = "1d") -> pd.DataFrame:
    """Récupère l'historique de prix pour un symbole donné via Yahoo Finance."""
    logger.info(f"Récupération des données pour {symbol}...")
    try:
        df = yf.Ticker(symbol).history(period=period, interval=interval)
        if df.empty:
            raise ValueError(f"Aucune donnée retournée pour {symbol}")
        return df
    except Exception as exc:
        logger.error(f"Échec de récupération pour {symbol} : {exc}")
        return pd.DataFrame()


# ============================================================================
# 2. ANALYSE TECHNIQUE — RSI, moyennes mobiles, détection de tendance
# ============================================================================
def compute_rsi(series: pd.Series, period: int = 14) -> float:
    """Calcule le RSI (Relative Strength Index) sur les N dernières périodes."""
    delta = series.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)

    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()

    rs = avg_gain / avg_loss.replace(0, 1e-10)
    rsi = 100 - (100 / (1 + rs))
    return round(float(rsi.iloc[-1]), 2) if not rsi.empty else 50.0


def compute_trend(sma_20: float, sma_50: float, rsi: float) -> tuple:
    """Détermine une tendance simple et un score de confiance technique."""
    if sma_20 > sma_50 and rsi > 50:
        return "Haussier", min(95, 60 + int((rsi - 50)))
    elif sma_20 < sma_50 and rsi < 50:
        return "Baissier", min(95, 60 + int((50 - rsi)))
    else:
        return "Neutre", 50


def analyze_technical(symbol: str, label: str) -> TechnicalSignal | None:
    """Pipeline complet d'analyse technique pour un symbole donné."""
    df = fetch_market_data(symbol)
    if df.empty or len(df) < 50:
        logger.warning(f"Données insuffisantes pour l'analyse technique de {symbol}")
        return None

    close = df["Close"]
    last_price = round(float(close.iloc[-1]), 4)
    sma_20 = round(float(close.rolling(window=20).mean().iloc[-1]), 4)
    sma_50 = round(float(close.rolling(window=50).mean().iloc[-1]), 4)
    rsi = compute_rsi(close)
    trend, confidence = compute_trend(sma_20, sma_50, rsi)

    return TechnicalSignal(
        symbol=symbol,
        label=label,
        last_price=last_price,
        rsi=rsi,
        sma_20=sma_20,
        sma_50=sma_50,
        trend=trend,
        confidence_technical=confidence,
    )


# ============================================================================
# 3. ANALYSE FONDAMENTALE & MACRO — Appel à l'API Anthropic Claude
# ============================================================================
def build_macro_prompt(signal: TechnicalSignal) -> str:
    """Construit un prompt structuré pour demander à Claude une synthèse
    macro/technique condensée et actionnable."""
    return f"""Tu es un analyste financier senior. Voici les données techniques
actuelles pour {signal.label} ({signal.symbol}) :

- Dernier prix : {signal.last_price}
- RSI (14) : {signal.rsi}
- Moyenne mobile 20 périodes : {signal.sma_20}
- Moyenne mobile 50 périodes : {signal.sma_50}
- Tendance technique détectée : {signal.trend}
- Confiance technique : {signal.confidence_technical}/100

Consignes :
1. Analyse le contexte macroéconomique actuel pertinent pour cet actif
   (politique monétaire, données d'emploi, inflation, actualité sectorielle).
2. Corrèle ce contexte macro avec les indicateurs techniques ci-dessus.
3. Fournis un score de confiance global (0-100) qui fusionne technique + macro.
4. Donne une recommandation claire et concise (Achat / Vente / Attente).

Réponds au format JSON strict, sans texte hors JSON :
{{
  "macro_summary": "résumé macro en 2-3 phrases",
  "confidence_score": 0-100,
  "recommendation": "Achat | Vente | Attente"
}}"""


def call_claude_for_macro_analysis(signal: TechnicalSignal) -> dict:
    """Appelle l'API Anthropic Claude pour obtenir la synthèse macro/technique.
    Utilise le endpoint /v1/messages standard avec le modèle Claude actuel."""
    if not ANTHROPIC_API_KEY:
        logger.warning("ANTHROPIC_API_KEY absente : analyse macro ignorée.")
        return {"macro_summary": "Analyse macro indisponible.", "confidence_score": signal.confidence_technical, "recommendation": "Attente"}

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    payload = {
        "model": "claude-sonnet-4-6",
        "max_tokens": 500,
        "messages": [{"role": "user", "content": build_macro_prompt(signal)}],
    }

    try:
        resp = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=payload,
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        text = "".join(
            block.get("text", "") for block in data.get("content", []) if block.get("type") == "text"
        )
        cleaned = text.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except Exception as exc:
        logger.error(f"Échec de l'appel Claude pour {signal.symbol} : {exc}")
        return {
            "macro_summary": "Analyse macro indisponible (erreur API).",
            "confidence_score": signal.confidence_technical,
            "recommendation": "Attente",
        }


def build_fused_report(signal: TechnicalSignal) -> FusedReport:
    """Fusionne l'analyse technique et l'analyse macro (Claude) en un rapport unique."""
    macro = call_claude_for_macro_analysis(signal)
    return FusedReport(
        signal=signal,
        macro_summary=macro.get("macro_summary", ""),
        confidence_score=int(macro.get("confidence_score", signal.confidence_technical)),
        recommendation=macro.get("recommendation", "Attente"),
    )


# ============================================================================
# 4. VÉRIFICATION DU STATUT UTILISATEUR (Google Apps Script)
# ============================================================================
def check_user_status(email: str) -> dict:
    """Interroge le backend Google Apps Script pour savoir si l'utilisateur
    dispose d'un abonnement PRO actif."""
    if not APPS_SCRIPT_WEBAPP_URL:
        logger.warning("APPS_SCRIPT_WEBAPP_URL absente : statut par défaut = gratuit.")
        return {"isPro": False}

    try:
        resp = requests.get(
            APPS_SCRIPT_WEBAPP_URL,
            params={"action": "checkStatus", "email": email, "secret": BOT_SHARED_SECRET},
            timeout=20,
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as exc:
        logger.error(f"Échec de vérification de statut pour {email} : {exc}")
        return {"isPro": False}


def fetch_subscribers() -> list[dict]:
    """Récupère automatiquement la liste des utilisateurs ayant connecté leur
    Telegram (colonnes H/I de la Google Sheet), avec leur statut PRO déjà
    calculé côté serveur. Remplace la maintenance manuelle d'une liste JSON.
    En cas d'échec (URL/secret absents), se replie sur USERS_TO_NOTIFY_FALLBACK."""
    if not APPS_SCRIPT_WEBAPP_URL:
        logger.warning("APPS_SCRIPT_WEBAPP_URL absente : utilisation de la liste de secours.")
        return USERS_TO_NOTIFY_FALLBACK

    try:
        resp = requests.get(
            APPS_SCRIPT_WEBAPP_URL,
            params={"action": "listSubscribers", "secret": BOT_SHARED_SECRET},
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()
        if not data.get("success"):
            logger.error(f"listSubscribers a échoué : {data.get('message')}")
            return USERS_TO_NOTIFY_FALLBACK

        subscribers = data.get("subscribers", [])
        logger.info(f"{len(subscribers)} abonné(s) avec Telegram connecté récupéré(s) depuis la Google Sheet.")
        return subscribers
    except Exception as exc:
        logger.error(f"Échec de récupération de la liste des abonnés : {exc}")
        return USERS_TO_NOTIFY_FALLBACK


# ============================================================================
# 5. FORMATAGE DES MESSAGES (Free floutée / PRO complète)
# ============================================================================
def format_free_message(signal: TechnicalSignal) -> str:
    """Message basique et flouté pour les utilisateurs gratuits."""
    return (
        f"🔒 *Signal technique — {signal.label}*\n"
        f"Tendance : {signal.trend}\n"
        f"Confiance technique : ~{signal.confidence_technical - 15}-{signal.confidence_technical + 5}/100 (flouté)\n\n"
        f"🔓 Passez PRO pour débloquer le score exact, l'analyse macro complète "
        f"et la recommandation détaillée !"
    )


def format_pro_message(report: FusedReport) -> str:
    """Message complet fusion technique + macro pour les utilisateurs PRO."""
    s = report.signal
    return (
        f"🟢 *Signal PRO — {s.label}*\n\n"
        f"📊 *Technique*\n"
        f"• Prix actuel : {s.last_price}\n"
        f"• RSI(14) : {s.rsi}\n"
        f"• SMA20/SMA50 : {s.sma_20} / {s.sma_50}\n"
        f"• Tendance : {s.trend}\n\n"
        f"🌍 *Analyse macro*\n{report.macro_summary}\n\n"
        f"🎯 *Score de confiance fusionné* : {report.confidence_score}/100\n"
        f"📌 *Recommandation* : {report.recommendation}"
    )


# ============================================================================
# 6. ENVOI DES ALERTES VIA TELEGRAM
# ============================================================================
def send_telegram_message(chat_id: str, text: str) -> None:
    """Envoie un message formaté Markdown vers un chat Telegram donné."""
    if not TELEGRAM_BOT_TOKEN:
        logger.warning("TELEGRAM_BOT_TOKEN absent : message non envoyé (affichage console).")
        print(text)
        return

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    try:
        resp = requests.post(
            url,
            json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
            timeout=15,
        )
        resp.raise_for_status()
        logger.info(f"Message envoyé avec succès à {chat_id}")
    except Exception as exc:
        logger.error(f"Échec d'envoi Telegram vers {chat_id} : {exc}")


# ============================================================================
# PIPELINE PRINCIPAL
# ============================================================================
def run_pipeline() -> None:
    logger.info("=== Démarrage du cycle d'analyse DONKO ANALYTIC BOT ===")
    logger.info(f"Horodatage UTC : {datetime.now(timezone.utc).isoformat()}")

    # Étape 1 & 2 : Analyse technique de tous les marchés surveillés
    signals: list[TechnicalSignal] = []
    for symbol, label in MARKETS.items():
        signal = analyze_technical(symbol, label)
        if signal:
            signals.append(signal)

    if not signals:
        logger.error("Aucun signal technique n'a pu être généré. Arrêt du cycle.")
        sys.exit(1)

    # Étape 3 : Fusion macro/technique via Claude pour chaque signal
    fused_reports = {s.symbol: build_fused_report(s) for s in signals}

    # Étape 4 : Récupération automatique des abonnés ayant connecté Telegram
    subscribers = fetch_subscribers()
    if not subscribers:
        logger.warning("Aucun abonné à notifier (personne n'a encore connecté son Telegram).")

    # Étape 5 & 6 : Pour chaque abonné, envoyer le message adapté à son statut
    for user in subscribers:
        email = user.get("email")
        chat_id = user.get("chat_id")
        is_pro = user.get("isPro", False)
        if not email or not chat_id:
            continue

        for signal in signals:
            report = fused_reports[signal.symbol]
            message = format_pro_message(report) if is_pro else format_free_message(signal)
            send_telegram_message(chat_id, message)

    logger.info("=== Cycle d'analyse terminé avec succès ===")


if __name__ == "__main__":
    run_pipeline()
