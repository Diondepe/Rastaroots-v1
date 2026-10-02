/* ==========================================================
   RASTAROOTS LIFE
   MASTER SCRIPT V610

   Upgraded for:
   - Mobile performance
   - Conversion tracking
   - Safer reveal animations
   - Mobile navigation
   - Shopify link consistency
   - Sticky CTA tracking
   - Reduced-motion accessibility
   - Hero carousel support
   - Scroll performance
========================================================== */

"use strict";


/* ==========================================================
   CONFIG
========================================================== */

const RASTAROOTS = {
  shopDomain: "https://shop.rastarootslife.com",

  discoveryProductPath:
    "/products/rastaroots-discovery-collection",

  discoveryProductUrl:
    "https://shop.rastarootslife.com/products/rastaroots-discovery-collection",

  oldShopDomain:
    "https://5w4dw4-1e.myshopify.com"
};


/* ==========================================================
   DOM READY
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  normaliseShopLinks();

  initMobileMenu();

  initRevealAnimations();

  initHeroParallax();

  initHomepageHeroCarousel();

  initAnalytics();

  initExternalLinkSecurity();

});


/* ==========================================================
   ANALYTICS HELPERS
========================================================== */

function trackGA(eventName, params = {}) {

  if (typeof window.gtag === "function") {

    window.gtag("event", eventName, params);

  }

}


function trackMeta(eventName, params = {}) {

  if (typeof window.fbq === "function") {

    window.fbq("trackCustom", eventName, params);

  }

}


function trackBoth(eventName, params = {}) {

  trackGA(eventName, params);

  trackMeta(eventName, params);

}


/* ==========================================================
   SHOPIFY LINK NORMALISATION

   Converts any old myshopify links to the branded shop domain.

   IMPORTANT:
   We preserve the path, query string and product destination.
========================================================== */

function normaliseShopLinks() {

  const links = document.querySelectorAll("a[href]");

  links.forEach((link) => {

    const href = link.getAttribute("href");

    if (!href) return;


    if (href.includes(RASTAROOTS.oldShopDomain)) {

      link.href = href.replace(
        RASTAROOTS.oldShopDomain,
        RASTAROOTS.shopDomain
      );

    }

  });

}


/* ==========================================================
   MOBILE MENU
========================================================== */

function initMobileMenu() {

  const menuToggle =
    document.querySelector(".menu-toggle");

  const mobileNav =
    document.querySelector("#mobileNav");


  if (!menuToggle || !mobileNav) return;


  const openMenu = () => {

    mobileNav.classList.add("active");

    document.body.classList.add("menu-open");

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

  };


  const closeMenu = () => {

    mobileNav.classList.remove("active");

    document.body.classList.remove("menu-open");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

  };


  const toggleMenu = () => {

    const isOpen =
      mobileNav.classList.contains("active");

    if (isOpen) {

      closeMenu();

    } else {

      openMenu();

    }

  };


  menuToggle.setAttribute(
    "aria-expanded",
    "false"
  );


  menuToggle.addEventListener(
    "click",
    toggleMenu
  );


  mobileNav
    .querySelectorAll("a")
    .forEach((link) => {

      link.addEventListener(
        "click",
        closeMenu
      );

    });


  /* Close menu with Escape */

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key !== "Escape") return;

      if (
        !mobileNav.classList.contains("active")
      ) {
        return;
      }

      closeMenu();

      menuToggle.focus();

    }
  );


  /*
   Close the mobile menu when moving back
   into desktop navigation.
  */

  const desktopNavQuery =
    window.matchMedia("(min-width: 981px)");


  const handleDesktopChange = (event) => {

    if (event.matches) {

      closeMenu();

    }

  };


  if (
    typeof desktopNavQuery.addEventListener ===
    "function"
  ) {

    desktopNavQuery.addEventListener(
      "change",
      handleDesktopChange
    );

  } else if (
    typeof desktopNavQuery.addListener ===
    "function"
  ) {

    desktopNavQuery.addListener(
      handleDesktopChange
    );

  }

}


/* ==========================================================
   REVEAL ANIMATIONS

   Progressive enhancement:
   Content remains visible unless IntersectionObserver
   is actually available.

   This prevents sections remaining invisible if JS or
   browser animation support fails.
========================================================== */

