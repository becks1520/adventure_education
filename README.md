# Game Edukasi 3D

Jelajahi peta 3D, masuk ke gedung, lalu jawab kuis. Tiap gedung = satu mata pelajaran.

## Cara menjalankan
1. Ekstrak zip, lalu **klik dua kali `index.html`** (butuh internet untuk memuat Three.js).
2. Mode offline: unduh Three.js **r128** (`three.min.js`) dan simpan di `lib/three.min.js`.

## Kontrol
- Komputer: **W A S D** / tombol panah = jalan, **E** = masuk gedung, **Esc** = tutup kuis, **1-4** atau **A-D** = pilih jawaban.
- HP / tablet: tombol arah di layar, ketuk kotak kuning untuk masuk gedung.

## Menambah / mengubah soal
Edit `data/soal.js`. Tiap gedung punya `nama`, `ikon`, `warna`, posisi `x`/`z`, dan daftar `soal`.
`jawaban` adalah nomor opsi yang benar (mulai dari 0). Gedung baru otomatis muncul di peta.

## Penilaian
Benar di percobaan pertama = 10 poin, setelah salah dulu = 5 poin. Mengulang gedung yang sudah selesai = latihan tanpa poin.
