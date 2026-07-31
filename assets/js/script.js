document.addEventListener("DOMContentLoaded", function () {
  // Determine path prefix based on whether page is in root or pages/
  const isSubPage = window.location.pathname.includes("/pages/");
  const headerPath = isSubPage
    ? "components/header.html"
    : "pages/components/header.html";
  const footerPath = isSubPage
    ? "components/footer.html"
    : "pages/components/footer.html";

  // Load Header
  const headerArea = document.getElementById("xb-header-area");
  if (headerArea) {
    initStickyHeader();
    fetch(headerPath)
      .then((response) => {
        if (!response.ok) throw new Error("Header load failed");
        return response.text();
      })
      .then((data) => {
        headerArea.innerHTML = adjustPaths(data, isSubPage);
        highlightActiveNav();
        initMobileMenu();
      })
      .catch((error) => console.error("Error loading header:", error));
  }

  // Load Footer
  const footerArea = document.getElementById("xb-footer-area");
  if (footerArea) {
    fetch(footerPath)
      .then((response) => {
        if (!response.ok) throw new Error("Footer load failed");
        return response.text();
      })
      .then((data) => {
        footerArea.innerHTML = adjustPaths(data, isSubPage);
        initScrollToTop();
      })
      .catch((error) => console.error("Error loading footer:", error));
  }

  // Initialize redirect script for empty links and #
  initEmptyLinkRedirects();

  // Initialize Preloader
  initPreloader();

  // Initialize scroll-triggered animations
  initScrollAnimations();
});

// Preloader Dismissal Logic
function initPreloader() {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  const preloaderCount = document.getElementById("preloaderCount");
  const preloaderPhaseText = document.getElementById("preloaderPhaseText");

  // Phase texts to cycle through
  const phases = [
    "Nurturing Dignity...",
    "Fostering Connection...",
    "Empowering Independence...",
  ];

  let currentPhase = 0;

  // Dynamic phase text swapper
  const swapPhaseInterval = setInterval(() => {
    if (currentPhase < phases.length - 1) {
      preloaderPhaseText.classList.add("fade-out-text");
      setTimeout(() => {
        currentPhase++;
        preloaderPhaseText.innerText = phases[currentPhase];
        preloaderPhaseText.classList.remove("fade-out-text");
      }, 300);
    }
  }, 650);

  // Counter animation (from 0 to 100 over 2 seconds)
  let count = 0;
  const target = 100;
  const duration = 1800; // slightly shorter than 2s to guarantee reaching 100 before fadeout begins
  const stepTime = Math.floor(duration / target);

  const counterTimer = setInterval(() => {
    count++;
    if (preloaderCount) {
      preloaderCount.innerText = count;
    }
    if (count >= target) {
      clearInterval(counterTimer);
    }
  }, stepTime);

  // Wait 2 seconds (2000ms), then begin fade-out transition
  setTimeout(() => {
    clearInterval(swapPhaseInterval);
    clearInterval(counterTimer);
    if (preloaderCount) preloaderCount.innerText = "100";

    preloader.classList.add("fade-out");
    document.body.classList.remove("preloader-active");

    // Completely hide or remove element after the CSS opacity transition finishes (600ms)
    setTimeout(() => {
      preloader.style.display = "none";
    }, 600);
  }, 2000);
}

