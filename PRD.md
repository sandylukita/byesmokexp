# **Product Requirement Document (PRD) – ByeSmoke XP**

**Versi Dokumen:** 1.0

**Tanggal:** 3 Juli 2025

**Status:** Final

### **1\. Latar Belakang & Visi Produk**

**ByeSmoke XP** adalah aplikasi mobile yang dirancang untuk membantu pengguna berhenti merokok melalui pendekatan gamifikasi yang personal dan memotivasi. Visi kami adalah untuk tidak hanya menjadi *tracker* pasif, tetapi menjadi teman seperjuangan digital yang cerdas, adaptif, dan memberikan dukungan yang relevan setiap hari.

Dengan memanfaatkan Firebase untuk sinkronisasi data dan Gemini AI untuk personalisasi konten, **ByeSmoke XP** menawarkan pengalaman yang unik, memastikan data pengguna aman dan progres mereka selalu terasa dihargai.

### **2\. Target Pengguna**

* **Pengguna Utama:** Individu usia 17-40+ yang memiliki keinginan kuat untuk berhenti merokok dan membutuhkan sistem pendukung yang terstruktur namun tidak rumit.  
* **Profil Psikografis:**  
  * Menyukai tantangan dan pencapaian (gamifikasi).  
  * Membutuhkan motivasi eksternal untuk menjaga komitmen.  
  * Terbuka dengan teknologi dan menghargai personalisasi.  
  * Menginginkan aplikasi yang *to-the-point* namun tetap kaya fitur.

### **3\. Arsitektur & Fitur Aplikasi**

Berikut adalah rincian fungsionalitas yang telah diimplementasikan dalam aplikasi:

#### **3.1. Autentikasi & Onboarding**

* **Splash Screen:** Tampilan awal dengan logo "ByeSmoke XP" untuk *branding*.  
* **Sistem Login:**  
  * **Email & Password:** Pendaftaran dan login standar.  
  * **Akun Admin (Tes):** Akun khusus (admin@byerokok.app) untuk keperluan *testing* dan demonstrasi fitur premium.  
* **Inisialisasi Data Pengguna:** Saat pendaftaran, dokumen pengguna dibuat di Firestore dengan struktur data awal (streak, total hari, XP, status premium, dll).

#### **3.2. Halaman Utama (Dashboard)**

Struktur Halaman Utama dirancang untuk menyajikan informasi penting secara ringkas dan menarik.

* **Sapaan Personal:** Menyapa pengguna dengan nama depan mereka (misal: "Halo, Budi\!").  
* **Kartu Level & Lencana:**  
  * Menampilkan Level pengguna saat ini berdasarkan total XP.  
  * Menampilkan lencana terakhir yang diraih, lengkap dengan ikon berwarna merah untuk penekanan. Jika belum ada, akan tertulis "Tanpa Badge".  
  * *Progress bar* XP menuju level selanjutnya.  
* **Kartu Statistik (3 Kolom):**  
  * **Streak:** Menampilkan jumlah hari *check-in* berturut-turut.  
  * **Total Hari:** Menampilkan total hari berhenti merokok.  
  * **Uang Hemat:** Menampilkan estimasi total uang yang berhasil dihemat.  
* **Tombol Aksi Utama (Check-in):**  
  * Tombol *check-in* harian yang jelas dan menjadi fokus utama.  
  * Tombol akan nonaktif setelah *check-in* berhasil dilakukan pada hari tersebut.  
  * **Logika Streak:** *Streak* akan bertambah jika *check-in* dilakukan secara berurutan dan akan ter-reset jika melewatkan satu hari.  
* **Kartu Misi Harian:**  
  * Menampilkan daftar misi yang harus diselesaikan.  
  * Misi yang sudah selesai akan otomatis hilang dari daftar ini.  
  * **Fitur Premium:** Pengguna premium mendapatkan 3 misi harian, sementara pengguna gratis hanya 1\.  
* **Kartu Motivasi Harian:**  
  * Menampilkan kutipan motivasi yang relevan.  
  * **Fitur Premium:** Konten motivasi dibuat oleh AI. Pengguna gratis akan melihat versi terkunci dengan tombol "Upgrade".

#### **3.3. Personalisasi dengan Gemini AI (Fitur Premium)**

