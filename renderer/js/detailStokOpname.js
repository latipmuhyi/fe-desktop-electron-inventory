document.addEventListener("DOMContentLoaded", async () => {
  const warehouse = localStorage.getItem("warehouse");
  const colomInput = document.getElementById("judulSon");
  const btnSave = document.getElementById("input-stok-opname");

  const tbody = document.getElementById("stok-opname-tbody");

  const successToastE = document.getElementById("successToast");
  const successToast = new bootstrap.Toast(successToastE);

  const errorToastEl = document.getElementById("errorToast");
  const errorToast = new bootstrap.Toast(errorToastEl);

  const params = new URLSearchParams(window.location.search);
  const opnameId = params.get("opname_id");

  const url = `${base_url}/api/opname/detail?opname_id=${opnameId}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    tbody.innerHTML = "";

    if (!Array.isArray(data.data.lines) || data.data.lines.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center">Tidak ada data</td></tr>`;
      return;
    }

    data.data.lines.forEach((item, idx) => {
      const barcode = item.barcode || "-";
      const productCode = item.product_code || "-";
      const productName = item.product_name || "-";
      const productCondition = item.product_condition || "-";
      const information = item.information || "-";
      const matchStatus = item.match_status || "-";
      const matchRemarks = item.match_remarks || "-";
      const systemStatus = item.system_status || "-";
      const receipt = item.receipt || "-";
      const vendor = item.vendor || "-";
      const scanned_date = item.scanned_date || "-";
      const id = item.id || item._id || "";

      const tr = document.createElement("tr");
      //   tr.classList.add("clickable-row");
      if (id) tr.dataset.id = id;

      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(barcode)}</td>
        <td>${escapeHtml(productCode)}</td>
        <td>${escapeHtml(productName)}</td>
        <td>${escapeHtml(productCondition)}</td>
        <td>${escapeHtml(information)}</td>
        <td>${escapeHtml(matchStatus)}</td>
        <td>${escapeHtml(matchRemarks)}</td>
        <td>${escapeHtml(systemStatus)}</td>
        <td>${escapeHtml(receipt)}</td>
        <td>${escapeHtml(vendor)}</td>
        <td>${escapeHtml(scanned_date)}</td>
      `;
      tbody.appendChild(tr);
    });

    // tbody.querySelectorAll(".clickable-row").forEach((row) => {
    //   row.addEventListener("click", () => {
    //     const id = row.dataset.id;
    //     console.log("Klik data:", id);
    //     window.location.href = `./detail_stok_opname.html?opname_id=${encodeURIComponent(
    //       id
    //     )}`;
    //   });
    // });
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
