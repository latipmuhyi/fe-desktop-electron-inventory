document.addEventListener("DOMContentLoaded", async () => {
  const dataDetail = document.getElementById("content-data-detail");
  const tbodyLeft = document.getElementById("tbody-left");
  const tbodyRight = document.getElementById("tbody-right");
  const scanInput = document.getElementById("scanBarcode");
  const btnAddItem = document.getElementById("addScanBtn");
  const btnValidate = document.getElementById("btn-validate");
  const btnSaveNotes = document.getElementById("btnSaveNotes");
  const notesModal = new bootstrap.Modal(document.getElementById("notesModal"));
  const inputNotes = document.getElementById("returnNotes");
  const barcodeInput = document.getElementById("scanBarcode");

  const params = new URLSearchParams(window.location.search);
  const borrowingId = Number(params.get("borrowing_id"));

  let scannedItems = JSON.parse(localStorage.getItem("scannedItems")) || [];

  // === Toast Function ===
  function showToast(type, message) {
    const toastEl = document.getElementById(
      type === "success" ? "successToast" : "errorToast"
    );
    const msgEl = document.getElementById(
      type === "success" ? "success-message" : "error-message"
    );
    msgEl.textContent = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }

  function formatDatetimeLocalToApi(value) {
    if (!value) return "";
    if (value instanceof Date) {
      const yyyy = value.getFullYear();
      const mm = String(value.getMonth() + 1).padStart(2, "0");
      const dd = String(value.getDate()).padStart(2, "0");
      const hh = String(value.getHours()).padStart(2, "0");
      const min = String(value.getMinutes()).padStart(2, "0");
      const ss = String(value.getSeconds()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }

    const t = value.split("T");
    if (t.length !== 2) return "";
    const date = t[0];
    let time = t[1];
    if (time.length === 5) time = time + ":00"; // "HH:MM" -> "HH:MM:SS"
    return `${date} ${time}`;
  }


  async function loadData() {
    const urlGet = `${base_url}/api/borrowing/detail?borrowing_id=${borrowingId}`;
    try {
      const res = await fetch(urlGet, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { data } = await res.json();

      // info detail kiri atas
      const fields = [
        ["Borrowing Number", "borrowing_number"],
        ["Borrowing Barcode", "borrowing_barcode"],
        ["Borrower Name", "borrower_name"],
        ["Borrower ID Number", "borrower_id_number"],
        ["Borrower Phone", "borrower_phone"],
        ["Borrower Email", "borrower_email"],
        ["Borrower Department", "borrower_department"],
        ["Borrower Address", "borrower_address"],
        ["Warehouse", "warehouse"],
        ["Borrow Date", "borrow_date"],
        ["Due Date", "due_date"],
        ["Duration (Days)", "duration_days"],
        ["Actual Return Date", "actual_return_date"],
        ["Purpose", "purpose"],
        ["Notes", "notes"],
        ["Status", "status"],
        ["Is Overdue", "is_overdue"],
        ["Total Items", "total_items"],
        ["Total Returned", "total_returned"],
        ["Total Pending", "total_pending"],
        ["Responsible", "responsible"],
      ];

      let html = "";
      fields.forEach(([label, key]) => {
        const value = data[key] ?? "-";
        html += `
          <div class="row mb-2">
            <div class="col-5 fw-semibold text-secondary">${label}</div>
            <div class="col-7">${escapeHtml(String(value))}</div>
          </div>
        `;
      });
      dataDetail.innerHTML = html;

      // tabel kiri
      tbodyLeft.innerHTML = "";
      tbodyRight.innerHTML = "";
      data.items.forEach((item, idx) => {
        const barcode = item.barcode || "-";
        const trLeft = document.createElement("tr");
        trLeft.dataset.barcode = barcode;
        trLeft.innerHTML = `
          <td>${idx + 1}</td>
          <td>${escapeHtml(barcode)}</td>
          <td>${escapeHtml(item.product_name || "-")}</td>
          <td>${escapeHtml(item.borrow_condition || "-")}</td>
          <td>${escapeHtml(item.borrow_notes || "-")}</td>
          <td>${escapeHtml(item.return_status || "-")}</td>
        `;
        
        // jika sudah di-scan
        if (scannedItems.find((i) => i.barcode === barcode)) {
          trLeft.classList.add("table-success");
        }
        tbodyLeft.appendChild(trLeft);
        // if (item.return_status === "returned") {
        //   tbodyRight.appendChild(trLeft);
        // } else {
        //   tbodyLeft.appendChild(trLeft);
        // }
      });
    } catch (error) {
      console.error(error);
      dataDetail.innerHTML = `<div class="text-danger">Gagal memuat data.</div>`;
    }
  }

  // === Render tabel kanan (hasil scan)
  function renderScannedTable() {
    tbodyRight.innerHTML = "";
    if (scannedItems.length === 0) {
      tbodyRight.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Belum ada data</td></tr>`;
      return;
    }

    scannedItems.forEach((item, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.barcode)}</td>
        <td>${escapeHtml(item.name || "-")}</td>
        <td>${escapeHtml(item.status || "returned")}</td>
        <td>${escapeHtml(item.return_condition || "-")}</td>
        <td>${escapeHtml(item.return_notes || "-")}</td>
      `;
      tbodyRight.appendChild(tr);
    });
  }

  function saveToLocalStorage() {
    localStorage.setItem("scannedItems", JSON.stringify(scannedItems));
  }

  // === Tambah (Scan)
  btnAddItem.addEventListener("click", () => {
    tambahBarangScan;
  });
  barcodeInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      tambahBarangScan();
    }
  });

  async function tambahBarangScan() {
    const barcode = scanInput.value.trim();
    if (!barcode) {
      showToast("error", "Barcode tidak boleh kosong!");
      return;
    }

    if (scannedItems.some((i) => i.barcode === barcode)) {
      showToast("error", "Barcode sudah ditambahkan sebelumnya!");
      scanInput.value = "";
      return;
    }

    const leftRow = [...tbodyLeft.querySelectorAll("tr")].find(
      (tr) => tr.dataset.barcode === barcode
    );
    if (!leftRow) {
      showToast("error", "Barcode tidak ditemukan di daftar peminjaman!");
      scanInput.value = "";
      return;
    }

    const tds = leftRow.querySelectorAll("td");
    const name = tds[2].innerText;

    const newItem = {
      barcode,
      name,
      status: "returned",
      return_condition: "good",
      return_notes: "Returned in good condition",
    };
    scannedItems.push(newItem);
    saveToLocalStorage();

    leftRow.classList.add("table-success");
    renderScannedTable();
    scanInput.value = "";
    showToast("success", "Barang berhasil ditambahkan ke daftar!");
  }

  // === Tombol Validate
  btnValidate.addEventListener("click", () => {
    if (scannedItems.length === 0) {
      showToast("error", "Belum ada data yang di-scan!");
      return;
    }
    inputNotes.value = "";
    notesModal.show();
  });

  // === Simpan Notes & Kirim API
  btnSaveNotes.addEventListener("click", async () => {
    const notes = inputNotes.value.trim();
    if (!notes) {
      showToast("error", "Catatan tidak boleh kosong!");
      return;
    }

    const now = new Date();
    const body = {
      borrowing_id: borrowingId,
      return_date: formatDatetimeLocalToApi(now),
      items: scannedItems.map((i) => ({
        barcode: i.barcode,
        return_condition: i.return_condition,
        return_notes: i.return_notes,
      })),
      notes,
    };


    try {
      const res = await fetch(`${base_url}/api/borrowing/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal mengirim data!");
      }

      showToast("success", "Data pengembalian berhasil disimpan!");
      notesModal.hide();

      localStorage.removeItem("scannedItems");
      scannedItems = [];
      renderScannedTable();
      await loadData();
    } catch (err) {
      console.error(err);
      showToast(
        "error",
        err.message || "Terjadi kesalahan saat mengirim data!"
      );
    }
  });

  await loadData();
  renderScannedTable();
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