* **Misi Harian Dinamis:** Setiap hari, aplikasi mengirimkan *prompt* ke Gemini AI yang berisi data progres pengguna (streak, lencana terakhir) untuk menghasilkan misi yang relevan dan menantang.  
* **Motivasi Personal:** Gemini AI juga menghasilkan kutipan motivasi yang disesuaikan dengan konteks perjalanan pengguna, membuat dukungan terasa lebih personal.  
* **Fallback Mechanism:** Jika terjadi kegagalan saat menghubungi API Gemini, aplikasi akan secara otomatis menggunakan data statis yang sudah disiapkan agar pengalaman pengguna tidak terganggu.

#### **3.4. Halaman Pengaturan**

* **Navigasi:** Akses ke halaman "Go Premium", "Akun", dan "Tentang Aplikasi".  
* **Mode Gelap:** Opsi untuk mengubah tema aplikasi. Fitur ini terkunci dan hanya tersedia untuk pengguna premium.  
* **Notifikasi:** *Toggle* untuk mengaktifkan/menonaktifkan notifikasi (fungsionalitas UI).  
* **Logout:** Fungsi untuk keluar dari akun.

#### **3.5. Halaman Akun & Riwayat**

* **Detail Akun:** Menampilkan informasi dasar seperti email dan total XP.  
* **Dinding Lencana (Badge Wall):** Galeri yang menampilkan semua lencana yang tersedia. Lencana yang sudah diraih akan berwarna, sementara yang belum akan ditampilkan dengan *opacity* lebih rendah.  
* **Riwayat Misi:** Menampilkan daftar semua misi yang telah berhasil diselesaikan oleh pengguna, diurutkan dari yang terbaru.

#### **3.6. Halaman Leaderboard**

* **Navigasi Tab:** Pengguna dapat beralih antara *leaderboard* "Mingguan" dan "Sepanjang Waktu".  
* **Peringkat Mingguan:** Mengurutkan pengguna berdasarkan konsistensi dan XP yang didapat dalam satu minggu terakhir.  
* **Peringkat Sepanjang Waktu:** Mengurutkan pengguna berdasarkan **Total Hari** berhenti merokok.  
* **Peringkat Pengguna:** Posisi pengguna saat ini akan selalu disorot agar mudah ditemukan.

### **4\. Model Monetisasi**

Aplikasi menggunakan model **Freemium** untuk menarik pengguna dan menawarkan nilai tambah melalui langganan premium.

* **Versi Gratis:**  
  * 1 Misi Harian statis.  
  * Fitur dasar (tracking, check-in, lencana).  
  * Akses terbatas (terkunci) ke fitur premium.  
* **Versi Premium (ByeSmoke XP+):**  
  * **Misi & Motivasi Personal dari AI:** Konten yang dibuat khusus oleh Gemini AI setiap hari.  
  * **3 Misi Harian:** Kesempatan mendapatkan lebih banyak XP.  
  * **Mode Gelap Eksklusif.**  
  * **Pengalaman Bebas Iklan.**  
  * **Dukungan Langsung:** Opsi untuk mendukung developer independen.

### **5\. Metrik Kesuksesan (KPIs)**

* **Akuisisi:** Jumlah pendaftaran pengguna baru per minggu/bulan.  
* **Aktivasi:** Persentase pengguna yang menyelesaikan *check-in* pertama.  
* **Retensi:**  
  * *Daily Active Users* (DAU) & *Monthly Active Users* (MAU).  
  * Rata-rata *streak* pengguna.  
* **Monetisasi:**  
  * Tingkat konversi dari pengguna gratis ke premium.  
  * *Churn rate* pengguna premium.

### **6\. Rencana Masa Depan (Roadmap)**

* **Q3 2025:**  
  * Implementasi *native* push *notification* untuk pengingat misi dan motivasi.  
  * Menambahkan lebih banyak variasi lencana dan *achievement*.  
* **Q4 2025:**  
  * Mengembangkan versi *native mobile* menggunakan React Native (Expo) berdasarkan *codebase* yang sudah ada.  
  * Meluncurkan versi Beta di TestFlight dan Google Play Console.  
* **Q1 2026:**  
  * Menambahkan fitur komunitas di mana pengguna bisa saling berbagi progres dan memberikan dukungan.