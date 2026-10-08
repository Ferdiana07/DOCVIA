# 🗄️ Database Schema & ER Diagram

Sistem **DOCVIA** menggunakan MongoDB sebagai basis datanya, dikelola menggunakan pemodelan berbasis objek melalui **Mongoose**.

Meskipun MongoDB adalah database NoSQL yang *schema-less*, kita tetap memaksakan aturan (schema) di level aplikasi untuk memastikan integritas dan keamanan data.

---

## 1. Entity-Relationship (ER) Overview

Hubungan utama antar entitas di platform ini adalah:
- **Satu User** bisa mengajukan menjadi **Satu Dokter** (One-to-One).
- **Satu User (Pasien)** bisa memiliki **Banyak Appointments** (One-to-Many).
- **Satu Dokter** bisa menangani **Banyak Appointments** (One-to-Many).

```text
  [ Users ] (1) ---------- (1) [ Doctors ]
       |                            |
      (1)                          (1)
       |                            |
      (M)                          (M)
  [    Appointments (Booking)        ]
```

---

## 2. Collections Detailed Breakdown

### A. Users Collection (`User.js`)
Pusat dari seluruh identitas aplikasi (Pasien, Dokter, Admin).

| Field | Type | Modifiers | Keterangan |
|-------|------|-----------|------------|
| `_id` | ObjectId | - | Kunci utama unik dari MongoDB. |
| `name` | String | required, trim | Nama lengkap pengguna. |
| `email` | String | required, unique | Kredensial login utama (lowercase). |
| `password` | String | required, select:false | Hash Bcrypt (tidak pernah dikirim ke frontend). |
| `phone` | String | default: `''` | Nomor telepon kontak opsional. |
| `role` | Enum | `patient`, `doctor`, `admin` | Penentu hak akses (Authorization). |
| `notifications`| Array | ref: `Notification` | *Array of ObjectId* untuk menautkan notifikasi masuk. |

### B. Doctors Collection (`Doctor.js`)
Data profesional medis. Hanya akan terbuat ketika User (`role: patient`) mengajukan formulir `Apply as Doctor`.

| Field | Type | Modifiers | Keterangan |
|-------|------|-----------|------------|
| `_id` | ObjectId | - | Kunci unik dokumen profil dokter. |
| `userId` | ObjectId | required, unique, ref:`User` | **Foreign Key** penaut ke akun `User` yang melamar (One-to-One). |
| `name` | String | required | Disalin dari tabel User saat pendaftaran. |
| `specialization`| String | required, Indexed | Spesialisasi (contoh: Cardiology). Sangat penting untuk fitur filter/pencarian. |
| `experience` | Number | required | Berapa tahun dokter berpraktik. |
| `consultationFee`| Number | required | Biaya satu kali pemesanan (Rupiah). |
| `location` | String | optional, Indexed | Kota, area, atau nama klinik untuk filter lokasi. |
| `status` | Enum | `pending`, `approved`, `rejected` | Digunakan Admin untuk validasi kelayakan. Pasien hanya bisa melihat dokter yang `approved`. |
| `availability`| Array of Object | - | Struktur jadwal berulang, e.g. `[{ day: 'Monday', startTime: '09:00', endTime: '12:00' }]`. |

### C. Appointments Collection (`Appointment.js`)
Rekam jejak dan histori pemesanan konsultasi.

| Field | Type | Modifiers | Keterangan |
|-------|------|-----------|------------|
| `_id` | ObjectId | - | ID Booking. |
| `patientId` | ObjectId | required, ref:`User` | **Foreign Key** ke pasien yang memesan. |
| `doctorId` | ObjectId | required, ref:`Doctor` | **Foreign Key** ke profil dokter yang dituju. |
| `appointmentDate` | Date | required | Tanggal pemesanan. |
| `appointmentTime` | String | required | Waktu konsultasi (format HH:mm). |
| `status` | Enum | `pending`, `approved`, `completed`, `rejected`, `cancelled` | Status *real-time* posisi pemesanan. |
| `reason` | String | required | Alasan kunjungan atau keluhan sakit (anamnesis awal). |
| `document` | String | - | Nama file acak di storage server. File hanya diunduh melalui endpoint terautentikasi. |
| `doctorNotes`| String | - | Catatan akhir dari dokter paska-konsultasi. |

---

## 3. Best Practices yang Diterapkan di Skema

- **Keamanan Password (`select: false`)**: Di skema `User`, field `password` disetel sebagai `select: false`. Artinya, jika sistem memanggil `User.find()`, password TIDAK akan ikut terbawa. Ini mencegah kebocoran *hash password* ke frontend secara tidak sengaja.
- **Cascading & Referencing**: Kita menggunakan teknik *Referencing* (menyimpan `ObjectId`), bukan *Embedding* (menyimpan seluruh *object* ke dalam dokumen lain) untuk Dokter dan Appointments agar basis data tidak membengkak (mencegah duplikasi data yang inkonsisten).
- **Indexing Pencarian**: Di koleksi `Doctors`, spesialisasi dan lokasi diberi `index` untuk mendukung filter direktori dokter.
- **Dokumen Privat**: Folder upload tidak disajikan sebagai static public URL. Endpoint download memeriksa pasien pemilik, dokter terkait, atau admin sebelum mengirim file.
# Schema extensions (2026-10-02)

- `User` now includes `dateOfBirth`, `gender`, `address`, `emergencyContact`, and a private `medicalProfile`.
- `Appointment` now includes a sparse unique `bookingKey`, structured `clinicalRecord`, `rescheduleHistory`, and 24h/2h reminder markers.
- `PlatformSetting` stores booking policies, reminder toggles, maintenance state, support contact, privacy, and terms copy.
- `Dispute` stores support cases, appointment references, priority, workflow status, assigned admin, and response.
