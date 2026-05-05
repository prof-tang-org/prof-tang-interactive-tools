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

  function pageSlug() {
    return slug(window.location.pathname || "home") || "home";
  }

  function pageEvent(name) {
    return name + "-from-" + pageSlug();
  }

  function track(path, title, attempts) {
    attempts = attempts || 0;

    if (window.goatcounter && typeof window.goatcounter.count === "function") {
      window.goatcounter.count({
        path: path,
        title: title,
        event: true
      });
      return;
    }

    if (attempts < 10) {
      window.setTimeout(function () {
        track(path, title, attempts + 1);
      }, 150);
    }
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
      track(pageEvent("feedback-click"), "Feedback click");
      return;
    }

    var howLink = target.closest('a[href="#how"]');
    if (howLink) {
      track("how-to-use-click", "How to use click");
      return;
    }

    var directFeedbackLink = target.closest("a#directLink");
    if (directFeedbackLink) {
      track("feedback-form-direct-link-click", "Feedback form direct link click");
    }
  });
})();
