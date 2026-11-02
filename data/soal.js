// ============================================================
//  DATA SOAL & SISTEM PENGACAK
//  Satu gedung = Satu mata pelajaran (12 mapel nasional).
//
//  S(tingkat, pertanyaan, [opsi], nomorJawabanBenar, pembahasan)
//  Tingkat: 1 = Anak (PAUD–SD), 2 = Pelajar (SMP–SMA), 3 = Umum / Dewasa
//  Nomor jawaban mulai dari 0.
// ============================================================

const S = (t, q, o, j, p) => ({ t: t, pertanyaan: q, opsi: o, jawaban: j, pembahasan: p });

// ============================================================
//  FUNGSI UTILITAS PENGACAK (SYSTEM SHUFFLE)
// ============================================================

/**
 * Algoritma Fisher-Yates Shuffle untuk mengacak array.
 */
function acakArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Mengambil daftar soal berdasarkan id gedungs dan tingkat yang diacak otomatis.
 * @param {string} idGedung - ID Mata Pelajaran (misal: "matematika", "bin")
 * @param {number} tingkat - Tingkat kesulitan (1, 2, atau 3)
 * @param {number} jumlah - Jumlah soal yang diambil (opsional, default semua)
 * @param {boolean} acakOpsi - Apakah opsi jawaban juga diacak posisinya? (default: true)
 */
function ambilSoalAcak(idGedung, tingkat, jumlah = null, acakOpsi = true) {
  const gedung = DATA_SOAL.gedung.find(g => g.id === idGedung);
  if (!gedung) return [];

  // Filter berdasarkan tingkat
  let daftarSoal = gedung.soal.filter(s => s.t === tingkat);
  
  // Acak urutan soal
  daftarSoal = acakArray(daftarSoal);

  // Potong jumlah jika ditentukan
  if (jumlah && jumlah > 0) {
    daftarSoal = daftarSoal.slice(0, jumlah);
  }

  // Jika acakOpsi aktif, posisi opsi dan indeks kunci jawaban akan disesuaikan secara dinamis
  if (acakOpsi) {
    daftarSoal = daftarSoal.map(soal => {
      const opsiDenganStatus = soal.opsi.map((teks, idx) => ({
        teks: teks,
        isBenar: idx === soal.jawaban
      }));
      
      const opsiDiacak = acakArray(opsiDenganStatus);
      const jawabanBaru = opsiDiacak.findIndex(o => o.isBenar);

      return {
        ...soal,
        opsi: opsiDiacak.map(o => o.teks),
        jawaban: jawabanBaru
      };
    });
  }

  return daftarSoal;
}

// ============================================================
//  DATA UTAMA SOAL (720 SOAL TOTAL)
// ============================================================

