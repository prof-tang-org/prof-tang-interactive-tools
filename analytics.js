(function () {
  function cleanText(node) {
    return node ? node.textContent.replace(/\s+/g, " ").trim() : "";
  }

  function slug(value) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  function track(path, title) {
    if (!window.goatcounter || typeof window.goatcounter.count !== "function") return;

    window.goatcounter.count({
      path: path,
      title: title,
      event: true
    });
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.closest) return;

    var simCard = target.closest("a.sim-card");
    if (simCard) {
      var simTitle = cleanText(simCard.querySelector("h3"));
      track("homepage-simulation-card-" + slug(simTitle || simCard.href), simTitle || "Simulation card click");
      return;
    }

    var courseTab = target.closest(".course-tabs .tab");
    if (courseTab) {
      var course = courseTab.getAttribute("data-tab") || cleanText(courseTab);
      track("homepage-course-tab-" + slug(course), cleanText(courseTab) || course);
      return;
    }

    var feedbackLink = target.closest("a.feedback-link");
    if (feedbackLink) {
      track("feedback-click", "Feedback click");
      return;
    }

    var howLink = target.closest('a[href="#how"]');
    if (howLink) {
      track("how-to-use-click", "How to use click");
    }
  });
})();
