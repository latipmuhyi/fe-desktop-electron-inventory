const form = document.getElementById("registerForm");
const result = document.getElementById("result");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    email: document.getElementById("email").value,
    nama: document.getElementById("nama").value,
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
    repassword: document.getElementById("repassword").value,
  };

  window.electronAPI.register(data);
});

window.electronAPI.onRegisterResponse((res) => {
  if (res.success) {
    result.innerHTML = `<p style="color:green">Registrasi berhasil untuk ${res.user.username}</p>`;
  } else {
    result.innerHTML = `<p style="color:red">Error: ${res.error}</p>`;
  }
});

  document.getElementById("btnLogin").addEventListener("click", () => {
    window.location.href = "../index.html";
  });
