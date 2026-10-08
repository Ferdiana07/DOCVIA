# DOCVIA

DOCVIA adalah platform janji temu layanan kesehatan berbasis MERN yang menghubungkan pasien dengan dokter terverifikasi. Aplikasi menyediakan pencarian dokter, ketersediaan jadwal aktual, booking dan dokumen pendukung, rekam konsultasi, notifikasi, serta tata kelola admin dalam satu antarmuka responsif.

Status pengumpulan: **final dan siap didemokan**.

## Akun tester

Jalankan seeder tester terlebih dahulu bila memakai MongoDB lokal/Atlas. Pada mode in-memory, akun dan data demo dibuat otomatis ketika API dinyalakan.

| Role | Email | Password | Halaman awal |
|---|---|---|---|
| Patient | `raka.pradana@example.com` | `DocviaTest-2026!` | `/patient/dashboard` |
| Doctor | `sarah.j@docvia.local` | `DocviaTest-2026!` | `/doctor/dashboard` |
| Admin | `admin@docvia.local` | `DocviaTest-2026!` | `/admin/dashboard` |

Kredensial ini hanya untuk demo dan QA. Halaman login final tidak menampilkan shortcut, password, atau developer mode.

## Fitur utama

### Patient

- Registrasi aman dan login berbasis JWT.
- Profil personal, kontak darurat, dan profil medis.
- Pencarian dokter berdasarkan nama, spesialisasi, lokasi, serta hari praktik.
- Slot tersedia yang otomatis mengabaikan waktu yang sudah dipesan.
- Booking dengan layar konfirmasi dan unggahan JPG, PNG, atau PDF tervalidasi.
- Riwayat, detail, pembatalan, dan reschedule appointment.
- Rekam konsultasi, rekomendasi, resep, dan tanggal follow-up.
- Notifikasi serta support case yang terhubung ke appointment.
- Pengajuan akun menjadi dokter.

### Doctor

- Dashboard appointment dan antrean berdasarkan status.
- Approve atau reject permintaan booking.
- Akses terbatas ke profil medis dan dokumen pasien yang ditangani.
- Pencatatan diagnosis, ringkasan kunjungan, resep, rekomendasi, dan follow-up.
- Penyelesaian appointment hanya setelah waktu konsultasi.
- Pengelolaan profil, biaya konsultasi, lokasi, dan jadwal praktik.
- Notifikasi dan support case.

### Admin

- Dashboard statistik operasional.
- Review, approve, dan reject pengajuan dokter.
- Monitoring user, doctor, dan seluruh appointment.
- Deactivate/reactivate akun tanpa menghapus histori.
- Pengelolaan support case, prioritas, status, dan respons admin.
- Pengaturan lead time, kebijakan pembatalan, reminder, kontak support, privacy, terms, dan maintenance notice.
- Akses appointment admin telah meredaksi dokumen dan data medis sensitif.

## Teknologi dan arsitektur

| Lapisan | Teknologi |
|---|---|
| Frontend | React 19, Vite, React Router, Axios, React Bootstrap, Phosphor Icons |
| Backend | Node.js, Express 5, pola MVC, REST API |
| Database | MongoDB dan Mongoose |
| Authentication | JWT dan bcrypt |
| File handling | Multer dengan validasi ekstensi, MIME, signature, dan batas 5 MB |
| Quality | Node test runner, Oxlint, production build, Selenium smoke test |

Struktur utama:

```text
client/src/
  assets/        aset frontend
  components/    komponen global dan navigasi
  context/       authentication dan theme state
  pages/         halaman public, patient, doctor, admin
  services/      Axios API client

server/
  controllers/   logika request dan response
  middleware/    auth, RBAC, upload, error handling
  models/        schema MongoDB
  routes/        endpoint REST
  services/      reminder dan delivery adapter
  tests/         automated unit tests
  utils/         seeder, validation, cache, migration
```

## Persyaratan sistem

- Node.js 20.19 atau lebih baru.
- npm 10 atau lebih baru.
- MongoDB lokal/Atlas, atau mode in-memory untuk demo.
- Browser modern seperti Chrome atau Firefox.

## Menjalankan proyek

### Opsi 1 - Demo cepat dengan database in-memory

Mode ini tidak memerlukan instalasi MongoDB. Data bersifat sementara dan akan di-reset saat server berhenti.

1. Siapkan backend.

```powershell
cd server
npm install
Copy-Item .env.example .env
```

