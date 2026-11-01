// ============================================================
//  DATA SOAL — satu gedung = satu mata pelajaran (12 mapel nasional SD–SMA).
//  Cara termudah menambah soal: pakai menu "📥 Soal" di dalam game (Excel/CSV).
//  Cara permanen: tambah baris S(...) di bawah, lalu unggah ulang file ini.
//
//  S(tingkat, pertanyaan, [opsi], nomorJawabanBenar, pembahasan)
//  Tingkat: 1 = Anak (PAUD–SD), 2 = Pelajar (SMP–SMA), 3 = Umum / Dewasa
//  Nomor jawaban mulai dari 0. Posisi gedung diatur otomatis (melingkar).
// ============================================================
const S = (t, q, o, j, p) => ({ t: t, pertanyaan: q, opsi: o, jawaban: j, pembahasan: p });

const DATA_SOAL = {
  gedung: [
    { id: "agama", nama: "Pendidikan Agama & Budi Pekerti", ikon: "🙏", warna: "#14b8a6", soal: [
      S(1, "Sebelum makan, kita dianjurkan untuk …", ["Berdoa", "Berlari", "Bermain", "Tidur"], 0, "Berdoa sebelum makan adalah wujud syukur."),
      S(2, "Sikap menghargai perbedaan keyakinan disebut …", ["Toleransi", "Egois", "Iri hati", "Sombong"], 0, "Toleransi berarti menghormati perbedaan."),
      S(3, "Kebebasan memeluk agama dijamin oleh UUD 1945 pasal …", ["Pasal 27", "Pasal 28", "Pasal 29", "Pasal 33"], 2, "Pasal 29 UUD 1945 menjamin kemerdekaan memeluk agama.")
    ]},
    { id: "pancasila", nama: "Pendidikan Pancasila", ikon: "🦅", warna: "#b91c1c", soal: [
      S(1, "Sila pertama Pancasila berbunyi …", ["Ketuhanan Yang Maha Esa", "Persatuan Indonesia", "Keadilan sosial", "Kemanusiaan yang adil dan beradab"], 0, "Sila ke-1: Ketuhanan Yang Maha Esa."),
      S(2, "Lambang sila ketiga Pancasila adalah …", ["Bintang", "Rantai", "Pohon beringin", "Kepala banteng"], 2, "Sila ke-3 berlambang pohon beringin."),
      S(3, "Lembaga yang membuat undang-undang bersama Presiden adalah …", ["DPR", "KPK", "BPK", "MA"], 0, "DPR memegang fungsi legislasi bersama Presiden.")
    ]},
    { id: "bin", nama: "Bahasa Indonesia", ikon: "📚", warna: "#f59e0b", soal: [
      S(1, "Lawan kata \"besar\" adalah …", ["Kecil", "Luas", "Tinggi", "Panjang"], 0, "Lawan kata besar adalah kecil."),
      S(1, "Awal kalimat ditulis dengan huruf …", ["Kecil", "Kapital", "Miring", "Tebal"], 1, "Awal kalimat memakai huruf kapital."),
      S(1, "Kata yang artinya sama dengan \"cantik\" adalah …", ["Indah", "Buruk", "Kotor", "Sedih"], 0, "Cantik bersinonim dengan indah."),
      S(2, "Sinonim dari \"pandai\" adalah …", ["Bodoh", "Pintar", "Malas", "Rajin"], 1, "Pandai dan pintar bermakna sama."),
      S(2, "Manakah kalimat yang baku?", ["Saya mau pergi ke pasar sama ibu.", "Saya pergi ke pasar bersama ibu.", "Gue pergi ke pasar ama ibu.", "Aku pergi pasar sama ibuku."], 1, "Kalimat baku memakai kata sesuai kaidah, seperti \"bersama\"."),
      S(2, "Penulisan kata baku yang benar adalah …", ["Analisa", "Praktek", "Apotek", "Resiko"], 2, "Bentuk baku: analisis, praktik, apotek, risiko."),
      S(3, "Majas yang membandingkan memakai kata \"seperti\" disebut …", ["Metafora", "Simile", "Hiperbola", "Personifikasi"], 1, "Simile (perumpamaan) memakai seperti, bagai, laksana."),
      S(3, "Imbuhan di awal kata disebut …", ["Sufiks", "Prefiks", "Infiks", "Konfiks"], 1, "Prefiks = awalan, contoh me-, ber-."),
      S(3, "Gagasan utama sebuah paragraf disebut …", ["Kalimat penjelas", "Ide pokok", "Kesimpulan", "Judul"], 1, "Ide pokok adalah gagasan utama paragraf.")
    ]},
    { id: "mat", nama: "Matematika", ikon: "🔢", warna: "#e11d48", soal: [
      S(1, "2 + 3 = ?", ["4", "5", "6", "7"], 1, "2 ditambah 3 sama dengan 5."),
      S(1, "10 − 4 = ?", ["5", "6", "7", "8"], 1, "10 dikurangi 4 sama dengan 6."),
      S(1, "Berapa jumlah sisi segitiga?", ["2", "3", "4", "5"], 1, "Segitiga punya 3 sisi."),
      S(2, "15 × 4 = ?", ["50", "60", "65", "70"], 1, "15 dikali 4 sama dengan 60."),
      S(2, "144 : 12 = ?", ["11", "12", "13", "14"], 1, "12 × 12 = 144."),
      S(2, "1/2 + 1/4 = ?", ["2/6", "3/4", "1/6", "2/4"], 1, "1/2 = 2/4, jadi 2/4 + 1/4 = 3/4."),
      S(3, "Nilai x pada 3x + 5 = 20 adalah …", ["3", "4", "5", "6"], 2, "3x = 15, sehingga x = 5."),
      S(3, "Keliling lingkaran berjari-jari 7 (π = 22/7) adalah …", ["22", "44", "154", "308"], 1, "K = 2πr = 2 × 22/7 × 7 = 44."),
      S(3, "Turunan dari x² adalah …", ["x", "2x", "x²", "2"], 1, "Turunan xⁿ adalah n·xⁿ⁻¹, jadi 2x.")
    ]},
    { id: "ipas", nama: "IPAS (IPA & IPS Terpadu)", ikon: "🌱", warna: "#84cc16", soal: [
      S(1, "Hewan yang dijuluki raja hutan adalah …", ["Singa", "Kelinci", "Rusa", "Kuda"], 0, "Singa dijuluki raja hutan."),
      S(2, "Proses tumbuhan membuat makanan dengan bantuan cahaya matahari disebut …", ["Respirasi", "Fotosintesis", "Fermentasi", "Transpirasi"], 1, "Fotosintesis menghasilkan makanan dan oksigen."),
      S(3, "Komponen biotik dalam ekosistem adalah …", ["Air", "Tanah", "Makhluk hidup", "Cahaya"], 2, "Biotik = makhluk hidup; abiotik = benda tak hidup.")
    ]},
    { id: "ipa", nama: "IPA (Biologi, Fisika, Kimia)", ikon: "🔬", warna: "#3b82f6", soal: [
      S(1, "Kita melihat dengan menggunakan …", ["Telinga", "Mata", "Hidung", "Lidah"], 1, "Mata adalah indra penglihatan."),
      S(1, "Matahari terbit dari arah …", ["Barat", "Timur", "Utara", "Selatan"], 1, "Matahari terbit di timur dan terbenam di barat."),
      S(1, "Air yang membeku berubah menjadi …", ["Uap", "Es", "Awan", "Hujan"], 1, "Air yang membeku menjadi es."),
      S(2, "Planet yang paling dekat dengan Matahari adalah …", ["Merkurius", "Venus", "Bumi", "Mars"], 0, "Merkurius adalah planet pertama dari Matahari."),
      S(2, "Hewan pemakan tumbuhan disebut …", ["Karnivora", "Herbivora", "Omnivora", "Insektivora"], 1, "Herbivora memakan tumbuhan, misalnya sapi."),
      S(2, "Air murni mendidih pada suhu … (permukaan laut)", ["50 °C", "80 °C", "100 °C", "120 °C"], 2, "Titik didih air adalah 100 °C."),
      S(3, "Organel penghasil energi (ATP) dalam sel adalah …", ["Ribosom", "Mitokondria", "Nukleus", "Lisosom"], 1, "Mitokondria disebut 'pembangkit tenaga' sel."),
      S(3, "Satuan gaya dalam SI adalah …", ["Joule", "Newton", "Watt", "Pascal"], 1, "Gaya diukur dalam Newton (N)."),
      S(3, "Rumus kimia garam dapur adalah …", ["H₂O", "NaCl", "CO₂", "KCl"], 1, "Garam dapur = natrium klorida (NaCl).")
    ]},
    { id: "ips", nama: "IPS (Sejarah, Geografi, Ekonomi, Sosiologi)", ikon: "🌏", warna: "#d97706", soal: [
      S(1, "Lambang negara Indonesia adalah …", ["Garuda Pancasila", "Elang", "Harimau", "Banteng"], 0, "Lambang negara kita adalah Garuda Pancasila."),
      S(1, "Bendera Indonesia berwarna …", ["Putih di atas, merah di bawah", "Merah di atas, putih di bawah", "Merah dan biru", "Hijau dan putih"], 1, "Sang Saka Merah Putih: merah di atas, putih di bawah."),
      S(1, "Hari Kemerdekaan Indonesia diperingati setiap tanggal …", ["17 Agustus", "1 Juni", "28 Oktober", "10 November"], 0, "Kemerdekaan diperingati setiap 17 Agustus."),
      S(2, "Proklamasi kemerdekaan Indonesia dibacakan pada tahun …", ["1942", "1945", "1950", "1965"], 1, "Proklamasi dibacakan pada 17 Agustus 1945."),
      S(2, "Samudra terluas di dunia adalah …", ["Atlantik", "Hindia", "Pasifik", "Arktik"], 2, "Samudra Pasifik adalah yang terluas."),
      S(2, "Sumpah Pemuda diikrarkan pada tahun …", ["1908", "1928", "1945", "1966"], 1, "Sumpah Pemuda: 28 Oktober 1928."),
      S(3, "Kelangkaan dalam ekonomi terjadi karena …", ["Kebutuhan sangat sedikit", "Sumber daya terbatas sedangkan kebutuhan tak terbatas", "Harga turun", "Produksi berlebih"], 1, "Sumber daya terbatas, kebutuhan manusia tidak terbatas."),
      S(3, "Konferensi Asia Afrika 1955 diadakan di kota …", ["Jakarta", "Bandung", "Yogyakarta", "Surabaya"], 1, "KAA 1955 berlangsung di Bandung."),
      S(3, "Inflasi adalah …", ["Kenaikan harga barang secara umum dan terus-menerus", "Turunnya nilai ekspor", "Naiknya pajak", "Bertambahnya penduduk"], 0, "Inflasi = kenaikan harga umum yang terus-menerus.")
    ]},
    { id: "ing", nama: "Bahasa Inggris", ikon: "🔤", warna: "#8b5cf6", soal: [
      S(1, "Bahasa Inggris dari \"kucing\" adalah …", ["Dog", "Cat", "Bird", "Fish"], 1, "Kucing = cat."),
      S(1, "\"Red\" artinya …", ["Biru", "Hijau", "Merah", "Kuning"], 2, "Red = merah."),
      S(1, "\"Good morning\" diucapkan pada …", ["Pagi", "Siang", "Sore", "Malam"], 0, "Good morning = selamat pagi."),
      S(2, "I ___ a student.", ["is", "am", "are", "be"], 1, "Subjek I memakai am."),
      S(2, "Bentuk lampau (past) dari \"go\" adalah …", ["Goed", "Went", "Gone", "Going"], 1, "Go – went – gone."),
      S(2, "Lawan kata \"hot\" adalah …", ["Cold", "Big", "Fast", "Dry"], 0, "Hot (panas) lawannya cold (dingin)."),
      S(3, "She ___ been working here since 2020.", ["have", "has", "is", "was"], 1, "She + present perfect memakai has."),
      S(3, "Arti idiom \"break a leg\" adalah …", ["Patah kaki", "Semoga sukses", "Berhati-hati", "Berlari cepat"], 1, "Dipakai untuk mengucapkan semoga sukses."),
      S(3, "If I ___ you, I would study harder.", ["am", "was", "were", "be"], 2, "Pengandaian (conditional type 2) memakai were.")
    ]},
    { id: "pjok", nama: "PJOK (Olahraga & Kesehatan)", ikon: "⚽", warna: "#f97316", soal: [
      S(1, "Olahraga yang bolanya ditendang ke gawang adalah …", ["Sepak bola", "Renang", "Catur", "Lompat tali"], 0, "Sepak bola dimainkan dengan menendang bola ke gawang."),
      S(2, "Olahraga yang memakai raket dan kok adalah …", ["Bulu tangkis", "Sepak bola", "Renang", "Bola voli"], 0, "Bulu tangkis dimainkan dengan raket dan kok."),
      S(3, "Pedoman gizi seimbang dari Kemenkes disebut …", ["Isi Piringku", "Makan sekenyangnya", "Hanya sayur", "Hanya protein"], 0, "Isi Piringku menunjukkan porsi makanan seimbang.")
    ]},
    { id: "seni", nama: "Seni dan Budaya", ikon: "🎨", warna: "#ec4899", soal: [
      S(1, "Alat musik yang dipukul adalah …", ["Drum", "Biola", "Seruling", "Gitar"], 0, "Drum dimainkan dengan cara dipukul."),
      S(2, "Alat musik angklung berasal dari daerah …", ["Jawa Barat", "Sumatra Utara", "Bali", "Papua"], 0, "Angklung berasal dari Jawa Barat (Sunda)."),
      S(3, "Tari Saman berasal dari provinsi …", ["Aceh", "Bali", "Jawa Timur", "Sulawesi Selatan"], 0, "Tari Saman berasal dari Aceh (Gayo).")
    ]},
    { id: "informatika", nama: "Informatika", ikon: "💻", warna: "#0891b2", soal: [
      S(1, "Alat untuk mengetik pada komputer adalah …", ["Keyboard", "Monitor", "Speaker", "Printer"], 0, "Keyboard dipakai untuk mengetik."),
      S(2, "Singkatan CPU adalah …", ["Central Processing Unit", "Computer Power Unit", "Central Program Utility", "Core Process Unit"], 0, "CPU = Central Processing Unit, 'otak' komputer."),
      S(3, "Protokol yang mengamankan situs web (ikon gembok) adalah …", ["HTTP", "HTTPS", "FTP", "SMTP"], 1, "HTTPS mengenkripsi data antara browser dan situs.")
    ]},
    { id: "pkwu", nama: "Prakarya & Kewirausahaan", ikon: "🛠️", warna: "#92400e", soal: [
      S(1, "Membuat kerajinan dari barang bekas disebut …", ["Daur ulang", "Membakar", "Membuang", "Menimbun"], 0, "Daur ulang memanfaatkan kembali barang bekas."),
      S(2, "Uang yang dipakai untuk memulai usaha disebut …", ["Modal", "Pajak", "Gaji", "Denda"], 0, "Modal adalah dana awal untuk menjalankan usaha."),
      S(3, "Laba (keuntungan) dihitung dengan …", ["Pendapatan − biaya", "Pendapatan + biaya", "Biaya − pendapatan", "Pendapatan × biaya"], 0, "Laba = total pendapatan dikurangi total biaya.")
    ]}
  ]
};
