/**
 * Fungsi untuk menampilkan / menyembunyikan loading pada tombol Bootstrap
 * @param {string} btnId 
 * @param {boolean} isLoading 
 * @param {string} [defaultText="Masuk"]
 */
function setButtonLoading(btnId, isLoading, defaultText = "Masuk") {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = `
    <div class="btn-group-custom">
        <div class="btn btn-ssi">
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        </div>
    </div>
    `;
  } else {
    btn.disabled = false;
    btn.innerHTML = defaultText;
  }
}

function setButtonLoading2(btnId, isLoading, defaultText = "Masuk") {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    `;
  } else {
    btn.disabled = false;
    btn.innerHTML = defaultText;
  }
}