2. Atur nilai berikut di `server/.env`.

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
USE_IN_MEMORY_DB=true
MONGO_MEMORY_PORT=27018
JWT_SECRET=replace-with-a-long-random-development-secret
```

3. Nyalakan API.

```powershell
npm run dev
```

4. Buka terminal baru dan nyalakan frontend.

```powershell
cd client
npm install
npm run dev
```

5. Buka `http://localhost:5173`.

### Opsi 2 - MongoDB persisten

Atur `USE_IN_MEMORY_DB=false` dan `MONGO_URI` pada `server/.env`, lalu jalankan:

```powershell
cd server
npm install
node utils/seedDummyData.js
npm run seed:testers
npm run migrate
npm run dev
```

Seeder tester bersifat idempotent: akun tester dibuat bila belum ada dan password ketiganya di-reset ke password pada tabel akun tester. Seeder ditolak saat `NODE_ENV=production`.

## Environment variables

Gunakan `server/.env.example` sebagai acuan. Variabel utama:

| Variable | Wajib | Keterangan |
|---|---|---|
| `PORT` | Tidak | Port API, default `5000` |
| `MONGO_URI` | Ya* | URI MongoDB; tidak diperlukan pada mode in-memory |
| `USE_IN_MEMORY_DB` | Tidak | `true` hanya untuk demo/development lokal |
| `MONGO_MEMORY_PORT` | Tidak | Port MongoDB sementara |
| `JWT_SECRET` | Ya | Secret JWT; gunakan nilai acak yang panjang |
| `JWT_EXPIRES_IN` | Tidak | Masa aktif token, default `7d` |
| `CLIENT_URL` | Ya | Origin frontend yang diizinkan CORS |
| `RESEND_API_KEY` | Tidak | Mengaktifkan email melalui Resend |
| `TWILIO_ACCOUNT_SID` | Tidak | Mengaktifkan SMS bersama variabel Twilio lainnya |
| `REMINDER_INTERVAL_MS` | Tidak | Interval pemeriksaan reminder |

Tanpa kredensial Resend/Twilio, notifikasi in-app tetap berfungsi. Delivery email/SMS dicatat sebagai `skipped`, bukan dilaporkan berhasil secara palsu.

## Verifikasi kualitas

Backend:

```powershell
cd server
npm test
```

Frontend:

```powershell
cd client
npm run lint
npm run build
```

Audit role end-to-end dengan API dan MongoDB sementara:

```powershell
powershell -ExecutionPolicy Bypass -File .runtime/run_final_role_audit.ps1
```

Audit final 8 Oktober 2026 mencakup:

- 16 kelompok skenario API end-to-end lintas patient, doctor, dan admin.
- Registrasi, profil, password, doctor application, approval/rejection, booking, upload, reschedule, cancel, complete, clinical record, support case, settings, notifikasi, dan account lifecycle.
- Ownership dan RBAC negatif, termasuk isolasi dokumen dan redaksi data medis untuk admin.
- 52 pemeriksaan halaman pada desktop light mode dan mobile dark mode tanpa fatal render error, console error, route mismatch, atau horizontal overflow.
- Dark mode persistence, logout, portrait dokter, banner, dan booking confirmation modal.

Matriks traceability lengkap tersedia di [docs/COMPLIANCE_AUDIT.md](docs/COMPLIANCE_AUDIT.md). Requirement sumber tersedia di [docs/REQUIRMENT.md](docs/REQUIRMENT.md).

## Keamanan yang telah diterapkan

- JWT authentication dan role-based access control.
- Password tersimpan sebagai bcrypt hash.
- Pemeriksaan ownership untuk appointment, notification, support case, dan file.
- Akun nonaktif ditolak pada login maupun request dengan token lama.
- Helmet, CORS allowlist, request limit, auth rate limit, dan payload limit.
- Validasi slot di server serta unique booking key untuk mencegah double booking.
- File upload diberi nama acak, dibatasi 5 MB, diverifikasi dari isi file, dan tidak disajikan sebagai folder publik.
- Data medis tidak ditampilkan pada endpoint oversight admin.

## Catatan produksi

DOCVIA siap untuk demo dan evaluasi capstone. Sebelum menangani data kesehatan nyata, deployment perlu melengkapi TLS, backup/restore, secret rotation, immutable audit log, malware scanning, monitoring, data-retention policy, distributed rate limiting/cache, serta kajian regulasi perlindungan data yang berlaku.
