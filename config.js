// ==========================================
// KONFIGURASI UTAMA SISTEM SURVEI
// ==========================================

const CONFIG = {
  // OPSI 1: DATABASE SUPABASE (Untuk Database & Grafik Laporan Online)
  // Cara dapatkan URL & KEY: Buka supabase.com, buat project gratis, masuk ke Project Settings -> API
  SUPABASE_URL: "", 
  SUPABASE_ANON_KEY: "", 

  // OPSI 2: WEB3FORMS (Untuk Kirim Pemberitahuan Hasil Survei ke Email Anda secara Real-time)
  // Cara dapatkan KEY: Buka web3forms.com, masukkan email Anda, Anda akan dikirimi Access Key gratis
  WEB3FORMS_ACCESS_KEY: "",

  // OPSI TAMBAHAN: LOGIN KEAMANAN DASHBOARD ADMIN
  // Digunakan untuk masuk ke halaman admin.html agar pelanggan lain tidak bisa membuka data survei Anda.
  // Kosongkan ADMIN_PASSWORD: "" jika ingin masuk tanpa login.
  ADMIN_USERNAME: "admin",
  ADMIN_PASSWORD: "password123",

  // OPSI TAMBAHAN: DAFTAR PETUGAS DEFAULT (MODE DEMO)
  // Daftar petugas bawaan yang akan muncul di dropdown halaman survei jika belum menyambungkan ke Supabase.
  DEFAULT_PETUGAS: ["Andi Kasir", "Siti Pramuniaga", "Budi Staff Gudang"]
};
