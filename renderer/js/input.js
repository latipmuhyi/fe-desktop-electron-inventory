document.addEventListener("DOMContentLoaded", async () => {
  // const tbodyLeft = document.getElementById("tbody-left");
  const tbodyRight = document.getElementById("tbody-right");
  const headWarehouse = document.getElementById("head-warehouse");
  const headDate = document.getElementById("head-date");
  const headWarehouseName = document.getElementById("head-warehouse-name");
  const headVendor = document.getElementById("head-vendor");
  const count = document.getElementById("count");
  const barcodeInput = document.getElementById("scanBarcode");

  const warehouse = localStorage.getItem("warehouse");

  const openLostBtn = document.getElementById("open-lost");
  const hideLostBtn = document.getElementById("hide-lost");
  const lostSection = document.getElementById("lost");
  const scanBarcodeLost = document.getElementById("scanBarcodeLost");

  openLostBtn.addEventListener("click", (e) => {
    e.preventDefault();
    lostSection.classList.remove("d-none");
    openLostBtn.classList.add("d-none");
    scanBarcodeLost.focus();
  });

  hideLostBtn.addEventListener("click", (e) => {
    e.preventDefault();
    lostSection.classList.add("d-none");
    openLostBtn.classList.remove("d-none");
  });

  const params = new URLSearchParams(window.location.search);
  const opnameId = params.get("opname_id");

  if (!opnameId) {
    console.error("Parameter receipt_id tidak ditemukan!");
    return;
  }

  async function renderTable() {
    const url = `${base_url}/api/receipt/product_detail`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      // tbodyLeft.innerHTML = "";
      tbodyRight.innerHTML = "";

      if (!Array.isArray(data.data) || data.data.length === 0) {
        // tbodyLeft.innerHTML = `<tr><td colspan="4" class="text-center">Tidak ada data</td></tr>`;
        tbodyRight.innerHTML = `<tr><td colspan="6" class="text-center">Tidak ada data</td></tr>`;
        return;
      }

      const item = data.data[0];

      headWarehouse.textContent = item.receipt_id || "-";
      const now = new Date();
      const formattedDate = now.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      headDate.textContent = formattedDate;
      headWarehouseName.textContent = item.warehouse_name || "-";
      headVendor.textContent = item.vendor_name || "-";
      count.textContent = data.count || "-";

      data.data.forEach((item, idx) => {
        const barcode = item.barcode || "-";
        const name = item.name || item.product_name || "-";
        const status = item.status_product || "-";
        const condition = item.condition || "-";
        const info = item.info || "-";

        const trRight = document.createElement("tr");
        trRight.innerHTML = `
          <td>${idx + 1}</td>
          <td>${escapeHtml(barcode)}</td>
          <td>${escapeHtml(name)}</td>
          <td>${escapeHtml(status)}</td>
          <td>${escapeHtml(condition)}</td>
          <td>${escapeHtml(info)}</td>
        `;
        tbodyRight.appendChild(trRight);
      });
    } catch (err) {
      console.error("Gagal memuat detail:", err);
      // tbodyLeft.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Gagal memuat data</td></tr>`;
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

    const apiUrl = `${base_url}/api/opname/scan`;
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
