document.addEventListener("DOMContentLoaded", () => {
  const stateEl = document.getElementById("state");
  const tbodyPeminjaman = document.getElementById("tbody-peminjaman");
  const infoEl = document.getElementById("data-info");

  const ITEMS_PER_PAGE = 8;
  let currentPage = 1;
  let allItems = [];

  async function loadData() {
    const name = localStorage.getItem("name") || "";
    const warehouse = localStorage.getItem("warehouse") || "";

    const paramsObj = { warehouse_code: warehouse, name: name };
    if (stateEl && stateEl.value) paramsObj.state = stateEl.value;

    const params = new URLSearchParams(paramsObj);
    const apiUrl = `${base_url}/api/borrowing/list?${params.toString()}`;

    try {
      const res = await fetch(apiUrl, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      allItems = data?.data?.items ?? [];

      if (allItems.length === 0) {
        tbodyPeminjaman.innerHTML = `<tr><td colspan="13" class="text-center">Tidak ada data</td></tr>`;
        infoEl.textContent = "Tidak ada data ditemukan.";
        document.getElementById("pagination-wrapper").style.display = "none";
        return;
      }

      document.getElementById("pagination-wrapper").style.display = "flex";
      renderTable();
    } catch (error) {
      showError(error.message || "Terjadi kesalahan");
    }
  }

  function renderTable() {
    tbodyPeminjaman.innerHTML = "";

    const totalData = allItems.length;
    const totalPages = Math.ceil(totalData / ITEMS_PER_PAGE);

    if (currentPage > totalPages) currentPage = totalPages || 1;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalData);
    const pageItems = allItems.slice(startIndex, endIndex);

    pageItems.forEach((item, idx) => {
      const tr = document.createElement("tr");
      const id = item.id || item._id || "";
      tr.classList.add("clickable-row");
      if (id) tr.dataset.id = id;
      tr.innerHTML = `
        <td class="text-center">${startIndex + idx + 1}</td>
        <td>${escapeHtml(item.borrowing_number || "-")}</td>
        <td>${escapeHtml(item.borrowing_barcode || "-")}</td>
        <td class="text-center">${escapeHtml(item.borrower_name || "-")}</td>
        <td class="text-center">${escapeHtml(item.borrower_phone || "-")}</td>
        <td class="text-center">${escapeHtml(item.warehouse || "-")}</td>
        <td class="text-center">${escapeHtml(item.borrow_date || "-")}</td>
        <td class="text-center">${escapeHtml(item.due_date || "-")}</td>
        <td class="text-center">${escapeHtml(item.total_items ?? "-")}</td>
        <td class="text-center">${escapeHtml(item.total_returned ?? "-")}</td>
        <td class="text-center">${escapeHtml(item.total_pending ?? "-")}</td>
        <td class="text-center">${escapeHtml(item.status || "-")}</td>
        <td class="text-center">${escapeHtml(item.overdue ?? "-")}</td>
      `;
      tbodyPeminjaman.appendChild(tr);
    });

    const statusText = stateEl.value
      ? stateEl.value.charAt(0).toUpperCase() + stateEl.value.slice(1)
      : "Semua Status";
    infoEl.textContent = `Menampilkan ${
      startIndex + 1
    }–${endIndex} dari ${totalData} data (Status: ${statusText})`;

    tbodyPeminjaman.querySelectorAll(".clickable-row").forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.dataset.id;
        console.log("Klik data:", id);
        window.location.href = `./detail_loan.html?borrowing_id=${encodeURIComponent(
          id
        )}`;
      });
    });

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    const prevBtn = document.createElement("li");
    prevBtn.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
    prevBtn.innerHTML = `
      <a class="page-link" href="#" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    `;
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });
    paginationContainer.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement("li");
      li.className = `page-item mx-1 ${i === currentPage ? "active" : ""}`;
      const a = document.createElement("a");
      a.className = "page-link border-ssi";
      a.href = "#";
      a.textContent = i;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = i;
        renderTable();
      });
      li.appendChild(a);
      paginationContainer.appendChild(li);
    }

    const nextBtn = document.createElement("li");
    nextBtn.className = `page-item ${
      currentPage === totalPages ? "disabled" : ""
    }`;
    nextBtn.innerHTML = `
      <a class="page-link" href="#" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    `;
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });
    paginationContainer.appendChild(nextBtn);
  }

  function showError(msg) {
    const errorToastEl = document.getElementById("errorToast");
    const errorMessage = document.getElementById("error-message");
    if (errorToastEl && errorMessage) {
      errorMessage.textContent = msg;
      const errorToast = new bootstrap.Toast(errorToastEl);
      errorToast.show();
    } else {
      console.error(msg);
    }
  }

  function escapeHtml(str) {
    if (typeof str !== "string") return str ?? "";
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  const paginationWrapper = document.createElement("div");
  paginationWrapper.id = "pagination-wrapper";
  paginationWrapper.className =
    "d-flex justify-content-between align-items-center mt-2";

  paginationWrapper.innerHTML = `
    <div id="data-info" class="text-secondary small mb-0"></div>
    <nav aria-label="Page navigation example">
      <ul class="pagination mb-0" id="pagination"></ul>
    </nav>
  `;

  document.querySelector(".table-responsive").after(paginationWrapper);

  loadData();
  if (stateEl)
    stateEl.addEventListener("change", () => {
      currentPage = 1;
      loadData();
    });
});