function initRevealAnimations() {

  const prefersReducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  if (prefersReducedMotion) return;


  if (
    !("IntersectionObserver" in window)
  ) {
    return;
  }


  const selector = [

    ".hero",

    ".value-strip",

    ".founder-banner",

    ".section",

    ".feature-section",

    ".club-section",

    ".launch-section",

    ".subscribe-section",

    ".site-footer",

    ".discovery-home",

    ".library-preview-v2",

    ".create-ritual-section",

    ".coffee-coming",

    ".rooted-lifestyle",

    ".answer-engine-section",

    ".brand-pillars",

    ".final-home-conversion",

    ".ritual-intro",

    ".ritual-choose-section",

    ".ritual-story",

    ".ritual-method",

    ".ritual-botanicals",

    ".ritual-spotify"

  ].join(",");


  const revealItems =
    document.querySelectorAll(selector);


  if (!revealItems.length) return;


  revealItems.forEach((item) => {

    item.classList.add("reveal");

  });


  const observer =
    new IntersectionObserver(

      (entries, revealObserver) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) return;


          entry.target.classList.add(
            "visible"
          );


          /*
           Once shown, stop observing it.
           This reduces unnecessary browser work.
          */

          revealObserver.unobserve(
            entry.target
          );

        });

      },

      {
        threshold: 0.08,

        rootMargin:
          "0px 0px -40px 0px"
      }

    );


  revealItems.forEach((item) => {

    observer.observe(item);

  });

}


/* ==========================================================
   HERO PARALLAX

   Desktop only.

   The old script updated transform on every scroll event.
   This version:
   - disables the effect on mobile/tablet
   - respects reduced motion
   - uses requestAnimationFrame
   - avoids unnecessary layout work
========================================================== */

function initHeroParallax() {

  const parallaxMedia =
    document.querySelector(
      ".parallax-media img"
    );


  if (!parallaxMedia) return;


  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  const desktop =
    window.matchMedia(
      "(min-width: 981px)"
    ).matches;


  if (
    reducedMotion ||
    !desktop
  ) {

    parallaxMedia.style.transform = "";

    return;

  }


  let ticking = false;


  const updateParallax = () => {

    const offset =
      Math.min(
        window.scrollY * 0.055,
        55
      );


    parallaxMedia.style.transform =
      `translate3d(0, ${offset}px, 0) scale(1.035)`;


    ticking = false;

  };


  const requestParallaxUpdate = () => {

    if (ticking) return;


    ticking = true;


    window.requestAnimationFrame(
      updateParallax
    );

  };


  window.addEventListener(
    "scroll",
    requestParallaxUpdate,
    {
      passive: true
    }
  );


  requestParallaxUpdate();

}


/* ==========================================================
   HOMEPAGE HERO CAROUSEL

   Supports:
   .home-hero-slide
   .home-hero-dot
   .home-hero-arrow

   It also works if the homepage currently contains only
   one hero slide.
========================================================== */

function initHomepageHeroCarousel() {

  const carousel =
    document.querySelector(
      ".home-hero-carousel"
    );


  if (!carousel) return;


  const slides =
    Array.from(
      carousel.querySelectorAll(
        ".home-hero-slide"
      )
    );


  if (!slides.length) return;


  const dots =
    Array.from(
      carousel.querySelectorAll(
        ".home-hero-dot"
      )
    );


  const arrows =
    Array.from(
      carousel.querySelectorAll(
        ".home-hero-arrow"
      )
    );


  let currentIndex =
    slides.findIndex((slide) =>
      slide.classList.contains("is-active")
    );


  if (currentIndex < 0) {

    currentIndex = 0;

  }


  const showSlide = (
    nextIndex,
    interaction = false
  ) => {

    if (!slides.length) return;


    const index =
      (
        nextIndex +
        slides.length
      ) % slides.length;


    slides.forEach(
      (slide, slideIndex) => {

        const active =
          slideIndex === index;


        slide.classList.toggle(
          "is-active",
          active
        );


        slide.setAttribute(
          "aria-hidden",
          active ? "false" : "true"
        );

      }
    );


    dots.forEach(
      (dot, dotIndex) => {

        const active =
          dotIndex === index;


        dot.classList.toggle(
          "is-active",
          active
        );


        dot.setAttribute(
          "aria-current",
          active ? "true" : "false"
        );

      }
    );


    currentIndex = index;


    if (interaction) {

      trackBoth(
        "hero_carousel_interaction",
        {
          slide_number:
            currentIndex + 1,

          page_location:
            window.location.href
        }
      );

    }

  };


  showSlide(currentIndex);


  dots.forEach(
    (dot, index) => {

      dot.addEventListener(
        "click",
        () => {

          showSlide(
            index,
            true
          );

        }
      );

    }
  );


  arrows.forEach((arrow) => {

    arrow.addEventListener(
      "click",
      () => {

        /*
         Supports explicit data-direction if present.

         Otherwise:
         first arrow = previous
         second arrow = next
        */

        const direction =
          (
            arrow.dataset.direction ||
            ""
          ).toLowerCase();


        let movement;


        if (
          direction === "prev" ||
          direction === "previous"
        ) {

          movement = -1;

        } else if (
          direction === "next"
        ) {

          movement = 1;

        } else {

          movement =
            arrows.indexOf(arrow) === 0
              ? -1
              : 1;

        }


        showSlide(
          currentIndex + movement,
          true
        );

      }
    );

  });


  /*
   Keyboard navigation when focus is inside
   the carousel.
  */

  carousel.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "ArrowLeft") {

        showSlide(
          currentIndex - 1,
          true
        );

      }


      if (event.key === "ArrowRight") {

        showSlide(
          currentIndex + 1,
          true
        );

      }

    }
  );

}


