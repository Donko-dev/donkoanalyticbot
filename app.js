/**
 * ============================================================================
 * DONKO ANALYTIC BOT — app.js
 * ----------------------------------------------------------------------------
 * MOTEUR DE RENDU — Injecte dynamiquement le contenu de data.js dans le DOM.
 * Ce fichier ne contient AUCUN texte ni couleur en dur : tout provient de
 * SITE_CONFIG (voir data.js). Pour changer le site, on modifie data.js.
 * ============================================================================
 */

(function () {
  "use strict";

  if (typeof SITE_CONFIG === "undefined") {
    console.error("[DONKO] data.js introuvable ou SITE_CONFIG non défini.");
    return;
  }

  const cfg = SITE_CONFIG;

  /* ------------------------------------------------------------------------
   * 1. INJECTION DES VARIABLES CSS (:root) DEPUIS cfg.theme
   * ---------------------------------------------------------------------- */
  function injectTheme() {
    const root = document.documentElement.style;
    const t = cfg.theme;

    root.setProperty("--color-primary", t.colorPrimary);
    root.setProperty("--color-secondary", t.colorSecondary);
    root.setProperty("--color-accent", t.colorAccent);
    root.setProperty("--color-danger", t.colorDanger);
    root.setProperty("--color-bg", t.colorBackground);
    root.setProperty("--color-bg-alt", t.colorBackgroundAlt);
    root.setProperty("--color-text", t.colorText);
    root.setProperty("--color-text-muted", t.colorTextMuted);
    root.setProperty("--font-heading", t.fontFamilyHeading);
    root.setProperty("--font-body", t.fontFamilyBody);
    root.setProperty("--font-size-base", t.fontSizeBase);
    root.setProperty("--border-radius", t.borderRadius);
    root.setProperty("--box-shadow", t.boxShadow);

    document
      .querySelectorAll("[data-theme-meta]")
      .forEach((el) => el.setAttribute("content", cfg.seo.themeColorMeta));
  }

  /* ------------------------------------------------------------------------
   * 2. SEO — <title>, meta description, Open Graph, Twitter Cards
   * ---------------------------------------------------------------------- */
  function injectSEO() {
    document.title = cfg.seo.siteTitle;
    setMeta("description", cfg.seo.siteDescription);
    setMeta("keywords", cfg.seo.keywords);
    setMeta("author", cfg.seo.author);

    setMetaProp("og:title", cfg.seo.siteTitle);
    setMetaProp("og:description", cfg.seo.siteDescription);
    setMetaProp("og:image", cfg.seo.ogImage);
    setMetaProp("og:image:alt", cfg.seo.ogImageAlt);
    setMetaProp("og:url", cfg.seo.siteUrl);
    setMetaProp("og:locale", cfg.seo.locale);

    setMeta("twitter:card", cfg.seo.twitterCard);
    setMeta("twitter:title", cfg.seo.siteTitle);
    setMeta("twitter:description", cfg.seo.siteDescription);
    setMeta("twitter:image", cfg.seo.ogImage);
  }

  function setMeta(name, content) {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (el) el.setAttribute("content", content);
  }
  function setMetaProp(prop, content) {
    let el = document.querySelector(`meta[property="${prop}"]`);
    if (el) el.setAttribute("content", content);
  }

  /* ------------------------------------------------------------------------
   * 3. BRAND / HEADER
   * ---------------------------------------------------------------------- */
  function injectHeader() {
    document.querySelectorAll("[data-brand-logo]").forEach((el) => {
      el.src = cfg.brand.logoPath;
      el.alt = cfg.brand.name;
    });
    document.querySelectorAll("[data-brand-name]").forEach((el) => {
      el.textContent = cfg.brand.name;
    });

    const nav = document.querySelector("[data-header-menu]");
    if (nav) {
      nav.innerHTML = cfg.header.menuItems
        .map((item) => `<a href="${item.href}">${item.label}</a>`)
        .join("");
    }

    const cta = document.querySelector("[data-header-cta]");
    if (cta) {
      cta.textContent = cfg.header.ctaButtonText;
      cta.href = cfg.header.ctaButtonHref;
    }
  }

  /* ------------------------------------------------------------------------
   * 4. HERO
   * ---------------------------------------------------------------------- */
  function injectHero() {
    const h = cfg.hero;
    const styles = cfg.theme.textStyles;

    setText("[data-hero-eyebrow]", h.eyebrow);
    setText("[data-hero-title]", h.title, {
      bold: styles.heroTitleBold,
      underline: styles.heroTitleUnderline,
    });
    setText("[data-hero-subtitle]", h.subtitle, {
      italic: styles.heroSubtitleItalic,
    });

    const btn1 = document.querySelector("[data-hero-btn-primary]");
    if (btn1) {
      btn1.textContent = h.primaryButtonText;
      btn1.href = h.primaryButtonHref;
    }
    const btn2 = document.querySelector("[data-hero-btn-secondary]");
    if (btn2) {
      btn2.textContent = h.secondaryButtonText;
      btn2.href = h.secondaryButtonHref;
    }
  }

  function setText(selector, text, styleFlags = {}) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.textContent = text;
    if (styleFlags.bold) el.style.fontWeight = "700";
    if (styleFlags.italic) el.style.fontStyle = "italic";
    if (styleFlags.underline) el.style.textDecoration = "underline";
  }

  /* ------------------------------------------------------------------------
   * 5. MARKETS
   * ---------------------------------------------------------------------- */
  function injectMarkets() {
    const container = document.querySelector("[data-markets-list]");
    if (!container) return;
    container.innerHTML = cfg.markets
      .map(
        (m) => `
        <div class="market-card">
          <span class="market-icon">${m.icon}</span>
          <h3>${m.name}</h3>
          <p>${m.example}</p>
        </div>`
      )
      .join("");
  }

  /* ------------------------------------------------------------------------
   * 6. PRICING — grille tarifaire avec effet de prix barré
   * ---------------------------------------------------------------------- */
  function injectPricing() {
    const p = cfg.pricing;
    setText("[data-pricing-title]", p.sectionTitle);
    setText("[data-pricing-subtitle]", p.sectionSubtitle);

    const container = document.querySelector("[data-pricing-grid]");
    if (container) {
      const strike = cfg.theme.textStyles.pricingOldPriceStrike;
      container.innerHTML = p.plans
        .map(
          (plan) => `
          <div class="pricing-card ${plan.highlight ? "pricing-card--highlight" : ""}">
            ${plan.highlight ? '<span class="badge">Populaire</span>' : ""}
            <h3>${plan.name}</h3>
            <p class="price-old" style="${strike ? "text-decoration: line-through;" : ""}">
              ${plan.oldPrice} ${p.currency}
            </p>
            <p class="price-new">${plan.newPrice} <span>${p.currency}</span></p>
            <p class="price-duration">/ ${plan.duration}</p>
            <a class="btn-subscribe" href="#" data-plan-id="${plan.id}">S'abonner</a>
          </div>`
        )
        .join("");
    }

    const featuresList = document.querySelector("[data-pricing-features]");
    if (featuresList) {
      featuresList.innerHTML = p.features.map((f) => `<li>✔ ${f}</li>`).join("");
    }
  }

  /* ------------------------------------------------------------------------
   * 5bis. JSONP — Contourne le blocage CORS des Web Apps Google Apps Script.
   * Google ne permet pas de configurer les en-têtes CORS sur un Content
   * Service ; la méthode officiellement recommandée pour un appel depuis un
   * site externe est le JSONP (chargement via balise <script>, qui n'est
   * pas soumis à la politique CORS des navigateurs).
   * ---------------------------------------------------------------------- */
  function jsonpRequest(url, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const callbackName = "donkoCb_" + Date.now() + "_" + Math.floor(Math.random() * 1e6);
      const script = document.createElement("script");
      let settled = false;

      function cleanup() {
        delete window[callbackName];
        script.remove();
        clearTimeout(timer);
      }

      window[callbackName] = function (data) {
        settled = true;
        resolve(data);
        cleanup();
      };

      script.onerror = function () {
        if (!settled) {
          reject(new Error("Échec du chargement JSONP"));
          cleanup();
        }
      };

      const timer = setTimeout(() => {
        if (!settled) {
          reject(new Error("Délai dépassé"));
          cleanup();
        }
      }, timeoutMs);

      const separator = url.indexOf("?") === -1 ? "?" : "&";
      script.src = url + separator + "callback=" + callbackName;
      document.body.appendChild(script);
    });
  }

  /* ------------------------------------------------------------------------
   * 6bis. TELEGRAM CONNECT — Widget d'auto-liaison (email → lien Telegram)
   * ---------------------------------------------------------------------- */
  function injectTelegramConnect() {
    const tg = cfg.telegramConnect;
    setText("[data-tg-title]", tg.sectionTitle);
    setText("[data-tg-subtitle]", tg.sectionSubtitle);

    const input = document.querySelector("[data-tg-email-input]");
    if (input) input.placeholder = tg.inputPlaceholder;

    const btn = document.querySelector("[data-tg-submit-btn]");
    if (btn) btn.textContent = tg.buttonText;

    const form = document.querySelector("[data-tg-form]");
    if (!form) return;

    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      const email = input.value.trim();
      if (!email) return;

      const resultEl = document.querySelector("[data-tg-result]");
      resultEl.hidden = false;
      resultEl.textContent = tg.loadingText;
      btn.disabled = true;

      try {
        const url = cfg.api.appsScriptWebAppUrl + cfg.api.getTelegramLinkEndpoint + "&email=" + encodeURIComponent(email);
        const data = await jsonpRequest(url);

        if (!data.success) {
          resultEl.textContent = "❌ " + (data.message || tg.errorNotFound);
        } else if (data.alreadyLinked) {
          resultEl.textContent = tg.successAlreadyLinked;
        } else {
          resultEl.innerHTML =
            `<p>${tg.successNewLink}</p>` +
            `<a class="btn-primary" href="${data.telegramLink}" target="_blank" rel="noopener">${tg.openTelegramButtonText}</a>`;
        }
      } catch (err) {
        resultEl.textContent = "❌ " + tg.errorGeneric;
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* ------------------------------------------------------------------------
   * 7. FOOTER — section EMPIRE CODE obligatoire
   * ---------------------------------------------------------------------- */
  function injectFooter() {
    const f = cfg.footer;
    document.querySelectorAll("[data-footer-logo]").forEach((el) => {
      el.src = f.logoPath;
      el.alt = f.logoAlt;
    });

    setText("[data-footer-copyright]", "", {});
    const copyEl = document.querySelector("[data-footer-copyright]");
    if (copyEl) copyEl.innerHTML = f.copyrightText;

    setText("[data-footer-tagline]", f.tagline, {
      italic: cfg.theme.textStyles.footerTextItalicTagline,
    });

    const contactsEl = document.querySelector("[data-footer-contacts]");
    if (contactsEl) {
      const c = f.contacts;
      contactsEl.innerHTML = `
        <a href="${c.whatsapp.href}" target="_blank" rel="noopener">${c.whatsapp.label}: ${c.whatsapp.number}</a>
        <a href="${c.email.href}">${c.email.label}: ${c.email.address}</a>
        <a href="${c.tiktok.href}" target="_blank" rel="noopener">${c.tiktok.label}: ${c.tiktok.handle}</a>
        <a href="${c.boutique.href}" target="_blank" rel="noopener">${c.boutique.label}: ${c.boutique.name}</a>
      `;
    }

    const disclaimerEl = document.querySelector("[data-footer-disclaimer]");
    if (disclaimerEl) disclaimerEl.textContent = f.disclaimer;
  }

  /* ------------------------------------------------------------------------
   * 8. INITIALISATION
   * ---------------------------------------------------------------------- */
  function init() {
    injectTheme();
    injectSEO();
    injectHeader();
    injectHero();
    injectMarkets();
    injectPricing();
    injectTelegramConnect();
    injectFooter();

    // Enregistrement du Service Worker (PWA)
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("service-worker.js")
          .catch((err) => console.warn("[DONKO] Échec enregistrement SW:", err));
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
