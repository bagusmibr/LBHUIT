# Leaderboard HUIT Standalone

Proyek ini adalah dashboard KPI Leaderboard mandiri yang dipisahkan dari Landing Page utama.

## Fitur Utama
- **Real-time Sync**: Mengambil data langsung dari Google Sheets via API Google Apps Script.
- **Auto-Refresh**: Data diperbarui otomatis setiap 5 menit.
- **Efek Premium**: Glow effect untuk skor tertinggi (Best Overall) dan animasi count-up.
- **Export sebagai Gambar**: Tombol 📸 untuk mendownload dashboard sebagai file PNG.
- **Mobile Responsive**: Tampilan optimal di desktop maupun handphone.

## Struktur Folder
- `index.html`: Halaman utama dashboard.
- `css/style.css`: File styling (Khusus Leaderboard).
- `js/kpi.js`: Logika aplikasi dan sinkronisasi data.
- `data/kpi.json`: File data lokal (fallback).
- `update_leaderboard.py`: Script Python untuk update data manual dari CSV.

## Cara Hosting (GitHub Pages)
1. Buat repository baru di GitHub bernama `leaderboardHUIT`.
2. Upload semua file dalam folder ini ke repository tersebut.
3. Masuk ke **Settings** > **Pages** di repository GitHub Anda.
4. Pilih branch `main` (atau `master`) dan folder `/ (root)`.
5. Dashboard Anda akan aktif dalam beberapa menit!

## Cara Update Data Manual
Jika API Google Sheets tidak digunakan, Anda bisa mengupdate data lewat file:
1. Simpan database Anda sebagai `Rapor_KPI.csv` di folder ini.
2. Jalankan `python update_leaderboard.py`.
3. File `data/kpi.json` akan terupdate otomatis.
