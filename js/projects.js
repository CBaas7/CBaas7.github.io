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
