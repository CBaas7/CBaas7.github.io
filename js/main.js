const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  let revealObserver;

  revealObserver = new IntersectionObserver(
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

const nav = document.querySelector(".glass-nav");

if (nav) {
  window.addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 20);
  });
}

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