/* ==========================================================
   ANALYTICS
========================================================== */

function initAnalytics() {

  initRootzListTracking();

  initProductTracking();

  initStickyCTATracking();

  initTeaTracking();

  initHerbalLibraryTracking();

}


/* ==========================================================
   ROOTZ LIST / EMAIL SIGNUP
========================================================== */

function initRootzListTracking() {

  const links =
    document.querySelectorAll(
      'a[href*="eepurl.com"]'
    );


  links.forEach((link) => {

    link.addEventListener(
      "click",
      () => {

        trackBoth(
          "rootz_list_click",
          {
            event_category:
              "signup",

            event_label:
              cleanText(link),

            page_location:
              window.location.href
          }
        );

      },

      {
        once: true
      }

    );

  });

}


/* ==========================================================
   PRODUCT / PRE-ORDER TRACKING

   IMPORTANT:
   The previous version treated words such as
   "founder" and "secure" as purchase intent.

   That could contaminate conversion reporting.

   This version primarily identifies actual shop/product
   destinations and explicit purchase language.
========================================================== */

function initProductTracking() {

  const elements =
    document.querySelectorAll(
      "a[href], button"
    );


  elements.forEach((element) => {

    if (
      element.closest(
        ".mobile-sticky-cta"
      )
    ) {

      /*
       Sticky CTA has its own dedicated event.
      */

      return;

    }


    const href =
      (
        element.getAttribute("href") ||
        ""
      ).toLowerCase();


    const text =
      cleanText(element).toLowerCase();


    const isShopLink =
      href.includes(
        "shop.rastarootslife.com"
      ) ||
      href.includes(
        "5w4dw4-1e.myshopify.com"
      );


    const isDiscoveryProduct =
      href.includes(
        RASTAROOTS.discoveryProductPath
          .toLowerCase()
      );


    const explicitPurchaseText =

      text.includes("pre-order") ||

      text.includes("preorder") ||

      text.includes("buy now") ||

      text.includes("shop now") ||

      text.includes("order now") ||

      text.includes("reserve yours") ||

      text.includes("get yours");


    if (
      !isShopLink &&
      !isDiscoveryProduct &&
      !explicitPurchaseText
    ) {

      return;

    }


    element.addEventListener(
      "click",
      () => {

        trackBoth(
          "product_cta_click",
          {
            event_category:
              "ecommerce",

            event_label:
              cleanText(element),

            product_name:
              isDiscoveryProduct
                ? "RastaRoots Discovery Collection"
                : "RastaRoots Product",

            destination:
              element.href || href,

            cta_location:
              getCTALocation(element),

            page_location:
              window.location.href
          }
        );


        /*
         Preserve the historic event name so existing
         GA reports don't suddenly lose continuity.
        */

        trackBoth(
          "preorder_click",
          {
            event_category:
              "ecommerce",

            event_label:
              cleanText(element),

            product_name:
              isDiscoveryProduct
                ? "RastaRoots Discovery Collection"
                : "RastaRoots Product",

            cta_location:
              getCTALocation(element),

            page_location:
              window.location.href
          }
        );

      },

      {
        once: true
      }

    );

  });

}


