# Game Edukasi 3D

Jelajahi peta 3D, masuk ke gedung, lalu jawab kuis. Tiap gedung = satu mata pelajaran.

## Cara menjalankan
1. Ekstrak zip, lalu **klik dua kali `index.html`** (butuh internet untuk memuat Three.js).
2. Mode offline: unduh Three.js **r128** (`three.min.js`) dan simpan di `lib/three.min.js`.

## Kontrol
- Komputer: **W A S D** / tombol panah = jalan (searah pandangan kamera), **geser mouse** atau **Q / R** = putar kamera 360°, roda mouse = zoom, **Spasi** = lompat, **E** = masuk gedung, **Esc** = tutup kuis, **1-4** atau **A-D** = pilih jawaban.
- HP / tablet: tombol **LOMPAT** di kanan bawah; **geser layar** (di luar joystik) = putar kamera 360°; joystik bulat di kiri bawah (makin jauh digeser, makin cepat), ketuk kotak kuning untuk masuk gedung.
- Menu **☰** (kanan atas): Misi, Karakter, Unggah Soal, Tingkat, Suara, Kembali ke taman, dan **Pengaturan & reset**.
- Progres tersimpan otomatis di browser. Jika setelah upload ke GitHub tampilan masih lama: buka alamat game dengan tambahan `?v=4` di belakangnya, atau tekan Ctrl+F5.

## Menambah / mengubah soal
Edit `data/soal.js`. Tiap gedung punya `nama`, `ikon`, `warna`, posisi `x`/`z`, dan daftar `soal`.
`jawaban` adalah nomor opsi yang benar (mulai dari 0). Gedung baru otomatis muncul di peta.

## Penilaian
Benar di percobaan pertama = 10 poin, setelah salah dulu = 5 poin. Mengulang gedung yang sudah selesai = latihan tanpa poin.

## Karakter & toko
Saat pertama main, pilih nama dan jenis karakter (laki-laki / perempuan). Koin bisa dibelikan baju, motif, celana, topi, dan aksesori di menu **☰ → Karakter**.
