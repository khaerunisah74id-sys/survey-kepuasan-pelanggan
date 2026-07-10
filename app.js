// ==========================================
// KONFIGURASI UTAMA
// ==========================================
// Tempelkan URL Web App Google Apps Script Anda di bawah ini setelah dideploy.
// Contoh: "https://script.google.com/macros/s/AKfycbz.../exec"
const GOOGLE_SCRIPT_URL = ""; 

// ==========================================
// LOGIKA FORM SURVEI
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("surveyForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnSpinner = document.getElementById("btnSpinner");
  const configWarning = document.getElementById("configWarning");
  const surveyFormCard = document.getElementById("surveyFormCard");
  const successCard = document.getElementById("successCard");

  // Periksa apakah URL Google Sheets sudah dikonfigurasi
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === "") {
    configWarning.style.display = "block";
  }

  // Handle Pengiriman Formulir
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Ambil data dari input
    const ratingEl = document.querySelector('input[name="rating"]:checked');
    const kategoriEl = document.querySelector('input[name="kategori"]:checked');
    const saranEl = document.getElementById("saran");

    if (!ratingEl) {
      alert("Silakan pilih rating kepuasan Anda terlebih dahulu.");
      return;
    }

    const rating = ratingEl.value;
    const kategori = kategoriEl ? kategoriEl.value : "Tidak Memilih";
    const saran = saranEl ? saranEl.value : "";

    // Aktifkan Loading State
    submitBtn.disabled = true;
    btnSpinner.style.display = "inline-block";

    // Data yang akan dikirim
    const formData = {
      rating: rating,
      kategori: kategori,
      saran: saran
    };

    if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== "") {
      // MODE PRODUKSI: Kirim ke Google Sheets
      
      // Menggunakan URLSearchParams agar terkirim sebagai application/x-www-form-urlencoded
      // Metode ini sangat kompatibel dengan Google Apps Script dan menghindari masalah CORS preflight
      const searchParams = new URLSearchParams();
      searchParams.append("rating", formData.rating);
      searchParams.append("kategori", formData.kategori);
      searchParams.append("saran", formData.saran);

      fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // no-cors memberi tahu browser untuk mengirim request tanpa meminta header CORS balik
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: searchParams
      })
      .then(() => {
        // Karena kita menggunakan mode "no-cors", browser tidak bisa membaca respon detailnya,
        // namun asalkan request terkirim dengan status 200/0, itu berarti berhasil masuk ke Google Sheets.
        showSuccessState();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Gagal mengirim data survei. Silakan periksa koneksi internet Anda.");
        resetLoadingState();
      });

    } else {
      // MODE DEMO: Simpan ke LocalStorage komputer (simulasi database lokal)
      console.log("Menjalankan Mode Demo. Data survei yang dikirim:", formData);
      
      setTimeout(function () {
        // Ambil data respon yang sudah ada di localStorage (jika ada)
        let responses = localStorage.getItem("demo_survey_responses");
        if (responses) {
          responses = JSON.parse(responses);
        } else {
          responses = [];
        }

        // Tambah data baru
        responses.push({
          tanggal: new Date().toLocaleString("id-ID"),
          rating: formData.rating,
          kategori: formData.kategori,
          saran: formData.saran
        });

        // Simpan kembali
        localStorage.setItem("demo_survey_responses", JSON.stringify(responses));

        // Tampilkan halaman sukses
        showSuccessState();
      }, 1000); // Simulasi delay jaringan selama 1 detik
    }
  });

  function showSuccessState() {
    surveyFormCard.style.display = "none";
    successCard.style.display = "block";
    resetLoadingState();
  }

  function resetLoadingState() {
    submitBtn.disabled = false;
    btnSpinner.style.display = "none";
  }
});

// Fungsi untuk meriset formulir dan mengulang survei
window.resetSurvey = function () {
  const form = document.getElementById("surveyForm");
  const surveyFormCard = document.getElementById("surveyFormCard");
  const successCard = document.getElementById("successCard");

  form.reset();
  
  // Reset rating radio selection visual state
  const checkedRating = document.querySelector('input[name="rating"]:checked');
  if (checkedRating) checkedRating.checked = false;

  const checkedCat = document.querySelector('input[name="kategori"]:checked');
  if (checkedCat) checkedCat.checked = false;

  successCard.style.display = "none";
  surveyFormCard.style.display = "block";
};
