document.addEventListener("DOMContentLoaded", () => {
  const quit = document.getElementById("btnQuit");
  if (quit) {
    quit.addEventListener("click", () => {
      window.electronAPI.quitApp();
    });
  }
  // document.getElementById("btnQuit").addEventListener("click", () => {
  //   window.electronAPI.quitApp();
  // });

  const backGudang = document.getElementById("back-gudang");
  if (backGudang) {
    backGudang.addEventListener("click", () => {
      localStorage.removeItem("warehouse-code");
      localStorage.removeItem("picking-code");
      window.location.href = "../gudang.html";
    });
  }

  const toWarehouseBtn = document.getElementById("to-warehouse");
  if (toWarehouseBtn) {
    toWarehouseBtn.addEventListener("click", () => {
      window.location.href = "../gudang/warehouse.html";
    });
  }
  const toMenuPeminjaman = document.getElementById("to-menu-peminjaman");
  if (toMenuPeminjaman) {
    toMenuPeminjaman.addEventListener("click", () => {
      window.location.href = "../menu-peminjaman.html";
    });
  }

  const toStokOpname = document.getElementById("to-stok-opname");
  if (toStokOpname) {
    toStokOpname.addEventListener("click", () => {
      window.location.href = "./stok_opname.html";
    });
  }

  const toStock = document.getElementById("to-stok");
  if (toStock) {
    toStock.addEventListener("click", () => {
      window.location.href = "../stok_opname.html";
    });
  }
});
