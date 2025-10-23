document.addEventListener("DOMContentLoaded", () => {
  const stateEl = document.getElementById("state");
  const tbodyPeminjaman = document.getElementById("tbody-pengembalian");

  const ITEMS_PER_PAGE = 8;
  let currentPage = 1;
  let allItems = [];

  async function loadData() {
    const name = localStorage.getItem("name") || "";
    const warehouse = localStorage.getItem("warehouse") || "";

    const paramsObj = {
      warehouse_code: warehouse,
      state: "borrowed",
      name: name,
    };

    const params = new URLSearchParams(paramsObj);
    const apiUrl = `${base_url}/api/borrowing/list?${params.toString()}`;

    try {
      const res = await fetch(apiUrl, {
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      allItems = data?.data?.items ?? [];

      if (allItems.length === 0) {
        tbodyPeminjaman.innerHTML = `<tr><td colspan="13" class="text-center">Tidak ada data</td></tr>`;
        return;
      }

      renderTable();
    } catch (error) {
      console.error("Error loading data:", error);
      tbodyPeminjaman.innerHTML = `<tr><td colspan="13" class="text-center text-danger">Gagal memuat data</td></tr>`;
    }
  }

  function renderTable() {
    tbodyPeminjaman.innerHTML = "";

    const totalData = allItems.length;
    const totalPages = Math.ceil(totalData / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalData);
    const pageItems = allItems.slice(startIndex, endIndex);

    pageItems.forEach((item, idx) => {
        const id = item.id || item._id || "";
      const tr = document.createElement("tr");
      tr.classList.add("clickable-row");
      if (id) tr.dataset.id = id;
      tr.innerHTML = `
        <td class="text-center">${startIndex + idx + 1}</td>
        <td>${escapeHtml(item.borrowing_number || "-")}</td>
        <td>${escapeHtml(item.borrowing_barcode || "-")}</td>
        <td>${escapeHtml(item.borrower_name || "-")}</td>
        <td>${escapeHtml(item.borrower_phone || "-")}</td>
        <td>${escapeHtml(item.warehouse || "-")}</td>
        <td>${escapeHtml(item.borrow_date || "-")}</td>
        <td>${escapeHtml(item.due_date || "-")}</td>
        <td class="text-center">${escapeHtml(item.total_items ?? "-")}</td>
      `;
      tbodyPeminjaman.appendChild(tr);
    });

    tbodyPeminjaman.querySelectorAll(".clickable-row").forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.dataset.id;
        window.location.href = `./pengembalian/index.html?borrowing_id=${encodeURIComponent(
          id
        )}`;
      });
    });
  }

  const pengembalianModal = document.getElementById("inputPengembalian");
  if (pengembalianModal) {
    pengembalianModal.addEventListener("shown.bs.modal", () => {
      loadData();
    });
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
