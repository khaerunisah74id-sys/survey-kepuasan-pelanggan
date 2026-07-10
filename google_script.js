/**
 * Google Apps Script untuk Sistem Survei Kepuasan Pelanggan
 * 
 * Script ini berfungsi sebagai backend API gratis untuk menerima data
 * dari website survei pelanggan dan menyimpannya ke Google Sheets.
 * 
 * CARA PENGGUNAAN:
 * 1. Buka Google Sheets Anda (sheet kosong).
 * 2. Klik menu 'Ekstensi' (Extensions) -> 'Apps Script'.
 * 3. Hapus kode bawaan yang ada, lalu salin (copy-paste) seluruh kode ini.
 * 4. Klik ikon Simpan (Save).
 * 5. Klik tombol 'Terapkan' (Deploy) -> 'Penerapan baru' (New deployment).
 * 6. Pilih tipe: 'Aplikasi Web' (Web app).
 * 7. Isi deskripsi bebas (misal: "Versi 1").
 * 8. Jalankan sebagai: 'Saya' (Me - email anda).
 * 9. Siapa yang memiliki akses: 'Siapa saja' (Anyone). Ini penting agar pelanggan bisa mengirim data.
 * 10. Klik 'Terapkan' (Deploy). Berikan izin jika diminta oleh Google.
 * 11. Salin 'URL Aplikasi Web' (Web App URL) yang dihasilkan. URL inilah yang akan dimasukkan ke file app.js di website Anda.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Kunci selama 10 detik untuk menghindari konflik data masuk bersamaan
  
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheets()[0]; // Menggunakan sheet pertama
    
    // Jika sheet masih kosong, buat header kolom terlebih dahulu
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Tanggal", "Rating", "Kategori", "Komentar/Saran"]);
      // Format header agar tebal
      sheet.getRange("A1:D1").setFontWeight("bold").setBackground("#e6f0fa");
    }
    
    // Mengambil data dari form submission
    var parameter = e.parameter;
    
    // Jika data dikirim berupa JSON string di body
    if (e.postData && e.postData.contents) {
      try {
        var jsonBody = JSON.parse(e.postData.contents);
        parameter = jsonBody;
      } catch (err) {
        // Abaikan jika bukan JSON
      }
    }
    
    var rating = parameter.rating || "";
    var kategori = parameter.kategori || "";
    var komentar = parameter.komentar || parameter.saran || "";
    var tanggal = new Date(); // Catat waktu pengisian survei
    
    // Validasi sederhana: Rating harus diisi
    if (!rating) {
      return ContentService
        .createTextOutput(JSON.stringify({ "result": "error", "error": "Rating wajib diisi!" }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }
    
    // Masukkan data ke baris baru di sheet
    sheet.appendRow([tanggal, rating, kategori, komentar]);
    
    // Mengembalikan respon sukses
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "message": "Survei berhasil disimpan!" }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
      
  } catch (error) {
    // Mengembalikan respon error
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  } finally {
    lock.releaseLock(); // Lepas kunci
  }
}

// Untuk menangani request CORS preflight dari browser modern
function doOptions(e) {
  return ContentService
    .createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