const DATA_SOAL = {
  kota: { nama: "Kota Edukasi", ikon: "🏙️", pengembang: "Kuslan Wawan", tahun: 2026 },
  gedung: [
    // ------------------------------------------------------------
    // 1. PENDIDIKAN AGAMA & BUDI PEKERTI
    // ------------------------------------------------------------
    {
      id: "agama",
      nama: "Pendidikan Agama & Budi Pekerti",
      ikon: "🙏",
      warna: "#14b8a6",
      soal: [
        // Tingkat 1 (20 Soal)
        S(1, "Sebelum makan, kita dianjurkan untuk …", ["Berdoa", "Berlari", "Bermain", "Tidur"], 0, "Berdoa sebelum makan adalah wujud rasa syukur atas rezeki."),
        S(1, "Orang tua yang harus kita hormati di rumah adalah …", ["Ayah dan Ibu", "Tetangga", "Teman main", "Pedagang"], 0, "Ayah dan Ibu adalah orang tua yang membesarkan kita."),
        S(1, "Tempat ibadah umat Islam dinamakan …", ["Masjid", "Gereja", "Pura", "Vihara"], 0, "Masjid adalah tempat ibadah umat Islam."),
        S(1, "Tempat ibadah umat Kristen dan Katolik dinamakan …", ["Gereja", "Masjid", "Klenteng", "Pura"], 0, "Gereja adalah tempat ibadah umat Kristen & Katolik."),
        S(1, "Kitab suci umat Islam adalah …", ["Al-Qur'an", "Alkitab", "Weda", "Tripitaka"], 0, "Al-Qur'an adalah kitab suci umat Islam."),
        S(1, "Sebelum belajar di kelas, sebaiknya kita …", ["Berdoa", "Menangis", "Tidur", "Makan"], 0, "Berdoa membuat ilmu yang dipelajari menjadi berkah."),
        S(1, "Jika teman mengalami musibah atau jatuh, kita harus …", ["Menolongnya", "Tertawa", "Mengejek", "Meninggalkan"], 0, "Menolong sesama adalah perbuatan terpuji."),
        S(1, "Mengucapkan ucapan salam saat bertemu guru hukumnya …", ["Bagus/Sopan", "Dilarang", "Jelek", "Salah"], 0, "Menyapa guru dengan salam adalah bentuk sopan santun."),
        S(1, "Jujur artinya mengatakan sesuatu sesuai dengan …", ["Kenyataan", "Kebohongan", "Khayalan", "Kemauan"], 0, "Jujur berarti berkata apa adanya sesuai fakta."),
        S(1, "Berbuat baik kepada sesama manusia akan mendapatkan …", ["Pahala", "Dosa", "Hukuman", "Rugi"], 0, "Kebaikan diganjar dengan pahala."),
        S(1, "Sikap tidak sombong dan menghargai orang lain disebut …", ["Rendah hati", "Tinggi hati", "Iri hati", "Pemberani"], 0, "Rendah hati (tawadu) adalah sifat terpuji."),
        S(1, "Mengembalikan barang yang dipinjam tepat waktu merupakan contoh sikap …", ["Tanggung jawab", "Egois", "Pemalas", "Ceroboh"], 0, "Bertanggung jawab atas barang pinjaman adalah amanah."),
        S(1, "Tuhan menciptakan manusia dengan berbagai suku agar saling …", ["Mengenal", "Mengejek", "Musuh", "Bertengkar"], 0, "Perbedaan diciptakan agar kita saling mengenal dan menghormati."),
        S(1, "Memberikan sebagian rezeki kepada yang membutuhkan disebut …", ["Bersedekah", "Pamer", "Jual beli", "Meminta"], 0, "Sedekah membantu mengurangi beban sesama."),
        S(1, "Menjaga kebersihan tubuh dan lingkungan adalah bagian dari …", ["Iman", "Kejahatan", "Kesombongan", "Kerugian"], 0, "Kebersihan sebagian dari iman."),
        S(1, "Ketika berbuat salah kepada teman, kita harus segera …", ["Minta maaf", "Lari", "Marah", "Menuduh"], 0, "Meminta maaf adalah wujud kesadaran berbuat salah."),
        S(1, "Menjaga kerukunan antar teman membuat hidup menjadi …", ["Damai", "Susah", "Sedih", "Kacau"], 0, "Kerukunan menciptakan kedamaian."),
        S(1, "Menghormati guru di sekolah dapat dilakukan dengan cara …", ["Mendengarkan penjelasannya", "Mengobrol sendiri", "Tidur di kelas", "Bermain HP"], 0, "Mendengarkan guru adalah wujud penghormatan."),
        S(1, "Kitab suci umat Hindu adalah …", ["Weda", "Alkitab", "Tripitaka", "Al-Qur'an"], 0, "Weda adalah kitab suci umat Hindu."),
        S(1, "Tempat ibadah umat Umat Buddha adalah …", ["Vihara", "Masjid", "Gereja", "Pura"], 0, "Vihara adalah tempat ibadah bagi umat Buddha."),

        // Tingkat 2 (20 Soal)
        S(2, "Sikap menghargai dan menghormati perbedaan keyakinan disebut …", ["Toleransi", "Egois", "Fanatisme", "Akulturasi"], 0, "Toleransi adalah kunci kerukunan dalam keberagaman."),
        S(2, "Rukun Iman dalam ajaran Islam berjumlah …", ["6", "5", "4", "7"], 0, "Rukun Iman ada 6 perkara."),
        S(2, "Hukum taklif dalam Islam yang jika dikerjakan mendapat pahala dan jika ditinggalkan tidak berdosa adalah …", ["Sunnah", "Wajib", "Makruh", "Haram"], 0, "Sunnah adalah perbuatan yang dianjurkan."),
        S(2, "Hukum perbuatan yang jika ditinggalkan mendapat pahala dan jika dikerjakan berdosa adalah …", ["Haram", "Wajib", "Sunnah", "Mubah"], 0, "Haram adalah larangan mutlak."),
        S(2, "Menghindari sifat pamer dalam beribadah disebut menghindari sikap …", ["Riya", "Takabur", "Hasad", "Ghibah"], 0, "Riya adalah melakukan ibadah ingin dilihat orang lain."),
        S(2, "Kitab Injil diturunkan kepada Nabi …", ["Isa AS", "Musa AS", "Daud AS", "Muhammad SAW"], 0, "Kitab Injil diwahyukan kepada Nabi Isa AS."),
        S(2, "Kitab Taurat diturunkan kepada Nabi …", ["Musa AS", "Isa AS", "Daud AS", "Ibrahim AS"], 0, "Kitab Taurat diwahyukan kepada Nabi Musa AS."),
        S(2, "Sifat para nabi yang artinya 'dapat dipercaya' adalah …", ["Amanah", "Sidiq", "Tabligh", "Fathanah"], 0, "Amanah berarti jujur dan terpercaya."),
        S(2, "Sifat nabi yang artinya 'cerdas' adalah …", ["Fathanah", "Sidiq", "Amanah", "Tabligh"], 0, "Fathanah artinya cerdas/pandai."),
        S(2, "Peristiwa Isra Mi'raj menghasilkan perintah ibadah …", ["Salat 5 waktu", "Puasa Ramadhan", "Zakat fitrah", "Ibadah Haji"], 0, "Isra Mi'raj merupakan peristiwa diterimanya perintah salat."),
        S(2, "Sikap tidak berlebih-lebihan dalam berbelanja dan hidup secukupnya dinamakan …", ["Sederhana", "Kikir", "Boros", "Gengsi"], 0, "Pola hidup sederhana menghindari sifat konsumtif."),
        S(2, "Perbuatan mempersekutukan Allah dengan sesuatu yang lain disebut …", ["Syirik", "Kufur", "Fasik", "Murtad"], 0, "Syirik adalah dosa besar mempersekutukan Tuhan."),
        S(2, "Hari kiamat juga dikenal dengan sebutan Yaumul Qiyamah yang artinya …", ["Hari Kehancuran/Kebangkitan", "Hari Berhitung", "Hari Pembalasan", "Hari Kemenangan"], 0, "Yaumul Qiyamah merujuk pada hari akhir/kebangkitan."),
        S(2, "Puasa wajib bagi umat Islam dilaksanakan pada bulan …", ["Ramadhan", "Syawal", "Zulhijjah", "Muharram"], 0, "Puasa Wajib sebulan penuh ada di bulan Ramadhan."),
        S(2, "Zakat yang wajib dikeluarkan setiap jiwa menjelang Idul Fitri adalah …", ["Zakat Fitrah", "Zakat Maal", "Zakat Profesi", "Infaq"], 0, "Zakat Fitrah bertujuan menyucikan diri."),
        S(2, "Kitab suci agama Khonghucu dinamakan …", ["Sishe Wujing", "Tripitaka", "Veda", "Tao Te Ching"], 0, "Sishe Wujing merupakan salah satu kitab utama Khonghucu."),
        S(2, "Empat Kebenaran Mulia merupakan ajaran dasar dalam agama …", ["Buddha", "Hindu", "Konghucu", "Taoisme"], 0, "Four Noble Truths adalah inti ajaran Buddha."),
        S(2, "Trisandya merupakan doa ritual harian yang dilakukan oleh umat …", ["Hindu", "Buddha", "Khonghucu", "Katolik"], 0, "Trisandya dilakukan umat Hindu tiga kali sehari."),
        S(2, "Mencela atau membicarakan keburukan orang lain di belakangnya disebut …", ["Ghibah", "Fitnah", "Namimah", "Riya"], 0, "Ghibah adalah membicarakan keburukan orang lain."),
        S(2, "Orang yang berhak menerima zakat disebut …", ["Mustahik", "Muzakki", "Amil", "Munfiq"], 0, "Mustahik adalah 8 golongan penerima zakat."),

        // Tingkat 3 (20 Soal)
        S(3, "Kebebasan memeluk agama dan beribadah menurut agamanya dijamin dalam UUD 1945 Pasal …", ["Pasal 29 Ayat 2", "Pasal 27 Ayat 1", "Pasal 30 Ayat 1", "Pasal 33 Ayat 3"], 0, "Pasal 29 Ayat 2 UUD 1945 menjamin kemerdekaan beragama."),
        S(3, "Pendekatan moderasi beragama mengedepankan prinsip …", ["Tawasuth (Tengah-tengah)", "Tatharruf (Ekstrem)", "Ta'ashub (Fanatik)", "Inklusif ekstrem"], 0, "Moderasi beragama menekankan keseimbangan dan tidak ekstrem."),
        S(3, "Ilmu yang mempelajari tata cara membaca Al-Qur'an dengan benar dinamakan ilmu …", ["Tajwid", "Fiqih", "Tauhid", "Hadis"], 0, "Tajwid mengatur hukum pengucapan huruf Al-Qur'an."),
        S(3, "Teologi hermeneutika dalam studi agama difokuskan pada …", ["Penafsiran teks keagamaan", "Penyebaran ajaran", "Ritual fisik", "Struktur kelembagaan"], 0, "Hermeneutika adalah teori penafsiran teks."),
        S(3, "Sikap skeptis atau menolak keberadaan Tuhan sama sekali disebut …", ["Ateisme", "Agnostisme", "Politeisme", "Monoteisme"], 0, "Ateisme adalah pandangan yang tidak percaya keberadaan Tuhan."),
        S(3, "Istilah 'Agnostisisme' merujuk pada pandangan bahwa …", ["Keberadaan Tuhan tidak dapat diketahui", "Tuhan ada banyak", "Tuhan adalah alam", "Tuhan tidak ada"], 0, "Agnostisisme menganggap pengetahuan tentang Tuhan tak terjangkau."),
        S(3, "Etika protestan menurut Max Weber memiliki keterkaitan erat dengan kemunculan …", ["Kapitalisme modern", "Feodalisme", "Sosialisme", "Merkantilisme"], 0, "Etika Protestan memicu semangat kerja keras kapitalisme awal."),
        S(3, "Konsep 'Kharman' atau Karma dalam agama Hindu dan Buddha merujuk pada …", ["Hukum sebab akibat perbuatan", "Doa pengampunan", "Ritual penyucian", "Tingkatan kasta"], 0, "Karma adalah hukum sebab akibat moral perbuatan."),
        S(3, "Buku mukjizat filsafat Islam 'Incoherence of the Incoherence' (Tahafut at-Tahafut) ditulis oleh …", ["Ibnu Rusyd", "Al-Ghazali", "Ibnu Sina", "Al-Farabi"], 0, "Tahafut at-Tahafut adalah karya kritik Ibnu Rusyd."),
        S(3, "Syariat, Hakikat, Tarikat, dan Ma'rifat merupakan tingkatan spiritual dalam doktrin …", ["Tasawuf", "Fiqh Madzhab", "Mu'tazilah", "Kalam"], 0, "Tasawuf membimbing perjalanan spiritual batiniah."),
        S(3, "Doktrin Panteisme menyatakan bahwa …", ["Tuhan dan alam semesta adalah satu", "Tuhan terpisah dari alam", "Tuhan ada banyak", "Tuhan tidak berwujud"], 0, "Panteisme mengidentifikasikan Tuhan menyatu dengan alam."),
        S(3, "Mazhab Fiqih mayoritas yang dianut oleh masyarakat muslim di Indonesia adalah …", ["Syafi'i", "Hanafi", "Maliki", "Hanbali"], 0, "Sebagian besar muslim Indonesia mengikuti Mazhab Syafi'i."),
        S(3, "Konsili Vatikan II (1962–1965) memberikan dampak besar pada Gereja Katolik dalam hal …", ["Pembaruan liturgi dan hubungan ekumenis", "Penetapan kitab baru", "Pemusatan kekuasaan mutlak", "Pemisahan total"], 0, "Konsili Vatikan II membuka dialog interreligius dan pembaruan liturgi."),
        S(3, "Tiga kerangka dasar ajaran Islam meliputi …", ["Akidah, Syariah, dan Akhlak", "Rukun Iman, Islam, dan Ihsan", "Tauhid, Fiqh, dan Tasawuf", "Semua jawaban benar"], 3, "Ketiga opsi tersebut merujuk pada tiga pilar utama ajaran Islam."),
        S(3, "Konsep 'Ahimsa' dalam ajaran Hindu dan Jainisme berarti …", ["Anti-kekerasan / Tidak menyakiti", "Kejujuran mutlak", "Pengorbanan diri", "Pertapaan ketat"], 0, "Ahimsa adalah prinsip nirkekerasan terhadap semua makhluk."),
        S(3, "Teks-teks Upanishad dalam agama Hindu terutama membahas tentang …", ["Filsafat dan metafisika", "Mantra perang", "Tata cara kurban", "Silsilah raja"], 0, "Upanishad memuat diskusi filosofis esensi Brahman dan Atman."),
        S(3, "Dalam tradisi Yahudi, hari Sabat (Sabbath) dirayakan pada hari …", ["Sabtu", "Minggu", "Jumat", "Senin"], 0, "Sabat Yahudi berlangsung dari Jumat sore hingga Sabtu malam."),
        S(3, "Tokoh pendiri reformasi gereja Protestan pada abad ke-16 adalah …", ["Martin Luther", "Thomas Aquinas", "St. Augustine", "Desiderius Erasmus"], 0, "Martin Luther memelopori Reformasi Protestan tahun 1517."),
        S(3, "Istilah 'Interfaith Dialogue' bertujuan untuk …", ["Membangun pemahaman antarumat beragama", "Menyamakan semua dogma", "Mencari agama terbaik", "Debat kusir"], 0, "Dialog antariman memupuk saling pengertian dan perdamaian."),
        S(3, "Hukum Islam yang bersumber dari kesepakatan para ulama disebut …", ["Ijma'", "Qiyas", "Ijtihad", "Urfa"], 0, "Ijma' adalah kesepakatan konsensus para مجتهد (ulama).")
      ]
    },

    // ------------------------------------------------------------
    // 2. PENDIDIKAN PANCASILA (PPKn)
    // ------------------------------------------------------------
    {
      id: "pancasila",
      nama: "Pendidikan Pancasila",
      ikon: "🦅",
      warna: "#b91c1c",
      soal: [
        // Tingkat 1 (20 Soal)
        S(1, "Sila pertama Pancasila berbunyi …", ["Ketuhanan Yang Maha Esa", "Persatuan Indonesia", "Keadilan sosial", "Kemanusiaan yang adil"], 0, "Sila ke-1 adalah dasar kerohanian bangsa."),
        S(1, "Lambang Sila Pertama Pancasila adalah …", ["Bintang", "Rantai", "Pohon Beringin", "Kepala Banteng"], 0, "Bintang emas merupakan lambang Sila Pertama."),
        S(1, "Lambang Sila Kedua Pancasila adalah …", ["Rantai", "Bintang", "Pohon Beringin", "Padi dan Kapas"], 0, "Rantai emas mewakili kemanusiaan."),
        S(1, "Lambang Sila Ketiga Pancasila adalah …", ["Pohon Beringin", "Kepala Banteng", "Rantai", "Bintang"], 0, "Pohon beringin melambangkan tempat berteduh dan persatuan."),
        S(1, "Lambang Sila Keempat Pancasila adalah …", ["Kepala Banteng", "Padi dan Kapas", "Bintang", "Rantai"], 0, "Kepala banteng mencerminkan musyawarah dan gotong royong."),
        S(1, "Lambang Sila Kelima Pancasila adalah …", ["Padi dan Kapas", "Pohon Beringin", "Kepala Banteng", "Bintang"], 0, "Padi dan kapas melambangkan kemakmuran dan keadilan."),
        S(1, "Semboyan bangsa Indonesia yang ada di kaki Garuda Pancasila adalah …", ["Bhinneka Tunggal Ika", "Tut Wuri Handayani", "Bersatu Kita Teguh", "Habis Gelap Terbitlah Terang"], 0, "Bhinneka Tunggal Ika berarti berbeda-beda tetapi tetap satu."),
        S(1, "Warna bendera negara kita Indonesia adalah …", ["Merah Putih", "Putih Merah", "Merah Kuning", "Hijau Putih"], 0, "Bendera Sang Sang Saka Merah Putih."),
        S(1, "Lagu nasional bangsa Indonesia adalah …", ["Indonesia Raya", "Garuda Pancasila", "Halo-Halo Bandung", "Maju Tak Gentar"], 0, "Indonesia Raya diciptakan oleh W.R. Supratman."),
        S(1, "Kerja bersama-sama untuk menyelesaikan pekerjaan dinamakan …", ["Gotong royong", "Mandiri", "Egois", "Bermain"], 0, "Gotong royong membuat pekerjaan berat menjadi ringan."),
        S(1, "Presiden pertama Republik Indonesia adalah …", ["Ir. Soekarno", "Drs. Mohammad Hatta", "Jokowi", "Soeharto"], 0, "Ir. Soekarno adalah Proklamator dan Presiden I."),
        S(1, "Wakil Presiden pertama Indonesia adalah …", ["Drs. Mohammad Hatta", "Ir. Soekarno", "Adam Malik", "BJ Habibie"], 0, "Bung Hatta adalah Wakil Presiden I."),
        S(1, "Menjaga kebersihan kelas bersama teman merupakan kewajiban …", ["Semua siswa", "Guru", "Penjaga sekolah", "Ketua kelas"], 0, "Kebersihan kelas adalah tanggung jawab bersama seluruh siswa."),
        S(1, "Menghormati perbedaan suku teman di sekolah sesuai dengan Sila ke-…", ["Tiga", "Satu", "Dua", "Lima"], 0, "Persatuan Indonesia (Sila 3) mengajarkan persatuan dalam perbedaan."),
        S(1, "Musyawarah dilakukan untuk mencapai …", ["Mufakat / Kesepakatan", "Pertengkaran", "Kemenangan sendiri", "Kekacauan"], 0, "Musyawarah bertujuan mencari kesepakatan bersama (mufakat)."),
        S(1, "Aturan yang berlaku di rumah harus ditaati oleh …", ["Semua anggota keluarga", "Ayah saja", "Anak saja", "Ibu saja"], 0, "Aturan rumah berlaku untuk semua anggota keluarga."),
        S(1, "Menolong teman yang jatuh adalah perbuatan yang …", ["Terpuji", "Tercela", "Rugi", "Dilarang"], 0, "Saling menolong adalah perbuatan baik."),
        S(1, "Hari Lahir Pancasila diperingati setiap tanggal …", ["1 Juni", "17 Agustus", "1 Oktober", "28 Oktober"], 0, " Hari Lahir Pancasila diperingati 1 Juni."),
        S(1, "Sikap antre saat membeli makanan di kantin mengajarkan kita untuk …", ["Disiplin dan sabar", "Marah-marah", "Rebutan", "Serakah"], 0, "Mengantre melatih kedisiplinan dan menghormati hak orang lain."),
        S(1, "Gambar Burung Garuda menghadap ke arah …", ["Kanan", "Kiri", "Depan", "Bawah"], 0, "Garuda Pancasila menoleh ke arah kanan."),

        // Tingkat 2 (20 Soal)
        S(2, "Lembaga negara yang berwenang membuat dan mengubah UUD adalah …", ["MPR", "DPR", "Presiden", "MA"], 0, "MPR berwenang menetapkan dan mengubah UUD."),
        S(2, "Lembaga pemegang kekuasaan legislatif utama di Indonesia adalah …", ["DPR", "MA", "MK", "KY"], 0, "DPR bertugas membuat undang-undang bersama Presiden."),
        S(2, "Lembaga negara yang menguji undang-undang terhadap UUD 1945 adalah …", ["Mahkamah Konstitusi (MK)", "Mahkamah Agung (MA)", "Komisi Yudisial (KY)", "DPR"], 0, "MK menguji UU terhadap UUD 1945."),
        S(2, "Hak asasi manusia diatur dalam UUD 1945 Pasal …", ["28A – 28J", "27 – 30", "31 – 34", "1 – 5"], 0, "Pasal 28A hingga 28J memuat pasal-pasal HAM."),
        S(2, "Sistem pemerintahan yang diterapkan di Indonesia adalah sistem …", ["Presidensial", "Parlementer", "Monarki", "Kharismatik"], 0, "Indonesia menganut sistem Presidensial."),
        S(2, "Pancasila ditetapkan sebagai dasar negara pada tanggal …", ["18 Agustus 1945", "1 Juni 1945", "17 Agustus 1945", "22 Juni 1945"], 0, "PPKI menetapkan Pancasila dan UUD 1945 pada 18 Agustus 1945."),
        S(2, "Panitia Kecil beranggotakan 9 orang yang merumuskan Piagam Jakarta disebut …", ["Panitia Sembilan", "BPUPKI", "PPKI", "KNIP"], 0, "Panitia Sembilan merumuskan Piagam Jakarta 22 Juni 1945."),
        S(2, "Ketua BPUPKI adalah …", ["Dr. K.R.T. Radjiman Wedyodiningrat", "Ir. Soekarno", "Drs. Moh. Hatta", "Soepomo"], 0, "BPUPKI dipimpin oleh Dr. Radjiman Wedyodiningrat."),
        S(2, "Rumusan awal Pancasila dituangkan dalam naskah …", ["Piagam Jakarta", "Teks Proklamasi", "Dekrit Presiden", "Sumpah Pemuda"], 0, "Piagam Jakarta (Jakarta Charter) memuat rumusan awal Pancasila."),
        S(2, "Norma yang bersumber dari hati nurani manusia disebut norma …", ["Kesusilaan", "Keseragaman", "Hukum", "Kesopanan"], 0, "Norma kesusilaan berasal dari bisikan hati nurani."),
        S(2, "Sanksi bagi pelanggar norma hukum bersifat …", ["Tegas dan memaksa", "Dicemooh masyarakat", "Dosa", "Penyesalan batin"], 0, "Norma hukum memiliki sanksi tegas yang dipaksakan negara."),
        S(2, "Bentuk negara Indonesia sesuai Pasal 1 Ayat 1 UUD 1945 adalah …", ["Negara Kesatuan", "Federasi", "Serikat", "Monarki"], 0, "Indonesia adalah Negara Kesatuan berbentuk Republik."),
        S(2, "Kekuasaan tertinggi dalam negara demokrasi berada di tangan …", ["Rakyat", "Presiden", "DPR", "Tentara"], 0, "Demokrasi berarti pemerintahan dari, oleh, dan untuk rakyat."),
        S(2, "Sikap membanggakan kebudayaan sendiri secara berlebihan dan merendahkan budaya lain disebut …", ["Chauvinisme", "Patriotisme", "Nasionalisme", "Humanisme"], 0, "Chauvinisme adalah rasa cinta tanah air yang sempit dan berlebihan."),
        S(2, "Landasan idiil negara Indonesia adalah …", ["Pancasila", "UUD 1945", "GBHN", "Wawasan Nusantara"], 0, "Pancasila adalah landasan idiil Indonesia."),
        S(2, "Landasan konstitusional negara Indonesia adalah …", ["UUD 1945", "Pancasila", "TAP MPR", "Perpres"], 0, "UUD 1945 adalah hukum dasar tertulis (konstitusional)."),
        S(2, "Tugas utama Komisi Yudisial (KY) adalah …", ["Mengusulkan pengangkatan Hakim Agung", "Menguji UU", "Membuat UU", "Menyusun anggaran"], 0, "KY menjaga kehormatan serta mengusulkan Hakim Agung."),
        S(2, "Sistem politik luar negeri Indonesia adalah …", ["Bebas dan Aktif", "Blok Barat", "Blok Timur", "Isolasionis"], 0, "Politik luar negeri Indonesia bebas dan aktif."),
        S(2, "Batas wilayah laut teritorial Indonesia diukur sejauh … mil dari garis pantai.", ["12 mil", "200 mil", "24 mil", "3 mil"], 0, "Laut teritorial berjarak 12 mil laut."),
        S(2, "Batas Zona Ekonomi Eksklusif (ZEE) berjarak … mil dari garis pangkal.", ["200 mil", "12 mil", "350 mil", "100 mil"], 0, "ZEE ditarik sejauh 200 mil laut."),

        // Tingkat 3 (20 Soal)
        S(3, "Konsep 'Separation of Powers' (Trias Politica) dikemukakan oleh …", ["Montesquieu", "John Locke", "Jean-Jacques Rousseau", "Thomas Hobbes"], 0, "Montesquieu membagi kekuasaan menjadi Eksekutif, Legislatif, Yudikatif."),
        S(3, "Pengujian peraturan perundang-undangan di bawah undang-undang terhadap undang-undang dilakukan oleh …", ["Mahkamah Agung (MA)", "Mahkamah Konstitusi (MK)", "DPR", "Kementerian Hukum"], 0, "MA menguji aturan di bawah UU terhadap UU."),
        S(3, "Pasal UUD 1945 yang menegaskan bahwa Indonesia adalah Negara Hukum adalah …", ["Pasal 1 Ayat 3", "Pasal 1 Ayat 2", "Pasal 2 Ayat 1", "Pasal 3 Ayat 1"], 0, "Pasal 1 Ayat 3 menyatakan 'Negara Indonesia adalah negara hukum'."),
        S(3, "Amandemen UUD 1945 telah dilakukan sebanyak … kali.", ["4 kali", "3 kali", "5 kali", "2 kali"], 0, "Amandemen UUD 1945 terjadi pada 1999, 2000, 2001, dan 2002."),
        S(3, "Unsur konstitutif berdirinya suatu negara meliputi …", ["Rakyat, Wilayah, Pemerintah yang berdaulat", "Tentara, Uang, Rakyat", "Presiden, DPR, UUD", "Pengakuan internasional saja"], 0, "Syarat primer (konstitutif) negara adalah rakyat, wilayah, dan pemerintah berdaulat."),
        S(3, "Pengakuan dari negara lain terhadap berdirinya suatu negara secara hukum disebut pengakuan …", ["De Jure", "De Facto", "Implicit", "Konsensual"], 0, "De Jure adalah pengakuan resmi hukum internasional."),
        S(3, "Teori kedaulatan yang menyatakan kekuasaan berasal dari hukum yang berlaku dikemukakan oleh …", ["Krabbe", "Jean Bodin", "Thomas Hobbes", "Machiavelli"], 0, "Hugo Krabbe memelopori Teori Kedaulatan Hukum."),
        S(3, "Sistem pemerintahan di mana menteri bertanggung jawab kepada parlemen dinamakan …", ["Parlementer", "Presidensial", "Semipresidensial", "Kolektif"], 0, "Kabinet parlementer bertanggung jawab pada parlemen."),
        S(3, "Asas kewarganegaraan berdasarkan keturunan atau hubungan darah dinamakan …", ["Ius Sanguinis", "Ius Soli", "Apatride", "Bipatride"], 0, "Ius Sanguinis menetapkan kewarganegaraan dari ikatan darah."),
        S(3, "Asas kewarganegaraan berdasarkan tempat lahir dinamakan …", ["Ius Soli", "Ius Sanguinis", "Naturalisasi", "Stelsel pasif"], 0, "Ius Soli menentukan kewarganegaraan berdasarkan tempat lahir."),
        S(3, "Kondisi seseorang yang tidak memiliki kewarganegaraan sama sekali disebut …", ["Apatride", "Bipatride", "Multipatride", "Naturalisasi"], 0, "Apatride terjadi ketika seseorang tanpa status kewarganegaraan."),
        S(3, "Fungsi DPR untuk menyusun anggaran pendapatan dan belanja negara dinamakan fungsi …", ["Anggaran / Budget", "Legislasi", "Pengawasan", "Interpelasi"], 0, "Fungsi Anggaran DPR menentukan APBN bersama Presiden."),
        S(3, "Hak DPR untuk meminta keterangan kepada Pemerintah mengenai kebijakan penting dinamakan hak …", ["Interpelasi", "Angket", "Nyatakan Pendapat", "Imunitas"], 0, "Hak Interpelasi adalah hak bertanya/meminta keterangan."),
        S(3, "Hak DPR untuk melakukan penyelidikan terhadap kebijakan pemerintah yang diduga melanggar UU adalah hak …", ["Angket", "Interpelasi", "Imunitas", "Inisiatif"], 0, "Hak Angket digunakan untuk penyelidikan khusus."),
        S(3, "Sifat Pancasila sebagai 'Ideologi Terbuka' berarti Pancasila …", ["Mampu menyesuaikan diri dengan perkembangan zaman tanpa mengubah nilai dasarnya", "Dapat diganti kapan saja", "Hanya berlaku di era tertentu", "Menutup diri dari budaya luar"], 0, "Ideologi terbuka bersifat dinamis dan reformatif."),
        S(3, "Filsafat Pancasila bersifat ontologis, epistemologis, dan aksiolgiss. Aksiolgiss berkaitan dengan nilai …", ["Manfaat dan etika/estetika", "Hakikat kebenaran", "Struktur pengetahuan", "Logika murni"], 0, "Aksiologi membahas tentang nilai dasar kegunaan dan moral."),
        S(3, "Prinsip Otonomi Daerah di Indonesia menganut asas desentralisasi, dekonsentrasi, dan …", ["Tugas Pembantuan", "Sentralisasi", "Privatisasi", "Nirsentralisasi"], 0, "Tiga asas otonomi daerah: desentralisasi, dekonsentrasi, tugas pembantuan."),
        S(3, "Struktur ketatanegaraan Indonesia pasca-amandemen menghapuskan kedudukan …", ["DPA (Dewan Pertimbangan Agung)", "BPK", "MPR", "KY"], 0, "DPA dibubarkan melalui amandemen UUD 1945."),
        S(3, "Istilah Geopolitik Indonesia dikenal dengan konsep …", ["Wawasan Nusantara", "Ketahanan Nasional", "Bhinneka Tunggal Ika", "Pancasila"], 0, "Wawasan Nusantara adalah cara pandang geopolitik bangsa Indonesia."),
        S(3, "Tingkatan tata urutan peraturan perundang-undangan tertinggi di Indonesia menurut UU No. 12 Tahun 2011 adalah …", ["UUD 1945", "TAP MPR", "Undang-Undang", "Perpu"], 0, "UUD 1945 merupakan hukum dasar tertulis tertinggi di Indonesia.")
      ]
    },

    // ------------------------------------------------------------
    // 3. BAHASA INDONESIA
    // ------------------------------------------------------------
    {
      id: "bin",
      nama: "Bahasa Indonesia",
      ikon: "📚",
      warna: "#f59e0b",
      soal: [
        // Tingkat 1 (20 Soal)
        S(1, "Lawan kata 'besar' adalah …", ["Kecil", "Luas", "Tinggi", "Panjang"], 0, "Kecil adalah lawan kata dari besar."),
        S(1, "Awal kalimat ditulis menggunakan huruf …", ["Kapital / Besar", "Kecil", "Miring", "Tebal"], 0, "Huruf pertama diawali dengan huruf kapital."),
        S(1, "Kata yang bersinonim (sama arti) dengan 'cantik' adalah …", ["Indah", "Buruk", "Kotor", "Kasar"], 0, "Cantik sama artinya dengan indah/elok."),
        S(1, "Tanda baca yang digunakan di akhir kalimat berita adalah …", ["Titik (.)", "Tanda Tanya (?)", "Tanda Seru (!)", "Koma (,)"], 0, "Kalimat berita ditutup dengan tanda titik."),
        S(1, "Tanda baca untuk bertanya adalah …", ["Tanda Tanya (?)", "Titik (.)", "Tanda Seru (!)", "Petik (\")"], 0, "Tanda tanya digunakan pada akhir kalimat tanya."),
        S(1, "Tanda baca untuk kalimat perintah atau ajakan adalah …", ["Tanda Seru (!)", "Titik (.)", "Tanda Tanya (?)", "Koma (,)"], 0, "Kalimat perintah atau emosional diakhiri tanda seru."),
        S(1, "Lawan kata 'rajin' adalah …", ["Malas", "Pintar", "Pandai", "Giat"], 0, "Lawan kata dari rajin adalah malas."),
        S(1, "Lawan kata 'tinggi' adalah …", ["Rendah", "Pendek", "Panjang", "Kecil"], 0, "Lawan kata tinggi adalah rendah."),
        S(1, "Dongeng tentang kisah hewan yang bisa berbicara dinamakan …", ["Fabel", "Mitos", "Legenda", "Sage"], 0, "Fabel adalah cerita yang tokohnya hewan."),
        S(1, "Orang yang menulis cerita atau buku dinamakan …", ["Penulis / Pengarang", "Pelukis", "Penyanyi", "Sutradara"], 0, "Penulis merangkai kata membuat cerita."),
        S(1, "Lawan kata 'siang' adalah …", ["Malam", "Pagi", "Sore", "Petang"], 0, "Malam adalah kebalikan dari siang."),
        S(1, "Kata 'Rumah' diawali dengan huruf …", ["R", "U", "M", "A"], 0, "Huruf depan kata Rumah adalah R."),
        S(1, "Percakapan antara dua orang atau lebih dinamakan …", ["Dialog", "Monolog", "Prolog", "Epilog"], 0, "Dialog adalah percakapan dua orang atau lebih."),
        S(1, "Kata tanya untuk menanyakan tempat adalah …", ["Di mana", "Siapa", "Kapan", "Mengapa"], 0, "Kata 'di mana' menanyakan lokasi/tempat."),
        S(1, "Kata tanya untuk menanyakan waktu adalah …", ["Kapan", "Berapa", "Bagaimana", "Siapa"], 0, "Kata 'kapan' menanyakan waktu peristiwa."),
        S(1, "Kata tanya untuk menanyakan nama orang adalah …", ["Siapa", "Apa", "Mana", "Mengapa"], 0, "Kata 'siapa' digunakan menanyakan subjek orang."),
        S(1, "Membaca buku cerita di perpustakaan dilakukan dengan …", ["Tenang / Tidak berisik", "Berteriak", "Lari-lari", "Bernyanyi"], 0, "Perpustakaan butuh ketenangan."),
        S(1, "Kumpulan baris indah yang memiliki bait dinamakan …", ["Puisi", "Cerpen", "Drama", "Koran"], 0, "Puisi terikat bait dan rima."),
        S(1, "Lawan kata 'bersih' adalah …", ["Kotor", "Rapi", "Wangi", "Indah"], 0, "Kotor adalah antonim dari bersih."),
        S(1, "Anak yang suka membaca buku dijuluki …", ["Kutu buku", "Panjang tangan", "Tebal muka", "Bintang lapangan"], 0, "Kutu buku adalah ungkapan untuk orang yang gemar membaca."),

        // Tingkat 2 (20 Soal)
        S(2, "Manakah penulisan kata baku yang benar menurut KBBI?", ["Apotek", "Apotik", "Praktek", "Analisa"], 0, "Apotek, praktik, dan analisis adalah kata baku."),
        S(2, "Gagasan utama yang menjadi dasar pengembangan paragraf disebut …", ["Ide Pokok / Pikiran Utama", "Kalimat Penjelas", "Judul", "Kesimpulan"], 0, "Ide pokok memuat gagasan dasar paragraf."),
        S(2, "Majas yang mengumpamakan benda mati seolah-olah bernyawa dan berperilaku seperti manusia dinamakan …", ["Personifikasi", "Metafora", "Hiperbola", "Simile"], 0, "Personifikasi menghidupkan benda mati."),
        S(2, "Majas yang menyatakan sesuatu secara berlebih-lebihan dinamakan …", ["Hiperbola", "Litotes", "Ironi", "Sinekdok"], 0, "Hiperbola membesar-besarkan fakta."),
        S(2, "Paragraf yang kalimat utamanya terletak di awal dinamakan paragraf …", ["Deduktif", "Induktif", "Campuran", "Narasi"], 0, "Deduktif = Depan/Awal."),
        S(2, "Paragraf yang kalimat utamanya terletak di akhir dinamakan paragraf …", ["Induktif", "Deduktif", "Campuran", "Deskriptif"], 0, "Induktif = Akhir."),
        S(2, "Kata imbuhan yang diletakkan di akhir kata dasar dinamakan …", ["Sufiks / Akhiran", "Prefiks", "Infiks", "Konfiks"], 0, "Sufiks adalah akhiran (seperti -an, -kan)."),
        S(2, "Unsur intrinsik cerita yang menunjukkan waktu, tempat, dan suasana dinamakan …", ["Latar / Setting", "Alur", "Tema", "Amanat"], 0, "Latar menggambarkan dimensi tempat dan waktu."),
        S(2, "Pesan moral yang ingin disampaikan pengarang kepada pembaca dinamakan …", ["Amanat", "Tema", "Plot", "Sudut Pandang"], 0, "Amanat memuat pesan kebaikan pengarang."),
        S(2, "Manakah kalimat berikut yang merupakan kalimat efektif?", ["Bapak guru mengajar di kelas.", "Banyak anak-anak bermain di lapangan.", "Demi untuk keadilan kita harus berjuang.", "Para tamu-tamu sudah hadir."], 0, "Bapak guru mengajar di kelas adalah kalimat efektif tanpa pleonisme."),
        S(2, "Persamaan bunyi di akhir baris puisi dinamakan …", ["Rima", "Irama", "Bait", "Larik"], 0, "Rima adalah pengulangan bunyi fonem."),
        S(2, "Karya sastra berupa cerita rekaan yang panjang dan memiliki konflik kompleks dinamakan …", ["Novel", "Cerpen", "Drama", "Dongeng"], 0, "Novel adalah karangan prosa panjang."),
        S(2, "Teks yang menceritakan riwayat hidup seseorang yang ditulis oleh orang lain dinamakan …", ["Biografi", "Autobiografi", "Memoar", "Diari"], 0, "Biografi ditulis oleh orang lain."),
        S(2, "Teks riwayat hidup yang ditulis oleh diri sendiri dinamakan …", ["Autobiografi", "Biografi", "Novel", "Artikel"], 0, "Autobiografi ditulis oleh diri sendiri."),
        S(2, "Ringkasan tulisan tanpa mengubah urutan isi teks asli dinamakan …", ["Rangkuman / Rintisan", "Sinopsis", "Abstrak", "Kritik"], 0, "Rangkuman merekap inti tulisan."),
        S(2, "Teks yang berisi langkah-langkah kerja secara sistematis dinamakan teks …", ["Prosedur", "Eksplanasi", "Laporan", "Persuasi"], 0, "Teks prosedur memuat langkah cara membuat/melakukan sesuatu."),
        S(2, "Kalimat yang bertujuan membujuk atau mempengaruhi pembaca disebut kalimat …", ["Persuasif", "Provokatif", "Deskriptif", "Argumentatif"], 0, "Persuasi bersifat mengajak atau membujuk."),
        S(2, "Kata sambung (penghubung) antar kalimat atau antar klausa dinamakan …", ["Konjungsi", "Preposisi", "Nomina", "Verba"], 0, "Konjungsi berfungsi menghubungkan satuan bahasa."),
        S(2, "Penulisan gelar akademik yang tepat menurut EYD adalah …", ["Dr. Ir. Ahmad, M.Pd.", "Dr Ir Ahmad M.Pd", "Dr. Ir. Ahmad M,Pd.", "Dr, Ir, Ahmad M.Pd"], 0, "Singkatan gelar dibatasi koma dan titik secara presisi."),
        S(2, "Kata sapaan atau ungkapan yang maknanya berlawanan disebut …", ["Antonim", "Sinonim", "Homonim", "Homograf"], 0, "Antonim adalah lawan kata."),

        // Tingkat 3 (20 Soal)
        S(3, "Majas yang membandingkan dua hal secara langsung tanpa kata pembanding (misal: 'Dia anak emas') dinamakan …", ["Metafora", "Simile", "Personifikasi", "Alegori"], 0, "Metafora membandingkan secara eksplisit tanpa kata sambung."),
        S(3, "Majas yang menggunakan ungkapan merendahkan diri untuk tujuan kesopanan dinamakan …", ["Litotes", "Ironi", "Sarkasme", "Sinisme"], 0, "Litotes merendahkan diri (misal: 'mampirlah ke gubuk kami')."),
        S(3, "Kata-kata yang memiliki ejaan dan pelafalan sama tetapi artinya berbeda dinamakan …", ["Homonim", "Homofon", "Homograf", "Polisemi"], 0, "Homonim: ejaan & lafal sama, arti beda (misal: 'bisa' = racun / sanggup)."),
        S(3, "Kata yang memiliki tulisan sama tetapi pelafalan dan artinya berbeda dinamakan …", ["Homograf", "Homofon", "Homonim", "Polisemi"], 0, "Homograf: ejaan sama, lafal beda (misal: 'apel' buah / 'apel' upacara)."),
        S(3, "Kata yang memiliki bunyi (lafal) sama tetapi ejaan dan artinya berbeda dinamakan …", ["Homofon", "Homograf", "Homonim", "Sinonim"], 0, "Homofon: bunyi sama, ejaan beda (misal: 'bank' & 'bang')."),
        S(3, "Teks yang menerangkan proses terjadinya fenomena alam atau sosial dinamakan teks …", ["Eksplanasi", "Exposisi", "Narrative", "Deskripsi"], 0, "Teks eksplanasi menjelaskan proses 'mengapa' dan 'bagaimana' fenomena terjadi."),
        S(3, "Proses penyerapan kata asing menjadi kata Indonesia dengan penyesuaian ejaan dinamakan …", ["Adaptasi / Adopsi", "Penerjemahan", "Kreasi", "Asimilasi"], 0, "Adaptasi mengambil konsep asing dengan adjustment ejaan baku."),
        S(3, "Kalimat yang memiliki lebih dari satu pola klausa (S-P) dinamakan kalimat …", ["Majemuk", "Tunggal", "Efektif", "Pasif"], 0, "Kalimat majemuk memiliki minimal dua klausa."),
        S(3, "Fungsi tata bahasa yang bertindak sebagai penerima tindakan dalam kalimat pasif adalah …", ["Subjek", "Predikat", "Objek", "Keterangan"], 0, "Dalam kalimat pasif, objek berubah posisi menjadi subjek penerima tindakan."),
        S(3, "Karya ilmiah singkat yang menyajikan hasil analisis terhadap suatu topik dinamakan …", ["Makalah / Esai", "Novel", "Cerpen", "Drama"], 0, "Makalah menyajikan pembahasan masalah secara akademis."),
        S(3, "Ringkasan singkat dari seluruh isi karya ilmiah yang berada di awal tulisan dinamakan …", ["Abstrak", "Latar Belakang", "Kesimpulan", "Lampiran"], 0, "Abstrak merangkum inti penelitian ilmiah."),
        S(3, "Unsur cerita yang menentukan sudut pandang pencerita (Orang Pertama / Ketiga) dinamakan …", ["Sudut Pandang / Point of View", "Alur", "Latar", "Gaya Bahasa"], 0, "Point of View (POV) menetapkan posisi pengarang dalam cerita."),
        S(3, "Kritik sastra yang berfokus pada struktur dan hubungan antarunsur dalam karya sastra dinamakan pendekatan …", ["Strukturalis", "Mimesis", "Ekspresif", "Pragmatis"], 0, "Pendekatan strukturalis mengkaji karya berdasarkan bangunan intrinsiknya."),
        S(3, "Penggunaan kata yang mubazir dan berlebihan dalam kalimat dinamakan …", ["Pleonisme", "Tautologi", "Ambiguitas", "Elipsis"], 0, "Pleonisme adalah penggunaan kata berlebihan yang tak perlu."),
        S(3, "Perubahan makna kata yang menjadi lebih luas dari makna aslinya dinamakan …", ["Generalisasi", "Spesialisasi", "Ameliorasi", "Peyorasi"], 0, "Generalisasi memperluas cakupan makna kata."),
        S(3, "Perubahan makna kata menjadi lebih sopan atau halus dinamakan …", ["Ameliorasi", "Peyorasi", "Sinekdok", "Asosiasi"], 0, "Ameliorasi meninggikan/menghaluskan makna kata."),
        S(3, "Buku referensi yang berisi daftar kata beserta arti dan maknanya dinamakan …", ["Kamus", "Ensiklopedia", "Atlas", "Biografi"], 0, "Kamus memberi definisi lengkap kata-kata."),
        S(3, "Perubahan bentuk kata akibat pemberian imbuhan dinamakan proses …", ["Afiksasi", "Reduplikasi", "Komposisi", "Modifikasi"], 0, "Afiksasi adalah pengimbuhan pada kata dasar."),
        S(3, "Kalimat yang berbelit-belit dan mengandung makna ganda dinamakan kalimat …", ["Ambigu", "Efektif", "Baku", "Denotatif"], 0, "Ambiguitas menyebabkan makna ganda/kabur."),
        S(3, "Makna kata yang sebenarnya sesuai dengan kamus dinamakan makna …", ["Denotatif", "Konotatif", "Kiasan", "Figuratif"], 0, "Denotasi adalah arti lugas/sebenarnya.")
      ]
    },

    // ------------------------------------------------------------
    // 4. MATEMATIKA
    // ------------------------------------------------------------
    {
      id: "mat",
      nama: "Matematika",
      ikon: "🔢",
      warna: "#e11d48",
      soal: [
        // Tingkat 1 (20 Soal)
        S(1, "2 + 3 = ?", ["5", "4", "6", "7"], 0, "2 ditambah 3 menghasilkan 5."),
        S(1, "10 − 4 = ?", ["6", "5", "7", "4"], 0, "10 dikurangi 4 adalah 6."),
        S(1, "Berapa jumlah sisi yang dimiliki oleh bangun segitiga?", ["3", "4", "5", "2"], 0, "Segitiga memiliki 3 sisi."),
        S(1, "Berapa jumlah sisi pada persegi?", ["4", "3", "5", "6"], 0, "Persegi memiliki 4 sisi sama panjang."),
        S(1, "5 × 2 = ?", ["10", "12", "8", "15"], 0, "5 dikali 2 sama dengan 10."),
        S(1, "12 : 3 = ?", ["4", "3", "5", "6"], 0, "12 dibagi 3 adalah 4."),
        S(1, "Angka 7 dibaca …", ["Tujuh", "Enam", "Delapan", "Sembilan"], 0, "7 = Tujuh."),
        S(1, "Manakah angka yang lebih besar: 15 atau 9?", ["15", "9", "Sama besar", "Tidak ada"], 0, "15 lebih besar dari 9."),
        S(1, "8 + 7 = ?", ["15", "14", "16", "13"], 0, "8 ditambah 7 sama dengan 15."),
        S(1, "20 − 5 = ?", ["15", "10", "12", "14"], 0, "20 dikurangi 5 adalah 15."),
        S(1, "Bangun datar yang berbentuk bulat seperti roda dinamakan …", ["Lingkaran", "Persegi", "Segitiga", "Trapesium"], 0, "Roda berbentuk lingkaran."),
        S(1, "3 × 3 = ?", ["9", "6", "12", "8"], 0, "3 dikali 3 sama dengan 9."),
        S(1, "Berapa jumlah sudut pada persegi panjang?", ["4", "3", "5", "6"], 0, "Persegi panjang memiliki 4 sudut siku-siku."),
        S(1, "15 + 5 = ?", ["20", "25", "18", "22"], 0, "15 + 5 = 20."),
        S(1, "50 − 20 = ?", ["30", "20", "40", "10"], 0, "50 dikurangi 20 sama dengan 30."),
        S(1, "Urutan angka setelah 19 adalah …", ["20", "18", "21", "22"], 0, "Setelah 19 adalah 20."),
        S(1, "10 × 10 = ?", ["100", "90", "110", "1000"], 0, "10 dikali 10 sama dengan 100."),
        S(1, "Setengah dari angka 10 adalah …", ["5", "4", "6", "2"], 0, "10 dibagi 2 = 5."),
        S(1, "16 : 4 = ?", ["4", "5", "3", "6"], 0, "16 dibagi 4 = 4."),
        S(1, "4 + 4 + 4 = ?", ["12", "10", "14", "16"], 0, "4 dikali 3 = 12."),

        // Tingkat 2 (20 Soal)
        S(2, "15 × 4 = ?", ["60", "50", "65", "70"], 0, "15 dikali 4 sama dengan 60."),
        S(2, "144 : 12 = ?", ["12", "11", "13", "14"], 0, "12 × 12 = 144."),
        S(2, "1/2 + 1/4 = ?", ["3/4", "2/6", "1/6", "2/4"], 0, "2/4 + 1/4 = 3/4."),
        S(2, "Akar kuadrat dari 81 (√81) adalah …", ["9", "8", "7", "6"], 0, "9 × 9 = 81."),
        S(2, "Rumus luas persegi panjang adalah …", ["Panjang × Lebar", "Sisi × Sisi", "1/2 × Alas × Tinggi", "2 × (p + l)"], 0, "Luas = p × l."),
        S(2, "Rumus luas segitiga adalah …", ["1/2 × alas × tinggi", "Alas × tinggi", "Sisi × sisi", "π × r²"], 0, "Luas segitiga = 1/2 × a × t."),
        S(2, "Hasil dari 2³ adalah …", ["8", "6", "4", "9"], 0, "2 × 2 × 2 = 8."),
        S(2, "Hasil dari (−5) + 8 = ?", ["3", "−3", "13", "−13"], 0, "−5 + 8 = 3."),
        S(2, "Keliling persegi yang sisinya 6 cm adalah …", ["24 cm", "36 cm", "12 cm", "18 cm"], 0, "Keliling = 4 × s = 4 × 6 = 24 cm."),
        S(2, "Luas persegi dengan sisi 7 cm adalah …", ["49 cm²", "28 cm²", "14 cm²", "42 cm²"], 0, "Luas = s × s = 7 × 7 = 49 cm²."),
        S(2, "FPS (Faktor Persekutuan Terbesar) dari 12 dan 18 adalah …", ["6", "3", "2", "12"], 0, "Faktor terbesar yang membagi 12 dan 18 adalah 6."),
        S(2, "KPK (Kelipatan Persekutuan Terkecil) dari 4 dan 6 adalah …", ["12", "24", "18", "6"], 0, "Kelipatan terkecil dari 4 dan 6 adalah 12."),
        S(2, "Nilai desimal dari 3/5 adalah …", ["0,6", "0,5", "0,75", "0,3"], 0, "3 dibagi 5 = 0,6."),
        S(2, "25% jika diubah ke bentuk pecahan biasa menjadi …", ["1/4", "1/2", "1/5", "3/4"], 0, "25/100 disederhanakan menjadi 1/4."),
        S(2, "Besar sudut siku-siku adalah …", ["90°", "180°", "45°", "360°"], 0, "Sudut siku-siku besarnya 90°."),
        S(2, "Jumlah sudut dalam suatu segitiga adalah …", ["180°", "360°", "90°", "270°"], 0, "Total sudut dalam segitiga selalu 180°."),
        S(2, "Volume kubus dengan panjang rusuk 5 cm adalah …", ["125 cm³", "25 cm³", "100 cm³", "150 cm³"], 0, "Volume = s³ = 5 × 5 × 5 = 125 cm³."),
        S(2, "Jika 3x = 21, maka nilai x adalah …", ["7", "6", "8", "9"], 0, "x = 21 / 3 = 7."),
        S(2, "Akar dari 169 (√169) adalah …", ["13", "12", "14", "15"], 0, "13 × 13 = 169."),
        S(2, "Hasil dari 5! (5 faktorial) adalah …", ["120", "60", "20", "100"], 0, "5! = 5 × 4 × 3 × 2 × 1 = 120."),

        // Tingkat 3 (20 Soal)
        S(3, "Nilai x pada persamaan 3x + 5 = 20 adalah …", ["5", "3", "4", "6"], 0, "3x = 15 => x = 5."),
        S(3, "Keliling lingkaran yang memiliki jari-jari r = 7 cm (π = 22/7) adalah …", ["44 cm", "22 cm", "154 cm", "88 cm"], 0, "Keliling = 2 × π × r = 2 × (22/7) × 7 = 44 cm."),
        S(3, "Luas lingkaran berjari-jari r = 7 cm adalah …", ["154 cm²", "44 cm²", "308 cm²", "49 cm²"], 0, "Luas = π × r² = (22/7) × 49 = 154 cm²."),
        S(3, "Turunan pertama dari f(x) = x² adalah …", ["2x", "x", "x²", "2"], 0, "Turunan xⁿ adalah n·xⁿ⁻¹, jadi 2x."),
        S(3, "Hasil dari ∫ 2x dx adalah …", ["x² + C", "2x² + C", "x + C", "2 + C"], 0, "Integral dari 2x adalah x² + C."),
        S(3, "Nilai dari sin 90° adalah …", ["1", "0", "1/2", "√3/2"], 0, "Sinus 90° = 1."),
        S(3, "Nilai dari cos 0° adalah …", ["1", "0", "1/2", "−1"], 0, "Kosinus 0° = 1."),
        S(3, "Nilai dari log 100 (basis 10) adalah …", ["2", "1", "10", "100"], 0, "10² = 100, maka log 100 = 2."),
        S(3, "Jika matriks A = [2 3; 1 4], tentukan determinan A!", ["5", "11", "2", "8"], 0, "Det = (2×4) − (3×1) = 8 − 3 = 5."),
        S(3, "Persamaan kuadrat x² − 5x + 6 = 0 memiliki akar-akar …", ["2 dan 3", "−2 dan −3", "1 dan 6", "−1 dan −6"], 0, "(x − 2)(x − 3) = 0 => x = 2 atau x = 3."),
        S(3, "Suku ke-10 dari barisan aritmatika 2, 5, 8, 11, … adalah …", ["29", "27", "30", "32"], 0, "Un = a + (n−1)b => U10 = 2 + 9(3) = 29."),
        S(3, "Jumlah 5 suku pertama dari deret geometri 1, 2, 4, 8, … adalah …", ["31", "30", "32", "63"], 0, "Sn = 1 + 2 + 4 + 8 + 16 = 31."),
        S(3, "Berapa banyak cara menyusun 3 huruf dari kata 'CAT' tanpa pengulangan?", ["6", "3", "9", "12"], 0, "3! (3 P 3) = 3 × 2 × 1 = 6."),
        S(3, "Peluang munculnya angka genap pada pelemparan sebuah dadu 6 sisi adalah …", ["1/2", "1/3", "1/6", "2/3"], 0, "Angka genap: {2,4,6} (3 dari 6) = 3/6 = 1/2."),
        S(3, "Nilai dari tan 45° adalah …", ["1", "0", "√3", "1/√3"], 0, "Tan 45° = Sin 45° / Cos 45° = 1."),
        S(3, "Jika lim(x→2) (x² − 4) / (x − 2) dievaluasi, hasilnya adalah …", ["4", "0", "2", "Tak hingga"], 0, "(x−2)(x+2)/(x−2) = x+2 => 2+2 = 4."),
        S(3, "Panjang hipotenusa (sisi miring) segitiga siku-siku dengan alas 3 cm dan tinggi 4 cm adalah …", ["5 cm", "6 cm", "7 cm", "8 cm"], 0, "c = √(3² + 4²) = √(9+16) = √25 = 5 cm."),
        S(3, "Pernyataan bernilai salah yang diimplikasikan dalam logika matematika (P → Q) terjadi saat …", ["P benar, Q salah", "P benar, Q benar", "P salah, Q benar", "P salah, Q salah"], 0, "Implikasi P→Q hanya bernilai salah jika anteseden (P) benar dan konsekuen (Q) salah."),
        S(3, "Modus dari data: 4, 5, 6, 6, 7, 8, 6, 9 adalah …", ["6", "5", "7", "8"], 0, "Modus adalah nilai yang paling sering muncul (6 muncul 3 kali)."),
        S(3, "Rata-rata (mean) dari nilai 10, 20, 30, 40, 50 adalah …", ["30", "25", "35", "40"], 0, "Total = 150 / 5 = 30.")
      ]
    },

    // ------------------------------------------------------------
    // 5. IPAS (IPA & IPS Terpadu SD)
    // ------------------------------------------------------------
    {
      id: "ipas",
      nama: "IPAS (IPA & IPS Terpadu)",
      ikon: "🌱",
      warna: "#84cc16",
      soal: [
        // Tingkat 1 (20 Soal)
        S(1, "Hewan yang dijuluki 'Raja Hutan' adalah …", ["Singa", "Kelinci", "Gajah", "Kucing"], 0, "Singa sering dijuluki raja hutan."),
        S(1, "Tumbuhan memerlukan cahaya matahari untuk proses pembuatan makanan yang disebut …", ["Fotosintesis", "Respirasi", "Perkembangbiakan", "Mendung"], 0, "Fotosintesis terjadi dengan bantuan cahaya matahari."),
        S(1, "Komponen biotik dalam ekosistem meliputi …", ["Makhluk hidup", "Air dan tanah", "Batu dan udara", "Cahaya matahari"], 0, "Biotik merujuk pada benda/makhluk hidup."),
        S(1, "Benda yang tidak hidup di alam sekitar dinamakan komponen …", ["Abiotik", "Biotik", "Organik", "Biologi"], 0, "Abiotik terdiri dari komponen benda tak hidup."),
        S(1, "Pohon menyerap air dari dalam tanah melalui …", ["Akar", "Daun", "Batang", "Bunga"], 0, "Akar berfungsi menyerap air dan hara tanah."),
        S(1, "Bagian tumbuhan yang berfungsi sebagai tempat berlangsungnya fotosintesis adalah …", ["Daun", "Akar", "Batang", "Buah"], 0, "Klorofil pada daun menyerap cahaya matahari."),
        S(1, "Hewan pemakan pemakan daging dinamakan …", ["Karnivora", "Herbivora", "Omnivora", "Insektivora"], 0, "Karnivora adalah golongan pemakan daging."),
        S(1, "Hewan pemakan tumbuhan dinamakan …", ["Herbivora", "Karnivora", "Omnivora", "Kanibal"], 0, "Herbivora memakan daun/tumbuhan."),
        S(1, "Hewan pemakan segala (daging dan tumbuhan) dinamakan …", ["Omnivora", "Herbivora", "Karnivora", "Insektivora"], 0, "Omnivora memakan baik tumbuhan maupun daging."),
        S(1, "Perubahan wujud benda dari cair menjadi padat dinamakan …", ["Membeku", "Mencair", "Menguap", "Menyublim"], 0, "Air yang membeku berubah menjadi es padat."),
        S(1, "Perubahan wujud es menjadi air dinamakan …", ["Mencair", "Membeku", "Mengembun", "Mengkristal"], 0, "Es yang meleleh/mencair menjadi air."),
        S(1, "Peta adalah gambaran permukaan bumi pada bidang datar yang diperkecil dengan …", ["Skala", "Kaca pembesar", "Warna", "Penggaris"], 0, "Skala membandingkan jarak peta dan sebenarnya."),
        S(1, "Simbol warna biru pada peta geografis biasanya menggambarkan …", ["Perairan / Laut", "Pegunungan", "Dataran rendah", "Hutan"], 0, "Biru menandakan wilayah perairan/laut."),
        S(1, "Candi Borobudur merupakan peninggalan bersejarah dari agama …", ["Buddha", "Hindu", "Islam", "Konghucu"], 0, "Candi Borobudur adalah candi Buddha terbesar."),
        S(1, "Candi Prambanan merupakan candi peninggalan agama …", ["Hindu", "Buddha", "Islam", "Kristen"], 0, "Prambanan adalah komplek candi Hindu."),
        S(1, "Kegiatan menghasilkan barang atau jasa dinamakan …", ["Produksi", "Konsumsi", "Distribusi", "Ekspor"], 0, "Produksi menciptakan barang/jasa."),
        S(1, "Orang yang menggunakan atau menghabiskan barang dan jasa dinamakan …", ["Konsumen", "Produsen", "Distributor", "Kurir"], 0, "Konsumen memakai produk/jasa."),
        S(1, "Orang yang menyalurkan barang dari produsen ke konsumen dinamakan …", ["Distributor", "Produsen", "Konsumen", "Penjual"], 0, "Distributor menyalurkan barang."),
        S(1, "Sumber energi utama bagi kehidupan di bumi adalah …", ["Matahari", "Angin", "Batu bara", "Minyak bumi"], 0, "Matahari memancarkan panas dan cahaya utama bagi bumi."),
        S(1, "Alat navigasi untuk menentukan arah mata angin adalah …", ["Kompas", "Termometer", "Barometer", "Jam"], 0, "Kompas penunjuk arah utara-selatan."),

        // Tingkat 2 (20 Soal)
        S(2, "Daur hidup kupu-kupu yang mengalami perubahan bentuk sempurna dinamakan …", ["Metamorfosis sempurna", "Metamorfosis tidak sempurna", "Ametamorfosis", "Polimorfisme"], 0, "Metamorfosis sempurna melalui tahapan telur-ulat-kepompong-kupu2."),
        S(2, "Tahapan metamorfosis kupu-kupu setelah ulat (larva) adalah …", ["Kepompong (Pupa)", "Telur", "Kupu-kupu dewasa", "Nimfa"], 0, "Larva berubah menjadi pupa/kepompong."),
        S(2, "Hubungan ketergantungan antara makhluk hidup dan lingkungannya dinamakan …", ["Ekosistem", "Habitats", "Populasi", "Komunitas"], 0, "Ekosistem adalah interaksi biotik dan abiotik."),
        S(2, "Simbiosis mutualisme adalah hubungan dua makhluk hidup yang …", ["Saling menguntungkan", "Satu rugi satu untung", "Satu untung satu tidak terpengaruh", "Saling merugikan"], 0, "Mutualisme menguntungkan kedua belah pihak."),
        S(2, "Contoh simbiosis mutualisme adalah interaksi antara …", ["Lebah dan bunga", "Benalu dan pohon inang", "Kutu dan kucing", "Ikan remora dan hiu"], 0, "Lebah mendapat nektar, bunga terbantu penyerbukan."),
        S(2, "Proses penguapan air laut ke udara dalam siklus air dinamakan …", ["Evaporasi", "Kondensasi", "Presipitasi", "Infiltrasi"], 0, "Evaporasi adalah penguapan air permukaan."),
        S(2, "Proses pembentukan awan dari uap air dinamakan …", ["Kondensasi", "Evaporasi", "Transpirasi", "Sublimasi"], 0, "Kondensasi adalah pengembunan uap menjadi awan."),
        S(2, "Peristiwa turunnya hujan dinamakan …", ["Presipitasi", "Evaporasi", "Infiltrasi", "Transpirasi"], 0, "Presipitasi adalah jatuhnya titik air hujan."),
        S(2, "Kerajaan Islam pertama di Pulau Jawa adalah …", ["Kerajaan Demak", "Kerajaan Mataram", "Kerajaan Banten", "Kerajaan Samudera Pasai"], 0, "Demak adalah kerajaan Islam pertama di Jawa."),
        S(2, "Kerajaan Islam pertama di Indonesia adalah …", ["Samudera Pasai", "Demak", "Aceh Darussalam", "Ternate"], 0, "Samudera Pasai berdiri di Aceh abad ke-13."),
        S(2, "Pahlawan nasional yang dijuluki 'Ayam Jantan dari Timur' adalah …", ["Sultan Hasanuddin", "Pangeran Diponegoro", "Pattimura", "Tuanku Imam Bonjol"], 0, "Sultan Hasanuddin dari Gowa dinamai Ayam Jantan dari Timur."),
        S(2, "Perang Diponegoro melawan penjajah Belanda terjadi pada tahun …", ["1825 – 1830", "1942 – 1945", "1908 – 1928", "1811 – 1816"], 0, "Perang Jawa/Diponegoro berlangsung 1825–1830."),
        S(2, "Garis khayal yang membagi bumi menjadi bagian Utara dan Selatan dinamakan …", ["Garis Khatulistiwa / Ekuator", "Garis Bujur", "Garis Meridian", "Garis Tropis"], 0, "Khatulistiwa melintang di tengah bumi (0°)."),
        S(2, "Garis lintang 0° yang melewati kota Pontianak di Indonesia adalah garis …", ["Khatulistiwa", "Meridian", "Greenwich", "Bujur Timur"], 0, "Kota Pontianak dilintasi tepat garis Khatulistiwa."),
        S(2, "Perubahan energi pada kipas angin yang menyala adalah dari energi listrik menjadi …", ["Energi gerak", "Energi panas", "Energi kimia", "Energi bunyi"], 0, "Kipas angin mengubah listrik menjadi gerak kinetik."),
        S(2, "Perubahan energi pada panel surya adalah dari energi cahaya menjadi …", ["Energi listrik", "Energi panas", "Energi kimia", "Energi gerak"], 0, "Panel surya menyerap sinar matahari menjadi arus listrik."),
        S(2, "Kondisi rata-rata cuaca dalam jangka waktu yang lama dan area luas dinamakan …", ["Iklim", "Cuaca", "Musim", "Suhu"], 0, "Iklim diukur dalam skala puluhan tahun."),
        S(2, "Kondisi udara pada waktu singkat dan tempat terbatas dinamakan …", ["Cuaca", "Iklim", "Musim", "Kelembapan"], 0, "Cuaca berubah dalam hitungan jam/hari."),
        S(2, "Indonesia memiliki iklim …", ["Tropis", "Subtropis", "Sedang", "Dingin / Kutub"], 0, "Letak astronomis Indonesia menyebabkan beriklim tropis."),
        S(2, "Kegiatan perdagangan antarnegara dinamakan ekspor dan …", ["Impor", "Barter", "Grosir", "Retail"], 0, "Ekspor (menjual ke luar) dan Impor (membeli dari luar)."),

        // Tingkat 3 (20 Soal)
        S(3, "Konsep 'Rantai Makanan' dalam ekosistem menempatkan tumbuhan hijau sebagai …", ["Produsen", "Konsumen I", "Konsumen II", "Pengurai (Dekomposer)"], 0, "Tumbuhan mampu memproduksi energi sendiri (autotrof)."),
        S(3, "Organisme pengurai seperti bakteri dan jamur dinamakan …", ["Dekomposer", "Produsen", "Predator", "Herbivora"], 0, "Dekomposer menguraikan sisa-sisa organik."),
        S(3, "Lapisan udara yang menyelimuti bumi dinamakan …", ["Atmfer", "Litosfer", "Hidrosfer", "Biosfer"], 0, "Atmosfer adalah lapisan gas pembungkus bumi."),
        S(3, "Lapisan atmosfer tempat terjadinya fenomena cuaca seperti hujan dan awan adalah …", ["Troposfer", "Stratosfer", "Mesosfer", "Termosfer"], 0, "Troposfer adalah lapisan atmosfer terbawah tempat dinamika cuaca."),
        S(3, "Lapisan atmosfer yang melindungi bumi dari radiasi sinar ultraviolet matahari adalah lapisan …", ["Ozon (Stratosfer)", "Troposfer", "Exosfer", "Mesosfer"], 0, "Lapisan ozon menyerap radiasi UV berdampak buruk."),
        S(3, "Pergerakan lempeng tektonik yang saling menjauh dinamakan batas …", ["Divergen", "Konvergen", "Transform", "Subduksi"], 0, "Divergen adalah batas lempeng saling menjauh."),
        S(3, "Pergerakan lempeng tektonik yang saling bertabrakan dinamakan batas …", ["Konvergen", "Divergen", "Transform", "Sesar"], 0, "Konvergen adalah batas lempeng bertabrakan."),
        S(3, "Teori yang menyatakan bahwa benua-benua di bumi dahulu menyatu dalam satu daratan besar dinamakan Teori Pergeseran Benua dengan benua raksasa dinamakan …", ["Pangea", "Gondwana", "Laurasia", "Tethys"], 0, "Pangea adalah superbenua purba."),
        S(3, "Tokoh yang mengemukakan Teori Pergeseran Benua (Continental Drift) adalah …", ["Alfred Wegener", "Charles Darwin", "Isaac Newton", "Galileo Galilei"], 0, "Alfred Wegener mencetuskan Teori Continental Drift tahun 1912."),
        S(3, "Prinsip ekonomi utama menyatakan bahwa manusia bertindak dengan pengorbanan sekecil-kecilnya untuk mendapatkan hasil …", ["Maksimal / Seoptimal mungkin", "Minimal", "Sama", "Tanpa batas"], 0, "Prinsip ekonomi: efisiensi biaya dan optimasi hasil."),
        S(3, "Pasar di mana hanya ada satu penjual yang menguasai seluruh penawaran barang dinamakan pasar …", ["Monopoli", "Oligopoli", "Monopsoni", "Persaingan Sempurna"], 0, "Monopoli dikuasai oleh penjual tunggal."),
        S(3, "Pasar yang dikuasai oleh beberapa perusahaan besar dinamakan pasar …", ["Oligopoli", "Monopoli", "Duopoli", "Monopolistik"], 0, "Oligopoli dikuasai sedikit penjual (misal: industri semen/seluler)."),
        S(3, "Dampak peningkatan suhu rata-rata global di bumi dikenal dengan istilah …", ["Pemanasan Global (Global Warming)", "Efek Rumah Kaca", "El Nino", "La Nina"], 0, "Global warming peningkatan temperatur bumi."),
        S(3, "Fenomena penyimpangan iklim berupa peningkatan suhu permukaan laut di Pasifik tengah yang menyebabkan kekeringan di Indonesia dinamakan …", ["El Niño", "La Niña", "Tsunami", "Siklon"], 0, "El Niño membawa dampak kemarau panjang di Indonesia."),
        S(3, "Fenomena iklim yang menyebabkan curah hujan tinggi berlebihan di Indonesia adalah …", ["La Niña", "El Niño", "Gelombang Panas", "Monsoon Kalbar"], 0, "La Niña meningkatkan pembentukan awan hujan di Nusantara."),
        S(3, "Sistem pertukaran barang tanpa menggunakan uang pada zaman purba dinamakan …", ["Barter", "Kredit", "Subsistensi", "Moneter"], 0, "Barter adalah sistem tukar-menukar barang."),
        S(3, "Organisasi Internasional bangsa-bangsa Asia Tenggara adalah …", ["ASEAN", "APEC", "OPEC", "NATO"], 0, "ASEAN wadah kerja sama kawasan Asia Tenggara."),
        S(3, "ASEAN didirikan melalui Deklarasi Bangkok pada tanggal …", ["8 Agustus 1967", "17 Agustus 1945", "24 Oktober 1945", "1 Juni 1945"], 0, "Deklarasi Bangkok ditandatangani 8 Agustus 1967."),
        S(3, "Tokoh perwakilan dari Indonesia dalam penandatanganan Deklarasi Bangkok pendirian ASEAN adalah …", ["Adam Malik", "Tun Abdul Razak", "S. Rajaratnam", "Thanat Khoman"], 0, "Adam Malik mewakili Indonesia dalam pendirian ASEAN."),
        S(3, "Konsep 'Keunggulan Komparatif' dalam perdagangan internasional dicetuskan oleh …", ["David Ricardo", "Adam Smith", "John Maynard Keynes", "Karl Marx"], 0, "David Ricardo mengembangkan Teori Keunggulan Komparatif.")
      ]
    },

    // ------------------------------------------------------------
    // 6. IPA (Biologi, Fisika, Kimia)
    // ------------------------------------------------------------
    {
      id: "ipa",
      nama: "IPA (Biologi, Fisika, Kimia)",
      ikon: "🔬",
      warna: "#3b82f6",
      soal: [
        // Tingkat 1 (20 Soal)
        S(1, "Kita melihat indahnya pemandangan menggunakan organ …", ["Mata", "Telinga", "Hidung", "Lidah"], 0, "Mata adalah indra penglihatan."),
        S(1, "Matahari terbit dari arah …", ["Timur", "Barat", "Utara", "Selatan"], 0, "Matahari selalu terbit di sebelah timur."),
        S(1, "Air yang dimasukkan ke dalam freezer akan membeku menjadi …", ["Es", "Uap", "Gas", "Minyak"], 0, "Air membeku menjadi es padat."),
        S(1, "Kita mendengarkan suara musik dengan panca indra …", ["Telinga", "Mata", "Kulit", "Hidung"], 0, "Telinga adalah indra pendengaran."),
        S(1, "Bagian tubuh manusia untuk mengecap rasa makanan adalah …", ["Lidah", "Gigi", "Bibir", "Tenggorokan"], 0, "Lidah memiliki saraf pengecap rasa."),
        S(1, "Benda yang ditarik oleh magnet adalah benda yang terbuat dari …", ["Besi / Logam", "Plastik", "Kayu", "Kertas"], 0, "Magnet menarik benda fermentik seperti besi."),
        S(1, "Gas yang kita hirup saat bernapas adalah …", ["Oksigen", "Karbondioksida", "Nitrogen", "Helium"], 0, "Manusia memerlukan oksigen untuk bernapas."),
        S(1, "Gas yang diembuskan manusia saat bernapas adalah …", ["Karbondioksida", "Oksigen", "Hidrogen", "Methane"], 0, "Karbondioksida diproduksi hasil respirasi."),
        S(1, "Alat pernapasan pada ikan adalah …", ["Insang", "Paru-paru", "Trakea", "Kulit"], 0, "Ikan menyerap oksigen air lewat insang."),
        S(1, "Alat pernapasan utama pada manusia adalah …", ["Paru-paru", "Insang", "Jantung", "Hati"], 0, "Paru-paru adalah organ pernapasan utama manusia."),
        S(1, "Katak berkembang biak dengan cara bertelur. Anak katak yang baru menetas dinamakan …", ["Berudu / Kecebong", "Ulat", "Jentik", "Larva"], 0, "Fase awal katak adalah berudu."),
        S(1, "Cicak memutuskan ekornya untuk mengelabuhi musuh. Kemampuan ini dinamakan …", ["Autotomi", "Mimikri", "Kamuflase", "Adaptasi"], 0, "Autotomi adalah tindakan memutus ekor."),
        S(1, "Bunglon mengubah warna kulitnya sesuai tempat ia berada dinamakan …", ["Mimikri", "Autotomi", "Hibernasi", "Ekolokasi"], 0, "Mimikri mengadaptasi warna lingkungan."),
        S(1, "Kelelawar dapat terbang malam tanpa menabrak dengan bantuan sistem bunyi gelombang dinamakan …", ["Ekolokasi", "Autotomi", "Mimikri", "Resonansi"], 0, "Ekolokasi memantulkan pantulan bunyi ultra."),
        S(1, "Planet tempat manusia tinggal adalah …", ["Bumi", "Mars", "Jupiter", "Venus"], 0, "Bumi adalah planet berpenghuni."),
        S(1, "Suhu dingin diukur dengan alat bernama …", ["Termometer", "Barometer", "Speedometer", "Stetoskop"], 0, "Termometer mengukur suhu/temperatur."),
        S(1, "Gaya yang menyebabkan buah apel jatuh ke bumi adalah gaya …", ["Gravitasi", "Gesek", "Magnet", "Pegas"], 0, "Gravitasi menarik benda menuju pusat bumi."),
        S(1, "Bayangan tubuh kita terbentuk karena cahaya bergerak secara …", ["Lurus", "Berbelok-belok", "Memutar", "Terputus-putus"], 0, "Cahaya merambat lurus."),
        S(1, "Cermin yang digunakan pada kaca spion kendaraan adalah cermin …", ["Cembung", "Cekung", "Datar", "Ganda"], 0, "Cermin cembung memperluas jarak pandang belakang."),
        S(1, "Zat cair yang dipanaskan terus menerus akan berubah menjadi …", ["Gas / Uap", "Padat", "Es", "Batu"], 0, "Pemanasan zat cair menimbulkan penguapan."),

        // Tingkat 2 (20 Soal)
        S(2, "Planet terdekat dengan Matahari dalam tata surya kita adalah …", ["Merkurius", "Venus", "Bumi", "Mars"], 0, "Merkurius berada di orbit paling dalam."),
        S(2, "Planet terbesar dalam sistem tata surya kita adalah …", ["Jupiter", "Saturnus", "Neptunus", "Uranus"], 0, "Jupiter adalah planet raksasa gas terbesar."),
        S(2, "Planet yang terkenal dengan cincin indahnya adalah …", ["Saturnus", "Jupiter", "Uranus", "Neptunus"], 0, "Saturnus memiliki cincin es dan debu menonjol."),
        S(2, "Titik didih air murni pada tekanan standar (1 atm) adalah …", ["100 °C", "0 °C", "80 °C", "50 °C"], 0, "Air mendidih pada suhu 100 °C."),
        S(2, "Titik beku air murni adalah …", ["0 °C", "100 °C", "4 °C", "−10 °C"], 0, "Air membeku pada suhu 0 °C."),
        S(2, "Satuan Standar Internasional (SI) untuk gaya adalah …", ["Newton (N)", "Joule (J)", "Watt (W)", "Pascal (Pa)"], 0, "Gaya diukur dalam Newton."),
        S(2, "Satuan Standar Internasional (SI) untuk energi dan usaha adalah …", ["Joule (J)", "Newton", "Watt", "Volt"], 0, "Energi/Usaha ber-satuan Joule."),
        S(2, "Satuan daya listrik adalah …", ["Watt (W)", "Ampere", "Volt", "Ohm"], 0, "Daya diukur dalam Watt."),
        S(2, "Organ tubuh manusia yang berfungsi memompa darah ke seluruh tubuh adalah …", ["Jantung", "Paru-paru", "Hati", "Ginjal"], 0, "Jantung adalah organ pemompa darah."),
        S(2, "Organ tubuh manusia yang berfungsi menyaring limbah darah dan menghasilkan urine adalah …", ["Ginjal", "Hati", "Lambung", "Usus Besar"], 0, "Ginjal melakukan ekskresi penyaringan darah."),
        S(2, "Zat hijau daun pada tumbuhan yang berfungsi menyerap cahaya matahari dinamakan …", ["Klorofil", "Kloroplas", "Karoten", "Stomata"], 0, "Klorofil adalah pigmen hijau fotosintesis."),
        S(2, "Penyakit akibat kekurangan sel darah merah atau hemoglobin dinamakan …", ["Anemia", "Leukemia", "Hipertensi", "Hemofilia"], 0, "Anemia adalah kekurangan eritrosit/Hb."),
        S(2, "Kanker darah yang ditandai jumlah sel darah putih berlebihan dinamakan …", ["Leukemia", "Anemia", "Hipotensi", "Diabetes"], 0, "Leukemia adalah produksi leukosit tidak terkendali."),
        S(2, "Satuan hambatan listrik dalam hukum Ohm dinamakan …", ["Ohm (Ω)", "Volt", "Ampere", "Coulomb"], 0, "Hambatan diukur dalam Ohm."),
        S(2, "Bentuk zat yang memiliki volume dan bentuk tetap dinamakan zat …", ["Padat", "Cair", "Gas", "Plasma"], 0, "Benda padat bentuk dan volumenya konstan."),
        S(2, "Zat yang bentuknya berubah menyesuaikan wadah tetapi volumenya tetap adalah zat …", ["Cair", "Padat", "Gas", "Uap"], 0, "Zat cair mengalir dan mengikuti wadah."),
        S(2, "Lensa mata yang mengalami rabun jauh (miopi) ditolong menggunakan kacamata berlensa …", ["Cekung (Negatif)", "Cembung (Positif)", "Ganda", "Silindris"], 0, "Miopi dibantu lensa cekung (negatif)."),
        S(2, "Lensa mata untuk penderita rabun dekat (hipermetropi) memakai lensa …", ["Cembung (Positif)", "Cekung", "Datar", "Prisma"], 0, "Hipermetropi dibantu lensa cembung (positif)."),
        S(2, "Rumus kimia air adalah …", ["H₂O", "CO₂", "NaCl", "O₂"], 0, "Air terdiri dari 2 atom Hidrogen & 1 atom Oksigen (H₂O)."),
        S(2, "Rumus kimia gas Karbondioksida adalah …", ["CO₂", "CO", "H₂O", "CH₄"], 0, "CO₂ adalah karbondioksida."),

        // Tingkat 3 (20 Soal)
        S(3, "Organel sel yang berfungsi sebagai tempat pembentukan energi (ATP) adalah …", ["Mitokondria", "Ribosom", "Lisosom", "Badan Golgi"], 0, "Mitokondria adalah powerhouse of the cell."),
        S(3, "Organel sel yang berperan dalam sintesis protein adalah …", ["Ribosom", "Mitokondria", "Vakuola", "Sentrosom"], 0, "Ribosom memproduksi rantai protein."),
        S(3, "Organel pembawa materi genetik keturunan di dalam inti sel adalah …", ["Kromosom (DNA)", "RNA", "Sitoplasma", "Membran"], 0, "Kromosom membawa materi genetik DNA."),
        S(3, "Hukum II Newton menyatakan hubungan gaya, massa, dan percepatan dengan rumus …", ["F = m × a", "F = m / a", "F = v × t", "E = m c²"], 0, "Gaya (F) = massa (m) × percepatan (a)."),
        S(3, "Unsur paling melimpah di alam semesta kita adalah …", ["Hidrogen", "Oksigen", "Helium", "Karbon"], 0, "Hidrogen menyusun bagian terbesar materi alam semesta."),
        S(3, "Rumus kimia dari garam dapur adalah …", ["NaCl", "KCl", "NaOH", "HCl"], 0, "Natrium Klorida (NaCl) adalah garam dapur."),
        S(3, "Tingkat keasaman (pH) untuk larutan yang bersifat netral adalah …", ["7", "0", "14", "1"], 0, "pH 7 adalah skala keasaman netral."),
        S(3, "Larutan dengan pH kurang dari 7 bersifat …", ["Asam", "Basa", "Netral", "Garami"], 0, "pH < 7 mengindikasikan sifat asam."),
        S(3, "Larutan dengan pH lebih besar dari 7 bersifat …", ["Basa / Alkalis", "Asam", "Netral", "Jenuh"], 0, "pH > 7 mengindikasikan sifat basa."),
        S(3, "Partikel penyusun inti atom yang bermuatan positif adalah …", ["Proton", "Neutron", "Elektron", "Positron"], 0, "Proton adalah partikel positif inti atom."),
        S(3, "Partikel subatomik yang bermuatan negatif dan mengelilingi inti atom dinamakan …", ["Elektron", "Proton", "Neutron", "Foton"], 0, "Elektron bermuatan negatif di kulit atom."),
        S(3, "Partikel inti atom yang tidak bermuatan (netral) dinamakan …", ["Neutron", "Proton", "Elektron", "Quark"], 0, "Neutron adalah partikel netral di inti."),
        S(3, "Kecepatan cahaya di ruang hampa udara adalah sekitar …", ["3 × 10⁸ m/s", "300.000 m/s", "3 × 10⁵ m/s", "1.000 m/s"], 0, "Kecepatan cahaya 300.000 km/s (3×10⁸ m/s)."),
        S(3, "Teori Relativitas Khusus dan Umum dicetuskan oleh fisikawan ternama …", ["Albert Einstein", "Isaac Newton", "Niels Bohr", "Max Planck"], 0, "Albert Einstein merumuskan Teori Relativitas."),
        S(3, "Pembelahan sel yang menghasilkan sel anak dengan jumlah kromosom sama seperti sel induk (2n) dinamakan …", ["Mitosis", "Meiosis", "Amitosis", "Biner"], 0, "Mitosis menghasilkan sel anak identik (2n)."),
        S(3, "Pembelahan sel reduksi yang menghasilkan sel kelamin (gamet) dengan jumlah kromosom separuh (n) dinamakan …", ["Meiosis", "Mitosis", "Sporulasi", "Amitosis"], 0, "Meiosis menghasilkan haploid (n) untuk sel gamet."),
        S(3, "Hukum kekekalan energi menyatakan bahwa energi …", ["Tidak dapat diciptakan atau dimusnahkan, hanya dapat berubah bentuk", "Dapat diciptakan dari kehampaan", "Pasti habis berkurang", "Berubah menjadi massa secara spontan"], 0, "Hukum I Termodinamika: Energi bersifat kekal."),
        S(3, "Reaksi kimia yang menyerap panas/kalor dari lingkungan dinamakan reaksi …", ["Endoterm", "Eksoterm", "Oksidasi", "Reduksi"], 0, "Endoterm menyerap kalor lingkungan."),
        S(3, "Reaksi kimia yang melepaskan kalor/panas ke lingkungan dinamakan reaksi …", ["Eksoterm", "Endoterm", "Netralisasi", "Sublimasi"], 0, "Eksoterm memancarkan kalor ke luar."),
        S(3, "Gas rumah kaca yang paling dominan menyebabkan efek pemanasan global akibat aktivitas industri adalah …", ["Karbondioksida (CO₂)", "Oksigen (O₂)", "Nitrogen (N₂)", "Helium (He)"], 0, "Emisi CO₂ tinggi merupakan pemicu utama global warming.")
      ]
    },

    // ------------------------------------------------------------
    // 7. IPS (Sejarah, Geografi, Ekonomi, Sosiologi)
    // ------------------------------------------------------------
    {
      id: "ips",
      nama: "IPS (Sejarah, Geografi, Ekonomi)",
      ikon: "🌏",
      warna: "#d97706",
      soal: [
        // Tingkat 1 (20 Soal)
        S(1, "Lambang negara Republik Indonesia adalah …", ["Garuda Pancasila", "Harimau", "Gajah", "Elang Jawa"], 0, "Burung Garuda Pancasila adalah lambang resmi negara."),
        S(1, "Hari Kemerdekaan Indonesia diperingati setiap tanggal …", ["17 Agustus", "1 Juni", "28 Oktober", "10 November"], 0, "Proklamasi dibacakan 17 Agustus 1945."),
        S(1, "Kota Ibu Kota Negara Indonesia saat ini adalah …", ["Jakarta", "Surabaya", "Bandung", "Medan"], 0, "DKI Jakarta adalah ibu kota negara."),
        S(1, "Mata uang resmi negara Indonesia adalah …", ["Rupiah (IDR)", "Ringgit", "Dolar", "Yen"], 0, "Rupiah adalah mata uang resmi Indonesia."),
        S(1, "Hari Sumpah Pemuda diperingati setiap tanggal …", ["28 Oktober", "10 November", "2 Mei", "20 Mei"], 0, "Sumpah Pemuda dicetuskan 28 Oktober 1928."),
        S(1, "Hari Pahlawan di Indonesia diperingati setiap tanggal …", ["10 November", "17 Agustus", "1 Juni", "21 April"], 0, "Hari Pahlawan memperingati pertempuran Surabaya 10 Nov 1945."),
        S(1, "Hari Kartini diperingati setiap tanggal …", ["21 April", "2 Mei", "20 Mei", "22 Desember"], 0, "21 April memperingati hari lahir R.A. Kartini."),
        S(1, "Hari Pendidikan Nasional (Hardiknas) diperingati tanggal …", ["2 Mei", "20 Mei", "1 Oktober", "10 November"], 0, "Hardiknas diperingati 2 Mei (Hari lahir Ki Hajar Dewantara)."),
        S(1, "Bapak Pendidikan Nasional Indonesia adalah …", ["Ki Hajar Dewantara", "R.A. Kartini", "Ir. Soekarno", "Bung Hatta"], 0, "Ki Hajar Dewantara adalah Bapak Pendidikan Nasional."),
        S(1, "Candi Hindu terbesar di Indonesia adalah Candi …", ["Prambanan", "Borobudur", "Mendut", "Muara Takus"], 0, "Prambanan di Yogyakarta adalah candi Hindu terbesar."),
        S(1, "Candi Buddha terbesar di dunia yang ada di Indonesia adalah Candi …", ["Borobudur", "Prambanan", "Cetho", "Sewu"], 0, "Borobudur di Magelang adalah candi Buddha terbesar."),
        S(1, "Suku asli yang mendiami Pulau Bali adalah suku …", ["Bali", "Jawa", "Sunda", "Batak"], 0, "Suku Bali mayoritas menghuni Pulau Bali."),
        S(1, "Rumah adat khas dari Sumatra Barat dinamakan Rumah …", ["Gadang", "Joglo", "Lamin", "Tongkonan"], 0, "Rumah Gadang memiliki atap melengkung menyerupai tanduk."),
        S(1, "Rumah adat khas Jawa dinamakan Rumah …", ["Joglo", "Gadang", "Honai", "Tongkonan"], 0, "Rumah Joglo adalah rumah adat Jawa."),
        S(1, "Rumah adat khas suku Papua dinamakan Rumah …", ["Honai", "Gadang", "Joglo", "Panggung"], 0, "Honai berbentuk bulat beratap jerami khas Papua."),
        S(1, "Pakaian adat khas daerah Jawa yang terbuat dari kain corak dinamakan …", ["Batik", "Ulos", "Songket", "Tenun"], 0, "Kain batik adalah warisan budaya Nusantara."),
        S(1, "Kain tradisional khas suku Batak dinamakan Kain …", ["Ulos", "Songket", "Batik", "Sasirangan"], 0, "Ulos adalah kain tenun khas Batak."),
        S(1, "Senjata tradisional khas suku Sunda Jawa Barat dinamakan …", ["Kujang", "Keris", "Rencong", "Mandau"], 0, "Kujang merupakan senjata tradisional Sunda."),
        S(1, "Senjata tradisional khas Jawa adalah …", ["Keris", "Kujang", "Mandau", "Rencong"], 0, "Keris adalah senjata tikam khas Jawa."),
        S(1, "Senjata tradisional khas Aceh dinamakan …", ["Rencong", "Kujang", "Mandau", "Badik"], 0, "Rencong adalah senjata khas rakyat Aceh."),

        // Tingkat 2 (20 Soal)
        S(2, "Proklamasi Kemerdekaan Indonesia dibacakan pada tahun …", ["1945", "1942", "1950", "1928"], 0, "Proklamasi Kemerdekaan RI 17 Agustus 1945."),
        S(2, "Naskah Proklamasi Kemerdekaan diketik oleh …", ["Sayuti Melik", "Sukarni", "B.M. Diah", "Chaerul Saleh"], 0, "Sayuti Melik mengetik naskah proklamasi."),
        S(2, "Penjahit bendera Pusaka Merah Putih pertama adalah …", ["Ibu Fatmawati", "R.A. Kartini", "Cut Nyak Dien", "Dewi Sartika"], 0, "Ibu Fatmawati menjahit Sang Saka Merah Putih."),
        S(2, "Samudra terluas di dunia adalah Samudra …", ["Pasifik", "Atlantik", "Hindia", "Arktik"], 0, "Samudra Pasifik mencakup area terluas bumi."),
        S(2, "Benua terbesar di dunia adalah Benua …", ["Asia", "Afrika", "Amerika", "Eropa"], 0, "Asia adalah benua terbesar baik wilayah maupun populasi."),
        S(2, "Gunung tertinggi di dunia adalah Gunung …", ["Everest", "Kilimanjaro", "Fuji", "Jayawijaya"], 0, "Gunung Everest di Himalaya adalah puncak tertinggi dunia (8.848 m)."),
        S(2, "Puncak tertinggi di Indonesia yang diselimuti salju abadi adalah Puncak …", ["Jaya (Jayawijaya)", "Rinjani", "Semeru", "Kerinci"], 0, "Puncak Jaya di Papua berketinggian 4.884 mdpl."),
        S(2, "Danau vulkanik terbesar di Indonesia dan Asia Tenggara adalah Danau …", ["Toba", "Maninjau", "Singkarak", "Towuti"], 0, "Danau Toba terbentuk akibat letusan supervulkanik purba."),
        S(2, "Sungai terpanjang di Indonesia adalah Sungai …", ["Kapuas", "Mahakam", "Musi", "Bengawan Solo"], 0, "Sungai Kapuas di Kalimantan Barat memiliki panjang 1.143 km."),
        S(2, "Sungai terpanjang di dunia adalah Sungai …", ["Nil", "Amazon", "Yangtze", "Mississippi"], 0, "Sungai Nil di Afrika adalah sungai terpanjang."),
        S(2, "Organisasi Perhimpunan Bangsa-Bangsa di dunia dinamakan …", ["PBB (UN)", "NATO", "OPEC", "WTO"], 0, "Perserikatan Bangsa-Bangsa (PBB) menjaga perdamaian dunia."),
        S(2, "Bapak Koperasi Indonesia adalah …", ["Drs. Mohammad Hatta", "Ir. Soekarno", "Sutan Sjahrir", "Tan Malaka"], 0, "Bung Hatta dijuluki Bapak Koperasi Indonesia."),
        S(2, "Tiga kegiatan ekonomi utama meliputi produksi, distribusi, dan …", ["Konsumsi", "Investasi", "Tabungan", "Barter"], 0, "Konsumsi adalah kegiatan menghabiskan guna barang."),
        S(2, "Sumpah Pemuda diikrarkan pada tanggal 28 Oktober 1928 dalam Kongres Pemuda ke-…", ["Dua (II)", "Satu (I)", "Tiga (III)", "Empat (IV)"], 0, "Kongres Pemuda II melahirkan Sumpah Pemuda."),
        S(2, "Tokoh pahlawan wanita dari Aceh yang gigih melawan Belanda adalah …", ["Cut Nyak Dien", "R.A. Kartini", "Dewi Sartika", "Martha Christina Tiahahu"], 0, "Cut Nyak Dien memimpin perang gerilya di Aceh."),
        S(2, "Organisasi pergerakan nasional pertama di Indonesia yang berdiri 20 Mei 1908 adalah …", ["Budi Utomo", "Sikat Islam", "Indische Partij", "PNI"], 0, "Budi Utomo menandai Kebangkitan Nasional."),
        S(2, "Hari Kebangkitan Nasional diperingati setiap tanggal …", ["20 Mei", "2 Mei", "10 November", "1 Juni"], 0, "20 Mei memperingati berdirinya Budi Utomo tahun 1908."),
        S(2, "Sistem tanam paksa pada masa penjajahan Belanda dicetuskan oleh …", ["Van den Bosch", "Daendels", "Raffles", "J.P. Coen"], 0, "Johannes van den Bosch menerapkan Cultuurstelsel (Tanam Paksa)."),
        S(2, "Gubernur Jenderal Belanda yang membangun Jalan Raya Pos (Anyer – Panarukan) adalah …", ["H.W. Daendels", "Van den Bosch", "Raffles", "Speelman"], 0, "Daendels membangun Jalan Raya Pos sepanjang 1.000 km."),
        S(2, "Bangsa Eropa pertama yang mendarat di Maluku untuk berdagang rempah-rempah adalah …", ["Portugis", "Belanda", "Inggris", "Spanyol"], 0, "Portugis sampai di Maluku pada tahun 1512."),

        // Tingkat 3 (20 Soal)
        S(3, "Konferensi Asia Afrika (KAA) pertama kali diselenggarakan pada tahun 1955 di kota …", ["Bandung", "Jakarta", "Bogor", "Yogyakarta"], 0, "KAA 1955 diselenggarakan di Gedung Merdeka Bandung."),
        S(3, "Kenaikan harga barang secara umum dan terus menerus dalam jangka waktu tertentu dinamakan …", ["Inflasi", "Deflasi", "Devaluasi", "Resesi"], 0, "Inflasi mengikis daya beli mata uang."),
        S(3, "Penurunan harga barang secara umum dinamakan …", ["Deflasi", "Inflasi", "Depresiasi", "Stagflasi"], 0, "Deflasi adalah kebalikan dari inflasi."),
        S(3, "Kebijakan pemerintah menurunkan nilai mata uang dalam negeri terhadap mata uang asing dinamakan …", ["Devaluasi", "Revaluasi", "Apresiasi", "Inflasi"], 0, "Devaluasi sengaja dilakukan untuk mendorong ekspor."),
        S(3, "Teori Tata Ruang Kota yang membagi kota dalam lingkaran-lingkaran konsentris dikemukakan oleh …", ["E.W. Burgess", "Homer Hoyt", "Harris & Ullman", "Christaller"], 0, "Burgess merumuskan Teori Konsentris perkembangan kota."),
        S(3, "Istilah 'Marginal Utility' dalam ilmu ekonomi merujuk pada …", ["Tambahan kepuasan dari konsumsi satu unit tambahan barang", "Total kepuasan", "Biaya produksi", "Kerugian marginal"], 0, "Marginal utility adalah kepuasan ekstra per unit barang."),
        S(3, "Bapak Ilmu Ekonomi Dunia yang menulis buku 'The Wealth of Nations' adalah …", ["Adam Smith", "David Ricardo", "John Maynard Keynes", "Karl Marx"], 0, "Adam Smith mencetuskan teori ekonomi klasik."),
        S(3, "Peristiwa Penculikan Soekarno dan Hatta ke Rengasdengklok terjadi pada tanggal …", ["16 Agustus 1945", "15 Agustus 1945", "17 Agustus 1945", "14 Agustus 1945"], 0, "Peristiwa Rengasdengklok terjadi sehari sebelum Proklamasi."),
        S(3, "Perjanjian diplomasi pertama antara Indonesia dan Belanda pasca kemerdekaan adalah Perjanjian …", ["Linggarjati", "Renville", "Roem-Royen", "KMB"], 0, "Perjanjian Linggarjati ditandatangani tahun 1947."),
        S(3, "Konferensi Meja Buntar (KMB) di Den Haag Belanda pada tahun 1949 menghasilkan keputusan utama …", ["Pengakuan kedaulatan Indonesia oleh Belanda", "Gencatan senjata", "Pembentukan RIS sementara", "Penyerahan Irian Barat langsung"], 0, "KMB 1949 mengakui kedaulatan Republik Indonesia Serikat."),
        S(3, "Sistem stratifikasi sosial tertutup paling jelas terlihat dalam sistem …", ["Kasta", "Kelas sosial", "Feodalisme industri", "Meritokrasi"], 0, "Sistem kasta membatasi mobilitas sosial secara ketat."),
        S(3, "Proses peleburan dua budaya atau lebih menjadi satu kebudayaan baru dengan menghilangkan ciri asli dinamakan …", ["Asimilasi", "Akulturasi", "Difusi", "Amalgamasi"], 0, "Asimilasi menghasilkan budaya baru tanpa ciri khas lama."),
        S(3, "Proses percampuran dua budaya tanpa menghilangkan ciri khas kebudayaan lama dinamakan …", ["Akulturasi", "Asimilasi", "Enkulturasi", "Apropriasi"], 0, "Akulturasi memadukan unsur budaya tanpa melenyapkan keasliannya."),
        S(3, "Pernikahan antar suku atau bangsa yang berbeda dinamakan …", ["Amalgamasi", "Asimilasi", "Akulturasi", "Endogami"], 0, "Amalgamasi adalah pembauran biologis melalui perkawinan."),
        S(3, "Tokoh sosiologi dunia yang dijuluki 'Bapak Sosiologi' adalah …", ["Auguste Comte", "Emile Durkheim", "Max Weber", "Karl Marx"], 0, "Auguste Comte memberi istilah Sosiologi pertama kali."),
        S(3, "Bank Sentral Republik Indonesia yang bertugas menjaga kestabilan nilai rupiah adalah …", ["Bank Indonesia (BI)", "Bank Mandiri", "BRI", "BCA"], 0, "Bank Indonesia adalah bank sentral independen."),
        S(3, "Kebijakan Bank Sentral dalam mengatur jumlah uang beredar dinamakan kebijakan …", ["Moneter", "Fiskal", "Perdagangan", "Tarif"], 0, "Kebijakan Moneter mengontrol pasokan uang dan suku bunga."),
        S(3, "Kebijakan pemerintah terkait penerimaan dan pengeluaran pajak dinamakan kebijakan …", ["Fiskal", "Moneter", "Rill", "Substitusi"], 0, "Kebijakan Fiskal mengatur APBN dan perpajakan."),
        S(3, "Garis imaginer yang memisahkan fauna tipe Asiatis dan Peralihan di Indonesia adalah garis …", ["Wallace", "Weber", "Lydekker", "Khatulistiwa"], 0, "Garis Wallace memisahkan fauna Asiatis dan Peralihan."),
        S(3, "Garis imaginer yang memisahkan fauna tipe Peralihan dan Australis di Indonesia adalah garis …", ["Weber", "Wallace", "Lydekker", "Sunda"], 0, "Garis Weber memisahkan wilayah Peralihan dan Australis (Papua).")
      ]
    },

    // ------------------------------------------------------------
    // 8. BAHASA INGGRIS
    // ------------------------------------------------------------
    {
      id: "ing",
      nama: "Bahasa Inggris",
      ikon: "🔤",
      warna: "#8b5cf6",
      soal: [
        // Tingkat 1 (20 Soal)
        S(1, "What is the English word for 'kucing'?", ["Cat", "Dog", "Bird", "Fish"], 0, "Kucing = Cat."),
        S(1, "What is the English word for 'anjing'?", ["Dog", "Cat", "Rabbit", "Cow"], 0, "Anjing = Dog."),
        S(1, "'Red' in Indonesian means …", ["Merah", "Biru", "Kuning", "Hijau"], 0, "Red = Merah."),
        S(1, "'Blue' in Indonesian means …", ["Biru", "Merah", "Hijau", "Hitam"], 0, "Blue = Biru."),
        S(1, "'Yellow' in Indonesian means …", ["Kuning", "Putih", "Cokelat", "Ungu"], 0, "Yellow = Kuning."),
        S(1, "'Good morning' is used in the …", ["Morning", "Afternoon", "Night", "Evening"], 0, "Good morning = Selamat pagi."),
        S(1, "'Good night' is said before …", ["Sleeping / Night", "Lunch", "Breakfast", "Working"], 0, "Good night diucapkan malam hari sebelum tidur."),
        S(1, "How do you say 'Terima kasih' in English?", ["Thank you", "Sorry", "Please", "Goodbye"], 0, "Terima kasih = Thank you."),
        S(1, "How do you say 'Maaf' in English?", ["Sorry", "Welcome", "Hello", "Thanks"], 0, "Maaf = Sorry / I am sorry."),
        S(1, "What is the English word for number '10'?", ["Ten", "Five", "One", "Seven"], 0, "10 = Ten."),
        S(1, "What is the English word for number '1'?", ["One", "Two", "Three", "Four"], 0, "1 = One."),
        S(1, "What is the English word for 'Buku'?", ["Book", "Pencil", "Pen", "Bag"], 0, "Buku = Book."),
        S(1, "What is the English word for 'Pintu'?", ["Door", "Window", "Table", "Chair"], 0, "Pintu = Door."),
        S(1, "What is the English word for 'Meja'?", ["Table", "Chair", "Bed", "House"], 0, "Meja = Table."),
        S(1, "'Apple' is a kind of …", ["Fruit", "Animal", "Color", "Vehicle"], 0, "Apple (Apel) adalah buah-buahan."),
        S(1, "What is the English word for 'Ibu'?", ["Mother", "Father", "Brother", "Sister"], 0, "Ibu = Mother."),
        S(1, "What is the English word for 'Ayah'?", ["Father", "Mother", "Uncle", "Grandfather"], 0, "Ayah = Father."),
        S(1, "How do you say 'Selamat tinggal' in English?", ["Goodbye", "Hello", "Welcome", "Good morning"], 0, "Selamat tinggal = Goodbye."),
        S(1, "'Sun' in Indonesian means …", ["Matahari", "Bulan", "Bintang", "Awan"], 0, "Sun = Matahari."),
        S(1, "'Moon' in Indonesian means …", ["Bulan", "Matahari", "Bintang", "Pelangi"], 0, "Moon = Bulan."),

        // Tingkat 2 (20 Soal)
        S(2, "Complete the sentence: 'I ___ a student.'", ["am", "is", "are", "be"], 0, "Subject 'I' uses auxiliary verb 'am'."),
        S(2, "Complete the sentence: 'She ___ to school every day.'", ["goes", "go", "going", "gone"], 0, "Simple present tense third person: 'She goes'."),
        S(2, "What is the past form (V2) of the verb 'go'?", ["went", "goed", "gone", "going"], 0, "Go (V1) - Went (V2) - Gone (V3)."),
        S(2, "What is the past form (V2) of 'eat'?", ["ate", "eaten", "eats", "eating"], 0, "Eat (V1) - Ate (V2) - Eaten (V3)."),
        S(2, "What is the antonym (opposite) of 'hot'?", ["Cold", "Warm", "Big", "Dry"], 0, "Opposite of hot is cold."),
        S(2, "What is the antonym of 'big'?", ["Small", "Large", "Tall", "Long"], 0, "Opposite of big is small."),
        S(2, "What is the synonym of 'happy'?", ["Glad / Joyful", "Sad", "Angry", "Tired"], 0, "Happy is synonymous with glad/joyful."),
        S(2, "Choose the correct pronoun: '___ is reading a book.' (referring to a girl)", ["She", "He", "They", "It"], 0, "Pronoun for female is 'She'."),
        S(2, "Plural form of 'child' is …", ["children", "childs", "childes", "childrens"], 0, "Irregular plural: child -> children."),
        S(2, "Plural form of 'foot' is …", ["feet", "foots", "feets", "footies"], 0, "Irregular plural: foot -> feet."),
        S(2, "Complete the comparative form: 'Fast, Faster, ___'", ["Fastest", "More fast", "Fastly", "Fasterest"], 0, "Degree of comparison: Fast - Faster - Fastest."),
        S(2, "Complete: 'Elephant is ___ than a mouse.'", ["bigger", "big", "biggest", "more big"], 0, "Comparative adjective: bigger."),
        S(2, "Complete: 'They ___ playing football now.'", ["are", "is", "am", "was"], 0, "Present continuous for 'They' uses 'are'."),
        S(2, "What time is '07.00'? It is seven ___.", ["o'clock", "hours", "times", "minute"], 0, "7:00 = Seven o'clock."),
        S(2, "The day after Monday is …", ["Tuesday", "Wednesday", "Sunday", "Thursday"], 0, "Monday -> Tuesday."),
        S(2, "The month after December is …", ["January", "February", "November", "March"], 0, "December -> January."),
        S(2, "Translate: 'Saya suka membaca buku.'", ["I like reading books.", "I read book like.", "I am book read.", "I like book."], 0, "Grammatically correct: 'I like reading books.'"),
        S(2, "Which one is a fruit?", ["Banana", "Carrot", "Potato", "Spinach"], 0, "Banana is a fruit."),
        S(2, "'Teacher' works in a …", ["School", "Hospital", "Bank", "Police station"], 0, "Teachers work in school."),
        S(2, "'Doctor' works in a …", ["Hospital", "School", "Market", "Airport"], 0, "Doctors work in hospital."),

        // Tingkat 3 (20 Soal)
        S(3, "Complete: 'She ___ been working here since 2020.'", ["has", "have", "is", "was"], 0, "Present perfect continuous for 'She' takes 'has'."),
        S(3, "What is the meaning of the idiom 'Break a leg'?", ["Good luck", "Hurt your leg", "Fail an exam", "Run fast"], 0, "'Break a leg' means Good luck in theatre/performance context."),
        S(3, "Complete the conditional type 2: 'If I ___ you, I would study harder.'", ["were", "was", "am", "be"], 0, "Unreal past condition uses 'were' for all subjects."),
        S(3, "Identify the passive voice: 'The letter ___ sent yesterday.'", ["was", "is", "has", "were"], 0, "Past passive for singular subject: 'was sent'."),
        S(3, "What does the idiom 'Piece of cake' mean?", ["Very easy", "Delicious food", "Expensive item", "Difficult task"], 0, "'Piece of cake' means something very easy."),
        S(3, "What is the past participle (V3) of 'write'?", ["written", "wrote", "writes", "writing"], 0, "Write (V1) - Wrote (V2) - Written (V3)."),
        S(3, "Which word is a conjunction?", ["Because", "Quickly", "Beautiful", "Happiness"], 0, "'Because' is a subordinating conjunction."),
        S(3, "Find the synonym of 'Abundant':", ["Plentiful", "Scarce", "Empty", "Rare"], 0, "Abundant means present in great quantities (plentiful)."),
        S(3, "Find the antonym of 'Mandatory':", ["Optional", "Obligatory", "Compulsory", "Required"], 0, "Mandatory (wajib) opposite is Optional (sukarela)."),
        S(3, "What type of text tells a story in past events?", ["Narrative Text", "Procedure Text", "Report Text", "Expository Text"], 0, "Narrative text tells past stories/events."),
        S(3, "Text that aims to describe a specific place, person, or thing in detail is …", ["Descriptive Text", "Recount Text", "News Item", "Discussion Text"], 0, "Descriptive text describes features of a specific object."),
        S(3, "Complete: 'Hardly had he arrived ___ the phone rang.'", ["when", "than", "then", "after"], 0, "Correlative pattern: 'Hardly... when...'."),
        S(3, "What does 'Bite the bullet' mean?", ["Face a difficult situation with courage", "Eat fast", "Shoot a gun", "Make a mistake"], 0, "'Bite the bullet' means endure a painful situation bravely."),
        S(3, "Select the correct sentence:", ["Neither he nor I am going.", "Neither he or I are going.", "Neither he nor I is going.", "Neither him nor me go."], 0, "Verb agrees with closest subject (I am)."),
        S(3, "Identify the noun form of the adjective 'Beautiful':", ["Beauty", "Beautify", "Beautifully", "Beauties"], 0, "'Beauty' is the noun form."),
        S(3, "Complete: 'By next year, I ___ my degree.'", ["will have finished", "will finish", "finished", "have finished"], 0, "Future perfect tense: 'will have finished'."),
        S(3, "Choose the correct order of adjectives: 'A ___ car.'", ["small red Italian", "red small Italian", "Italian small red", "red Italian small"], 0, "Adjective order: Size (small), Color (red), Origin (Italian)."),
        S(3, "What is the meaning of 'Call it a day'?", ["Stop working on something", "Make a phone call", "Start a morning", "Celebrate a birthday"], 0, "'Call it a day' means to stop working."),
        S(3, "Select the word with correct spelling:", ["Accommodation", "Acommodation", "Accomodation", "Acomodation"], 0, "Correct spelling: A-c-c-o-m-m-o-d-a-t-i-o-n."),
        S(3, "What is the meaning of 'Once in a blue moon'?", ["Very rarely", "Every full moon", "Often", "Never"], 0, "'Once in a blue moon' means very rarely.")
      ]
    },

    // ------------------------------------------------------------
    // 9. PJOK (Olahraga & Kesehatan)
    // ------------------------------------------------------------
    {
      id: "pjok",
      nama: "PJOK (Olahraga & Kesehatan)",
      ikon: "⚽",
      warna: "#f97316",
      soal: [
        // Tingkat 1 (20 Soal)
        S(1, "Olahraga beregu yang memperebutkan bola untuk ditendang ke gawang dinamakan …", ["Sepak bola", "Bulu tangkis", "Renang", "Catur"], 0, "Sepak bola bertujuan memasukkan bola ke gawang lawan."),
        S(1, "Pemain sepak bola yang bertugas menjaga gawang agar tidak kemasukan bola adalah …", ["Kiper / Penjaga Gawang", "Penyerang", "Gelandang", "Wasit"], 0, "Kiper diperbolehkan memegang bola di area penalti."),
        S(1, "Olahraga yang dilakukan di dalam air dinamakan …", ["Renang", "Lari", "Basket", "Voli"], 0, "Renang dilaksanakan di kolam air."),
        S(1, "Jumlah pemain starter dalam satu tim sepak bola adalah … orang.", ["11", "6", "5", "9"], 0, "Sepak bola dimainkan 11 lawan 11."),
        S(1, "Olahraga memukul kok menggunakan raket melewati net dinamakan …", ["Bulu tangkis / Badminton", "Tenis Meja", "Voli", "Kasti"], 0, "Bulu tangkis memakai raket dan kok."),
        S(1, "Bola yang digunakan pada permainan bulu tangkis dinamakan …", ["Kok / Shuttlecock", "Bola karet", "Bola tenis", "Bola basket"], 0, "Bulu tangkis menggunakan Shuttlecock (kok)."),
        S(1, "Sebelum berolahraga, kita wajib melakukan … agar tidak cedera.", ["Pemanasan", "Pendinginan", "Tidur", "Makan kenyang"], 0, "Pemanasan menyiapkan otot tubuh sebelum olahraga."),
        S(1, "Setelah selesai berolahraga, kita melakukan …", ["Pendinginan", "Pemanasan", "Lari cepat", "Makan es"], 0, "Pendinginan mengembalikan denyut jantung ke batas normal."),
        S(1, "Gerakan meloncat dengan kedua kaki melatih kekuatan otot …", ["Kaki", "Tangan", "Leher", "Perut"], 0, "Meloncat memutarkan daya tahan otot kaki."),
        S(1, "Gerakan push-up bermanfaat untuk melatih kekuatan otot …", ["Lengan dan dada", "Kaki", "Pergelangan kaki", "Paha"], 0, "Push-up memfokuskan otot dada dan lengan."),
        S(1, "Gerakan sit-up bermanfaat untuk melatih kekuatan otot …", ["Perut", "Punggung", "Kaki", "Tangan"], 0, "Sit-up melatih ketahanan otot perut."),
        S(1, "Jumlah pemain dalam satu tim bola voli di lapangan adalah … orang.", ["6", "11", "5", "4"], 0, "Permainan bola voli dimainkan 6 orang per tim."),
        S(1, "Jumlah pemain starter satu tim basket adalah … orang.", ["5", "6", "11", "7"], 0, "Bola basket dimainkan 5 lawan 5."),
        S(1, "Menggosok gigi dilakukan minimal … kali sehari.", ["2", "1", "5", "10"], 0, "Ideal menggosok gigi 2 kali sehari (pagi & malam)."),
        S(1, "Mencuci tangan sebelum makan bertujuan menghilangkan …", ["Kuman dan bakteri", "Nafsu makan", "Warna kulit", "Keringat"], 0, "Mencuci tangan mencegah kuman masuk tubuh."),
        S(1, "Berjalan dan berlari termasuk gerak dasar …", ["Lokomotor", "Non-lokomotor", "Manipulatif", "Ritmik"], 0, "Gerak lokomotor adalah gerak berpindah tempat."),
        S(1, "Gerakan mengayun lengan di tempat termasuk gerak …", ["Non-lokomotor", "Lokomotor", "Manipulatif", "Statis"], 0, "Gerak non-lokomotor adalah gerak tanpa berpindah tempat."),
        S(1, "Gerakan menendang atau melempar bola termasuk gerak …", ["Manipulatif", "Lokomotor", "Non-lokomotor", "Pasif"], 0, "Gerak manipulatif menggunakan alat/objek."),
        S(1, "Istirahat terbaik untuk mengembalikan kesegaran tubuh adalah …", ["Tidur", "Bermain game", "Nonton TV", "Makan"], 0, "Tidur cukup meregenerasi sel dan menyegarkan pikiran."),
        S(1, "Makanan sehat empat sehat lima sempurna ditutup dengan minum …", ["Susu", "Es boba", "Kopi", "Sirup"], 0, "Susu melengkapi gizi empat sehat."),

        // Tingkat 2 (20 Soal)
        S(2, "Induk organisasi sepak bola seluruh Indonesia dinamakan …", ["PSSI", "PBVSI", "PERBASI", "PBSI"], 0, "PSSI (Persatuan Sepakbola Seluruh Indonesia)."),
        S(2, "Induk organisasi bulu tangkis seluruh Indonesia dinamakan …", ["PBSI", "PSSI", "PERBASI", "PELTI"], 0, "PBSI (Persatuan Bulutangkis Seluruh Indonesia)."),
        S(2, "Induk organisasi bola basket seluruh Indonesia dinamakan …", ["PERBASI", "PBVSI", "PSSI", "PASI"], 0, "PERBASI (Persatuan Bola Basket Seluruh Indonesia)."),
        S(2, "Gaya renang dengan posisi dada menghadap ke permukaan air dinamakan gaya …", ["Dada / Katak", "Bebas", "Punggung", "Kupu-kupu"], 0, "Gaya dada mirip gerakan katak berenang."),
        S(2, "Gaya renang di mana tubuh terlentang dan wajah menghadap ke atas dinamakan gaya …", ["Punggung", "Dada", "Bebas", "Kupu-kupu"], 0, "Gaya punggung dilakukan terlentang."),
        S(2, "Gaya renang yang paling cepat dalam perlombaan dinamakan gaya …", ["Bebas (Crawl)", "Dada", "Punggung", "Kupu-kupu"], 0, "Gaya bebas menghasilkan laju tercepat."),
        S(2, "Lari jarak pendek dinamakan juga lari …", ["Sprint", "Maraton", "Estafet", "Menengah"], 0, "Lari sprint mengandalkan kecepatan penuh."),
        S(2, "Pelari jarak pendek dinamakan …", ["Sprinter", "Maratoner", "Striker", "Starter"], 0, "Sprinter adalah sebutan pelari jarak pendek."),
        S(2, "Start yang digunakan oleh pelari jarak pendek adalah start …", ["Jongkok", "Berdiri", "Melayang", "Duduk"], 0, "Start jongkok digunakan untuk lari pendek (sprint)."),
        S(2, "Start yang digunakan untuk lari jarak jauh (maraton) adalah start …", ["Berdiri", "Jongkok", "Melayang", "Bebas"], 0, "Lari jarak jauh menggunakan start berdiri."),
        S(2, "Induk organisasi atletik seluruh Indonesia dinamakan …", ["PASI", "PSSI", "PERSANI", "PBVSI"], 0, "PASI (Persatuan Atletik Seluruh Indonesia)."),
        S(2, "Panjang lintasan lari maraton standar internasional adalah … km.", ["42,195 km", "10 km", "21 km", "50 km"], 0, "Jarak maraton resmi adalah 42,195 km."),
        S(2, "Posisi awal badan saat memukul bola dalam tenis meja dinamakan …", ["Stance", "Grip", "Footwork", "Smash"], 0, "Stance adalah kesiapan posisi badan."),
        S(2, "Teknik memukul bola voli di atas net dengan keras ke daerah lawan dinamakan …", ["Smash / Spike", "Passing", "Serving", "Blocking"], 0, "Smash adalah pukulan menukik tajam mencetak angka."),
        S(2, "Pertahanan di atas net untuk menahan smash lawan dalam bola voli dinamakan …", ["Block / Bendungan", "Service", "Passing", "Dig"], 0, "Block membendung pukulan smash."),
        S(2, "Tembakan meloncat memasukkan bola ke keranjang dalam basket dinamakan …", ["Jump Shot", "Lay-up", "Dunk", "Pivot"], 0, "Jump shot memadukan lompatan dan tembakan."),
        S(2, "Teknik melangkah dua langkah lalu melompat memasukkan bola basket dinamakan …", ["Lay-up shot", "Slam dunk", "Free throw", "Hook shot"], 0, "Lay-up memasukkan bola dari dekat ring."),
        S(2, "Gerakan berputar dengan satu kaki sebagai poros dalam bola basket dinamakan …", ["Pivot", "Dribble", "Rebound", "Screen"], 0, "Pivot berguna melindungi bola dari serbuan lawan."),
        S(2, "Kartu merah yang dikeluarkan wasit dalam sepak bola berarti pemain harus …", ["Keluar dari lapangan (Keluar permainan)", "Menerima peringatan", "Duduk 5 menit", "Tukar posisi"], 0, "Kartu merah menandakan hukuman pengusiran pemain."),
        S(2, "Kartu kuning dalam sepak bola berarti pemain mendapatkan …", ["Peringatan pertama", "Pengusiran", "Penalti", "Bebas hukuman"], 0, "Kartu kuning adalah peringatan resmi wasit."),

        // Tingkat 3 (20 Soal)
        S(3, "Pedoman gizi seimbang yang diterbitkan Kemenkes RI sebagai pengganti konsep 4 Sehat 5 Sempurna dinamakan …", ["Isi Piringku", "Tumpeng Gizi", "Piramida Makanan", "Diet Sehat"], 0, "Isi Piringku menekankan porsi gizi seimbang piring makan."),
        S(3, "Kondisi fisik seseorang untuk melakukan aktivitas harian tanpa mengalami kelelahan berlebih dinamakan …", ["Kebugaran Jasmani", "Kesehatan Jiwa", "Daya Tahan Otot", "Kapasitas Vital"], 0, "Kebugaran jasmani (physical fitness) mendukung aktivitas produktif."),
        S(3, "Tes untuk mengukur daya tahan jantung dan paru-paru (VO2Max) dengan lari bolak-balik 20m dinamakan …", ["Beep Test / Bleep Test", "Push Up Test", "Sit and Reach", "Vertical Jump"], 0, "Beep test mengukur tingkat kapasitas aerobik maksimal."),
        S(3, "Kemampuan otot untuk melakukan kontraksi secara berulang-ulang dalam waktu lama dinamakan …", ["Daya Tahan Otot", "Kekuatan Otot", "Kelenturan", "Kelincahan"], 0, "Muscular endurance adalah daya tahan otot."),
        S(3, "Kemampuan sendi untuk bergerak dalam ruang gerak maksimal dinamakan …", ["Kelenturan / Kelentukan (Flexibility)", "Kelincahan", "Kecepatan", "Keseimbangan"], 0, "Flexibility menentukan jangkauan sendi."),
        S(3, "Kemampuan tubuh mengubah arah gerak dengan cepat tanpa kehilangan keseimbangan dinamakan …", ["Kelincahan (Agility)", "Kecepatan", "Kekuatan", "Koordinasi"], 0, "Agility mengukur kelincahan manuver gerak."),
        S(3, "Latihan lari berbelok-belok melintasi rintangan untuk melatih kelincahan dinamakan lari …", ["Zig-zag", "Shuttle run", "Sprint", "Interval"], 0, "Lari zig-zag melatih kelincahan dan koordinasi kaki."),
        S(3, "Latihan lari bolak-balik untuk melatih kelincahan dinamakan lari …", ["Shuttle run", "Maraton", "Fartlek", "Fartlek run"], 0, "Shuttle run melatih akselerasi dan kelincahan gerak balik."),
        S(3, "Sistem latihan daya tahan jantung yang memadukan kombinasi jalan, lari pelan, dan sprint dinamakan …", ["Fartlek (Speed Play)", "Interval Training", "Circuit Training", "Cross Country"], 0, "Fartlek adalah latihan bermain kecepatan asal Swedia."),
        S(3, "Penyakit tidak menular yang ditandai dengan tekanan darah tinggi di atas normal dinamakan …", ["Hipertensi", "Hipotensi", "Diabetes", "Stroke"], 0, "Hipertensi ditandai tensi sistolik/diastolik tinggi."),
        S(3, "Penyakit yang ditandai dengan kadar gula darah melebihi batas normal dinamakan …", ["Diabetes Mellitus", "Hipertensi", "Anemia", "Asam Urat"], 0, "Diabetes terjadi akibat kekacauan fungsi hormon insulin."),
        S(3, "Hormon yang diproduksi oleh pankreas untuk mengatur kadar gula dalam darah adalah …", ["Insulin", "Adrenalin", "Estrogen", "Testosteron"], 0, "Insulin memfasilitasi glukosa masuk ke sel."),
        S(3, "Cedera persendian yang ditandai dengan pergeseran sendi dari mangkoknya dinamakan …", ["Dislokasi", "Kram", "Keseleo (Sprain)", "Patah tulang"], 0, "Dislokasi adalah lepasnya tulang dari sendi."),
        S(3, "Cedera otot akibat regangan berlebih pada pita tendon/ligamen dinamakan …", ["Keseleo / Sprain", "Dislokasi", "Fraktur", "Kram"], 0, "Sprain/Strain merujuk pada terkilir pita otot."),
        S(3, "Pertolongan pertama pada cedera olahraga menggunakan metode RICE. 'R' dalam RICE berarti …", ["Rest (Istirahat)", "Run", "Refresh", "Rehabilitation"], 0, "RICE = Rest, Ice, Compression, Elevation."),
        S(3, "Singkatan 'I' dalam metode penanganan cedera RICE adalah …", ["Ice (Kompres Es)", "Injured", "Immobilization", "Injection"], 0, "Ice berguna meredakan pembengkakan awal."),
        S(3, "Organisasi Sepak Bola Dunia dinamakan …", ["FIFA", "UEFA", "FIBA", "IOC"], 0, "FIFA (Fédération Internationale de Football Association)."),
        S(3, "Komite Olimpiade Internasional penyelenggara Olimpiade Dunia dinamakan …", ["IOC", "FIFA", "IAAF", "WADA"], 0, "IOC (International Olympic Committee)."),
        S(3, "Zat terlarang yang meningkatkan performa atlet secara ilegal dinamakan …", ["Doping", "Vitamin", "Suplemen", "Steril"], 0, "Doping dilarang keras dalam olahraga profesional."),
        S(3, "Tiga jenis zat gizi makro (makronutrisi) yang dibutuhkan tubuh adalah …", ["Karbohidrat, Protein, dan Lemak", "Vitamin, Mineral, dan Air", "Gula, Garam, dan Sirup", "Kalsium, Besi, dan Seng"], 0, "Karbohidrat, protein, lemak memproduksi kalori utama.")
      ]
    },

    // ------------------------------------------------------------
    // 10. SENI DAN BUDAYA
    // ------------------------------------------------------------
    {
      id: "seni",
      nama: "Seni dan Budaya",
      ikon: "🎨",
      warna: "#ec4899",
      soal: [
        // Tingkat 1 (20 Soal)
        S(1, "Alat musik yang dimainkan dengan cara dipukul stick adalah …", ["Drum", "Gitar", "Biola", "Seruling"], 0, "Drum dimainkan dengan dipukul menggunakan stik."),
        S(1, "Alat musik yang dimainkan dengan cara dipetik senarnya adalah …", ["Gitar", "Drum", "Seruling", "Trompet"], 0, "Gitar memiliki senar yang dipetik."),
        S(1, "Alat musik seruling dimainkan dengan cara …", ["Ditiup", "Dipukul", "Dipetik", "Digoyang"], 0, "Seruling menghasilkan suara dengan ditiup."),
        S(1, "Alat musik angklung berasal dari daerah …", ["Jawa Barat", "Bali", "Papua", "Sumatra Utara"], 0, "Angklung terbuat dari bambu khas Sunda Jawa Barat."),
        S(1, "Alat musik angklung dimainkan dengan cara …", ["Digoyangkan", "Dipukul", "Ditiup", "Dipetik"], 0, "Angklung digoyangkan hingga menghasilkan getaran bunyi."),
        S(1, "Warna pencampuran antara merah dan kuning akan menghasilkan warna …", ["Jingga / Oranye", "Hijau", "Ungu", "Cokelat"], 0, "Merah + Kuning = Oranye."),
        S(1, "Warna pencampuran antara biru dan kuning akan menghasilkan warna …", ["Hijau", "Ungu", "Oranye", "Hitam"], 0, "Biru + Kuning = Hijau."),
        S(1, "Warna pencampuran antara merah dan biru akan menghasilkan warna …", ["Ungu", "Hijau", "Cokelat", "Abu-abu"], 0, "Merah + Biru = Ungu."),
        S(1, "Tiga warna primer (dasar) dalam seni rupa adalah …", ["Merah, Kuning, dan Biru", "Merah, Hijau, dan Hitam", "Hitam, Putih, dan Abu-abu", "Kuning, Hijau, dan Ungu"], 0, "Merah, Kuning, Biru adalah warna primer."),
        S(1, "Gambar relief atau patung memiliki dimensi …", ["3 Dimensi (3D)", "2 Dimensi (2D)", "1 Dimensi", "Tanpa Dimensi"], 0, "Patung memiliki panjang, lebar, dan volume (3D)."),
        S(1, "Lukisan di atas kertas atau kanvas termasuk karya seni …", ["2 Dimensi (2D)", "3 Dimensi (3D)", "4D", "Digital"], 0, "Lukisan hanya punya panjang dan lebar (2D)."),
        S(1, "Alat yang digunakan lukis untuk mengoleskan cat minyak ke kanvas dinamakan …", ["Kuas", "Pensil", "Penggaris", "Penghapus"], 0, "Kuas digunakan meratakan cat lukis."),
        S(1, "Tari Kecak berasal dari daerah …", ["Bali", "Jawa Timur", "Aceh", "DKI Jakarta"], 0, "Tari Kecak adalah tari khas Bali."),
        S(1, "Tari Saman berasal dari daerah …", ["Aceh", "Sumatra Selatan", "Padang", "Papua"], 0, "Tari Saman berasal dari suku Gayo Aceh."),
        S(1, "Tari Jaipong berasal dari daerah …", ["Jawa Barat", "Jawa Tengah", "DKI Jakarta", "Banten"], 0, "Jaipong adalah tarian Sunda Jawa Barat."),
        S(1, "Tari Piring berasal dari provinsi …", ["Sumatra Barat", "Riau", "Jambi", "Bengkulu"], 0, "Tari Piring menggunakan piring khas Minangkabau."),
        S(1, "Lagu anak 'Balonku Ada Lima' diciptakan oleh …", ["A.T. Mahmud", "Ibu Sud", "Pak Dal", "W.R. Supratman"], 0, "Lagu Balonku dikomposisi oleh A.T. Mahmud."),
        S(1, "Lagu 'Pelangi-Pelangi' diciptakan oleh …", ["A.T. Mahmud", "Ibu Sud", "Papa T Bob", "Pak Kasur"], 0, "Lagu Pelangi diciptakan oleh A.T. Mahmud."),
        S(1, "Pertunjukan boneka kayu/kulit tradisional Jawa dinamakan …", ["Wayang", "Lenong", "Ludruk", "Ketoprak"], 0, "Wayang adalah seni pertunjukan tradisional."),
        S(1, "Orang yang memainkan wayang dinamakan …", ["Dalang", "Sutradara", "Aktor", "Nakhoda"], 0, "Dalang memimpin jalannya pertunjukan wayang."),

        // Tingkat 2 (20 Soal)
        S(2, "Alat musik tradisional Sasando yang terbuat dari daun lontar berasal dari …", ["Nusa Tenggara Timur (NTT)", "NTB", "Maluku", "Papua"], 0, "Sasando adalah alat musik petik khas Rote NTT."),
        S(2, "Alat musik Kolintang berasal dari daerah …", ["Sulawesi Utara", "Sulawesi Selatan", "Gorontalo", "Central Sulawesi"], 0, "Kolintang terbuat dari kayu khas Minahasa Sulut."),
        S(2, "Alat musik Gamelan dimainkan dengan cara …", ["Dipukul", "Ditiup", "Dipetik", "Digesek"], 0, "Instrumen gamelan mayoritas dipukul."),
        S(2, "Alat musik Biola dimainkan dengan cara …", ["Digesek", "Dipetik", "Dipukul", "Ditiup"], 0, "Biola menggunakan bow untuk digesek."),
        S(2, "Tangga nada pentatonik terdiri dari … nada dasar.", ["5 nada", "7 nada", "12 nada", "8 nada"], 0, "Penta = 5 (lima nada)."),
        S(2, "Tangga nada diatonik terdiri dari … nada dasar.", ["7 nada", "5 nada", "6 nada", "10 nada"], 0, "Dia = 7 nada (Do-Re-Mi-Fa-Sol-La-Si)."),
        S(2, "Tari Pendet dari Bali pada awalnya merupakan tarian …", ["Penyambutan / Pemujaan", "Perang", "Panen", "Pernikahan"], 0, "Tari Pendet adalah tarian pemujaan di pura."),
        S(2, "Tari Tor-Tor merupakan tarian adat khas masyarakat suku …", ["Batak (Sumatra Utara)", "Dayak", "Minang", "Bugis"], 0, "Tor-Tor adalah tari ritual suku Batak."),
        S(2, "Rumah adat Honai berasal dari daerah …", ["Papua", "NTT", "Maluku", "Sulawesi"], 0, "Honai adalah rumah tradisional Papua."),
        S(2, "Pameran seni rupa yang menampilkan karya satu orang seniman dinamakan pameran …", ["Tunggal", "Kelompok", "Klasik", "Kontemporer"], 0, "Pameran tunggal menampilkan satu kreator."),
        S(2, "Tingkat keras lembutnya bunyi dalam musik dinamakan …", ["Dinamika", "Tempo", "Harmoni", "Melodi"], 0, "Dinamika mengatur intensitas keras-lembut lagu."),
        S(2, "Cepat lambatnya laju ketukan dalam musik dinamakan …", ["Tempo", "Ritme", "Dinamika", "Nada"], 0, "Tempo menentukan kecepatan lagu (Allegro, Andante, dll)."),
        S(2, "Alat pengukur tempo lagu dinamakan …", ["Metronome", "Tuner", "Garputala", "Barometer"], 0, "Metronome memberikan detak konstan tempo."),
        S(2, "Unsur rupa yang terbentuk dari hubungan beberapa garis dinamakan …", ["Bidang", "Titik", "Tekstur", "Warna"], 0, "Garis yang terhubung membentuk bidang."),
        S(2, "Sifat permukaan suatu benda dalam seni rupa (halus/kasar) dinamakan …", ["Tekstur", "Warna", "Gelap Terang", "Bentuk"], 0, "Tekstur memberikan sensasi perabaan benda."),
        S(2, "Teater tradisional khas masyarakat Jakarta (Betawi) dinamakan …", ["Lenong", "Ludruk", "Ketoprak", "Randai"], 0, "Lenong adalah seni teater rakyat Betawi."),
        S(2, "Teater tradisional khas Jawa Timur dinamakan …", ["Ludruk", "Ketoprak", "Lenong", "Wayang Wong"], 0, "Ludruk adalah teater rakyat khas Jawa Timur."),
        S(2, "Batik yang dibuat dengan menorehkan lilin/malam menggunakan alat khusus dinamakan batik …", ["Tulis", "Cap", "Cetak", "Ikat"], 0, "Batik tulis dikerjakan manual menggunakan canting."),
        S(2, "Alat penoreh cairan lilin malam pada kain batik dinamakan …", ["Canting", "Kuas", "Pena", "Spatula"], 0, "Canting adalah penampung lilin batik."),
        S(2, "Lagu daerah 'Gundul Gundul Pacul' berasal dari provinsi …", ["Jawa Tengah", "Jawa Barat", "Jawa Timur", "Bali"], 0, "Gundul Pacul adalah lagu anak daerah Jawa Tengah.")
      ]
    },

    // ------------------------------------------------------------
    // 11. INFORMATIKA
    // ------------------------------------------------------------
    {
      id: "informatika",
      nama: "Informatika",
      ikon: "💻",
      warna: "#0891b2",
      soal: [
        // Tingkat 1 (20 Soal)
        S(1, "Alat utama yang digunakan untuk mengetik huruf dan angka pada komputer dinamakan …", ["Keyboard", "Mouse", "Monitor", "Printer"], 0, "Keyboard adalah papan ketik input data."),
        S(1, "Alat penunjuk (pointer) untuk menggerakkan kursor di layar komputer dinamakan …", ["Mouse", "Keyboard", "CPU", "Speaker"], 0, "Mouse digunakan mengendalikan kursor."),
        S(1, "Layar yang menampilkan gambar dan tulisan pada komputer dinamakan …", ["Monitor", "Printer", "CPU", "Scanner"], 0, "Monitor adalah media output visual."),
        S(1, "Alat untuk mencetak dokumen dari komputer ke dalam kertas dinamakan …", ["Printer", "Monitor", "Scanner", "Proyektor"], 0, "Printer mencetak data digital ke kertas."),
        S(1, "Perangkat keras yang dijuluki sebagai 'Otak Komputer' adalah …", ["CPU (Processor)", "RAM", "Harddisk", "Power Supply"], 0, "CPU mengolah seluruh perintah komputer."),
        S(1, "Alat untuk mengeluarkan suara dari komputer dinamakan …", ["Speaker", "Microphone", "Monitor", "Webcam"], 0, "Speaker memancarkan gelombang suara."),
        S(1, "Perangkat untuk merekam suara masuk ke komputer dinamakan …", ["Microphone", "Speaker", "Camera", "Headphone"], 0, "Microphone menangkap audio input."),
        S(1, "Kamera kecil yang berada di atas layar laptop dinamakan …", ["Webcam", "Printer", "Scanner", "Flashdisk"], 0, "Webcam mengambil gambar/video pengguna."),
        S(1, "Perangkat penyimpanan data kecil yang mudah dibawa-bawa dinamakan …", ["Flashdisk", "Harddisk Internal", "RAM", "CD-ROM"], 0, "Flashdisk adalah media simpan portabel USB."),
        S(1, "Proses menyalakan komputer dari keadaan mati dinamakan …", ["Booting", "Shutdown", "Restart", "Sleep"], 0, "Booting memasukkan OS saat pertama menyala."),
        S(1, "Proses mematikan sistem komputer secara aman dinamakan …", ["Shutdown", "Booting", "Restart", "Logoff"], 0, "Shutdown mematikan komputer dengan tertib."),
        S(1, "Program aplikasi yang digunakan untuk mengetik surat dinamakan …", ["Microsoft Word", "Microsoft Excel", "Paint", "Calculator"], 0, "Word adalah pengolah kata."),
        S(1, "Program aplikasi sederhan untuk menggambar di Windows dinamakan …", ["Paint", "Word", "Excel", "PowerPoint"], 0, "Paint adalah software gambar bawaan Windows."),
        S(1, "Internet merupakan singkatan dari …", ["Interconnected Network", "International Network", "Inter Internal Network", "Internal Network"], 0, "Internet = Interconnected Network."),
        S(1, "Aplikasi untuk membuka situs web seperti Google Chrome dinamakan …", ["Browser", "Search Engine", "Social Media", "Antivirus"], 0, "Browser membuka halaman web."),
        S(1, "Tombol terbawah pada keyboard yang paling panjang dinamakan tombol …", ["Spacebar (Spasi)", "Enter", "Backspace", "Shift"], 0, "Tombol spasi berbentuk paling panjang."),
        S(1, "Tombol keyboard untuk menghapus satu huruf di sebelah kiri kursor dinamakan …", ["Backspace", "Delete", "Enter", "Shift"], 0, "Backspace menghapus ke kiri."),
        S(1, "Tombol keyboard untuk membuat baris baru dinamakan …", ["Enter", "Space", "Tab", "Esc"], 0, "Enter membuat garis/baris baru."),
        S(1, "Simbol gembok pada alamat situs di browser menandakan bahwa situs tersebut …", ["Aman (HTTPS)", "Bahaya", "Rusak", "Palsu"], 0, "Gembok menandakan koneksi aman HTTPS terkunci SSL."),
        S(1, "Jaringan nirkabel tanpa kabel untuk koneksi internet dinamakan …", ["Wi-Fi", "Kabel LAN", "Bluetooth", "Infrared"], 0, "Wi-Fi mentransmisikan sinyal nirkabel.")
      ]
    },

    // ------------------------------------------------------------
    // 12. PRAKARYA & KEWIRAUSAHAAN (PKWU)
    // ------------------------------------------------------------
    {
      id: "pkwu",
      nama: "Prakarya & Kewirausahaan",
      ikon: "🛠️",
      warna: "#92400e",
      soal: [
        // Tingkat 1 (20 Soal)
        S(1, "Membuat benda kerajinan dengan memanfaatkan sampah atau barang bekas dinamakan …", ["Daur Ulang (Recycle)", "Membakar", "Menimbun", "Membuang"], 0, "Daur ulang memanfaatkan sampah menjadi produk bermanfaat."),
        S(1, "Uang yang dipakai untuk modal awal mendirikan usaha dinamakan …", ["Modal", "Keuntungan", "Gaji", "Bonus"], 0, "Modal adalah dana awal kegiatan usaha."),
        S(1, "Laba atau keuntungan usaha dihitung dengan cara …", ["Pendapatan dikurangi Biaya", "Pendapatan ditambah Biaya", "Biaya dikurangi Pendapatan", "Pendapatan dikali Biaya"], 0, "Laba = Total Pendapatan − Total Biaya."),
        S(1, "Orang yang berani mengambil risiko untuk membuka usaha sendiri dinamakan …", ["Wirausahawan / Entrepreneur", "Karyawan", "Manajer", "Pelanggan"], 0, "Wirausaha mengelola bisnis mandiri."),
        S(1, "Bahan alam yang berserat lunak dan biasa digunakan untuk membuat kerajinan gerabah adalah …", ["Tanah liat", "Kayu", "Batu", "Besi"], 0, "Tanah liat adalah bahan utama keramik/gerabah."),
        S(1, "Kerajinan yang dibuat dari serat pohon bambu biasanya dikerjakan dengan teknik …", ["Menganyam", "Mencetak", "Mengukir", "Menjahit"], 0, "Pohon bambu dianyam menjadi pelbagai barang."),
        S(1, "Tempat menjual barang secara langsung kepada pembeli di pasar dinamakan …", ["Toko / Kios", "Pabrik", "Gudang", "Kantor"], 0, "Toko/Kios adalah tempat ritel penawaran produk."),
        S(1, "Keadaan di mana total pendapatan sama persis dengan total biaya (tidak rugi dan tidak untung) dinamakan …", ["Impas (Break Even Point)", "Rugi", "Laba", "Bangkrut"], 0, "BEP adalah titik impas tanpa rugi/laba."),
        S(1, "Kemasan produk berfungsi untuk melindungi barang dan mempercantik …", ["Tampilan produk", "Kualitas dalam", "Bahan mentah", "Alat produksi"], 0, "Packaging memberi nilai estetika visual dan proteksi."),
        S(1, "Bahan bekas dari botol plastik dapat dimanfaatkan kembali menjadi …", ["Pot tanaman / Tempat pensil", "Makanan", "Bahan bakar", "Pakaian halus"], 0, "Botol plastik bekas fleksibel diolah jadi barang berguna."),
        S(1, "Sikap pantang menyerah dan selalu mencoba hal baru dalam wirausaha dinamakan sifat …", ["Inovatif dan Kreatif", "Pemalas", "Takut gagal", "Pasrah"], 0, "Wirausahawan unggul memiliki kreativitas tinggi."),
        S(1, "Kegiatan promosi barang agar dikenal masyarakat luas dinamakan …", ["Pemasaran / Iklan", "Produksi", "Pembelian", "Penyimpanan"], 0, "Promosi mengenalkan keunggulan produk."),
        S(1, "Media cetak berupa lembaran kertas kecil yang dibagikan untuk promosi usaha dinamakan …", ["Brosur / Pamflet", "Baliho", "Spanduk", "Katalog"], 0, "Brosur dicetak untuk dibagikan secara ringkas."),
        S(1, "Kerajinan pahatan kayu Jepara terkenal dengan teknik …", ["Ukir", "Anyam", "Tenun", "Batik"], 0, "Jepara terkenal dengan seni ukir kayunya."),
        S(1, "Kain tenun ikat khas Nusa Tenggara dibuat menggunakan teknik …", ["Tenun manual", "Cetak mesin", "Batik tulis", "Bordir"], 0, "Tenun dibuat menyilangkan benang pakan dan lusi."),
        S(1, "Seseorang yang membeli produk barang atau jasa untuk kebutuhan sendiri dinamakan …", ["Konsumen / Pembeli", "Produsen", "Distributor", "Agen"], 0, "Konsumen adalah pengguna akhir produk."),
        S(1, "Penataan produk barang yang rapi di rak toko dinamakan …", ["Display produk", "Packing", "Shipping", "Unboxing"], 0, "Display memperindah kerapian sajian barang."),
        S(1, "Bahan kerajinan limbah keras anorganik contohnya adalah …", ["Pecahan kaca dan kaleng", "Daun kering", "Kulit pisang", "Kertas bekas"], 0, "Kaca dan kaleng termasuk limbah keras anorganik."),
        S(1, "Bahan kerajinan limbah lunak organik contohnya adalah …", ["Pelepah pisang dan daun kering", "Plastik", "Kaca", "Besi"], 0, "Daun dan pelepah adalah limbah lunak organik."),
        S(1, "Strategi penetapan harga jual harus memperhitungkan biaya produksi dan …", ["Keuntungan yang diinginkan", "Kerugian", "Pajak maksimal", "Diskon awal"], 0, "Harga Jual = Biaya Produksi + Margin Keuntungan.")
      ]
    }
  ]
};