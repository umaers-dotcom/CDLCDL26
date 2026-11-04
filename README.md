# Cakratama Dormitory League (CDL)

Frontend React + Vite + Tailwind CSS 4. Login admin memakai Firebase
Authentication; seluruh data kompetisi dibaca dan disimpan melalui Firestore.

## Jalankan

```bash
npm install
npm run dev
```

Buka URL yang ditampilkan Vite, biasanya `http://localhost:5173`.

## Konfigurasi Firebase

1. Konfigurasi Firebase Web App tersedia pada `.env` lokal.
2. Jika menggunakan project lain, salin `.env.example` ke `.env` dan isi nilainya dari Firebase Console.
3. Aktifkan provider Email/Password di Firebase Authentication.
4. Tambahkan domain dev aplikasi (biasanya `localhost`) ke Authorized domains.
5. Untuk setiap admin, buat dokumen `admins/{uid}` di Firestore dengan field `role: "admin"`.
6. Deploy `firestore.rules` ke project sebelum menggunakan aplikasi:

   ```bash
   firebase deploy --only firestore:rules
   ```

Jangan commit `.env`. Firebase web API key bersifat publik untuk aplikasi web;
akses data tetap harus dilindungi Firestore Security Rules.

## Data Firestore

Koleksi yang digunakan: `rooms`, `members`, `events`, `results`, `points`,
`mvpAwards`, dan `pointSettings`. Perubahan admin langsung tersimpan ke
Firestore; leaderboard, statistik, halaman detail, dan riwayat membaca data
yang sama secara realtime. Hasil dan penghargaan dengan status `Published`
dapat dibaca publik. Penulisan data memerlukan admin terverifikasi.

Saat ini aplikasi membaca isi koleksi yang sudah ada dan tidak otomatis
mengunggah data contoh lokal sebelumnya. Tambahkan dokumen awal melalui Admin
Panel atau Firebase Console jika koleksinya masih kosong.

## Build

```bash
npm run build
```

Folder hasil build ada di `dist/`.
