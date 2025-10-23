document.addEventListener("DOMContentLoaded", async () => {
  const tbodyLeft = document.getElementById("tbody-left");
  const tbodyRight = document.getElementById("tbody-right");
  const tbodyMoving = document.getElementById("tbody-moving");
  const headWarehouse = document.getElementById("head-warehouse");
  const headDate = document.getElementById("head-date");
  const headWarehouseName = document.getElementById("head-warehouse-name");
  const headVendor = document.getElementById("head-vendor");
  const count = document.getElementById("count");
  const barcodeInput = document.getElementById("scanBarcode");

  const params = new URLSearchParams(window.location.search);
  const internalId = params.get("internal_id");

  if (!internalId) {
    console.error("Parameter internal_id tidak ditemukan!");
    return;
  }

  async function renderTable() {
    let url = `${base_url}/api/internal-transfer/detail?transfer_id=${internalId}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      tbodyLeft.innerHTML = "";
      tbodyRight.innerHTML = "";

      if (!Array.isArray(data.data) || data.data.length === 0) {
        tbodyLeft.innerHTML = `<tr><td colspan="4" class="text-center">Tidak ada data</td></tr>`;
        tbodyRight.innerHTML = `<tr><td colspan="6" class="text-center">Tidak ada data</td></tr>`;
        return;
      }

      const item = data.data[0];
      const pickingCode = localStorage.getItem("picking-code");
      const now = new Date();
      const formattedDate = now.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      headDate.textContent = formattedDate;
      count.textContent = data.count || "-";

      headWarehouse.textContent = item.transfer_id || "-";
      headWarehouseName.textContent =
        "Form : " + item.from_warehouse_name || "-";
      headVendor.textContent = "To : " + item.to_warehouse_name || "-";
      data.data.forEach((item, idx) => {
        const barcode = item.barcode || "-";
        const name = item.name || item.product_name || "-";
        const codeProduct = item.name || item.code_product || "-";
        const fromWarehouseName = item.from_warehouse_name || "-";
        const toWarehouseName = item.to_warehouse_name || "-";
        const status = item.status_product || "-";
        if (status === "available") {
          const trLeft = document.createElement("tr");
          trLeft.innerHTML = `
              <td>${idx + 1}</td>
              <td>${escapeHtml(barcode)}</td>
              <td>${escapeHtml(name)}</td>
              <td>${escapeHtml(status)}</td>
            `;
          tbodyLeft.appendChild(trLeft);
        } else if (status === "scaned") {
          const trRight = document.createElement("tr");
          trRight.innerHTML = `
              <td>${idx + 1}</td>
              <td>${escapeHtml(barcode)}</td>
              <td>${escapeHtml(name)}</td>
              <td>${escapeHtml(codeProduct)}</td>
              <td>${escapeHtml(status)}</td>
              <td>${escapeHtml(fromWarehouseName)}</td>
              <td>${escapeHtml(toWarehouseName)}</td>
            `;
          tbodyRight.appendChild(trRight);
        } else if (status === "moving") {
          const trRight = document.createElement("tr");
          trRight.innerHTML = `
              <td>${idx + 1}</td>
              <td>${escapeHtml(barcode)}</td>
              <td>${escapeHtml(name)}</td>
              <td>${escapeHtml(codeProduct)}</td>
              <td>${escapeHtml(status)}</td>
              <td>${escapeHtml(fromWarehouseName)}</td>
              <td>${escapeHtml(toWarehouseName)}</td>
            `;
          tbodyMoving.appendChild(trRight);
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

    const apiUrl = `${base_url}/api/barcode/update_status`;
    const payload = {
      barcodes: [barcode],
    };

    try {
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
    const apiUrl = `${base_url}/api/barcode/update_stock`;
    const receiptId = headWarehouse.textContent.trim();
    if (!receiptId || receiptId === "-" || receiptId === "Memuat data...") {
      alert("❌ Data warehouse belum tersedia!");
      return;
    }
    const payload = {
      receipt: receiptId,
    };
    console.log("pay = ", payload);

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
