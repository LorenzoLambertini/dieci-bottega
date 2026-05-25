/**
 * Dieci Bottega — Lead Capture Embed
 * Include in any page to automatically intercept the contact form
 * and send submissions to the CRM.
 *
 * Usage:
 *   <script src="https://diecibottega.it/embed.js" async></script>
 */
(function () {
  "use strict";

  var ENDPOINT =
    "https://voyhwqqubcathcvjatyk.supabase.co/functions/v1/capture-lead";

  function getUTM() {
    var params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
    };
  }

  function findForms() {
    // Match forms with action containing "contact", "contatto", or id/class hints
    var forms = document.querySelectorAll(
      'form[id*="contact"], form[id*="contatt"], form[class*="contact"], form[class*="contatt"], form[action*="contact"]'
    );
    // Fallback: any form with an email input
    if (!forms.length) {
      forms = document.querySelectorAll("form");
    }
    return Array.from(forms).filter(function (f) {
      return f.querySelector('input[type="email"], input[name="email"]');
    });
  }

  function extractField(form, names) {
    for (var i = 0; i < names.length; i++) {
      var el =
        form.querySelector('[name="' + names[i] + '"]') ||
        form.querySelector('[id="' + names[i] + '"]') ||
        form.querySelector('[placeholder*="' + names[i] + '"]');
      if (el && el.value && el.value.trim()) return el.value.trim();
    }
    return undefined;
  }

  function attachForm(form) {
    if (form.__db_attached) return;
    form.__db_attached = true;

    form.addEventListener("submit", function (e) {
      var name =
        extractField(form, ["name", "nome", "full_name", "fullname"]) || "";
      var email =
        extractField(form, ["email", "mail", "e-mail"]) || "";
      var phone = extractField(form, ["phone", "telefono", "tel", "cellulare"]);
      var company = extractField(form, ["company", "azienda", "business"]);
      var message = extractField(form, [
        "message",
        "messaggio",
        "msg",
        "body",
        "testo",
      ]);

      if (!email) return; // don't intercept non-contact forms

      var payload = Object.assign(
        {
          name: name,
          email: email,
          phone: phone,
          company: company,
          message: message,
          source: "website",
          page_url: window.location.href,
        },
        getUTM()
      );

      // Fire-and-forget — don't block form submission
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(function () {
        // Silently fail — never interrupt UX
      });
    });
  }

  function init() {
    findForms().forEach(attachForm);

    // Watch for dynamically added forms (SPA navigation)
    if (typeof MutationObserver !== "undefined") {
      var observer = new MutationObserver(function () {
        findForms().forEach(attachForm);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
