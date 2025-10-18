document.addEventListener("DOMContentLoaded", async () => {
  const warehouse = localStorage.getItem("warehouse");
  const colomInput = document.getElementById("judulSon");
  const btnSave = document.getElementById("input-stok-opname");

  const tbody = document.getElementById("stok-opname-tbody");

  const successToastE = document.getElementById("successToast");
  const successToast = new bootstrap.Toast(successToastE);

  const errorToastEl = document.getElementById("errorToast");
  const errorToast = new bootstrap.Toast(errorToastEl);

  btnSave.addEventListener("click", async () => {
    const dataInput = colomInput.value.trim();
    const opnameId = "";
    if (!dataInput) return;

    setButtonLoading("input-stok-opname", true);

    const apiUrl = `${base_url}/api/opname/create`;
    const payload = {
      warehouse_code: warehouse,
      notes: dataInput,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // await response.json();
      const data = await response.json();
      successToast.show();

      setTimeout(() => {
        setButtonLoading("input-stok-opname", false);
        window.location.href = `./stok_opname/input.html?opname_id=${encodeURIComponent(
          data.data.opname_id
        )}`;
      }, 2000);
    } catch (err) {
      errorToast.show();
      setButtonLoading("input-stok-opname", false);
    }

    colomInput.value = "";
    colomInput.focus();
  });

  const url = `${base_url}/api/opname/list?warehouse_code=${warehouse}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    tbody.innerHTML = "";

    console.log("res", data.data.items.length);

    if (!Array.isArray(data.data.items) || data.data.items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center">Tidak ada data</td></tr>`;
      return;
    }

    data.data.items.forEach((item, idx) => {
      const opnameNumber = item.opname_number || "-";
      const notes = item.notes || "-";
      const opnameDate = item.opname_date || "-";
      const totalScanned = item.total_scanned || "-";
      const totalMatched = item.total_matched || "-";
      const totalUnmatched = item.total_unmatched || "-";
      const status = item.status || "-";
      const id = item.id || item._id || "";

      const tr = document.createElement("tr");
      tr.classList.add("clickable-row");
      if (id) tr.dataset.id = id;

      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(opnameNumber)}</td>
        <td>${escapeHtml(notes)}</td>
        <td>${escapeHtml(opnameDate)}</td>
        <td>${escapeHtml(totalScanned)}</td>
        <td>${escapeHtml(totalMatched)}</td>
        <td>${escapeHtml(totalUnmatched)}</td>
        <td>${escapeHtml(status)}</td>
        <td>
          <button type="button" class="btn btn-warning"
                  style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;">
            <i class="fa-solid fa-barcode"></i>
          </button>
          <button type="button" class="btn btn-success"
                  style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;">
            <i class="fa-solid fa-eye"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".clickable-row").forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.dataset.id;
        window.location.href = `./detail_stok_opname.html?opname_id=${encodeURIComponent(
          id
        )}`;
      });
    });
  } catch (err) {
    console.error("Error fetching warehouse:", err);
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">Gagal memuat data</td></tr>`;
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
