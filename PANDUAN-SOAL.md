# Panduan Membuat & Memasukkan Soal

## Cara termudah: menu "📥 Soal" di dalam game (Excel / CSV)
1. Klik **📥 Soal** di pojok kanan atas game, lalu **Unduh template Excel**.
2. Buka di Excel. Isi satu soal per baris: **Mapel, Tingkat (1/2/3), Pertanyaan, A, B, C, D, Jawaban (huruf), Pembahasan**.
   Nama mapel boleh singkat (mis. `Matematika`, `IPA`, `Bahasa Inggris`, `PJOK`, `Seni`). Sheet "Petunjuk" di template menjelaskan semuanya.
3. Simpan, lalu klik **Pilih file** di menu yang sama. Game melaporkan berapa soal masuk dan baris mana yang salah.
- Soal yang diunggah **tersimpan di browser perangkat itu saja**. Supaya semua pemain mendapat soal yang sama, salin soalnya ke `data/soal.js` (cara di bawah) dan unggah ulang ke GitHub.
- File Word (.docx) belum didukung; salin tabelnya ke Excel dulu. Kalau Excel tidak terbaca, simpan sebagai **CSV** lalu unggah.

## Cara permanen: edit `data/soal.js`

Semua soal ada di `data/soal.js`. Satu soal = satu baris:

```js
S(tingkat, "Pertanyaan?", ["Opsi A", "Opsi B", "Opsi C", "Opsi D"], nomorJawabanBenar, "Pembahasan singkat."),
```

- **tingkat**: `1` = Anak (PAUD–SD), `2` = Pelajar (SMP–SMA), `3` = Umum/Dewasa.
- **nomorJawabanBenar** dimulai dari **0** (opsi A = 0, B = 1, C = 2, D = 3).
- Letakkan baris baru di dalam daftar `soal: [ ... ]` gedung yang sesuai. Setiap baris diakhiri koma, kecuali yang terakhir.
- Jika mengetik tanda kutip di dalam teks, tulis `\"`. Contoh: `"Lawan kata \"besar\" adalah …"`.
- Ingin gedung baru? Salin satu blok gedung, ganti `id` (unik), `nama`, `ikon`, `warna`, dan posisi `x`, `z`. Jaga jarak ±20 dari gedung lain dan jangan keluar dari −44…44.

## Target jumlah
Minimal **20 soal per tingkat per gedung** (game memilih acak 5 tiap kunjungan). Total satu gedung = ±60 soal.

## Cara menulis soal yang baik
1. Satu soal menguji satu hal. Hindari pertanyaan ganda.
2. Pengecoh (opsi salah) harus masuk akal, bukan asal. Contoh: untuk 7 × 8 pakai 54, 56, 58, 64.
3. Panjang opsi dibuat mirip; jawaban benar jangan selalu paling panjang.
4. Sebar posisi jawaban benar (A/B/C/D). Game mengacak urutan opsi, tapi tetap isi bervariasi.
5. Pembahasan 1 kalimat: *mengapa* jawabannya benar, bukan sekadar mengulang jawabannya.
6. Hindari data yang cepat berubah (jabatan, jumlah penduduk, rekor).

## Pedoman per tingkat
| Tingkat | Bahasa | Contoh materi |
|---|---|---|
| 1 Anak | Kalimat pendek, kata sehari-hari | berhitung dasar, hewan & tumbuhan, warna, bangun datar, Pancasila & simbol negara |
| 2 Pelajar | Istilah pelajaran | pecahan, persamaan, sel & sistem tubuh, sejarah nasional, tata bahasa, geografi |
| 3 Umum | Penalaran & konteks nyata | aljabar/kalkulus dasar, kimia/fisika, ekonomi, literasi digital, hukum & kewarganegaraan |

## Memakai AI untuk membuat soal lebih cepat
Salin perintah ini ke asisten AI (isi bagian dalam kurung siku), lalu tempel hasilnya ke `soal.js`:

```
Buatkan 20 soal pilihan ganda mata pelajaran [MAPEL], materi [TOPIK], untuk tingkat [1/2/3].
Format tiap soal tepat satu baris:
S(TINGKAT, "pertanyaan", ["opsi A", "opsi B", "opsi C", "opsi D"], NOMOR_JAWABAN_BENAR_MULAI_DARI_0, "pembahasan satu kalimat"),
Aturan: 4 opsi, tidak ada opsi yang sama, jawaban benar tersebar merata, pengecoh masuk akal, bahasa Indonesia baku.
Tanda kutip di dalam teks ditulis \".  Jangan beri teks lain selain baris soal.
```
**Tetap periksa faktanya sendiri** sebelum dipakai; AI bisa salah.

## Pemeriksa otomatis
Saat game dibuka, setiap soal dicek. Soal yang salah format (jawaban di luar opsi, opsi kembar, tingkat bukan 1–3, dll.) **dilewati**, muncul peringatan kuning di layar, dan rinciannya ada di Console browser (tekan **F12** → tab Console). Perbaiki barisnya, simpan, lalu muat ulang halaman.

Jika layar kosong/game tidak mau jalan setelah mengedit, hampir selalu penyebabnya koma atau kurung yang kurang di `soal.js`. Buka Console (F12) untuk melihat nomor barisnya.

## Ingin progres dari awal?
Progres tersimpan di browser. Untuk mengulang dari nol: F12 → Application → Local Storage → hapus `ge3d-v2`, lalu muat ulang.
