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
});

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
