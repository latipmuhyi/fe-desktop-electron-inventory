document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("tbody");
  async function renderTable() {
    let url = `${base_url}/api/return-products`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log(data.data);
      

      tbody.innerHTML = "";
      if (!Array.isArray(data.data) || data.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">Tidak ada data</td></tr>`;
        return;
      }

      data.data.forEach((item, idx) => {
        const id = item.id || "-";
        const customer = item.customer || "-";
        const deliveryOrder = item.delivery_order || "-";
        const responsible = item.responsible || "-";
        const returnDate = item.return_date || "-";
        const returnToWarehouse = item.return_to_warehouse || "-";
        const returnedCount = item.returned_count || "-";
        const status = item.status || "-";
        const returnNumber = item.return_number || "-";
        const totalItems = item.total_items || "-";

        const tr = document.createElement("tr");
        tr.classList.add("clickable-row");
        tr.dataset.returnNumber = returnNumber;
        tr.dataset.deliveryOrder = deliveryOrder;
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${escapeHtml(returnNumber)}</td>
            <td>${escapeHtml(deliveryOrder)}</td>
            <td>${escapeHtml(customer)}</td>
            <td>${escapeHtml(responsible)}</td>
            <td>${escapeHtml(returnDate)}</td>
            <td>${escapeHtml(returnToWarehouse)}</td>
            <td>${escapeHtml(returnedCount)}</td>
            <td>${escapeHtml(totalItems)}</td>
            <td>${escapeHtml(status)}</td>
          `;

        tbody.appendChild(tr);
        tbody.querySelectorAll(".clickable-row").forEach((row) => {
          row.addEventListener("click", () => {
            const params = {
              "return-number": row.dataset.returnNumber,
              "delivery-order": row.dataset.deliveryOrder,
            };

            const queryString = new URLSearchParams(params).toString();
            window.location.href = `./retur/detail.html?${queryString}`;
          });
        });

      });
    } catch (err) {
      console.error("Gagal memuat detail:", err);
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Gagal memuat data</td></tr>`;
    }
  }
  await renderTable();
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
