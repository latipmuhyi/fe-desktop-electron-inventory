document.addEventListener("DOMContentLoaded", async () => {
  const apiUrl = `${base_url}/api/borrowing/create`;

  const inputs = {
    name: document.querySelector('input[placeholder="Name"]'),
    nik: document.querySelector('input[placeholder="NIK"]'),
    phone: document.querySelector('input[placeholder="Phone"]'),
    email: document.querySelector('input[placeholder="Email"]'),
    department: document.querySelector('input[placeholder="Department"]'),
    address: document.querySelector('input[placeholder="Address"]'),
    warehouse: document.querySelector('input[placeholder="Warehouse Code"]'),
    due_date: document.querySelector('input[placeholder="Due Date"]'),
  };

  const inputBarcode = document.querySelector('input[placeholder="barcode"]');
  const inputCondition = document.querySelector(
    'select[placeholder="condition"]'
  );
  const inputNotes = document.querySelector('input[placeholder="notes"]');

  const btnAddBorrower = document.querySelectorAll(".btn.btn-ssi.w-100")[0];
  const btnAddItem = document.querySelectorAll(".btn.btn-ssi.w-100")[1];
  const btnValidate = document.getElementById("btn-validate");

  const tbody = document.getElementById("tbody-right");

  let borrowerData = JSON.parse(localStorage.getItem("borrowerData")) || {};
  let barcodes = JSON.parse(localStorage.getItem("barcodes")) || [];

  // --- Fungsi Toast ---
  function showToast(type, message) {
    const toastEl =
      type === "error"
        ? document.getElementById("errorToast")
        : document.getElementById("successToast");
    const msgEl =
      type === "error"
        ? document.getElementById("error-message")
        : document.getElementById("success-message");

    if (toastEl && msgEl) {
      msgEl.textContent = message;
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  // --- Tambah Data Diri ---
  btnAddBorrower.addEventListener("click", () => {
    borrowerData = {
      borrower_name: inputs.name.value.trim(),
      borrower_id_number: inputs.nik.value.trim(),
      borrower_phone: inputs.phone.value.trim(),
      borrower_email: inputs.email.value.trim(),
      borrower_department: inputs.department.value.trim(),
      borrower_address: inputs.address.value.trim(),
      warehouse_code: inputs.warehouse.value.trim(),
      due_date: formatDatetimeLocalToApi(inputs.due_date.value),
    };

    if (!borrowerData.borrower_name || !borrowerData.borrower_id_number) {
      showToast("error", "Data diri gagal disimpan. Nama dan NIK wajib diisi!");
      return;
    }

    localStorage.setItem("borrowerData", JSON.stringify(borrowerData));
    showToast("success", "Data diri berhasil disimpan!");
  });

  // --- Tambah Barang ---

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
    const barcode = inputBarcode.value.trim();
    const condition = inputCondition.value.trim();
    const notes = inputNotes.value.trim();

    if (!barcode) {
      showToast("error", "Barcode tidak boleh kosong!");
      return;
    }

    const item = {
      barcode,
      borrow_condition: condition || "good",
      borrow_notes: notes || "-",
    };

    barcodes.push(item);
    localStorage.setItem("barcodes", JSON.stringify(barcodes));
    renderTable();

    inputBarcode.value = "";
    inputCondition.value = "";
    inputNotes.value = "";

    showToast("success", "Barang berhasil ditambahkan ke daftar!");
  };

  // --- Render Tabel ---
  function renderTable() {
    tbody.innerHTML = "";
    if (barcodes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center">Belum ada data</td></tr>`;
      return;
    }

    barcodes.forEach((item, idx) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td data-field="barcode">${item.barcode}</td>
        <td>${borrowerData.borrower_name || "-"}</td>
        <td>Dipinjam</td>
        <td>
          <select class="form-select form-select-sm borrow-condition" data-index="${idx}">
            <option value="good" ${
              item.borrow_condition === "good" ? "selected" : ""
            }>Good</option>
            <option value="damaged" ${
              item.borrow_condition === "damaged" ? "selected" : ""
            }>Damaged</option>
            <option value="missing_parts" ${
              item.borrow_condition === "missing_parts" ? "selected" : ""
            }>Missing Parts</option>
            <option value="defect" ${
              item.borrow_condition === "defect" ? "selected" : ""
            }>Defect</option>
          </select>
        </td>
        <td contenteditable="true" data-field="borrow_notes">${
          item.borrow_notes
        }</td>
        <td class="text-center">
          <button class="btn btn-sm btn-danger btn-delete" data-index="${idx}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // --- Hapus barang ---
    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.dataset.index;
        barcodes.splice(index, 1);
        localStorage.setItem("barcodes", JSON.stringify(barcodes));
        renderTable();
        showToast("success", "Barang berhasil dihapus!");
      });
    });

    // --- Edit Notes langsung ---
    tbody.querySelectorAll("[contenteditable=true]").forEach((cell) => {
      cell.addEventListener("input", (e) => {
        const field = e.target.dataset.field;
        const rowIndex = e.target.parentElement.rowIndex - 1;
        barcodes[rowIndex][field] = e.target.innerText.trim();
        localStorage.setItem("barcodes", JSON.stringify(barcodes));
      });
    });

    // --- Ganti Kondisi Barang ---
    document.querySelectorAll(".borrow-condition").forEach((select) => {
      select.addEventListener("change", (e) => {
        const index = e.target.dataset.index;
        barcodes[index].borrow_condition = e.target.value;
        localStorage.setItem("barcodes", JSON.stringify(barcodes));
      });
    });
  }

  // --- Validate ---
  btnValidate.addEventListener("click", async () => {
    if (!borrowerData.borrower_name) {
      showToast("error", "Silakan isi dan simpan Data Diri terlebih dahulu!");
      return;
    }

    if (barcodes.length === 0) {
      showToast(
        "error",
        "Tambahkan minimal satu data barang sebelum validasi!"
      );
      return;
    }

    const payload = {
      ...borrowerData,
      purpose: "For testing equipment",
      barcodes,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        showToast("success", "Data berhasil dikirim ke server!");
        console.log("Response:", result);

        localStorage.removeItem("borrowerData");
        localStorage.removeItem("barcodes");
        borrowerData = {};
        barcodes = [];
        renderTable();
        Object.values(inputs).forEach((i) => (i.value = ""));
      } else {
        showToast(
          "error",
          "Gagal mengirim data: " + (result.message || "Terjadi kesalahan")
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Terjadi kesalahan jaringan atau server.");
    }
  });

  // --- Load ulang data dari localStorage ---
  renderTable();

  if (borrowerData.borrower_name) {
    inputs.name.value = borrowerData.borrower_name;
    inputs.nik.value = borrowerData.borrower_id_number;
    inputs.phone.value = borrowerData.borrower_phone;
    inputs.email.value = borrowerData.borrower_email;
    inputs.department.value = borrowerData.borrower_department;
    inputs.address.value = borrowerData.borrower_address;
    inputs.warehouse.value = borrowerData.warehouse_code;
    inputs.due_date.value = formatApiToDatetimeLocal(borrowerData.due_date);    
  }
});

// convert "2025-10-21T17:00" => "2025-10-21 17:00:00"
function formatDatetimeLocalToApi(value) {
  if (!value) return "";
  // some browsers produce seconds, normalize
  // value expected like "2025-10-21T17:00" or "2025-10-21T17:00:00"
  const t = value.split("T");
  if (t.length !== 2) return "";
  const date = t[0];
  let time = t[1];
  if (time.length === 5) time = time + ":00"; // "HH:MM" -> "HH:MM:SS"
  return `${date} ${time}`;
}

// convert "2025-10-21 17:00:00" => "2025-10-21T17:00"
function formatApiToDatetimeLocal(apiValue) {
  if (!apiValue) return "";
  // remove seconds and replace space with T
  // "2025-10-21 17:00:00" -> "2025-10-21T17:00"
  const parts = apiValue.split(" ");
  if (parts.length < 2) return "";
  const date = parts[0];
  const time = parts[1].split(":").slice(0,2).join(":"); // HH:MM
  return `${date}T${time}`;
}

