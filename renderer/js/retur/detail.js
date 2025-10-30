document.addEventListener("DOMContentLoaded", async () => {
    const tbodyLeft = document.getElementById("tbody-left");
    const tbodyRight = document.getElementById("tbody-right");
    const headWarehouse = document.getElementById("head-warehouse");
    const headDate = document.getElementById("head-date");
    const headWarehouseName = document.getElementById("head-warehouse-name");
    const headVendor = document.getElementById("head-vendor");

  const params = new URLSearchParams(window.location.search);
  const returnNumber = params.get("return-number");
  const deliveryOrder = params.get("delivery-order");

  async function renderTable() {
    let url = `${base_url}/api/return/items?return=${returnNumber}`;
    let urlOrder = `${base_url}/api/delivery/detail?delivery_id=${deliveryOrder}`;
    try {
      const res = await fetch(url);
      const resOrder = await fetch(urlOrder);
      const data = await res.json();
      const dataOrder = await resOrder.json();
      

      tbodyLeft.innerHTML = "";
      tbodyRight.innerHTML = "";
      if (!Array.isArray(dataOrder.data) || dataOrder.data.length === 0) {
        tbodyLeft.innerHTML = `<tr><td colspan="4" class="text-center">Tidak ada data</td></tr>`;
        return;
      }
      if (!Array.isArray(data.items) || data.items.length === 0) {
        tbodyRight.innerHTML = `<tr><td colspan="4" class="text-center">Tidak ada data</td></tr>`;
        return;
      }

      dataOrder.data.forEach((item, idx) => {
        const id = item.id || "-";
        const barcode = item.product_barcode || "-";
        const productName = item.product_name || "-";
        const status = item.status_product || "-";
        const product_code = item.product_code || "-";

        const tr = document.createElement("tr");
        tr.classList.add("clickable-row");
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${escapeHtml(barcode)}</td>
            <td>${escapeHtml(product_code)}</td>
            <td>${escapeHtml(productName)}</td>
          `;

        tbodyLeft.appendChild(tr);
      });
      
      data.items.forEach((item, idx) => {
        const id = item.id || "-";
        const barcode_scanned = item.barcode_scanned || "-";
        const product_name = item.product_name || "-";
        const product_code = item.product_code || "-";
        const condition = item.condition || "-";
        const return_reason = item.return_reason || "-";
        const destination_location = item.destination_location || "-";
        const new_status = item.new_status || "-";
        const returnNumber = item.return_number || "-";
        const totalItems = item.total_items || "-";

        const tr = document.createElement("tr");
        tr.classList.add("clickable-row");
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${escapeHtml(barcode_scanned)}</td>
            <td>${escapeHtml(product_name)}</td>
            <td>${escapeHtml(product_code)}</td>
            <td>${escapeHtml(condition)}</td>
            <td>${escapeHtml(return_reason)}</td>
            <td>${escapeHtml(destination_location)}</td>
            <td>${escapeHtml(new_status)}</td>
          `;

        tbodyRight.appendChild(tr);
      });
    } catch (err) {
      console.error("Gagal memuat detail:", err);
      tbodyRight.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Gagal memuat data</td></tr>`;
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
