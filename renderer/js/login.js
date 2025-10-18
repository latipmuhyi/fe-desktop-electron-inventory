document.addEventListener("DOMContentLoaded", function () {
  const toastEl = document.getElementById("loginToast");
  const toast = new bootstrap.Toast(toastEl);

  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("emailInput").value.trim();
    const password = document.getElementById("passwordInput").value.trim();

    if (email === "" || password === "") {
      const errorToast = new bootstrap.Toast(
        document.getElementById("errorToast")
      );
      errorToast.show();
      return;
    }

    setButtonLoading("btnLogin", true);
    const warehouse = "WH";
    const name = "Anton";

    setTimeout(() => {
      if (email === "ad@g" && password === "1234") {
        localStorage.setItem("warehouse", warehouse);
        localStorage.setItem("name", name);
        toast.show();

        setTimeout(() => {
          setButtonLoading("btnLogin", false);
          window.location.href = "views/dashboard.html";
        }, 2000);
      } else {
        const errorToast = new bootstrap.Toast(
          document.getElementById("errorToast")
        );
        errorToast.show();
        setButtonLoading("btnLogin", false);
      }
    }, 1500);
  });
});
