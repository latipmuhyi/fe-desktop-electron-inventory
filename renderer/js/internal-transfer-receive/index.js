document.addEventListener("DOMContentLoaded", async () => {
  const warehouse = localStorage.getItem("warehouse-code");
  const nameLocal = localStorage.getItem("name");
  const nameAccount = document.getElementById("name-account");
  const tbody = document.getElementById("warehouse-tbody");
  if (!tbody) {
    console.error("Elemen #warehouse-tbody tidak ditemukan!");
    return;
  }
  nameAccount.textContent = nameLocal || "-";

  let url = `${base_url}/api/internal-transfer?warehouse=${warehouse}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    tbody.innerHTML = "";

    if (!Array.isArray(data.data) || data.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center">Tidak ada data</td></tr>`;
      return;
    }

    data?.data.forEach((item, idx) => {
      const reference = item.reference || item.name || "-";
      const locationFrom = item.location_from || item.locationFrom || "-";
      const locationTo = item.location_to || item.locationTo || "-";
      const partner = item.partner || "-";
      const warehouse = item.warehouse || "-";
      const sourceDocument = item.source_document || item.sourceDocument || "-";
      const company = item.company || "-";
      const scheduledDate = item.scheduled_date || item.scheduledDate || "-";
      const status = item.status || "-";
      const id = item.id || item._id || "";

      const tr = document.createElement("tr");
      tr.classList.add("clickable-row");
      if (id) tr.dataset.id = id;
      tr.dataset.reference = reference;

      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(reference)}</td>
        <td>${escapeHtml(locationFrom)}</td>
        <td>${escapeHtml(locationTo)}</td>
        <td>${escapeHtml(partner)}</td>
        <td>${escapeHtml(warehouse)}</td>
        <td>${escapeHtml(sourceDocument)}</td>
        <td>${escapeHtml(company)}</td>
        <td>${escapeHtml(scheduledDate)}</td>
        <td>${escapeHtml(status)}</td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".clickable-row").forEach((row) => {
      row.addEventListener("click", () => {
        const reference = row.dataset.reference;
        window.location.href = `./detail.html?internal_id=${encodeURIComponent(
          reference
        )}`;
      });
    });
  } catch (err) {
    console.error("Error fetching warehouse:", err);
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">Gagal memuat data</td></tr>`;
  }
});

function escapeHtml(str) {
  if (typeof str !== "string") return str ?? "";
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