// Helper to adjust relative paths in loaded header/footer HTML depending on directory depth
function adjustPaths(html, isSubPage) {
  let adjusted = html;

  if (isSubPage) {
    // We are inside pages/ directory.
    // Convert asset references like assets/css/ to ../assets/css/
    adjusted = adjusted.replace(/src="assets\//g, 'src="../assets/');
    adjusted = adjusted.replace(/href="assets\//g, 'href="../assets/');
    // Convert home link index.html to ../index.html
    adjusted = adjusted.replace(/href="index\.html"/g, 'href="../index.html"');
    // Keep links to sub-pages simple (e.g. about.html, not pages/about.html)
    adjusted = adjusted.replace(/href="pages\/([^"]+)"/g, 'href="$1"');
  } else {
    // We are in the root directory.
    // Make sure links to sub-pages point to pages/...
    // (excluding index.html which is in root)
    const pages = [
      "about.html",
      "services.html",
      "team.html",
      "portfolio.html",
      "career.html",
      "blog.html",
      "contact.html",
      "login.html",
      "register.html",
    ];
    pages.forEach((page) => {
      const regex = new RegExp(`href="${page}"`, "g");
      adjusted = adjusted.replace(regex, `href="pages/${page}"`);
    });
  }

  return adjusted;
}

// Highlight the active page in navigation menu
function highlightActiveNav() {
  const currentPath = window.location.pathname;
  const pageName =
    currentPath.substring(currentPath.lastIndexOf("/") + 1) || "index.html";

  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const linkPage = href.substring(href.lastIndexOf("/") + 1);

    if (
      linkPage === pageName ||
      (pageName === "index.html" && linkPage === "")
    ) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("active");
    }
  });
}

// Initialize Mobile Menu toggles and auto-collapsing
function initMobileMenu() {
  const navLinks = document.querySelectorAll(
    ".navbar-nav .nav-link:not(.dropdown-toggle)",
  );
  const navbarCollapse = document.querySelector(".navbar-collapse");

  if (navbarCollapse) {
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth < 992) {
          const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
          if (bsCollapse) {
            bsCollapse.hide();
          }
        }
      });
    });
  }
}

// Scroll to Top behavior
function initScrollToTop() {
  const scrollBtn = document.getElementById("scrollToTopBtn");
  if (!scrollBtn) return;

  // Show button when page is scrolled down past 300px
  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      scrollBtn.style.display = "flex";
      // Trigger a minor fade-in feel
      setTimeout(() => {
        scrollBtn.style.opacity = "1";
      }, 10);
    } else {
      scrollBtn.style.opacity = "0";
      // Hide after transition
      setTimeout(() => {
        if (window.scrollY <= 300) {
          scrollBtn.style.display = "none";
        }
      }, 300);
    }
  });

  // Scroll smoothly to top when clicked
  scrollBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// Toggle scrolled class on header for styling when sticky
function initStickyHeader() {
  const headerArea = document.getElementById("xb-header-area");
  if (!headerArea) return;

  function checkScroll() {
    if (window.scrollY > 50) {
      headerArea.classList.add("scrolled");
    } else {
      headerArea.classList.remove("scrolled");
    }
  }

  // Initial check
  checkScroll();
  window.addEventListener("scroll", checkScroll);
}

// Intercept all empty or hash links and redirect them to the 404 page
function initEmptyLinkRedirects() {
  document.addEventListener("click", function (event) {
    if (event.defaultPrevented) return;

    // Find closest anchor tag
    const link = event.target.closest("a");
    if (link) {
      const href = link.getAttribute("href");

      // Check if href is an empty link or '#'
      const isEmptyHash = href === "#";
      const isEmptyString = href === "";
      const isJsVoid =
        href &&
        href.toLowerCase().startsWith("javascript:") &&
        (href.includes("void(0)") ||
          href.includes("void(0);") ||
          href.trim() === "javascript:;");

      // If it's a bootstrap interactive toggle (like tab or collapse), do not redirect
      const hasBsToggle = link.hasAttribute("data-bs-toggle");

      if ((isEmptyHash || isEmptyString || isJsVoid) && !hasBsToggle) {
        event.preventDefault();

        // Determine correct path relative to current page location
        const isSubPage = window.location.pathname.includes("/pages/");
        const redirectPath = isSubPage ? "../404.html" : "404.html";

        window.location.href = redirectPath;
      }
    }
  });
}

