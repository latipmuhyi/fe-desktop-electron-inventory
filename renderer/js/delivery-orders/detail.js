document.addEventListener("DOMContentLoaded", async () => {
  const tbodyLeft = document.getElementById("tbody-left");
  const tbodyRight = document.getElementById("tbody-right");
  const tbodyFooter = document.getElementById("tbody-footer");
  const headWarehouse = document.getElementById("head-warehouse");
  const headDate = document.getElementById("head-date");
  const headWarehouseName = document.getElementById("head-warehouse-name");
  const headVendor = document.getElementById("head-vendor");
  // const count = document.getElementById("count");
  const barcodeInput = document.getElementById("scanBarcode");

  const warehouse = localStorage.getItem("warehouse");
  const params = new URLSearchParams(window.location.search);
  const deliveryId = params.get("delivery_id");
  headWarehouse.textContent = deliveryId || "-";

  let barcodeList = [];

  async function renderTable() {
    let url = `${base_url}/api/stock-product-available?warehouse=${warehouse}`;
    let urlScanned = `${base_url}/api/delivery/detail?delivery_id=${deliveryId}`;

    try {
      const res = await fetch(url);
      const resScanned = await fetch(urlScanned);
      const data = await res.json();
      const dataScanned = await resScanned.json();

      tbodyLeft.innerHTML = "";
      tbodyRight.innerHTML = "";
      tbodyFooter.innerHTML = "";

      if (!Array.isArray(data.data) || data.data.length === 0) {
        tbodyLeft.innerHTML = `<tr><td colspan="4" class="text-center">Tidak ada data</td></tr>`;
        return;
      }
      if (!Array.isArray(dataScanned.data) || dataScanned.length === 0) {
        tbodyRight.innerHTML = `<tr><td colspan="6" class="text-center">Tidak ada data</td></tr>`;
        return;
      }

      const item = data.data[0];
      const now = new Date();
      const formattedDate = now.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      headDate.textContent = formattedDate;
      // count.textContent = data.count || "-";

      headWarehouseName.textContent = "Form : " + item.warehouse_name || "-";
      headVendor.textContent = "To : " + item.to_warehouse_name || "-";
      data.data.forEach((item, idx) => {
        const barcode = item.barcode || "-";
        const name = item.name || item.product_name || "-";
        const codeProduct = item.name || item.code_product || "-";
        const fromWarehouseName = item.warehouse_name || "-";
        const status = item.status_product || "-";
        const trLeft = document.createElement("tr");
        trLeft.innerHTML = `
              <td>${idx + 1}</td>
              <td>${escapeHtml(barcode)}</td>
              <td>${escapeHtml(name)}</td>
              <td>${escapeHtml(status)}</td>
            `;
        tbodyLeft.appendChild(trLeft);
      });

      dataScanned.data.forEach((item, idx) => {
        const barcode = item.product_barcode || "-";
        const name = item.name || item.product_name || "-";
        const codeProduct = item.name || item.product_code || "-";
        const fromWarehouseName = item.warehouse || "-";
        const status = item.status_product || "-";
        const trRight = document.createElement("tr");
        if (status === "scanned") {
          barcodeList.push(barcode);
          trRight.innerHTML = `
                <td>${idx + 1}</td>
                <td>${escapeHtml(barcode)}</td>
                <td>${escapeHtml(name)}</td>
                <td>${escapeHtml(codeProduct)}</td>
                <td>${escapeHtml(fromWarehouseName)}</td>
                <td>${escapeHtml(status)}</td>
              `;
          tbodyRight.appendChild(trRight);
        } else if (status === "sold") {
          trRight.innerHTML = `
                <td>${idx + 1}</td>
                <td>${escapeHtml(barcode)}</td>
                <td>${escapeHtml(name)}</td>
                <td>${escapeHtml(codeProduct)}</td>
                <td>${escapeHtml(fromWarehouseName)}</td>
                <td>${escapeHtml(status)}</td>
              `;
          tbodyFooter.appendChild(trRight);
        }
      });
    } catch (err) {
      console.error("Gagal memuat detail:", err);
      tbodyLeft.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Gagal memuat data</td></tr>`;
      tbodyRight.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Gagal memuat data</td></tr>`;
    }
  }

  await renderTable();
  //   =============================================== SCAN ===============================
  document
    .getElementById("addScanBtn")
    .addEventListener("click", tambahBarangScan);
  barcodeInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") tambahBarangScan();
  });

  async function tambahBarangScan() {
    const barcode = barcodeInput.value.trim();
    if (!barcode) return;

    const apiUrl = `${base_url}/api/delivery/scan-barcode`;
    const payload = {
      delivery_id: deliveryId,
      barcodes: [barcode],
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      await response.json();

      await renderTable();
    } catch (err) {
      console.error("❌ Gagal update barcode:", err);
    }

    barcodeInput.value = "";
    barcodeInput.focus();
  }

  // =========================================== VALIDATE ===============================
  document.getElementById("btn-validate").addEventListener("click", validate);

  async function validate() {
    const apiUrl = `${base_url}/api/delivery/update-stock`;
    const payload = {
      delivery_id: deliveryId,
      barcodes: barcodeList,
    };

    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const result = await response.json();
    console.log("✅ Validasi berhasil:", result);

    await renderTable();
  }
});

/**
 * Escape HTML
 */
function escapeHtml(str) {
  if (typeof str !== "string") return str ?? "";
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
