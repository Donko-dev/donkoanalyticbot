/**
 * ============================================================================
 * DONKO ANALYTIC BOT — app.js
 * ----------------------------------------------------------------------------
 * MOTEUR DE RENDU — Injecte dynamiquement le contenu de data.js dans le DOM,
 * gère le changement de langue (FR/EN/DE), le changement de thème
 * (clair/sombre) et l'écran de démarrage animé.
 * Ce fichier ne contient AUCUN texte ni couleur en dur : tout provient de
 * SITE_CONFIG (voir data.js). Pour changer le site, on modifie data.js.
 *
 * ARCHITECTURE :
 *   - Les fonctions "...Once()" attachent la structure et les écouteurs
 *     d'événements UNE SEULE FOIS, au chargement.
 *   - Les fonctions "apply...Text(t)" ne font QUE remplacer du texte/HTML :
 *     elles sont rejouées à chaque changement de langue, sans jamais
 *     rattacher de nouvel écouteur (pour éviter les doublons d'événements).
 * ============================================================================
 */

(function () {
  "use strict";

  if (typeof SITE_CONFIG === "undefined") {
    console.error("[DONKO] data.js introuvable ou SITE_CONFIG non défini.");
    return;
  }

  const cfg = SITE_CONFIG;

  const STORAGE_KEYS = {
    language: "donko_lang",
    theme: "donko_theme",
  };

  let currentLanguage = cfg.defaultLanguage || "fr";
  let currentTheme = cfg.theme.defaultMode || "dark";

  /** Renvoie le dictionnaire de textes de la langue actuellement sélectionnée. */
  function translations() {
    return cfg.i18n[currentLanguage] || cfg.i18n[cfg.defaultLanguage];
  }

  /* ------------------------------------------------------------------------
   * DÉTECTION DE LA PRÉFÉRENCE INITIALE (langue & thème)
   * Ordre de priorité : préférence enregistrée > préférence système > défaut.
   * ---------------------------------------------------------------------- */
  function getInitialLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.language);
      const supported = cfg.languages.map((l) => l.code);
      if (saved && supported.includes(saved)) return saved;

      const nav = (navigator.language || "").slice(0, 2).toLowerCase();
      if (supported.includes(nav)) return nav;
    } catch (err) {
      /* localStorage indisponible (mode privé strict, etc.) — on ignore. */
    }
    return cfg.defaultLanguage || "fr";
  }

  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.theme);
      if (saved === "light" || saved === "dark") return saved;

      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "light";
      }
    } catch (err) {
      /* idem */
    }
    return cfg.theme.defaultMode || "dark";
  }

  /* ------------------------------------------------------------------------
   * THÈME — Injection des variables CSS (:root) depuis la palette active
   * ---------------------------------------------------------------------- */
  function applyTheme(mode) {
    currentTheme = mode === "light" ? "light" : "dark";
    const t = cfg.theme;
    const palette = t.palettes[currentTheme] || t.palettes.dark;
    const root = document.documentElement.style;

    root.setProperty("--color-primary", palette.colorPrimary);
    root.setProperty("--color-secondary", palette.colorSecondary);
    root.setProperty("--color-accent", palette.colorAccent);
    root.setProperty("--color-danger", palette.colorDanger);
    root.setProperty("--color-bg", palette.colorBackground);
    root.setProperty("--color-bg-alt", palette.colorBackgroundAlt);
    root.setProperty("--color-text", palette.colorText);
    root.setProperty("--color-text-muted", palette.colorTextMuted);
    root.setProperty("--box-shadow", palette.boxShadow);
    root.setProperty("--font-heading", t.fontFamilyHeading);
    root.setProperty("--font-body", t.fontFamilyBody);
    root.setProperty("--font-size-base", t.fontSizeBase);
    root.setProperty("--border-radius", t.borderRadius);

    document.documentElement.setAttribute("data-theme", currentTheme);
    document.documentElement.style.colorScheme = currentTheme; // thème natif des champs de formulaire

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute("content", palette.colorBackground);

    try {
      localStorage.setItem(STORAGE_KEYS.theme, currentTheme);
    } catch (err) {
      /* ignore */
    }

    updateThemeToggleIcon();
  }

  function updateThemeToggleIcon() {
    const iconEl = document.querySelector("[data-theme-icon]");
    if (!iconEl) return;
    // L'icône affichée représente le mode VERS LEQUEL on bascule au clic.
    iconEl.textContent = currentTheme === "dark" ? "☀️" : "🌙";
  }

  function setupThemeToggle() {
    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    btn.addEventListener("click", () => {
      applyTheme(currentTheme === "dark" ? "light" : "dark");
    });
  }

  /* ------------------------------------------------------------------------
   * LANGUE — Sélecteur avec drapeaux (menu déroulant)
   * ---------------------------------------------------------------------- */
  function setupLanguageSwitcher() {
    const container = document.querySelector("[data-lang-switcher]");
    const toggleBtn = document.querySelector("[data-lang-toggle]");
    const menu = document.querySelector("[data-lang-menu]");
    if (!container || !toggleBtn || !menu) return;

    menu.innerHTML = cfg.languages
      .map(
        (l) => `<button type="button" data-lang-option="${l.code}">${l.flag} <span>${l.label}</span></button>`
      )
      .join("");

    toggleBtn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      container.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", container.classList.contains("open") ? "true" : "false");
    });

    menu.querySelectorAll("[data-lang-option]").forEach((optBtn) => {
      optBtn.addEventListener("click", () => {
        setLanguage(optBtn.getAttribute("data-lang-option"));
        container.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (evt) => {
      if (!container.contains(evt.target)) {
        container.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setLanguage(lang) {
    const supported = cfg.languages.map((l) => l.code);
    if (!supported.includes(lang)) return;
    currentLanguage = lang;
    try {
      localStorage.setItem(STORAGE_KEYS.language, lang);
    } catch (err) {
      /* ignore */
    }
    renderTranslatedContent();
  }

  function applyLanguageSwitcherUI() {
    const flagEl = document.querySelector("[data-lang-current-flag]");
    const current = cfg.languages.find((l) => l.code === currentLanguage);
    if (flagEl && current) flagEl.textContent = current.flag;

    document.querySelectorAll("[data-lang-option]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang-option") === currentLanguage);
    });
  }

  /* ------------------------------------------------------------------------
   * SEO — <title>, meta description, Open Graph, Twitter Cards, langue
   * (Affecte l'onglet du navigateur pour un visiteur réel ; les robots de
   * partage lisent les balises STATIQUES d'index.html, pas ce rendu JS —
   * c'est pourquoi index.html contient déjà les bonnes valeurs par défaut.)
   * ---------------------------------------------------------------------- */
  function applySEOText(t) {
    document.title = t.seo.siteTitle;
    setMeta("description", t.seo.siteDescription);
    setMeta("keywords", cfg.seo.keywords);
    setMeta("author", cfg.seo.author);

    setMetaProp("og:title", t.seo.siteTitle);
    setMetaProp("og:description", t.seo.siteDescription);
    setMetaProp("og:image", cfg.seo.ogImage);
    setMetaProp("og:image:alt", cfg.seo.ogImageAlt);
    setMetaProp("og:image:width", String(cfg.seo.ogImageWidth));
    setMetaProp("og:image:height", String(cfg.seo.ogImageHeight));
    setMetaProp("og:url", cfg.seo.siteUrl);

    const langCfg = cfg.languages.find((l) => l.code === currentLanguage);
    if (langCfg) setMetaProp("og:locale", langCfg.locale);

    setMeta("twitter:card", cfg.seo.twitterCard);
    setMeta("twitter:title", t.seo.siteTitle);
    setMeta("twitter:description", t.seo.siteDescription);
    setMeta("twitter:image", cfg.seo.ogImage);

    document.documentElement.lang = currentLanguage;
  }

  function setMeta(name, content) {
    const el = document.querySelector(`meta[name="${name}"]`);
    if (el) el.setAttribute("content", content);
  }
  function setMetaProp(prop, content) {
    const el = document.querySelector(`meta[property="${prop}"]`);
    if (el) el.setAttribute("content", content);
  }

  /* ------------------------------------------------------------------------
   * BRAND / HEADER — structure une seule fois, texte à chaque rendu
   * ---------------------------------------------------------------------- */
  function injectBrandOnce() {
    document.querySelectorAll("[data-brand-logo]").forEach((el) => {
      el.src = cfg.brand.logoPath;
      el.alt = cfg.brand.name;
    });
    document.querySelectorAll("[data-brand-name]").forEach((el) => {
      el.textContent = cfg.brand.name;
    });

    const cta = document.querySelector("[data-header-cta]");
    if (cta) cta.href = cfg.header.ctaButtonHref;

    const btn1 = document.querySelector("[data-hero-btn-primary]");
    if (btn1) btn1.href = cfg.hero.primaryButtonHref;
    const btn2 = document.querySelector("[data-hero-btn-secondary]");
    if (btn2) btn2.href = cfg.hero.secondaryButtonHref;
  }

  function applyHeaderText(t) {
    const nav = document.querySelector("[data-header-menu]");
    if (nav) {
      nav.innerHTML = cfg.header.menuItems
        .map((item) => `<a href="${item.href}">${t.header.menuLabels[item.id]}</a>`)
        .join("");
    }
    const cta = document.querySelector("[data-header-cta]");
    if (cta) cta.textContent = t.header.ctaButtonText;
  }

  /* ------------------------------------------------------------------------
   * HERO
   * ---------------------------------------------------------------------- */
  function applyHeroText(t) {
    const styles = cfg.theme.textStyles;
    setText("[data-hero-eyebrow]", t.hero.eyebrow);
    setText("[data-hero-title]", t.hero.title, {
      bold: styles.heroTitleBold,
      underline: styles.heroTitleUnderline,
    });
    setText("[data-hero-subtitle]", t.hero.subtitle, { italic: styles.heroSubtitleItalic });

    const btn1 = document.querySelector("[data-hero-btn-primary]");
    if (btn1) btn1.textContent = t.hero.primaryButtonText;
    const btn2 = document.querySelector("[data-hero-btn-secondary]");
    if (btn2) btn2.textContent = t.hero.secondaryButtonText;
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
   * MARKETS
   * ---------------------------------------------------------------------- */
  function applyMarketsText(t) {
    setText("[data-markets-title]", t.markets.sectionTitle);

    const container = document.querySelector("[data-markets-list]");
    if (!container) return;
    container.innerHTML = cfg.markets
      .map((m) => {
        const item = t.markets.items[m.id];
        return `
        <div class="market-card">
          <span class="market-icon">${m.icon}</span>
          <h3>${item.name}</h3>
          <p>${item.example}</p>
        </div>`;
      })
      .join("");
  }

  /* ------------------------------------------------------------------------
   * PRICING — grille tarifaire avec effet de prix barré
   * ---------------------------------------------------------------------- */
  function applyPricingText(t) {
    setText("[data-pricing-title]", t.pricing.sectionTitle);
    setText("[data-pricing-subtitle]", t.pricing.sectionSubtitle);

    const container = document.querySelector("[data-pricing-grid]");
    if (container) {
      const strike = cfg.theme.textStyles.pricingOldPriceStrike;
      container.innerHTML = cfg.pricing.plans
        .map((plan) => {
          const text = t.pricing.planText[plan.id];
          return `
          <div class="pricing-card ${plan.highlight ? "pricing-card--highlight" : ""}">
            ${plan.highlight ? '<span class="badge">★</span>' : ""}
            <h3>${text.name}</h3>
            <p class="price-old" style="${strike ? "text-decoration: line-through;" : ""}">
              ${plan.oldPrice} ${cfg.pricing.currency}
            </p>
            <p class="price-new">${plan.newPrice} <span>${cfg.pricing.currency}</span></p>
            <p class="price-duration">/ ${text.duration}</p>
            <a class="btn-subscribe" href="#" data-plan-id="${plan.id}">${t.pricing.subscribeButtonText}</a>
          </div>`;
        })
        .join("");
    }

    const featuresList = document.querySelector("[data-pricing-features]");
    if (featuresList) {
      featuresList.innerHTML = t.pricing.features.map((f) => `<li>✔ ${f}</li>`).join("");
    }
  }

  /* ------------------------------------------------------------------------
   * JSONP — Contourne le blocage CORS des Web Apps Google Apps Script.
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
   * TELEGRAM CONNECT — texte (à chaque rendu) + soumission (une seule fois)
   * ---------------------------------------------------------------------- */
  function applyTelegramConnectText(t) {
    const tg = t.telegramConnect;
    setText("[data-tg-title]", tg.sectionTitle);
    setText("[data-tg-subtitle]", tg.sectionSubtitle);

    const input = document.querySelector("[data-tg-email-input]");
    if (input) input.placeholder = tg.inputPlaceholder;

    const btn = document.querySelector("[data-tg-submit-btn]");
    if (btn) btn.textContent = tg.buttonText;
  }

  function setupTelegramConnectForm() {
    const form = document.querySelector("[data-tg-form]");
    const input = document.querySelector("[data-tg-email-input]");
    const btn = document.querySelector("[data-tg-submit-btn]");
    const resultEl = document.querySelector("[data-tg-result]");
    if (!form || !input || !btn || !resultEl) return;

    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      const email = input.value.trim();
      if (!email) return;

      // On relit les textes de la langue COURANTE au moment de la soumission
      // (pas ceux capturés à l'initialisation), pour rester juste même après
      // un changement de langue en cours de route.
      const tg = translations().telegramConnect;

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
   * FOOTER — Bloc EMPIRE CODE (structure fixe, une fois) + disclaimer (i18n)
   * ---------------------------------------------------------------------- */
  function injectFooterOnce() {
    const f = cfg.footer;
    document.querySelectorAll("[data-footer-logo]").forEach((el) => {
      el.src = f.logoPath;
      el.alt = f.logoAlt;
    });

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
  }

  function applyFooterDisclaimer(t) {
    setText("[data-footer-disclaimer]", t.footer.disclaimer);
  }

  /* ------------------------------------------------------------------------
   * SPLASH — Écran de démarrage animé (logo qui tourne 3 à 5 secondes)
   * ---------------------------------------------------------------------- */
  function applySplashText(t) {
    setText("[data-splash-text]", t.splash.loadingText);
  }

  function setupSplashScreen() {
    const logo = document.querySelector("[data-splash-logo]");
    if (logo) logo.src = cfg.splash.logoPath || cfg.brand.logoPath;

    const splashEl = document.querySelector("[data-splash-screen]");
    if (!splashEl) return;

    if (!cfg.splash.enabled) {
      splashEl.remove();
      return;
    }

    const duration = cfg.splash.durationMs || 4000;
    setTimeout(() => {
      splashEl.classList.add("hidden");
      setTimeout(() => splashEl.remove(), 700); // laisse le temps au fondu CSS
    }, duration);
  }

  /* ------------------------------------------------------------------------
   * RENDU — Applique la langue courante à TOUT le contenu textuel
   * ---------------------------------------------------------------------- */
  function renderTranslatedContent() {
    const t = translations();
    applySEOText(t);
    applyHeaderText(t);
    applyHeroText(t);
    applyMarketsText(t);
    applyPricingText(t);
    applyTelegramConnectText(t);
    applyFooterDisclaimer(t);
    applySplashText(t);
    applyLanguageSwitcherUI();
  }

  /* ------------------------------------------------------------------------
   * INITIALISATION
   * ---------------------------------------------------------------------- */
  function init() {
    currentLanguage = getInitialLanguage();
    currentTheme = getInitialTheme();

    applyTheme(currentTheme); // couleurs + typographie, avant tout le reste
    injectBrandOnce();
    injectFooterOnce();
    renderTranslatedContent(); // tous les textes, dans la langue détectée

    setupLanguageSwitcher();
    setupThemeToggle();
    setupTelegramConnectForm();
    setupSplashScreen();

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
