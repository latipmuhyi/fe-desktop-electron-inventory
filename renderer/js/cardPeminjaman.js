document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("card-container");

  if (!container) {
    return;
  }
  const cardData = [
    {
      warehouse_name: "Peminjaman",
      warehouse_code: "pinjam",
      picking_type: "pinjam",
      to_process: "",
      waiting: "",
      late: "",
    },
    {
      warehouse_name: "Pengembalian",
      warehouse_code: "kembali",
      picking_type: "kembali",
      to_process: "",
      waiting: "",
      late: "",
    },
  ];

  // try {

  container.innerHTML = "";
  cardData.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "card m-2 shadow-sm";
    card.style.width = "18rem";

    card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${item.warehouse_name}</h5>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <button class="btn btn-ssi btn-receipt d-flex" data-type="${item.warehouse_code}" id="${item.picking_code}">
              <p class="card-text mb-1 ms-1">To Process</p>
            </button>
          </div>
        </div>
      `;

    container.appendChild(card);
  });

  document.querySelectorAll(".btn-receipt").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (cardData.picking_code === "pinjam") {
        window.location.href = "./peminjaman/index.html";
      } else {
        window.location.href = "./pengembalian/index.html";
      }
    });
  });
  // } catch (err) {
  //   console.error("Error fetching inventory:", err);
  //   container.innerHTML = `
  //     <div class="text-center text-danger mt-3">
  //       Gagal memuat data
  //     </div>
  //   `;
  // }
});
