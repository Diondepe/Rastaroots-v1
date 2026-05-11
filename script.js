// =========================
// RASTAROOTS LIFE SCRIPT
// =========================

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

revealItems.forEach((item) => {
  item.classList.add("reveal");
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.15,
  }
);

revealItems.forEach((item) => {
  revealObserver.observe(item);
});

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

// Track Rootz List / signup clicks in Google Analytics
const signupLinks = document.querySelectorAll('a[href*="eepurl.com"]');

signupLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (typeof gtag === "function") {
      gtag("event", "rootz_list_click", {
        event_category: "signup",
        event_label: link.textContent.trim(),
      });
    }
  });
});
