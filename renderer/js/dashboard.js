// dashboard.js
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("sidebarToggle")
    .addEventListener("click", function () {
      document.getElementById("sidebar").classList.toggle("show");
    });

  // Active menu navigation
  document.querySelectorAll(".sidebar .nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      if (this.id !== "logoutBtn") {
        e.preventDefault();
        document
          .querySelectorAll(".sidebar .nav-link")
          .forEach((l) => l.classList.remove("active"));
        this.classList.add("active");

        const page = this.getAttribute("data-page");
        console.log("Navigating to:", page);
      }
    });
  });
});
