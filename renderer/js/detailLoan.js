document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("stok-opname-tbody");

  const params = new URLSearchParams(window.location.search);
  const borrowingId = params.get("borrowing_id");

  const url = `${base_url}/api/borrowing/detail?borrowing_id=${borrowingId}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    tbody.innerHTML = "";

    if (!Array.isArray(data.data.items) || data.data.items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center">Tidak ada data</td></tr>`;
      return;
    }

    

    data.data.items.forEach((item, idx) => {
      const barcode = item.barcode || "-";
      const id = item.id || item._id || "";

      const tr = document.createElement("tr");
      if (id) tr.dataset.id = id;

      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(barcode)}</td>
        <td>${escapeHtml(item.product_name || "-")}</td>
        <td>${escapeHtml(item.borrow_condition || "-")}</td>
        <td>${escapeHtml(item.borrow_notes || "-")}</td>
        <td>${escapeHtml(item.return_status || "-")}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="12" class="text-center text-danger">Gagal memuat data</td></tr>`;
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
