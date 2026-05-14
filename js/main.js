// Scroll-animatie: elk element met .reveal wordt eenmalig zichtbaar gemaakt met .is-visible.
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// Navbar krijgt extra achtergrond na scrollen; CSS gebruikt .glass-nav.is-scrolled.
const nav = document.querySelector(".glass-nav");

if (nav) {
  window.addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 20);
  });
}

// Skills-tabs: data-tools-tab op de knop moet overeenkomen met data-tools-panel op de items.
const toolTabs = document.querySelectorAll("[data-tools-tab]");
const toolItems = document.querySelectorAll("[data-tools-panel]");

toolTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const activePanel = tab.dataset.toolsTab;

    toolTabs.forEach((item) => {
      item.classList.toggle("is-active", item === tab);
      item.setAttribute("aria-pressed", item === tab ? "true" : "false");
    });

    toolItems.forEach((item) => {
      item.classList.toggle("is-hidden", item.dataset.toolsPanel !== activePanel);
    });
  });
});

// Projectcategorieen: filtert de projectrijen zonder de viewport te verplaatsen.
const projectTabs = document.querySelectorAll("[data-project-filter]");
const projectRows = document.querySelectorAll("[data-project-category]");
const projectEmpty = document.querySelector(".project-empty");

projectTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const activeCategory = tab.dataset.projectFilter;
    let visibleCount = 0;

    // Active state en aria-pressed blijven gelijk, zodat de gekozen tab ook voor screenreaders duidelijk is.
    projectTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    // 'all' toont alles; andere filters tonen alleen rijen met dezelfde data-project-category.
    projectRows.forEach((row) => {
      const shouldShow = activeCategory === "all" || row.dataset.projectCategory === activeCategory;
      row.classList.toggle("is-hidden", !shouldShow);

      if (shouldShow) {
        visibleCount += 1;
        row.classList.add("is-visible");
      }
    });

    // Categorieen zonder voorbeelden krijgen een korte melding in plaats van een lege lijst.
    if (projectEmpty) {
      projectEmpty.classList.toggle("is-visible", visibleCount === 0);
    }

    // Geen automatische scroll: de gebruiker blijft op dezelfde plek op de pagina.
  });
});

// Mobiele categorie-slider: beweegt rustig heen en weer zodat duidelijk is dat er meer categorieen zijn.
const toolTabsSlider = document.querySelector(".tool-tabs");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (toolTabsSlider && !reduceMotion.matches) {
  let direction = 1;
  let isPaused = false;
  let autoScrollTimer;

  const pauseAutoScroll = () => {
    isPaused = true;
    window.clearInterval(autoScrollTimer);
  };

  const hasTabsOverflow = () => toolTabsSlider.scrollWidth > toolTabsSlider.clientWidth + 2;

  const autoScrollTabs = () => {
    if (!isPaused && hasTabsOverflow()) {
      const maxScroll = toolTabsSlider.scrollWidth - toolTabsSlider.clientWidth;
      const nextScroll = toolTabsSlider.scrollLeft + direction * 0.7;

      if (nextScroll >= maxScroll) {
        toolTabsSlider.scrollLeft = maxScroll;
        direction = -1;
      } else if (nextScroll <= 0) {
        toolTabsSlider.scrollLeft = 0;
        direction = 1;
      } else {
        toolTabsSlider.scrollLeft = nextScroll;
      }
    }
  };

  // Zodra de bezoeker zelf swipet, scrollt of focust, stopt de automatische beweging.
  toolTabsSlider.addEventListener("pointerdown", pauseAutoScroll, { passive: true });
  toolTabsSlider.addEventListener("wheel", pauseAutoScroll, { passive: true });
  toolTabsSlider.addEventListener("focusin", pauseAutoScroll);

  // Wacht kort tot fonts en layout klaar zijn; daarna start de rustige beweging.
  window.setTimeout(() => {
    if (hasTabsOverflow()) {
      autoScrollTimer = window.setInterval(autoScrollTabs, 20);
    }
  }, 600);
}
