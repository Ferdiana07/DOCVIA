# Audit kesesuaian DOCVIA

Tanggal audit akhir: 8 Oktober 2026  
Dokumen acuan: spesifikasi DOCVIA yang dilampirkan ke proyek.

## Kesimpulan

DOCVIA telah memenuhi seluruh alur fungsional utama pada requirement: tiga peran dengan RBAC, profil pasien dan medis, pencarian dokter, ketersediaan slot aktual, booking dengan dokumen, konfirmasi dan reminder, dashboard dokter, rekam konsultasi, approval dan governance admin, cancel/reschedule/history, notifikasi, caching, contoh load balancing, pola MVC, dan automated unit test.

Email dan SMS memakai adapter produksi yang aktif saat kredensial Resend/Twilio diisi. Tanpa kredensial, notifikasi in-app tetap berfungsi dan pengiriman eksternal dilaporkan sebagai `skipped`, bukan dipalsukan sebagai berhasil.

## Matriks kesesuaian

| Area | Status | Implementasi |
|---|---|---|
| React + Axios | Sesuai | React 19, route-level lazy loading, instance Axios dan interceptor. |
| Bootstrap | Sesuai | Bootstrap 5 dan React Bootstrap menjadi satu sistem komponen. |
| Material UI | Deviasi terkontrol | Tidak dicampur dengan Bootstrap untuk menjaga konsistensi, aksesibilitas, dan ukuran bundle. |
| Moment.js | Deviasi terkontrol | Diganti API `Date`/`Intl` native untuk menghindari dependency legacy yang tidak diperlukan. |
| Express + MongoDB/Mongoose | Sesuai | REST API, model terpisah, indeks pencarian dan slot aktif. |
| JWT + bcrypt | Sesuai | Autentikasi stateless, password hash, akun nonaktif ditolak. |
| MVC | Sesuai | Model, controller, route, middleware, service, dan utility dipisah. |
| RBAC pasien/dokter/admin | Sesuai | Middleware role dan pemeriksaan ownership per resource. |
| Registrasi | Sesuai | Self-registration hanya pasien; admin dibuat via seed agar tidak ada privilege escalation. |
| Profil personal dan medis | Sesuai | DOB, gender, alamat, kontak darurat, golongan darah, alergi, kondisi kronis, obat. |
| Browse/filter dokter | Sesuai | Nama, spesialisasi, lokasi, dan hari praktik. |
| Ketersediaan aktual | Sesuai | `/doctors/:id/available-slots` menghapus slot terisi dan menerapkan lead time. |
| Booking + dokumen | Sesuai | Validasi schedule, konflik pasien/dokter, indeks booking unik, verifikasi signature file, pembersihan upload gagal, dan download khusus pasien pemilik/dokter terkait. |
| Cancel/reschedule/history | Sesuai | Cutoff dapat dikonfigurasi, reschedule kembali pending, audit trail tersimpan. |
| Konfirmasi/reminder | Sesuai | In-app selalu aktif; email via Resend dan SMS via Twilio bila dikonfigurasi; scheduler 24h/2h idempotent. |
| Dashboard dokter | Sesuai | Jadwal, approval/reject/complete, profil dan availability. |
| Rekam konsultasi | Sesuai | Diagnosis, ringkasan, resep, rekomendasi, follow-up dan konteks medis pasien. |
| Admin approval/oversight | Sesuai | Dokter, user, appointment, deactivate/reactivate akun, statistik. |
| Platform settings | Sesuai | Lead time, cancellation, reminders, maintenance notice, support, privacy/terms. |
| Dispute management | Sesuai | Pasien/dokter membuka kasus; admin mengatur prioritas, status, dan respons. |
| Caching | Sesuai untuk satu node | TTL cache untuk direktori dokter dengan invalidasi saat data berubah. Redis direkomendasikan saat multi-region. |
| Load balancing | Siap deploy | PM2 cluster config dan contoh Nginx `least_conn` tersedia. Scheduler memakai atomic claim agar aman pada beberapa worker. |
| Automated test | Sesuai | Node test runner menguji parsing tanggal, slot, grid jadwal, konflik slot, upload, dan cache; audit API lintas-role menjalankan 16 kelompok skenario end-to-end. |
| UI/UX dan aksesibilitas | Sesuai | Responsive, auto dark mode, skip link, focus-visible, target 44px, reduced motion, loading/error/empty states. |

## Bukti audit final

- 16 kelompok skenario API end-to-end lulus pada MongoDB sementara yang terisolasi.
- 52 pemeriksaan halaman lulus pada desktop light mode dan mobile dark mode untuk public, patient, doctor, dan admin.
- Dark mode persistence, logout, gambar dokter/banner, dan booking confirmation modal lulus pada browser automation.
- Developer/tester shortcut telah dihapus sepenuhnya dari UI login; akun QA hanya didokumentasikan pada README.

## Catatan produksi

Sebelum memproses data kesehatan nyata, organisasi tetap perlu menetapkan regulasi target (misalnya kebijakan perlindungan data setempat), data retention, backup/restore, audit log immutable, antivirus/file scanning, rate limiting terdistribusi, rotasi secret, TLS, observability, dan perjanjian pemrosesan data dengan provider email/SMS. Ini adalah kebutuhan operasional dan legal, bukan gap pada alur produk lokal.

## Verifikasi

```bash
cd server
npm test
npm run migrate

cd ../client
npm run lint
npm run build
```