/* ==========================================================
   MOBILE STICKY CTA

   Separate event so we can finally see how much
   revenue intent is coming from the persistent
   mobile conversion button.
========================================================== */

function initStickyCTATracking() {

  const links =
    document.querySelectorAll(
      ".mobile-sticky-cta a"
    );


  links.forEach((link) => {

    link.addEventListener(
      "click",
      () => {

        trackBoth(
          "mobile_sticky_cta_click",
          {
            event_category:
              "ecommerce",

            event_label:
              cleanText(link),

            product_name:
              "RastaRoots Discovery Collection",

            destination:
              link.href,

            page_location:
              window.location.href
          }
        );


        /*
         Keep preorder reporting continuity.
        */

        trackBoth(
          "preorder_click",
          {
            event_category:
              "ecommerce",

            event_label:
              cleanText(link),

            product_name:
              "RastaRoots Discovery Collection",

            cta_location:
              "mobile_sticky_cta",

            page_location:
              window.location.href
          }
        );

      },

      {
        once: true
      }

    );

  });

}


/* ==========================================================
   TEA / RITUAL INTEREST TRACKING

   This lets us see which blends people are actually
   interested in before they reach Shopify.
========================================================== */

function initTeaTracking() {

  const links =
    document.querySelectorAll(
      [
        ".tea-card a",
        ".ritual-link",
        ".ritual-jump-grid a",
        ".ritual-story-actions a"
      ].join(",")
    );


  links.forEach((link) => {

    link.addEventListener(
      "click",
      () => {

        trackBoth(
          "tea_interest_click",
          {
            event_label:
              cleanText(link),

            destination:
              link.href || "",

            page_location:
              window.location.href
          }
        );

      },

      {
        once: true
      }

    );

  });

}


/* ==========================================================
   HERBAL LIBRARY TRACKING
========================================================== */

function initHerbalLibraryTracking() {

  const links =
    document.querySelectorAll(
      [
        ".library-herbs a",
        'a[href*="herbal-library"]'
      ].join(",")
    );


  links.forEach((link) => {

    link.addEventListener(
      "click",
      () => {

        trackBoth(
          "herbal_library_click",
          {
            event_label:
              cleanText(link),

            destination:
              link.href || "",

            page_location:
              window.location.href
          }
        );

      },

      {
        once: true
      }

    );

  });

}


/* ==========================================================
   CTA LOCATION

   Gives GA useful context instead of grouping every
   purchase button together.
========================================================== */

function getCTALocation(element) {

  if (
    element.closest(
      ".home-hero-carousel, .hero, .ritual-hero"
    )
  ) {

    return "hero";

  }


  if (
    element.closest(
      ".discovery-home"
    )
  ) {

    return "discovery_section";

  }


  if (
    element.closest(
      ".final-home-conversion"
    )
  ) {

    return "final_conversion";

  }


  if (
    element.closest(
      ".site-header, .main-nav, .mobile-nav"
    )
  ) {

    return "navigation";

  }


  if (
    element.closest(
      ".tea-card"
    )
  ) {

    return "tea_card";

  }


  if (
    element.closest(
      ".ritual-story"
    )
  ) {

    return "ritual_story";

  }


  if (
    element.closest(
      ".site-footer"
    )
  ) {

    return "footer";

  }


  return "page_content";

}


/* ==========================================================
   TEXT CLEANER
========================================================== */

function cleanText(element) {

  if (!element) return "";


  const text =
    (
      element.getAttribute(
        "aria-label"
      ) ||

      element.textContent ||

      ""
    )
      .replace(/\s+/g, " ")
      .trim();


  return text.slice(0, 120);

}


/* ==========================================================
   EXTERNAL LINK SECURITY

   If an external link opens in a new tab,
   make sure the opener relationship is removed.
========================================================== */

function initExternalLinkSecurity() {

  const links =
    document.querySelectorAll(
      'a[target="_blank"]'
    );


  links.forEach((link) => {

    const existingRel =
      (
        link.getAttribute("rel") ||
        ""
      )
        .split(/\s+/)
        .filter(Boolean);


    const rel =
      new Set(existingRel);


    rel.add("noopener");

    rel.add("noreferrer");


    link.setAttribute(
      "rel",
      Array.from(rel).join(" ")
    );

  });

}
