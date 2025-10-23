document.addEventListener("DOMContentLoaded", async () => {
  const tbodyLeft = document.getElementById("tbody-left");
  const tbodyRight = document.getElementById("tbody-right");
  const headWarehouse = document.getElementById("head-warehouse");
  const headDate = document.getElementById("head-date");
  const warehouse = localStorage.getItem("warehouse");
  const barcodeInput = document.getElementById("scanBarcode");
  const conditionInput = document.getElementById("condition");
  const informationInput = document.getElementById("information");
  const addScanBtn = document.getElementById("addScanBtn");
  const btnValidate = document.getElementById("btn-validate");

  const params = new URLSearchParams(window.location.search);
  const opnameIdString = params.get("opname_id");
  const opnameId = Number(params.get("opname_id"));

  let barcodeList = [];

  async function renderTable() {
    try {
      const params = new URLSearchParams({
        warehouse_code: warehouse,
        status: "available",
      });

      const urlLeft = `${base_url}/api/opname/expected_products?${params.toString()}`;
      const urlRight = `${base_url}/api/opname/detail?opname_id=${opnameId}`;

      const [resLeft, resRight] = await Promise.all([
        fetch(urlLeft, { headers: { "Content-Type": "application/json" } }),
        fetch(urlRight, { headers: { "Content-Type": "application/json" } }),
      ]);

      const data = await resLeft.json();
      const dataRight = await resRight.json();

      tbodyLeft.innerHTML = "";
      tbodyRight.innerHTML = "";

      if (!Array.isArray(data.data.items) || data.data.items.length === 0) {
        tbodyLeft.innerHTML = `<tr><td colspan="4" class="text-center">Tidak ada data</td></tr>`;
        tbodyRight.innerHTML = `<tr><td colspan="10" class="text-center">Tidak ada data</td></tr>`;
        return;
      }

      const now = new Date();
      const formattedDate = now.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      headDate.textContent = formattedDate;
      headWarehouse.textContent = data.data.warehouse || "-";

      dataRight.data.lines.forEach((item, idx) => {
        const barcode = item.barcode || "-";
        barcodeList.push(barcode);

        const name = item.name || item.product_name || "-";
        const warehouseName = item.warehouse || "-";
        const productCondition = item.product_condition || "-";
        const information = item.information || "-";
        const matchStatus = item.match_status || "-";
        const receipt = item.receipt || "-";
        const vendor = item.vendor || "-";
        const scannedDate = item.scanned_date || "-";

        const trRight = document.createElement("tr");
        trRight.innerHTML = `
          <td>${idx + 1}</td>
          <td>${escapeHtml(barcode)}</td>
          <td>${escapeHtml(name)}</td>
          <td>${escapeHtml(warehouseName)}</td>
          <td>${escapeHtml(productCondition)}</td>
          <td>${escapeHtml(information)}</td>
          <td>${escapeHtml(vendor)}</td>
          <td>${escapeHtml(receipt)}</td>
          <td>${escapeHtml(matchStatus)}</td>
          <td>${escapeHtml(scannedDate)}</td>
        `;
        tbodyRight.appendChild(trRight);
      });

      data.data.items.forEach((item, idx) => {
        const barcode = item.barcode || "-";
        const name = item.name || item.product_name || "-";
        const status = item.status || "-";

        const trLeft = document.createElement("tr");
        trLeft.innerHTML = `
          <td>${idx + 1}</td>
          <td>${escapeHtml(barcode)}</td>
          <td>${escapeHtml(name)}</td>
          <td>${escapeHtml(status)}</td>
        `;

        if (barcodeList.includes(barcode)) {
          trLeft.classList.add("table-success");
        }

        tbodyLeft.appendChild(trLeft);
      });
    } catch (err) {
      console.error("Gagal memuat detail:", err);
      tbodyLeft.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Gagal memuat data</td></tr>`;
      tbodyRight.innerHTML = `<tr><td colspan="10" class="text-center text-danger">Gagal memuat data</td></tr>`;
    }
  }

  await renderTable();
  // ========================================= scan / add

  addScanBtn.addEventListener("click", tambahBarangScan);

  async function tambahBarangScan() {
    const barcode = barcodeInput.value.trim();
    const condition = conditionInput.value.trim();
    const information = informationInput.value.trim();

    if (!barcode) {
      alert("Barcode tidak boleh kosong!");
      barcodeInput.focus();
      return;
    }
    const apiUrl = `${base_url}/api/opname/scan`;

    try {
      const payload = {
        opname_id: opnameId,
        barcodes: [
          {
            barcode: barcode,
            product_condition: condition,
            information: information,
          },
        ],
      };
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Gagal update barcode (HTTP ${response.status}): ${text}`
        );
      }

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
        errorMessage.textContent = "Data gagal disimpan: " + err.message;
        errorToast.show();
      }
    } finally {
      barcodeInput.value = "";
      conditionInput.value = "";
      informationInput.value = "";
      barcodeInput.focus();
    }
  }

  btnValidate.addEventListener("click", validateStok);

  async function validateStok() {
    const apiUrl = `${base_url}/api/opname/submit`;
    try {
      const payload = {
        opname_id: opnameId,
      };
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Gagal update barcode (HTTP ${response.status}): ${text}`
        );
      }

      let result = null;
      try {
        result = await response.json();
      } catch {
        console.warn("⚠️ Response bukan JSON valid.");
      }

      const successToastEl = document.getElementById("successToast");
      const successMessage = document.getElementById("success-message");
      if (successToastEl) {
        const successToast = new bootstrap.Toast(successToastEl);
        successMessage.textContent = "Data Berhasil di Validate";
        successToast.show();
      }

      await renderTable();
    } catch (error) {
      const errorToastEl = document.getElementById("errorToast");
      const errorMessage = document.getElementById("error-message");
      if (errorToastEl) {
        const errorToast = new bootstrap.Toast(errorToastEl);
        errorMessage.textContent = error.message;
        errorToast.show();
      }
    }
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
