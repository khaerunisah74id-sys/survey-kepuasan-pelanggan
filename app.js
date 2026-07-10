// ==========================================
// LOGIKA FORM SURVEI (Menggunakan CONFIG dari config.js)
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("surveyForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnSpinner = document.getElementById("btnSpinner");
  const configWarning = document.getElementById("configWarning");
  const surveyFormCard = document.getElementById("surveyFormCard");
  const successCard = document.getElementById("successCard");

  // Jika CONFIG Supabase maupun Web3Forms belum dikonfigurasi, munculkan peringatan mode demo
  const isSupabaseConfigured = CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY;
  const isWeb3FormsConfigured = CONFIG.WEB3FORMS_ACCESS_KEY;
  
  if (!isSupabaseConfigured && !isWeb3FormsConfigured) {
    configWarning.style.display = "block";
    configWarning.innerHTML = `
      <strong>⚠️ Mode Demo Aktif:</strong><br>
      Anda belum mengisi konfigurasi di file <code>config.js</code>. Survei saat ini disimpan sementara di browser Anda (LocalStorage).<br>
      Buka file <code>config.js</code> untuk menyambungkan ke <strong>Supabase (Database)</strong> dan/atau <strong>Web3Forms (Email)</strong>.
    `;
  } else {
    configWarning.style.display = "none";
  }

  // Fungsi untuk mengambil dan memasukkan daftar petugas ke dropdown
  function loadPetugasSelect() {
    const petugasSelect = document.getElementById("petugasSelect");
    if (!petugasSelect) return;

    if (isSupabaseConfigured) {
      // Ambil dari database online Supabase (menggunakan view aman agar tidak memuat username/password)
      fetch(`${CONFIG.SUPABASE_URL}/rest/v1/daftar_petugas?select=nama&order=nama.asc`, {
        method: "GET",
        headers: {
          "apikey": CONFIG.SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error("Gagal memuat petugas dari view");
        return res.json();
      })
      .then(data => {
        petugasSelect.innerHTML = '<option value="" disabled selected>-- Pilih Nama Petugas --</option>';
        data.forEach(p => {
          const opt = document.createElement("option");
          opt.value = p.nama;
          opt.innerText = p.nama;
          petugasSelect.appendChild(opt);
        });
      })
      .catch(err => {
        console.error("Gagal mengambil data dari Supabase, memuat default:", err);
        populateDefaultPetugas();
      });
    } else {
      // Gunakan default dari config.js
      populateDefaultPetugas();
    }

    function populateDefaultPetugas() {
      petugasSelect.innerHTML = '<option value="" disabled selected>-- Pilih Nama Petugas --</option>';
      const defaultList = CONFIG.DEFAULT_PETUGAS || [];
      defaultList.forEach(nama => {
        const opt = document.createElement("option");
        opt.value = nama;
        opt.innerText = nama;
        petugasSelect.appendChild(opt);
      });
    }
  }

  // Panggil pemuatan select petugas
  loadPetugasSelect();

  // Handle Pengiriman Formulir
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const ratingEl = document.querySelector('input[name="rating"]:checked');
    const kategoriEl = document.querySelector('input[name="kategori"]:checked');
    const saranEl = document.getElementById("saran");
    const petugasSelect = document.getElementById("petugasSelect");

    if (!ratingEl) {
      alert("Silakan pilih tingkat kepuasan Anda.");
      return;
    }

    const rating = ratingEl.value;
    const kategori = kategoriEl ? kategoriEl.value : "Tidak Memilih";
    const saran = saranEl ? saranEl.value : "";
    const petugas = petugasSelect ? petugasSelect.value : "Umum";

    // Aktifkan Loading State
    submitBtn.disabled = true;
    btnSpinner.style.display = "inline-block";

    const promises = [];

    // 1. JIKA SUPABASE DIATUR -> Kirim ke Supabase
    if (isSupabaseConfigured) {
      const supabasePromise = fetch(`${CONFIG.SUPABASE_URL}/rest/v1/survei_responses`, {
        method: "POST",
        headers: {
          "apikey": CONFIG.SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          rating: rating,
          kategori: kategori,
          saran: saran,
          petugas: petugas
        })
      }).then(res => {
        if (!res.ok) throw new Error("Gagal mengirim ke database Supabase");
        return res;
      });
      promises.push(supabasePromise);
    }

    // 2. JIKA WEB3FORMS DIATUR -> Kirim Notifikasi ke Email
    if (isWeb3FormsConfigured) {
      const web3FormsPromise = fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          access_key: CONFIG.WEB3FORMS_ACCESS_KEY,
          subject: `Survei Baru: ${rating} (${kategori})`,
          from_name: "Sistem Survei Toko",
          message: `Ada masukan baru dari pelanggan!\n\n` +
                   `- Petugas Pelayanan: ${petugas}\n` +
                   `- Tingkat Kepuasan: ${rating}\n` +
                   `- Kategori Terkesan: ${kategori}\n` +
                   `- Komentar/Saran: ${saran || "(Kosong)"}\n\n` +
                   `Waktu: ${new Date().toLocaleString("id-ID")}`
        })
      }).then(res => {
        if (!res.ok) throw new Error("Gagal mengirim notifikasi email");
        return res.json();
      });
      promises.push(web3FormsPromise);
    }

    // Eksekusi pengiriman data
    if (promises.length > 0) {
      Promise.all(promises)
        .then(() => {
          showSuccessState();
        })
        .catch(error => {
          console.error("Error detail:", error);
          alert("Terjadi kesalahan saat mengirim data. Silakan coba lagi.");
          resetLoadingState();
        });
    } else {
      // 3. JIKA DUA-DUANYA KOSONG -> Simpan di LocalStorage (Mode Demo)
      setTimeout(function () {
        let responses = localStorage.getItem("demo_survey_responses");
        responses = responses ? JSON.parse(responses) : [];
        
        responses.push({
          tanggal: new Date().toLocaleString("id-ID"),
          rating: rating,
          kategori: kategori,
          saran: saran,
          petugas: petugas
        });

        localStorage.setItem("demo_survey_responses", JSON.stringify(responses));
        showSuccessState();
      }, 1000);
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

// Reset formulir
window.resetSurvey = function () {
  const form = document.getElementById("surveyForm");
  const surveyFormCard = document.getElementById("surveyFormCard");
  const successCard = document.getElementById("successCard");

  form.reset();
  
  const checkedRating = document.querySelector('input[name="rating"]:checked');
  if (checkedRating) checkedRating.checked = false;

  const checkedCat = document.querySelector('input[name="kategori"]:checked');
  if (checkedCat) checkedCat.checked = false;

  successCard.style.display = "none";
  surveyFormCard.style.display = "block";
};
