document.addEventListener("DOMContentLoaded", () => {
    const headDate = document.getElementById("head-date");
    const now = new Date();
    const formattedDate = now.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    headDate.textContent = formattedDate;
});
