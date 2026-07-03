// =========================
// RASTAROOTS LIFE SCRIPT
// =========================

const SHOP_PRODUCT_URL =
  "https://shop.rastarootslife.com/products/rastaroots-discovery-collection";

// Mobile menu
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector("#mobileNav");

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("active");
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("active");
      document.body.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Smooth reveal animations
const revealItems = document.querySelectorAll(
  ".hero, .value-strip, .founder-banner, .section, .feature-section, .club-section, .launch-section, .subscribe-section, .site-footer"
);

revealItems.forEach((item) => item.classList.add("reveal"));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.15 }
);

revealItems.forEach((item) => revealObserver.observe(item));

// Hero parallax
const parallaxMedia = document.querySelector(".parallax-media img");

window.addEventListener(
  "scroll",
  () => {
    if (!parallaxMedia) return;
    const offset = window.scrollY * 0.08;
    parallaxMedia.style.transform = `translateY(${offset}px) scale(1.04)`;
  },
  { passive: true }
);

// Stagger cards and upgraded sections
const cards = document.querySelectorAll(
  ".product-card, .tea-card, .launch-grid div, .how-grid div, .club-benefits div"
);

cards.forEach((card, index) => {
  card.style.transitionDelay = `${index * 90}ms`;
});

// =========================
// ANALYTICS HELPERS
// =========================

function trackGA(eventName, params = {}) {
  if (typeof gtag === "function") {
    gtag("event", eventName, params);
  }
}

function trackMeta(eventName, params = {}) {
  if (typeof fbq === "function") {
    fbq("trackCustom", eventName, params);
  }
}

function trackBoth(eventName, params = {}) {
  trackGA(eventName, params);
  trackMeta(eventName, params);
}

// Rootz List / signup clicks
document.querySelectorAll('a[href*="eepurl.com"]').forEach((link) => {
  link.addEventListener("click", () => {
    trackBoth("rootz_list_click", {
      event_category: "signup",
      event_label: link.textContent.trim(),
      page_location: window.location.href,
    });
  });
});

// Pre-order / Shopify clicks
document.querySelectorAll("a, button").forEach((el) => {
  const href = el.getAttribute("href") || "";
  const text = (el.textContent || "").toLowerCase();

  const isShopifyLink =
    href.includes("myshopify.com") ||
    href.includes("shop.rastarootslife.com") ||
    href.includes("products/rastaroots-discovery-collection");

  const isPreorderButton =
    text.includes("pre-order") ||
    text.includes("preorder") ||
    text.includes("reserve") ||
    text.includes("founder") ||
    text.includes("secure");

  if (isShopifyLink || isPreorderButton) {
    el.addEventListener("click", () => {
      trackBoth("preorder_click", {
        event_category: "ecommerce",
        event_label: el.textContent.trim(),
        product_name: "RastaRoots Discovery Collection",
        value: 24.99,
        currency: "GBP",
        page_location: window.location.href,
      });
    });
  }
});

// Automatically update old Shopify links to branded shop domain
document.querySelectorAll('a[href*="5w4dw4-1e.myshopify.com"]').forEach((link) => {
  link.href = link.href.replace(
    "https://5w4dw4-1e.myshopify.com",
    "https://shop.rastarootslife.com"
  );
});
