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
