// ==========================================
// KONFIGURASI UTAMA SISTEM SURVEI
// ==========================================

const CONFIG = {
  // OPSI 1: DATABASE SUPABASE (Untuk Dashboard & Grafik Online)
  // Cara dapatkan URL & KEY: Buka supabase.com, buat project gratis, masuk ke Project Settings -> API
  SUPABASE_URL: "", 
  SUPABASE_ANON_KEY: "", 

  // OPSI 2: WEB3FORMS (Untuk Kirim Pemberitahuan Hasil Survei ke Email Anda secara Real-time)
  // Cara dapatkan KEY: Buka web3forms.com, masukkan email Anda, Anda akan dikirimi Access Key gratis
  WEB3FORMS_ACCESS_KEY: "",

  // OPSI TAMBAHAN: PIN KEAMANAN DASHBOARD ADMIN
  // PIN ini digunakan untuk masuk ke halaman admin.html agar pelanggan lain tidak bisa membuka data survei Anda.
  // Biarkan kosong "" jika Anda tidak ingin menggunakan PIN pengaman (bebas diakses siapa saja).
  ADMIN_PIN: "1234"
};