// Intersection Observer for scroll reveal animations
function initScrollAnimations() {
  // Inject reveal classes dynamically across all pages/sections
  injectScrollAnimationClasses();

  const animatedElements = document.querySelectorAll(
    ".reveal-fade-in, .reveal-fade-up, .reveal-fade-down, .reveal-fade-left, .reveal-fade-right, .reveal-zoom-in, .reveal-zoom-out",
  );

  if (animatedElements.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -8% 0px", // Trigger when 8% inside the viewport
    threshold: 0.05,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // Animates only once
      }
    });
  }, observerOptions);

  animatedElements.forEach((el) => {
    observer.observe(el);
  });
}

// Programmatically apply reveal classes and staggered delays to sections, headings, cards, and images
function injectScrollAnimationClasses() {
  // 1. Identify all main content sections and add reveal-fade-in
  const sections = document.querySelectorAll(
    "main > section, .error-page-container",
  );
  sections.forEach((sec) => {
    if (
      sec.classList.contains("hero") ||
      sec.classList.contains("page-banner") ||
      sec.id === "preloader"
    )
      return;
    sec.classList.add("reveal-fade-in");
  });

  // 2. Animate Section Headers (tag, title, desc)
  const sectionHeaders = document.querySelectorAll(
    ".section-tag, .section-title, .section-desc, .section-heading, .section-subtitle, .error-number, .error-title, .error-description",
  );
  sectionHeaders.forEach((hdr) => {
    hdr.classList.add("reveal-fade-up");
  });

  // 3. Animate grid rows or lists of cards with staggering delays
  const rows = document.querySelectorAll(
    "main .row, main .quick-bar-box, .auth-wrapper, .error-links-grid",
  );
  rows.forEach((row) => {
    const cards = row.querySelectorAll(
      ".col-md-4, .col-lg-4, .col-xl-3, .col-md-6, .col-lg-3, " +
        ".quick-bar-card, .service-card, .value-card, .process-step-card, .caregiver-card, " +
        ".testimonial-card, .news-card, .founder-card, .standards-card, " +
        ".board-card, .culture-card, .benefit-card, .job-card, .location-card, " +
        ".case-study-card, .scrapbook-item, .team-member-card, .blog-card, " +
        ".auth-card, .auth-image-side, .auth-form-container, .gallery-item-card, .portfolio-item, " +
        ".error-card, .error-link-card",
    );

    cards.forEach((card, idx) => {
      // Don't double animate if parent/ancestor already has a reveal class
      let ancestor = card.parentElement;
      let hasAnimatedAncestor = false;
      while (ancestor && ancestor !== row) {
        if (
          ancestor.classList.contains("reveal-fade-up") ||
          ancestor.classList.contains("reveal-fade-in") ||
          ancestor.classList.contains("reveal-zoom-in")
        ) {
          hasAnimatedAncestor = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      if (hasAnimatedAncestor) return;

      card.classList.add("reveal-fade-up");

      // Add stagger delay (up to 4 items in a row)
      const delayStep = (idx % 4) * 100;
      if (delayStep > 0) {
        card.classList.add(`delay-${delayStep}`);
      }
    });
  });

  // 4. Animate standalone images with zoom-in
  const images = document.querySelectorAll(
    "main img:not(.preloader-logo):not(.header-logo):not(.footer-logo), .auth-image-side img, .error-page-container img",
  );
  images.forEach((img) => {
    if (
      img.closest(
        ".quick-bar-card, .service-card, .value-card, .process-step-card, .caregiver-card, .testimonial-card, .news-card, .founder-card, .standards-card, .board-card, .culture-card, .benefit-card, .job-card, .location-card, .case-study-card, .scrapbook-item, .team-member-card, .blog-card, .auth-card, .gallery-item-card, .portfolio-item, .error-card",
      )
    ) {
      return; // Animating the card itself is enough
    }
    img.classList.add("reveal-zoom-in");
  });
}
