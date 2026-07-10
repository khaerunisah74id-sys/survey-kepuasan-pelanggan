// ==========================================================================
// LOGIKA FORM WIZARD SURVEI HYUNDAI (app.js)
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("surveyForm");
  const submitBtn = document.getElementById("submitBtn");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const btnSpinner = document.getElementById("btnSpinner");
  const successCard = document.getElementById("successCard");
  const formErrorMsg = document.getElementById("formErrorMsg");

  let currentStep = 1;
  const totalSteps = 5;

  // Nama langkah untuk progress tracker
  const stepTitles = {
    1: "Identitas Pelanggan",
    2: "Penilaian Layanan (1/2)",
    3: "Penilaian Fasilitas (2/2)",
    4: "Loyalitas & Masukan",
    5: "Penilaian Akhir & Kirim"
  };

  // Cek konfigurasi Supabase & Web3Forms
  const isSupabaseConfigured = CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY;
  const isWeb3FormsConfigured = CONFIG.WEB3FORMS_ACCESS_KEY;

  // Load select petugas
  function loadPetugasSelect() {
    const petugasSelect = document.getElementById("petugasSelect");
    if (!petugasSelect) return;

    if (isSupabaseConfigured) {
      // Ambil dari view aman Supabase
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
        console.error("Gagal mengambil data petugas dari Supabase, memuat default:", err);
        populateDefaultPetugas();
      });
    } else {
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

  loadPetugasSelect();

  // Logika Navigasi Wizard
  window.navigateStep = function (direction) {
    if (direction === 1) {
      // Jalankan validasi pada langkah aktif sebelum melaju
      if (!validateStep(currentStep)) {
        alert("Mohon lengkapi kolom wajib (*) pada langkah ini sebelum melanjutkan.");
        return;
      }
    }

    // Ubah langkah aktif
    document.getElementById(`step${currentStep}`).classList.remove("active");
    currentStep += direction;
    document.getElementById(`step${currentStep}`).classList.add("active");

    // Scroll ke atas form agar rapi
    document.querySelector(".survey-container").scrollIntoView({ behavior: "smooth" });

    updateWizardUI();
  };

  function updateWizardUI() {
    // Progres bar fill
    const progressPercent = (currentStep / totalSteps) * 100;
    document.getElementById("wizardProgressFill").style.width = `${progressPercent}%`;

    // Teks info langkah
    document.getElementById("stepIndicatorText").innerText = `Langkah ${currentStep} dari ${totalSteps}`;
    document.getElementById("stepTitleText").innerText = stepTitles[currentStep];

    // Tombol Navigasi
    if (currentStep === 1) {
      prevBtn.style.display = "none";
      nextBtn.style.display = "inline-flex";
      submitBtn.style.display = "none";
    } else if (currentStep === totalSteps) {
      prevBtn.style.display = "inline-flex";
      nextBtn.style.display = "none";
      submitBtn.style.display = "inline-flex";
    } else {
      prevBtn.style.display = "inline-flex";
      nextBtn.style.display = "inline-flex";
      submitBtn.style.display = "none";
    }

    // Reset error message
    formErrorMsg.style.display = "none";
  }

  // Validasi Input Tiap Langkah
  function validateStep(step) {
    if (step === 1) {
      const tanggal = document.getElementById("tanggalInput").value;
      const cabang = document.getElementById("cabangInput").value.trim();
      const petugas = document.getElementById("petugasSelect").value;
      
      // Validasi minimal 1 jenis layanan terpilih
      const checkedLayanan = document.querySelectorAll('input[name="jenis_layanan"]:checked');

      if (!tanggal || !cabang || !petugas || checkedLayanan.length === 0) {
        return false;
      }

      // Jika pilihan 'Lainnya' dicentang, kolom keterangan lainnya wajib diisi
      if (document.getElementById("srv7").checked) {
        const layananLainnya = document.getElementById("layananLainnya").value.trim();
        if (!layananLainnya) return false;
      }

      return true;
    }

    if (step === 2) {
      // Cek rating p1 sampai p7
      for (let i = 1; i <= 7; i++) {
        if (!document.querySelector(`input[name="p${i}"]:checked`)) {
          return false;
        }
      }
      return true;
    }

    if (step === 3) {
      // Cek rating p8 sampai p14
      for (let i = 8; i <= 14; i++) {
        if (!document.querySelector(`input[name="p${i}"]:checked`)) {
          return false;
        }
      }
      return true;
    }

    if (step === 4) {
      const loyalKembali = document.querySelector('input[name="loyalitas_kembali"]:checked');
      const loyalRekomendasi = document.querySelector('input[name="loyalitas_rekomendasi"]:checked');
      if (!loyalKembali || !loyalRekomendasi) {
        return false;
      }
      return true;
    }

    return true;
  }

  // Handle Submit Form
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validasi akhir langkah 5
    const penilaianKeseluruhan = document.querySelector('input[name="penilaian_keseluruhan"]:checked');
    const consentCheck = document.getElementById("consentCheck").checked;

    if (!penilaianKeseluruhan || !consentCheck) {
      formErrorMsg.style.display = "block";
      formErrorMsg.innerText = "Mohon pilih penilaian keseluruhan dan setujui Kebijakan Privasi.";
      return;
    }

    // Mengumpulkan jenis layanan
    const layananList = [];
    document.querySelectorAll('input[name="jenis_layanan"]:checked').forEach(el => {
      layananList.push(el.value);
    });

    // Mengumpulkan seluruh rating p1-p14
    const ratings = {};
    for (let i = 1; i <= 14; i++) {
      ratings[`p${i}`] = parseInt(document.querySelector(`input[name="p${i}"]:checked`).value, 10);
    }

    const payload = {
      nama_pelanggan: document.getElementById("namaInput").value.trim() || "Anonim",
      nomor_hp: document.getElementById("hpInput").value.trim() || "Tidak Mengisi",
      tanggal_kunjungan: document.getElementById("tanggalInput").value,
      cabang: document.getElementById("cabangInput").value.trim(),
      jenis_layanan: layananList.join(", "),
      layanan_lainnya: document.getElementById("layananLainnya").value.trim() || "",
      petugas: document.getElementById("petugasSelect").value,
      ...ratings,
      loyalitas_kembali: document.querySelector('input[name="loyalitas_kembali"]:checked').value,
      loyalitas_rekomendasi: parseInt(document.querySelector('input[name="loyalitas_rekomendasi"]:checked').value, 10),
      saran_disukai: document.getElementById("saranSukaInput").value.trim(),
      saran_ditingkatkan: document.getElementById("saranTingkatInput").value.trim(),
      saran_lainnya: document.getElementById("saranKritikInput").value.trim(),
      penilaian_keseluruhan: penilaianKeseluruhan.value
    };

    // Aktifkan Loading State
    submitBtn.disabled = true;
    prevBtn.disabled = true;
    btnSpinner.style.display = "inline-block";
    formErrorMsg.style.display = "none";

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
        body: JSON.stringify(payload)
      }).then(res => {
        if (!res.ok) throw new Error("Gagal mengirim ke database Supabase");
        return res;
      });
      promises.push(supabasePromise);
    }

    // 2. JIKA WEB3FORMS DIATUR -> Kirim Notifikasi ke Email
    if (isWeb3FormsConfigured) {
      // Membuat isi email ringkasan
      let ratingsText = "";
      for (let i = 1; i <= 14; i++) {
        ratingsText += `- Pertanyaan ${i}: ${ratings[`p${i}`]} / 5\n`;
      }

      const web3FormsPromise = fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          access_key: CONFIG.WEB3FORMS_ACCESS_KEY,
          subject: `Survei Baru Hyundai - Cabang: ${payload.cabang} (${payload.penilaian_keseluruhan})`,
          from_name: "Survei Kepuasan Hyundai",
          message: `Ada masukan baru dari survei kepuasan pelanggan Hyundai!\n\n` +
                   `=== IDENTITAS PELANGGAN ===\n` +
                   `- Nama: ${payload.nama_pelanggan}\n` +
                   `- No HP: ${payload.nomor_hp}\n` +
                   `- Tanggal Kunjungan: ${payload.tanggal_kunjungan}\n` +
                   `- Cabang: ${payload.cabang}\n` +
                   `- Jenis Layanan: ${payload.jenis_layanan}\n` +
                   `- Layanan Lainnya: ${payload.layanan_lainnya || "(Tidak Ada)"}\n` +
                   `- Petugas/SA: ${payload.petugas}\n\n` +
                   `=== PENILAIAN KEPUASAN (1-14) ===\n` +
                   ratingsText + `\n` +
                   `=== LOYALITAS & MASUKAN ===\n` +
                   `- Gunakan Kembali Layanan: ${payload.loyalitas_kembali}\n` +
                   `- Skor Rekomendasi (NPS): ${payload.loyalitas_rekomendasi} / 10\n` +
                   `- Hal yang Paling Disukai: ${payload.saran_disukai || "(Kosong)"}\n` +
                   `- Aspek Perlu Ditingkatkan: ${payload.saran_ditingkatkan || "(Kosong)"}\n` +
                   `- Kritik & Saran Lainnya: ${payload.saran_lainnya || "(Kosong)"}\n\n` +
                   `- Penilaian Keseluruhan: ${payload.penilaian_keseluruhan}\n\n` +
                   `Waktu Pengiriman: ${new Date().toLocaleString("id-ID")}`
        })
      }).then(res => {
        if (!res.ok) throw new Error("Gagal mengirim notifikasi email");
        return res.json();
      });
      promises.push(web3FormsPromise);
    }

    // Eksekusi Pengiriman
    if (promises.length > 0) {
      Promise.all(promises)
        .then(() => {
          showSuccessState();
        })
        .catch(error => {
          console.error("Error detail:", error);
          alert("Terjadi kesalahan saat menyimpan tanggapan Anda. Silakan coba lagi.");
          resetLoadingState();
        });
    } else {
      // 3. JIKA DUA-DUANYA KOSONG -> Simpan di LocalStorage (Mode Demo)
      setTimeout(function () {
        let responses = localStorage.getItem("demo_survey_responses");
        responses = responses ? JSON.parse(responses) : [];
        
        responses.push({
          id: Date.now(),
          created_at: new Date().toISOString(),
          ...payload
        });

        localStorage.setItem("demo_survey_responses", JSON.stringify(responses));
        showSuccessState();
      }, 1000);
    }
  });

  function showSuccessState() {
    document.getElementById("surveyForm").style.display = "none";
    document.querySelector(".wizard-progress-container").style.display = "none";
    successCard.style.display = "block";
    resetLoadingState();
  }

  function resetLoadingState() {
    submitBtn.disabled = false;
    prevBtn.disabled = false;
    btnSpinner.style.display = "none";
  }
});

// Reset formulir survei kembali ke awal
window.resetSurvey = function () {
  const form = document.getElementById("surveyForm");
  const successCard = document.getElementById("successCard");

  form.reset();
  
  // Sembunyikan kolom layanan lainnya
  document.getElementById("layananLainnya").style.display = "none";

  // Kembalikan ke langkah 1
  document.getElementById("step5").classList.remove("active");
  document.getElementById("step1").classList.add("active");
  
  // Tampilkan form dan progres tracker kembali
  form.style.display = "block";
  document.querySelector(".wizard-progress-container").style.display = "block";
  successCard.style.display = "none";

  // Reset tombol navigasi
  document.getElementById("prevBtn").style.display = "none";
  document.getElementById("nextBtn").style.display = "inline-flex";
  document.getElementById("submitBtn").style.display = "none";

  // Reset fill bar & info step
  document.getElementById("wizardProgressFill").style.width = "20%";
  document.getElementById("stepIndicatorText").innerText = "Langkah 1 dari 5";
  document.getElementById("stepTitleText").innerText = "Identitas Pelanggan";

  // Disable tombol kirim
  document.getElementById("submitBtn").disabled = true;
};
