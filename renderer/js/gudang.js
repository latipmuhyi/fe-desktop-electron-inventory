document.addEventListener("DOMContentLoaded", async () => {
  const url = `${base_url}/api/inventory/overview`;
  const container = document.getElementById("card-container");

  if (!container) {
    return;
  }
  const cardData = [
    {
      warehouse_name: "Receipts",
      warehouse_code: "receipts",
      picking_type: "receipts",
      to_process: "",
      waiting: "",
      late: "",
    },
    {
      warehouse_name: "Internal Transfers Send",
      warehouse_code: "internal-send",
      picking_type: "internal-send",
      to_process: "",
      waiting: "",
      late: "",
    },
    {
      warehouse_name: "Internal Transfers Receive",
      warehouse_code: "internal-receive",
      picking_type: "internal-receive",
      to_process: "",
      waiting: "",
      late: "",
    },
    {
      warehouse_name: "Delivery Orders",
      warehouse_code: "orders",
      picking_type: "orders",
      to_process: "",
      waiting: "",
      late: "",
    },
  ];

  // try {
  //   const res = await fetch(url);
  //   const result = await res.json();

  //   if (!Array.isArray(result.data) || result.data.length === 0) {
  //     container.innerHTML = `
  //       <div class="text-center text-muted mt-3">Tidak ada data</div>
  //     `;
  //     return;
  //   }

    container.innerHTML = "";
    // const typeCodeList = result.data.map((item) => item.warehouse_code);
    // localStorage.setItem("warehouse-list-code", typeCodeList);

    cardData.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "card m-2 shadow-sm";
      card.style.width = "18rem";

      // card.innerHTML = `
      //   <div class="card-body">
      //     <h5 class="card-title">${item.picking_type}</h5>
      //     <p class="card-subtitle mb-2 text-body-secondary">${item.warehouse_name}</p>
      //     <div class="d-flex justify-content-between align-items-center mt-3">
      //       <button class="btn btn-ssi btn-receipt d-flex" data-type="${item.warehouse_code}" id="${item.picking_code}">
      //         ${item.to_process}
      //         <p class="card-text mb-1 ms-1">To Process</p>
      //       </button>
      //       <div>
      //         <p class="card-text mb-1">${item.waiting} Waiting</p>
      //         <span class="">${item.late} Late</span>
      //       </div>
      //     </div>
      //   </div>
      // `;
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${item.warehouse_name}</h5>
          <p class="card-subtitle mb-2 text-body-secondary">${item.picking_type}</p>
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
        const type = e.currentTarget.getAttribute("data-type");
        const pickingCode = e.currentTarget.getAttribute("id");
        localStorage.setItem("warehouse-code", type);
        localStorage.setItem("picking-code", pickingCode);
        if (type === "receipts") {
          window.location.href = "./gudang/warehouse.html";
        } else if (type === "internal-send") {
          window.location.href = "./internal-transfer-send/warehouse.html";
        } else if (type === "internal-receive") {
          window.location.href = "./internal-transfer-receive/warehouse.html";
        } else {
          window.location.href = "./delivery-order/warehouse.html";
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
