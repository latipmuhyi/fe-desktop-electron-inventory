fetch("../views/menu.html")
  .then((r) => r.text())
  .then((html) => {
    document.getElementById("sidebar-container").innerHTML = html;

    setActiveMenu();
    bindMenuNavigation();
  })
  .catch((err) => console.error("Gagal memuat sidebar:", err));

function setActiveMenu() {
  const curPage =
    location.pathname.split("/").pop().replace(".html", "") || "dashboard";

  document.querySelectorAll(".nav-link").forEach((a) => {
    a.classList.remove("active");
  });

  const activeLink = document.querySelector(
    `.nav-link[data-page="${curPage}"]`
  );
  if (activeLink) activeLink.classList.add("active");
}

function bindMenuNavigation() {
  document.querySelectorAll(".nav-link[data-page]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const page = a.dataset.page;
      if (!page) return;

      window.location.href = `${page}.html`;
    });
  });
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }
}
