# 🔄 System Workflows

Dokumen ini menjelaskan alur kerja (workflow) fungsional **DOCVIA**, langkah demi langkah. Pemahaman ini sangat penting untuk mengetahui bagaimana berbagai fitur berinteraksi satu sama lain, dari registrasi pengguna hingga konsultasi selesai.

---

## 1. Alur Registrasi & Autentikasi (User Login Flow)
Ini adalah alur pertama kali user masuk ke aplikasi.

1. **Pengunjung (Guest)** membuka halaman utama (`/`).
2. Jika ingin memesan dokter, pengunjung diarahkan ke halaman **Register**.
3. Di halaman Register, user memasukkan `Nama`, `Email`, `Password`, dan `Nomor Telepon`.
   - *Di belakang layar (Backend)*: Sistem mem-validasi apakah email sudah terdaftar. Jika belum, *password* di-enkripsi (di-hash menggunakan `bcrypt`) dan data disimpan di MongoDB dengan role otomatis sebagai `patient`.
4. Setelah sukses, sistem melakukan auto-login dengan mengembalikan **JWT (JSON Web Token)**. Token ini disimpan di *Local Storage* *browser*.
5. Sistem mengarahkan user ke **Patient Dashboard** (`/patient/dashboard`).
6. Untuk interaksi selanjutnya, setiap *request API* ke backend akan selalu menyertakan JWT tersebut di bagian *header* sebagai bukti autentikasi.

---

## 2. Alur Menjadi Dokter (Doctor Onboarding Flow)
Pasien yang memiliki kualifikasi medis bisa melamar untuk menjadi dokter di platform.

1. **Pasien** yang sedang *login* menekan menu **Apply as Doctor**.
2. Pasien mengisi formulir panjang yang berisi:
   - Spesialisasi (e.g., Cardiology, Pediatrics)
   - Tahun pengalaman (Experience)
   - Gelar (Qualification)
   - Biaya Konsultasi (Consultation Fee)
   - Jadwal Praktik (Availability / Timings)
3. **Submit Form**: Data dikirim ke backend dan sistem membuat record profil dokter baru dengan status `pending` di koleksi `Doctors`.
4. Sistem otomatis memicu Notifikasi ke Dashboard Admin bahwa ada lamaran baru.
5. **Admin Login**: Admin masuk ke dashboard dan membuka menu "Doctor Applications".
6. Admin meninjau data pelamar. Jika sesuai, Admin menekan **Approve**.
7. *Di belakang layar*: 
   - Status dokter berubah dari `pending` menjadi `approved`.
   - Role *user* tersebut berubah dari `patient` menjadi `doctor`.
   - Notifikasi dikirimkan ke *user* pelamar bahwa akun dokternya telah aktif.
8. Dokter baru kini akan muncul di halaman publik **Find a Doctor** dan siap menerima pasien.

---

## 3. Alur Pemesanan Jadwal (Appointment Booking Flow)
Ini adalah inti dari aplikasi, yakni mempertemukan pasien dan dokter.

1. **Pasien Login**: Pasien mencari dokter melalui halaman `/doctors`.
2. Pasien memilih dokter spesifik dan menekan tombol **Book Appointment**.
3. Sistem membuka halaman form pemesanan:
   - Menampilkan detail dan jadwal praktik dokter.
   - Pasien memilih Tanggal (Date) dan Waktu (Time) sesuai slot tersedia.
   - Pasien mengisi alasan/keluhan, dan secara opsional **mengunggah dokumen** (seperti hasil lab atau rontgen dalam format PDF/JPG).
4. **Submit Booking**: Data dan *file* dikirim ke backend. 
   - *File upload* ditangani oleh `Multer` dan disimpan secara fisik di *server* (folder `uploads/`).
   - Sistem merekam *appointment* dengan status default `pending`.
5. Notifikasi dikirim otomatis ke akun Dokter yang bersangkutan.

---

## 4. Alur Manajemen Konsultasi (Doctor Management Flow)
Alur ketika dokter memproses pemesanan yang masuk.

1. **Dokter Login**: Dokter masuk ke halamannya (`/doctor/dashboard`) dan melihat ada notifikasi pemesanan baru.
2. Dokter masuk ke tab **Appointments**.
3. Di dalam daftar dengan status `pending`, dokter dapat menekan tombol **Review**.
4. Muncul *modal/popup* berisi keluhan pasien, dan tombol **Download Dokumen** jika pasien mengunggah *file* rekam medis.
5. Dokter membuat keputusan:
   - **Approve (Setuju)**: Jadwal dikonfirmasi. Status berubah menjadi `approved`.
   - **Reject (Tolak)**: Jadwal ditolak (misal karena jadwal mendadak penuh). Status berubah menjadi `rejected`.
6. Keputusan ini memicu notifikasi balasan ke dashboard Pasien.
7. Pada hari H, dokter dan pasien bertemu (asumsi offline/kunjungan klinik).
8. Setelah selesai konsultasi, Dokter kembali ke aplikasi dan menekan tombol **Mark as Completed** pada jadwal tersebut. Status pemesanan kini menjadi `completed`.

---

## 5. Alur Tata Kelola Admin (Admin Oversight Flow)
Alur administrasi tingkat atas.

1. **Admin Login**: Masuk menggunakan akun admin.
2. Admin Dashboard menampilkan statistik komprehensif:
   - Total pasien di platform.
   - Total dokter terdaftar.
   - Total seluruh *appointments* (konsultasi).
3. Melalui menu **Users**, admin dapat melihat siapa saja yang terdaftar di aplikasi (nama, email, role, status aktif).
4. Melalui menu **Appointments**, admin dapat memonitor seluruh transaksi jadwal antara pasien dan dokter dalam sistem, memastikan tidak ada penyalahgunaan platform.

---

### Kesimpulan Alur Data (Data Flow State Machine)
Setiap siklus pemesanan berputar pada perubahan **Status**:
`Pending` (Menunggu konfirmasi) ➡️ `Approved` (Disetujui, masuk jadwal) ➡️ `Completed` (Selesai).

Jika ditolak:
`Pending` ➡️ `Rejected` (Batal dari dokter).
`Pending/Approved` ➡️ `Cancelled` (Batal dari pasien).
