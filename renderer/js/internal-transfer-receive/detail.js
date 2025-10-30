document.addEventListener("DOMContentLoaded", async () => {
  const warehouse = localStorage.getItem("warehouse");
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
  let barcodeList = [];

  if (!internalId) {
    console.error("Parameter internal_id tidak ditemukan!");
    return;
  }


  async function renderTable() {
    let url = `${base_url}/api/stock-product-available?warehouse=${warehouse}`;
    let urlScanned = `${base_url}/api/internal-transfer-receive/detail?transfer_id=${internalId}`;

    try {
      const res = await fetch(url);
      const resScanned = await fetch(urlScanned);
      const data = await res.json();
      const dataScanned = await resScanned.json();

      tbodyLeft.innerHTML = "";
      tbodyRight.innerHTML = "";

      if (!Array.isArray(data.data) || data.data.length === 0) {
        tbodyLeft.innerHTML = `<tr><td colspan="4" class="text-center">Tidak ada data</td></tr>`;
        return;
      }

      if (!Array.isArray(dataScanned.data) || dataScanned.data.length === 0) {
        tbodyRight.innerHTML = `<tr><td colspan="4" class="text-center">Tidak ada data</td></tr>`;
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
        } 
      });
      dataScanned.data.forEach((item, idx) => {
        const barcode = item.barcode || "-";
        transferId = item.transfer_id || "-";
        const name = item.name || item.product_name || "-";
        const codeProduct = item.name || item.code_product || "-";
        const fromWarehouseName = item.from_warehouse_name || "-";
        const toWarehouseName = item.to_warehouse_name || "-";
        const status = item.status_product || "-";
        if (status === "scanned") {
          const trRight = document.createElement("tr");
          barcodeList.push(barcode);
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
    if (e.key === "Enter") {
      e.preventDefault();
      tambahBarangScan();
    };
  });

  async function tambahBarangScan() {
    const barcode = barcodeInput.value.trim();
    const paramsObj = { barcode: barcode, transfer_id: internalId };
    const params = new URLSearchParams(paramsObj);
    if (!barcode) return;

    const apiUrl = `${base_url}/api/internal-transfer-receive/create?${params.toString()}`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      let result = null;
      try {
        result = await response.json();
      } catch {
        console.warn("⚠️ Response bukan JSON valid.");
      }
      const successToastEl = document.getElementById("successToast");
      if (successToastEl) {
        const successToast = new bootstrap.Toast(successToastEl);
        successToast.show();
      }

      await renderTable();
    } catch (err) {
      console.error("❌ Terjadi kesalahan saat update barcode:", err);
      const errorToastEl = document.getElementById("errorToast");
      const errorMessage = document.getElementById("error-message");
      if (errorToastEl) {
        const errorToast = new bootstrap.Toast(errorToastEl);
        errorMessage.textContent = "Data gagal scan " + err;
        errorToast.show();
      }
    } finally {
      barcodeInput.value = "";
      barcodeInput.focus();
    }

    barcodeInput.value = "";
    barcodeInput.focus();
  }

  // =========================================== VALIDATE ===============================
  document.getElementById("btn-validate").addEventListener("click", validate);

  async function validate() {
    const apiUrl = `${base_url}/api/internal-transfer/transfer-product-receive`;
    const payload = {
      transfer_id: internalId,
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
