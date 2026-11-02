(function () {
    'use strict';
    const VERSI = '5.0';
    console.info('Game Edukasi 3D versi ' + VERSI);

    const $ = (id) => document.getElementById(id);

    function tampilError(html) {
        const k = $('kotak-error');
        k.innerHTML = html;
        k.classList.remove('modal-hidden');
    }

    // ---------- Pemeriksaan awal ----------
    if (typeof THREE === 'undefined') {
        tampilError('<h2>⚠️ Three.js gagal dimuat</h2>' +
            '<p>Game ini perlu koneksi internet untuk memuat Three.js.<br>' +
            'Untuk mode offline, unduh <code>three.min.js</code> (versi r128) dan simpan di <code>lib/three.min.js</code>.</p>');
        return;
    }
    if (typeof DATA_SOAL === 'undefined' || !Array.isArray(DATA_SOAL.gedung)) {
        tampilError('<h2>⚠️ Data soal tidak ditemukan</h2><p>Pastikan file <code>data/soal.js</code> ada dan tidak error.</p>');
        return;
    }

    // Pemeriksa soal: soal yang salah format dilewati (dan dilaporkan di Console, tekan F12)
    function masalahSoal(s) {
        if (!s || typeof s.pertanyaan !== 'string' || !s.pertanyaan.trim()) return 'pertanyaan kosong';
        if (!Array.isArray(s.opsi) || s.opsi.length < 2 || s.opsi.length > 4) return 'opsi harus 2-4 pilihan';
        if (new Set(s.opsi.map(String)).size !== s.opsi.length) return 'ada opsi yang sama';
        if (!Number.isInteger(s.jawaban) || s.jawaban < 0 || s.jawaban >= s.opsi.length) return 'nomor jawaban di luar opsi (mulai dari 0)';
        if ([1, 2, 3].indexOf(s.t) < 0) return 'tingkat harus 1, 2, atau 3';
        return '';
    }
    let soalDilewati = 0;
    DATA_SOAL.gedung.forEach((g) => {
        g.soal = (g.soal || []).filter((s, i) => {
            const masalah = masalahSoal(s);
            if (masalah) { soalDilewati++; console.warn('[Soal dilewati] ' + g.id + ' #' + (i + 1) + ': ' + masalah, s); }
            return !masalah;
        });
    });

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    document.body.classList.toggle('touch', isTouch);

    // ---------- 1. RENDERER, SCENE, KAMERA ----------
    const canvas = $('game-canvas');
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    } catch (err) {
        tampilError('<h2>⚠️ WebGL tidak tersedia</h2><p>Browser atau perangkat ini tidak mendukung WebGL. Coba Chrome / Firefox / Safari terbaru.</p>');
        return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 45, 120);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);

    // ---------- 2. PENCAHAYAAN ----------
    scene.add(new THREE.HemisphereLight(0xbfe3ff, 0x4a7c3a, 0.55));
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const sun = new THREE.DirectionalLight(0xffffff, 0.85);
    sun.position.set(30, 50, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -70;
    sun.shadow.camera.right = 70;
    sun.shadow.camera.top = 70;
    sun.shadow.camera.bottom = -70;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 150;
    scene.add(sun);

    // ---------- 3. LINGKUNGAN ----------
    const BATAS = 52;            // batas area bermain (±)
    // 12 slot gedung pada kota pola kisi (grid): tiap gedung menghadap jalan ke arah taman di tengah
    const SLOT_GEDUNG = [
        [0, 22.5, 0, -1], [22.8, 22.5, 0, -1], [33.2, 22.5, 0, -1], [22.5, 0, -1, 0], [22.8, -22.5, 0, 1], [33.2, -22.5, 0, 1],
        [0, -22.5, 0, 1], [-22.8, -22.5, 0, 1], [-33.2, -22.5, 0, 1], [-22.5, 0, 1, 0], [-22.8, 22.5, 0, -1], [-33.2, 22.5, 0, -1]
    ].map((v) => ({ x: v[0], z: v[1], dx: v[2], dz: v[3], rot: Math.atan2(v[2], v[3]) }));
    if (DATA_SOAL.gedung.length > SLOT_GEDUNG.length) {
        console.warn('Peta hanya memuat ' + SLOT_GEDUNG.length + ' gedung; gedung ke-' + (SLOT_GEDUNG.length + 1) + ' dan seterusnya diabaikan.');
        DATA_SOAL.gedung.length = SLOT_GEDUNG.length;
    }
    const JUMLAH = DATA_SOAL.gedung.length;
    const TAU = Math.PI * 2;

    let seed = 20260;
    const acakTetap = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    // --- alat bantu membangun objek ---
    const cacheBahan = {};
    const bahan = (c) => cacheBahan[c] || (cacheBahan[c] = new THREE.MeshStandardMaterial({ color: c }));
    const pakaiBahan = (w) => (typeof w === 'number' ? bahan(w) : w);
    function kotak(induk, w, h, d, warna, x, y, z) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), pakaiBahan(warna));
        m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
        induk.add(m); return m;
    }
    function tabung(induk, ra, rb, h, warna, x, y, z, seg) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(ra, rb, h, seg || 20), pakaiBahan(warna));
        m.position.set(x, y, z); m.castShadow = true;
        induk.add(m); return m;
    }
    function bola(induk, r, warna, x, y, z) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), pakaiBahan(warna));
        m.position.set(x, y, z); m.castShadow = true;
        induk.add(m); return m;
    }
    function datar(geo, warna, y) {
        const m = new THREE.Mesh(geo, pakaiBahan(warna));
        m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true;
        scene.add(m); return m;
    }
    function kutub(a) { const g = new THREE.Group(); g.rotation.y = a; scene.add(g); return g; }   // z lokal = arah ke luar dari pusat
    const cacheGeo = {};
    function datarDi(induk, w, d, warna, y, z, x) {
        const kunci = w + 'x' + d;
        const geo = cacheGeo[kunci] || (cacheGeo[kunci] = new THREE.PlaneGeometry(w, d));
        const m = new THREE.Mesh(geo, pakaiBahan(warna));
        m.rotation.x = -Math.PI / 2; m.position.set(x || 0, y, z); m.receiveShadow = true;
        induk.add(m); return m;
    }
    const putih = 0xf8fafc, emas = 0xf5c542;

    // --- tanah, taman, jalan kota POLA KISI (grid): 4 jalan ke tiap arah = 16 persimpangan ---
    const tanah = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), bahan(0x3fb56b));
    tanah.rotation.x = -Math.PI / 2; tanah.receiveShadow = true; scene.add(tanah);

    const GARIS = [-42, -14, 14, 42];               // sumbu jalan (sama untuk arah x dan z)
    const LEBAR = 6, aspal = 0x374151, kuning = 0xfacc15;
    const PUSAT_BLOK = [-28, 0, 28];
    const BLOK = [];                                // 9 blok kota 22×22; blok tengah = taman
    PUSAT_BLOK.forEach((bx) => PUSAT_BLOK.forEach((bz) => BLOK.push({ x: bx, z: bz })));

    function buatMarka(warna, daftar, y) {          // ratusan garis datar digambar sekali (InstancedMesh) agar ringan di HP
        const geo = new THREE.PlaneGeometry(1, 1); geo.rotateX(-Math.PI / 2);
        const im = new THREE.InstancedMesh(geo, pakaiBahan(warna), daftar.length);
        const m4 = new THREE.Matrix4();
        daftar.forEach((d, i) => { m4.makeScale(d[2], 1, d[3]); m4.setPosition(d[0], y, d[1]); im.setMatrixAt(i, m4); });
        im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; im.receiveShadow = true;
        scene.add(im);
    }
    GARIS.forEach((g) => {                          // aspal
        datarDi(scene, 2 * BATAS, LEBAR, aspal, 0.04, g, 0);
        datarDi(scene, LEBAR, 2 * BATAS, aspal, 0.04, 0, g);
    });
    datar(new THREE.CircleGeometry(10.5, 48), 0xd9d6cf, 0.03);        // plaza taman di blok tengah
    datar(new THREE.RingGeometry(5.4, 6.8, 48), 0x2f9e4f, 0.045);     // bedeng bunga

    const putus = [], tepi = [], zebra = [], trotoar = [];
    const dekatSimpang = (t, jarak) => GARIS.some((g) => Math.abs(t - g) < jarak);
    const potong = [-BATAS];
    GARIS.forEach((g) => potong.push(g - 3.3, g + 3.3));
    potong.push(BATAS);
    GARIS.forEach((g) => {
        for (let t = -BATAS + 2; t < BATAS - 1; t += 4) if (!dekatSimpang(t, 4.4)) { putus.push([t, g, 1.8, 0.2]); putus.push([g, t, 0.2, 1.8]); }
        for (let k = 0; k < potong.length; k += 2) {
            const a = potong[k], b = potong[k + 1], len = b - a, mid = (a + b) / 2;
            [-2.7, 2.7].forEach((o) => { tepi.push([mid, g + o, len, 0.2]); tepi.push([g + o, mid, 0.2, len]); });
        }
    });
    GARIS.forEach((X) => GARIS.forEach((Z) => {      // zebra cross di keempat lengan tiap persimpangan
        for (let o = -2.5; o <= 2.5; o += 1) {
            zebra.push([X + 4.6, Z + o, 1.8, 0.5], [X - 4.6, Z + o, 1.8, 0.5], [X + o, Z + 4.6, 0.5, 1.8], [X + o, Z - 4.6, 0.5, 1.8]);
        }
    }));
    BLOK.forEach((b) => {                            // trotoar mengelilingi tiap blok
        trotoar.push([b.x, b.z + 10.4, 22, 1.2], [b.x, b.z - 10.4, 22, 1.2], [b.x + 10.4, b.z, 1.2, 22], [b.x - 10.4, b.z, 1.2, 22]);
    });
    buatMarka(0xd8d4cc, trotoar, 0.045);
    buatMarka(putih, tepi.concat(zebra), 0.06);
    buatMarka(kuning, putus, 0.065);

    // --- orang berbentuk balok (gaya Minecraft) ---
    const KULIT = bahan(0xd9a37a);
    function buatManusia(bajuMat, rambut, celana) {
        const grup = new THREE.Group();
        const atas = new THREE.Group(); atas.position.y = 0.75;
        kotak(atas, 0.62, 0.75, 0.34, bajuMat, 0, 0.375, 0);
        const kepala = new THREE.Group(); kepala.position.y = 1.0;
        kotak(kepala, 0.5, 0.5, 0.5, KULIT, 0, 0, 0);
        kotak(kepala, 0.54, 0.14, 0.54, rambut, 0, 0.22, 0);
        kotak(kepala, 0.54, 0.34, 0.1, rambut, 0, 0.06, -0.22);
        [-0.12, 0.12].forEach((dx) => {
            kotak(kepala, 0.12, 0.08, 0.02, 0xffffff, dx, 0.03, 0.255);
            kotak(kepala, 0.06, 0.08, 0.02, 0x2b1b0f, dx * 1.1, 0.03, 0.265);
        });
        kotak(kepala, 0.14, 0.04, 0.02, 0x9a4a3a, 0, -0.12, 0.255);
        atas.add(kepala);
        const lengan = (sisi) => {
            const p = new THREE.Group(); p.position.set(sisi * 0.45, 0.72, 0);
            kotak(p, 0.28, 0.54, 0.28, bajuMat, 0, -0.27, 0);
            kotak(p, 0.28, 0.18, 0.28, KULIT, 0, -0.63, 0);
            atas.add(p); return p;
        };
        const kaki = (sisi) => {
            const p = new THREE.Group(); p.position.set(sisi * 0.16, 0.75, 0);
            kotak(p, 0.3, 0.7, 0.3, celana, 0, -0.35, 0);
            kotak(p, 0.32, 0.1, 0.38, 0x6b7280, 0, -0.7, 0.03);
            grup.add(p); return p;
        };
        const lenganKiri = lengan(-1), lenganKanan = lengan(1), kakiKiri = kaki(-1), kakiKanan = kaki(1);
        grup.add(atas);
        return { grup: grup, atas: atas, kepala: kepala, lenganKiri: lenganKiri, lenganKanan: lenganKanan, kakiKiri: kakiKiri, kakiKanan: kakiKanan };
    }

    // --- gedung: satu bentuk khas per mata pelajaran ---
    const bahanJendela = new THREE.MeshStandardMaterial({ color: 0xbfe9ff, emissive: 0x4aa8d8, emissiveIntensity: 0.5 });
    function buatPapanNama(teks, ikon) {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 128;
        const g = c.getContext('2d');
        g.fillStyle = 'rgba(255,255,255,0.96)'; g.fillRect(0, 0, 512, 128);
        g.strokeStyle = '#1e293b'; g.lineWidth = 8; g.strokeRect(4, 4, 504, 120);
        g.fillStyle = '#1e293b'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = 'bold 40px "Segoe UI", Arial, sans-serif';
        g.fillText(ikon + ' ' + teks, 256, 68, 470);
        return new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }));
    }
    const HIASAN = {
        agama(g) {          // rumah ibadah berkubah emas + dua menara
            const k = new THREE.Mesh(new THREE.SphereGeometry(2.8, 24, 12, 0, TAU, 0, Math.PI / 2), pakaiBahan(emas));
            k.position.y = 7.4; k.castShadow = true; g.add(k);
            tabung(g, 0.1, 0.1, 1.2, emas, 0, 10.8, 0, 8);
            [-1, 1].forEach((s) => { tabung(g, 0.55, 0.65, 10, putih, s * 4.3, 5, -3.6, 12); tabung(g, 0.05, 0.5, 1.4, emas, s * 4.3, 10.7, -3.6, 12); });
        },
        pancasila(g) {      // balai berpilar lima + bintang emas + bendera
            for (let i = 0; i < 5; i++) tabung(g, 0.38, 0.38, 6.6, putih, -3.2 + i * 1.6, 3.3, 5, 12);
            kotak(g, 8.6, 0.4, 2.4, putih, 0, 6.8, 4.6);
            const b = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.9, 5), pakaiBahan(emas)); b.position.set(0, 7.9, 0); g.add(b);
            tabung(g, 0.07, 0.07, 4, 0x9ca3af, 3.5, 9.4, 0, 8);
            kotak(g, 1.6, 0.5, 0.05, 0xdc2626, 4.3, 11, 0); kotak(g, 1.6, 0.5, 0.05, putih, 4.3, 10.5, 0);
        },
        bin(g) {            // perpustakaan: pilar + tumpukan buku di atap
            for (let i = 0; i < 4; i++) tabung(g, 0.35, 0.35, 6.2, putih, -2.7 + i * 1.8, 3.1, 4.6, 12);
            kotak(g, 8.4, 0.4, 1.8, putih, 0, 6.4, 4.6);
            [0xdc2626, 0x2563eb, 0x16a34a].forEach((c, i) => kotak(g, 3 - i * 0.5, 0.5, 1.6, c, 0, 7.65 + i * 0.5, 0));
        },
        mat(g) {            // menara dengan lambang π di atap
            kotak(g, 5, 0.6, 0.6, putih, 0, 9.4, 0);
            [-1.6, 1.6].forEach((x) => kotak(g, 0.6, 2, 0.6, putih, x, 8.4, 0));
            kotak(g, 1.2, 0.3, 1.2, emas, 0, 7.55, 0);
        },
        ipas(g) {           // rumah kaca dengan tanaman
            const kaca = new THREE.MeshStandardMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0.45 });
            kotak(g, 7.6, 3, 7.6, kaca, 0, 8.9, 0);
            [[-2, -2], [2, 2], [-2, 2], [2, -2]].forEach((p) => { tabung(g, 0.15, 0.15, 1.2, 0x7c4a1e, p[0], 8.0, p[1], 8); bola(g, 0.9, 0x22c55e, p[0], 9.0, p[1]); });
        },
        ipa(g) {            // laboratorium: labu Erlenmeyer raksasa + cerobong
            const cair = new THREE.MeshStandardMaterial({ color: 0x4ade80, transparent: true, opacity: 0.8 });
            tabung(g, 0.35, 1.6, 2.4, cair, 0, 8.6, 0, 20); tabung(g, 0.4, 0.4, 0.8, 0xe5e7eb, 0, 10.2, 0, 12);
            tabung(g, 0.5, 0.5, 3, 0x9ca3af, -3, 8.9, -3, 12);
        },
        ips(g) {            // bola dunia di atas tugu
            kotak(g, 2, 0.8, 2, 0x9ca3af, 0, 7.8, 0); bola(g, 1.8, 0x2563eb, 0, 9.6, 0);
            bola(g, 0.7, 0x22c55e, 1.0, 10.1, 1.1); bola(g, 0.6, 0x22c55e, -1.1, 9.2, 1.0);
            const c = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.07, 8, 32), pakaiBahan(emas));
            c.position.y = 9.6; c.rotation.x = Math.PI / 2; g.add(c);
        },
        ing(g) {            // menara jam bergaya Big Ben
            kotak(g, 2.8, 5, 2.8, 0xc9a66b, 0, 9.9, 0);
            const a = new THREE.Mesh(new THREE.ConeGeometry(2.1, 2.6, 4), pakaiBahan(0x374151));
            a.rotation.y = Math.PI / 4; a.position.y = 13.7; g.add(a);
            const w = new THREE.Mesh(new THREE.CircleGeometry(1, 24), pakaiBahan(putih)); w.position.set(0, 10.6, 1.42); g.add(w);
            kotak(g, 0.08, 0.7, 0.04, 0x111111, 0, 10.8, 1.45); kotak(g, 0.5, 0.08, 0.04, 0x111111, 0.2, 10.6, 1.45);
        },
        pjok(g) {           // gedung olahraga: tiang lampu stadion + gawang + bola
            [-1, 1].forEach((s) => { tabung(g, 0.2, 0.2, 11, 0x6b7280, s * 4.5, 5.5, -4.5, 8); kotak(g, 1.6, 0.8, 0.5, 0xfef08a, s * 4.5, 11.2, -4.5); });
            kotak(g, 0.12, 2.2, 0.12, putih, 5.4, 1.1, 2.5); kotak(g, 0.12, 2.2, 0.12, putih, 5.4, 1.1, 6.5); kotak(g, 0.12, 0.12, 4.1, putih, 5.4, 2.2, 4.5);
            bola(g, 0.5, putih, 6.6, 0.5, 4.5);
        },
        seni(g) {           // teater/galeri: atap tenda, topeng, spanduk warna-warni
            const t = new THREE.Mesh(new THREE.ConeGeometry(6.2, 3, 4), pakaiBahan(0xdb2777));
            t.rotation.y = Math.PI / 4; t.position.y = 8.9; t.castShadow = true; g.add(t);
            bola(g, 0.5, 0xfacc15, -1.3, 7.9, 3.4); bola(g, 0.5, 0xfacc15, 1.3, 7.9, 3.4);
            [0xef4444, 0xfacc15, 0x22c55e, 0x3b82f6].forEach((c, i) => kotak(g, 0.15, 3, 0.8, c, i < 2 ? -4.05 : 4.05, 3.5, i % 2 ? 1.6 : -1.6));
        },
        informatika(g) {    // antena parabola + menara sinyal
            const d = new THREE.Mesh(new THREE.SphereGeometry(1.5, 20, 10, 0, TAU, 0, Math.PI / 2), pakaiBahan(0xe5e7eb));
            d.position.set(0, 9, 0); d.rotation.x = Math.PI - 0.6; g.add(d);
            tabung(g, 0.15, 0.15, 2, 0x6b7280, 0, 8.2, 0, 8);
            tabung(g, 0.08, 0.18, 6, 0x6b7280, 3, 10.4, -3, 8); bola(g, 0.2, 0xef4444, 3, 13.5, -3);
        },
        pkwu(g) {           // bengkel: atap gerigi, tenda kanopi merah-putih, peti kayu
            [-2.6, 0, 2.6].forEach((x) => { const m = kotak(g, 2.6, 0.3, 8.2, 0x6b7280, x, 8.0, 0); m.rotation.z = -0.35; kotak(g, 0.2, 1.2, 8.2, 0x9ca3af, x - 1.2, 8.0, 0); });
            for (let i = 0; i < 6; i++) { const m = kotak(g, 1.4, 0.12, 1.8, i % 2 ? putih : 0xdc2626, -3.5 + i * 1.4, 3.7, 5.0); m.rotation.x = 0.35; }
            kotak(g, 0.9, 0.9, 0.9, 0xa16207, 5, 0.45, 3.5); kotak(g, 0.9, 0.9, 0.9, 0xa16207, 5, 1.35, 3.5);
        }
    };
    const penghalang = [{ x: 0, z: 0, r: 3.8 }];   // lingkaran yang tidak bisa ditembus (air mancur & gedung)
    const daftarGedung = DATA_SOAL.gedung.map((data, i) => {
        const sl = SLOT_GEDUNG[i];
        const warna = new THREE.Color(data.warna);
        const grp = new THREE.Group();
        grp.position.set(sl.x, 0, sl.z);
        grp.rotation.y = sl.rot;                              // pintu menghadap jalan ke arah taman
        const bahanBadan = new THREE.MeshStandardMaterial({ color: warna });
        const gelap = new THREE.MeshStandardMaterial({ color: warna.clone().multiplyScalar(0.6) });
        kotak(grp, 8, 7, 8, bahanBadan, 0, 3.5, 0);
        kotak(grp, 8.6, 0.4, 8.6, gelap, 0, 7.2, 0);
        kotak(grp, 1.8, 3, 0.2, 0x5b3a1e, 0, 1.5, 4.05);
        kotak(grp, 3.4, 0.2, 1.2, 0xbdb8ad, 0, 0.1, 4.6);
        [-2.6, 2.6].forEach((dx) => kotak(grp, 1.4, 1.4, 0.15, bahanJendela, dx, 4, 4.05));
        const papan = buatPapanNama(data.nama, data.ikon);
        papan.position.set(0, 5.7, 4.07);
        grp.add(papan);
        if (HIASAN[data.id]) HIASAN[data.id](grp);
        else { const t = new THREE.Mesh(new THREE.ConeGeometry(6.2, 2.8, 4), gelap); t.rotation.y = Math.PI / 4; t.position.y = 8.6; t.castShadow = true; grp.add(t); }
        scene.add(grp);
        penghalang.push({ x: grp.position.x, z: grp.position.z, r: 5.4 });
        return { data: data, x: grp.position.x, z: grp.position.z, bahanBadan: bahanBadan, warna: warna };
    });

    // --- taman air mancur lengkap dengan bangku & lampu ---
    const air = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
    tabung(scene, 3.8, 4.0, 0.7, 0xb9b5ad, 0, 0.35, 0, 36);
    tabung(scene, 3.4, 3.4, 0.1, air, 0, 0.62, 0, 36);
    tabung(scene, 0.55, 0.75, 2.0, 0xcfcac1, 0, 1.1, 0, 16);
    tabung(scene, 1.7, 1.0, 0.4, 0xb9b5ad, 0, 2.25, 0, 24);
    tabung(scene, 1.4, 1.4, 0.08, air, 0, 2.5, 0, 24);
    tabung(scene, 0.12, 0.12, 1.2, air, 0, 3.1, 0, 8);
    const tetes = [];
    for (let i = 0; i < 16; i++) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), air);
        scene.add(m); tetes.push({ mesh: m, phi: i * TAU / 16, fase: (i % 4) / 4 });
    }
    const warnaBunga = [0xef4444, 0xfacc15, 0xf472b6, 0xffffff, 0xa78bfa];
    for (let i = 0; i < 28; i++) {
        const a = i * TAU / 28;
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), bahan(warnaBunga[i % 5]));
        b.position.set(Math.sin(a) * 6.1, 0.25, Math.cos(a) * 6.1); scene.add(b);
    }
    function buatBangku(a) {
        const b = new THREE.Group();
        b.position.set(Math.sin(a) * 8.6, 0, Math.cos(a) * 8.6);
        b.rotation.y = a + Math.PI;                           // menghadap air mancur
        kotak(b, 2.2, 0.15, 0.7, 0x8b5a2b, 0, 0.55, 0);
        kotak(b, 2.2, 0.7, 0.12, 0x8b5a2b, 0, 0.95, -0.33);
        [-0.9, 0.9].forEach((dx) => kotak(b, 0.12, 0.55, 0.6, 0x374151, dx, 0.28, 0));
        scene.add(b);
    }
    const bahanLampu = new THREE.MeshStandardMaterial({ color: 0xfff3b0, emissive: 0xffe08a, emissiveIntensity: 0.8 });
    function buatLampu(a) {
        const x = Math.sin(a) * 9.8, z = Math.cos(a) * 9.8;
        tabung(scene, 0.08, 0.1, 3.6, 0x374151, x, 1.8, z, 8);
        bola(scene, 0.3, bahanLampu, x, 3.7, z);
    }
    for (let k = 0; k < 6; k++) { buatBangku((15 + 60 * k) * Math.PI / 180); buatLampu((45 + 60 * k) * Math.PI / 180); }

    // --- pohon ---
    const posPohon = [];
    const geoBatang = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
    const geoDaun = new THREE.ConeGeometry(1.6, 3.2, 8);
    function buatPohon(x, z, s) {
        const p = new THREE.Group();
        const batang = new THREE.Mesh(geoBatang, bahan(0x7c4a1e)); batang.position.y = 1;
        const daun = new THREE.Mesh(geoDaun, bahan(0x1f8f4a)); daun.position.y = 3.4;
        batang.castShadow = true; daun.castShadow = true;
        p.add(batang, daun); p.scale.set(s, s, s); p.position.set(x, 0, z); scene.add(p);
        posPohon.push({ x: x, z: z });
    }
    BLOK.forEach((b) => {
        if (b.x === 0 && b.z === 0) return;                      // blok tengah = taman
        for (let n = 0, coba = 0; n < 8 && coba < 150; coba++) {
            const x = b.x + (acakTetap() * 2 - 1) * 9, z = b.z + (acakTetap() * 2 - 1) * 9;
            if (daftarGedung.some((g) => Math.hypot(x - g.x, z - g.z) < 7.5)) continue;
            buatPohon(x, z, 0.8 + acakTetap() * 0.6); n++;
        }
    });
    [[-9.5, -9.5], [9.5, -9.5], [9.5, 9.5]].forEach((p) => buatPohon(p[0], p[1], 0.9));   // sudut taman
    for (let i = 0; i < 44; i++) {                                // pohon di tepi luar kota
        const t = (acakTetap() * 2 - 1) * 54, d = 47.5 + acakTetap() * 6.5, sk = i % 4;
        buatPohon(sk === 0 ? t : sk === 1 ? t : sk === 2 ? d : -d, sk === 0 ? d : sk === 1 ? -d : t, 0.8 + acakTetap() * 0.7);
    }

    // --- identitas kota: gapura di pintu masuk utara & prasasti pengembang di taman ---
    const KOTA = Object.assign({ nama: 'Kota Edukasi', ikon: '🏙️', pengembang: 'Kuslan Wawan', tahun: 2026 }, DATA_SOAL.kota || {});
    ['nama', 'ikon', 'pengembang'].forEach((k) => { KOTA[k] = String(KOTA[k]).slice(0, 28); });
    document.title = KOTA.nama + ' — Game Edukasi 3D';
    function papanTeks(w, h, cw, ch, baris, latar, warnaTeks) {
        const c = document.createElement('canvas'); c.width = cw; c.height = ch;
        const g = c.getContext('2d'), tebal = Math.round(cw / 64);
        g.fillStyle = latar; g.fillRect(0, 0, cw, ch);
        g.strokeStyle = '#f5c542'; g.lineWidth = tebal; g.strokeRect(tebal / 2, tebal / 2, cw - tebal, ch - tebal);
        g.fillStyle = warnaTeks; g.textAlign = 'center'; g.textBaseline = 'middle';
        let y = (ch - baris.reduce((a, b) => a + b[1] * 1.25, 0)) / 2;
        baris.forEach((b) => { g.font = (b[2] ? 'bold ' : '') + b[1] + 'px "Segoe UI", Arial, sans-serif'; g.fillText(b[0], cw / 2, y + b[1] * 0.625, cw - 4 * tebal); y += b[1] * 1.25; });
        return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }));
    }
    (function gapura() {                                        // gerbang bernama kota, melintang di atas jalan utara
        const g = new THREE.Group(); g.position.set(14, 0, -47.5);
        const merah = 0xb91c1c, tua = 0x7f1d1d;
        [-5.2, 5.2].forEach((x) => {
            kotak(g, 2.0, 0.8, 2.0, emas, x, 0.4, 0);
            kotak(g, 1.4, 9.6, 1.4, merah, x, 5.6, 0);
            kotak(g, 1.9, 0.5, 1.9, emas, x, 10.6, 0);
            bola(g, 0.45, emas, x, 11.2, 0);
        });
        kotak(g, 12.6, 1.0, 1.8, tua, 0, 9.9, 0);
        kotak(g, 13.4, 0.5, 2.4, merah, 0, 10.7, 0);
        kotak(g, 10.0, 0.5, 2.0, merah, 0, 11.2, 0);
        const puncak = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.4, 4), pakaiBahan(emas)); puncak.position.set(0, 12.2, 0); puncak.rotation.y = Math.PI / 4; g.add(puncak);
        kotak(g, 9.0, 2.3, 0.3, tua, 0, 8.5, 0);
        const isi = [['SELAMAT DATANG DI', 44, false], [KOTA.ikon + ' ' + KOTA.nama.toUpperCase(), 88, true]];
        const depan = papanTeks(9.0, 2.25, 1024, 256, isi, '#7f1d1d', '#fef3c7'); depan.position.set(0, 8.5, 0.16); g.add(depan);
        const belakang = papanTeks(9.0, 2.25, 1024, 256, isi, '#7f1d1d', '#fef3c7'); belakang.position.set(0, 8.5, -0.16); belakang.rotation.y = Math.PI; g.add(belakang);
        scene.add(g);
        [8.8, 19.2].forEach((x) => posPohon.push({ x: x, z: -47.5 }));
    })();
    (function prasasti() {                                      // monumen kecil dengan nama pengembang, dekat titik awal
        const g = new THREE.Group(); g.position.set(-7.6, 0, 8.6);
        kotak(g, 5.2, 0.5, 1.9, 0x9ca3af, 0, 0.25, 0);
        kotak(g, 4.7, 0.4, 1.5, 0xb9b5ad, 0, 0.7, 0);
        const p = new THREE.Group(); p.position.set(0, 1.9, -0.2); p.rotation.x = -0.28; g.add(p);
        kotak(p, 4.5, 2.25, 0.35, 0x4b5563, 0, 0, 0);
        const m = papanTeks(4.2, 2.1, 512, 256, [[KOTA.ikon + ' ' + KOTA.nama, 40, true], ['Dikembangkan oleh', 26, false], [KOTA.pengembang, 36, true], ['© ' + KOTA.tahun, 24, false]], '#1f2937', '#f9fafb');
        m.position.z = 0.19; p.add(m);
        scene.add(g);
        penghalang.push({ x: -7.6, z: 8.6, r: 2.5 });
        [-9.2, -7.6, -6.0].forEach((x) => posPohon.push({ x: x, z: 8.6 }));
    })();

    // --- mobil menyusuri jalan kota (belok di tiap sudut blok), pejalan kaki di taman ---
    function buatMobil(warna) {
        const m = new THREE.Group();
        kotak(m, 1.4, 0.55, 2.8, warna, 0, 0.6, 0);
        kotak(m, 1.2, 0.5, 1.4, warna, 0, 1.1, -0.15);
        kotak(m, 1.24, 0.32, 1.1, 0x93c5fd, 0, 1.12, -0.15);
        [[-0.7, 0.9], [0.7, 0.9], [-0.7, -0.9], [0.7, -0.9]].forEach((p) => { const r = tabung(m, 0.3, 0.3, 0.25, 0x111827, p[0], 0.3, p[1], 12); r.rotation.z = Math.PI / 2; });
        scene.add(m); return m;
    }
    const mobilList = [];
    const WARNA_MOBIL = [0xef4444, 0xfacc15, 0x3b82f6, 0xf8fafc, 0x22c55e, 0xf97316, 0x8b5cf6, 0x14b8a6];
    function tambahMobil(x0, x1, z0, z1, arah, v, warna, fase) {   // lintasan = persegi panjang mengikuti lajur jalan
        const per = 2 * ((x1 - x0) + (z1 - z0));
        mobilList.push({ grup: buatMobil(warna), x0: x0, x1: x1, z0: z0, z1: z1, per: per, s: fase * per, arah: arah, v: v, h: 0, siap: false });
    }
    tambahMobil(-12.5, 12.5, -12.5, 12.5, 1, 7, WARNA_MOBIL[0], 0);            // mengelilingi taman
    tambahMobil(-15.5, 15.5, -15.5, 15.5, -1, 7, WARNA_MOBIL[1], 0.5);
    tambahMobil(-43.5, 43.5, -43.5, 43.5, 1, 9, WARNA_MOBIL[2], 0);            // jalan lingkar luar kota
    tambahMobil(-43.5, 43.5, -43.5, 43.5, 1, 9, WARNA_MOBIL[3], 0.5);
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach((q, i) => {                  // mengelilingi tiap blok sudut
        const xa = q[0] * 15.5, xb = q[0] * 40.5, za = q[1] * 15.5, zb = q[1] * 40.5;
        tambahMobil(Math.min(xa, xb), Math.max(xa, xb), Math.min(za, zb), Math.max(za, zb), 1, 8, WARNA_MOBIL[4 + i], i * 0.25);
    });
    const pejalan = [];
    for (let i = 0; i < 6; i++) {
        const m = buatManusia(
            new THREE.MeshStandardMaterial({ color: [0xf97316, 0x16a34a, 0xdb2777, 0x7c3aed, 0xeab308, 0x0ea5e9][i] }),
            [0x2b1b0f, 0xb45309, 0x111111, 0x6b3e1f, 0x1f2937, 0xd4a017][i], 0x374151);
        scene.add(m.grup);
        pejalan.push({ m: m, a: i * TAU / 6, arah: i % 2 ? -1 : 1, r: 7.4 + (i % 3) * 0.3, w: 0.1 + (i % 3) * 0.02, fase: i });
    }

    // --- animasi dunia: air mancur, mobil, pejalan ---
    let tDunia = 0;
    function animasiDunia(dt) {
        tDunia += dt;
        tetes.forEach((p) => {
            const u = (tDunia * 0.8 + p.fase) % 1, rad = 0.1 + u * 2.9;
            p.mesh.position.set(Math.sin(p.phi) * rad, 2.7 * (1 - u) + 0.7 * u + 6.4 * u * (1 - u), Math.cos(p.phi) * rad);
        });
        mobilList.forEach((c) => {
            c.s = (c.s + c.arah * c.v * dt + c.per) % c.per;
            const w = c.x1 - c.x0, h = c.z1 - c.z0;
            let x, z, dx, dz;
            if (c.s < w) { x = c.x0 + c.s; z = c.z0; dx = 1; dz = 0; }
            else if (c.s < w + h) { x = c.x1; z = c.z0 + (c.s - w); dx = 0; dz = 1; }
            else if (c.s < 2 * w + h) { x = c.x1 - (c.s - w - h); z = c.z1; dx = -1; dz = 0; }
            else { x = c.x0; z = c.z1 - (c.s - 2 * w - h); dx = 0; dz = -1; }
            const tujuan = Math.atan2(dx * c.arah, dz * c.arah);
            if (!c.siap) { c.h = tujuan; c.siap = true; }
            let d = tujuan - c.h;
            while (d > Math.PI) d -= TAU;
            while (d < -Math.PI) d += TAU;
            c.h += d * Math.min(1, dt * 8);
            c.grup.position.set(x, 0, z);
            c.grup.rotation.y = c.h;
        });
        pejalan.forEach((p) => {
            p.a += p.arah * p.w * dt;
            p.m.grup.position.set(Math.sin(p.a) * p.r, 0, Math.cos(p.a) * p.r);
            p.m.grup.rotation.y = p.a + p.arah * Math.PI / 2;
            const ayun = Math.sin(tDunia * 6 + p.fase) * 0.6;
            p.m.kakiKiri.rotation.x = ayun; p.m.kakiKanan.rotation.x = -ayun;
            p.m.lenganKiri.rotation.x = -ayun; p.m.lenganKanan.rotation.x = ayun;
        });
    }

    // Awan
    const awan = [];
    const bahanAwan = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 6; i++) {
        const g = new THREE.Group();
        [[0, 0, 0, 3], [3, -0.5, 1, 2.4], [-3, -0.3, -1, 2.2]].forEach((p) => {
            const b = new THREE.Mesh(new THREE.SphereGeometry(p[3], 10, 8), bahanAwan);
            b.position.set(p[0], p[1], p[2]);
            g.add(b);
        });
        g.position.set((acakTetap() * 2 - 1) * 80, 30 + acakTetap() * 8, (acakTetap() * 2 - 1) * 70 - 20);
        g.userData.v = 0.6 + acakTetap() * 0.8;
        scene.add(g);
        awan.push(g);
    }

    // Koin (muncul lagi setiap game dibuka)
    const koinList = [];
    const geoKoin = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 20);
    const bahanKoin = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xb45309, emissiveIntensity: 0.4, metalness: 0.5, roughness: 0.4 });
    const JUMLAH_KOIN = 160;               // tersebar di seluruh area permainan
    for (let n = 0, coba = 0; n < JUMLAH_KOIN && coba < 8000; coba++) {
        const x = (acakTetap() * 2 - 1) * (BATAS - 2);
        const z = (acakTetap() * 2 - 1) * (BATAS - 2);
        if (Math.abs(x) > BATAS - 1.5 || Math.abs(z) > BATAS - 1.5 || Math.hypot(x, z - 9) < 3 || Math.hypot(x, z) < 5 || !daftarGedung.every((g) => Math.hypot(x - g.x, z - g.z) > 7)
            || posPohon.some((t) => Math.hypot(x - t.x, z - t.z) < 1.9)
            || koinList.some((q) => Math.hypot(x - q.position.x, z - q.position.z) < 4.5)) continue;
        const k = new THREE.Group();
        const piringan = new THREE.Mesh(geoKoin, bahanKoin);
        piringan.rotation.x = Math.PI / 2;
        k.add(piringan);
        k.position.set(x, 1.1, z);
        k.userData.f = acakTetap() * 6;
        scene.add(k);
        koinList.push(k);
        n++;
    }

    // NPC penjaga di depan tiap gedung
    const npcList = daftarGedung.map((g, i) => {
        const sl = SLOT_GEDUNG[i];
        const m = buatManusia(new THREE.MeshStandardMaterial({ color: g.warna }), 0x2b1b0f, 0x374151);
        m.grup.position.set(g.x + sl.dx * 4.9 - sl.dz * 3, 0, g.z + sl.dz * 4.9 + sl.dx * 3);
        scene.add(m.grup);
        return m.grup;
    });

    // ---------- 4. PEMAIN (karakter balok ala Minecraft) ----------
    const bahanBaju = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.6 });
    const manusiaP = buatManusia(bahanBaju, 0x3b2314, 0x1e3a8a);
    const player = manusiaP.grup, badanAtas = manusiaP.atas, kepala = manusiaP.kepala;
    const lenganKiri = manusiaP.lenganKiri, lenganKanan = manusiaP.lenganKanan;
    const kakiKiri = manusiaP.kakiKiri, kakiKanan = manusiaP.kakiKanan;
    player.position.set(0, 0, 9);          // mulai di taman, dekat air mancur
    scene.add(player);

    // ---------- 5. INPUT ----------
    const keys = Object.create(null);
    const joy = { aktif: false, x: 0, z: 0, id: null };
    const TOMBOL_GERAK = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'q', 'r'];

    function resetInput() {
        Object.keys(keys).forEach((k) => { keys[k] = false; });
        joyLepas();
    }

    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const k = e.key.toLowerCase();

        if (isKuisOpen) {
            if (k === 'escape') { if (panelTampil()) tutupPanel(); else if (levelTampil()) { if (simpan.level) tutupLevel(); } else tutupKuis(); return; }
            if (panelTampil()) return;
            // Pintasan jawaban: 1-4 atau A-D
            const idx = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
            if (k.length === 1 && idx >= 0) {
                const b = (levelTampil() ? $('level-opsi') : $('kuis-opsi')).children[idx];
                if (b && !b.disabled) { e.preventDefault(); b.click(); }
            }
            return;
        }

        if (TOMBOL_GERAK.indexOf(k) >= 0) {
            keys[k] = true;
            e.preventDefault();
        } else if (k === 'e' && !e.repeat) {
            interaksi();
        }
    });
    window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
    window.addEventListener('blur', resetInput);

    // Joystik bulat: geser kenop ke arah tujuan; makin jauh digeser, makin cepat
    const joyEl = $('joystick'), joyKenop = $('joy-kenop');
    function joyGerak(e) {
        const r = joyEl.getBoundingClientRect();
        const maks = r.width / 2 - 8;
        let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy);
        if (d > maks) { dx *= maks / d; dy *= maks / d; }
        joyKenop.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        const m = Math.hypot(dx, dy) / maks;
        joy.x = m < 0.15 ? 0 : dx / maks;
        joy.z = m < 0.15 ? 0 : dy / maks;
        joy.aktif = joy.x !== 0 || joy.z !== 0;
    }
    function joyLepas(e) {
        if (e && joy.id !== null && e.pointerId !== joy.id) return;
        joy.id = null; joy.aktif = false; joy.x = 0; joy.z = 0;
        joyKenop.style.transform = 'translate(0px,0px)';
    }
    joyEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        joy.id = e.pointerId;
        try { joyEl.setPointerCapture(e.pointerId); } catch (_) { /* abaikan */ }
        joyGerak(e);
    });
    joyEl.addEventListener('pointermove', (e) => { if (e.pointerId === joy.id) { e.preventDefault(); joyGerak(e); } });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => joyEl.addEventListener(t, joyLepas));
    joyEl.addEventListener('contextmenu', (e) => e.preventDefault());

    // Putar kamera: geser (mouse/jari) di area permainan; roda mouse = zoom
    let seret = null;
    canvas.addEventListener('pointerdown', (e) => {
        if (isKuisOpen) return;
        seret = { id: e.pointerId, x: e.clientX, y: e.clientY };
        try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* abaikan */ }
    });
    canvas.addEventListener('pointermove', (e) => {
        if (!seret || e.pointerId !== seret.id) return;
        kameraYaw -= (e.clientX - seret.x) * 0.008;
        kameraPitch = Math.max(0.2, Math.min(1.3, kameraPitch + (e.clientY - seret.y) * 0.006));
        seret.x = e.clientX; seret.y = e.clientY;
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => canvas.addEventListener(t, (e) => { if (seret && e.pointerId === seret.id) seret = null; }));
    canvas.addEventListener('wheel', (e) => { e.preventDefault(); kameraJarak = Math.max(7, Math.min(24, kameraJarak + e.deltaY * 0.01)); }, { passive: false });

    // ---------- 6. HUD ----------
    const KUNCI = 'ge3d-v2';
    const TINGKAT = { 1: { pendek: 'Anak', nama: 'Anak (PAUD–SD)', ikon: '🧒' },
                      2: { pendek: 'Pelajar', nama: 'Pelajar (SMP–SMA)', ikon: '🧑‍🎓' },
                      3: { pendek: 'Umum', nama: 'Umum / Dewasa', ikon: '🧑' } };
    const simpan = { skor: 0, selesai: [], level: 0, suara: true, koin: 0, koinPeta: 0, misiSelesai: [], punya: [0], warna: 0, kamera: false };
    try { Object.assign(simpan, JSON.parse(localStorage.getItem(KUNCI) || '{}')); } catch (_) { /* abaikan */ }
    function tulis() {
        try { localStorage.setItem(KUNCI, JSON.stringify(simpan)); } catch (_) { /* abaikan */ }
        if (window.GE3D && window.GE3D.onSimpan) window.GE3D.onSimpan(simpan);
    }

    let skor = simpan.skor || 0;
    const selesai = new Set(simpan.selesai || []);
    const kunciSelesai = (id) => id + ':' + simpan.level;
    const jumlahSelesai = () => daftarGedung.filter((g) => selesai.has(kunciSelesai(g.data.id))).length;

    // Suara sederhana (WebAudio)
    let ac = null;
    function bunyi(nada) {
        if (!simpan.suara) return;
        try {
            ac = ac || new (window.AudioContext || window.webkitAudioContext)();
            if (ac.state === 'suspended') ac.resume();
            let t = ac.currentTime;
            nada.forEach((n) => {
                const o = ac.createOscillator(), g = ac.createGain();
                o.type = 'triangle'; o.frequency.value = n[0];
                g.gain.setValueAtTime(0.15, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + n[1]);
                o.connect(g); g.connect(ac.destination);
                o.start(t); o.stop(t + n[1]);
                t += n[1] * 0.9;
            });
        } catch (_) { /* suara tidak tersedia */ }
    }

    // Toast (pesan singkat)
    let tToast = null;
    function toast(pesan, ms) {
        const el = $('toast');
        el.textContent = pesan;
        el.classList.add('tampil');
        clearTimeout(tToast);
        tToast = setTimeout(() => el.classList.remove('tampil'), ms || 3200);
    }

    // Misi
    const MISI = [
        { id: 'm1', teks: 'Selesaikan 1 gedung', nilai: () => selesai.size, target: 1, hadiah: 10 },
        { id: 'm2', teks: 'Selesaikan 3 gedung', nilai: () => selesai.size, target: 3, hadiah: 25 },
        { id: 'm3', teks: 'Selesaikan 12 gedung (tingkat apa pun)', nilai: () => selesai.size, target: 12, hadiah: 50 },
        { id: 'm4', teks: 'Kumpulkan 60 koin di peta', nilai: () => simpan.koinPeta, target: 60, hadiah: 25 },
        { id: 'm5', teks: 'Raih skor 100', nilai: () => skor, target: 100, hadiah: 30 }
    ];
    function periksaMisi() {
        MISI.forEach((m) => {
            if (simpan.misiSelesai.indexOf(m.id) < 0 && m.nilai() >= m.target) {
                simpan.misiSelesai.push(m.id);
                simpan.koin += m.hadiah;
                toast('🏆 Misi selesai: ' + m.teks + ' (+' + m.hadiah + ' 🪙)');
                bunyi([[523, 0.1], [784, 0.1], [1047, 0.2]]);
            }
        });
    }

    // Warna baju karakter (dibuka dengan koin)
    const WARNA = [
        { n: 'Biru', h: 0x2563eb, harga: 0 }, { n: 'Merah', h: 0xdc2626, harga: 15 },
        { n: 'Hijau', h: 0x16a34a, harga: 15 }, { n: 'Ungu', h: 0x7c3aed, harga: 25 },
        { n: 'Oranye', h: 0xea580c, harga: 25 }, { n: 'Pink', h: 0xdb2777, harga: 40 }
    ];
    if (!WARNA[simpan.warna]) simpan.warna = 0;
    bahanBaju.color.setHex(WARNA[simpan.warna].h);
    $('hud-kontrol').innerHTML = isTouch
        ? '🎮 joystik = jalan · geser layar = putar kamera'
        : '🎮 <b>W A S D</b> / <b>Panah</b> jalan · <b>E</b> masuk gedung · <b>geser mouse</b> atau <b>Q / R</b> putar kamera';

    function updateHud() {
        periksaMisi();
        $('hud-koin').textContent = '🪙 ' + simpan.koin;
        $('hud-skor').textContent = '⭐ ' + skor;
        $('hud-gedung').textContent = '🏫 ' + jumlahSelesai() + '/' + daftarGedung.length;
        $('btn-level').textContent = '🎚️ Tingkat: ' + (TINGKAT[simpan.level] ? TINGKAT[simpan.level].pendek : '-');
        $('btn-suara').textContent = simpan.suara ? '🔊 Suara: hidup' : '🔇 Suara: mati';
        simpan.skor = skor; simpan.selesai = Array.from(selesai); tulis();
    }
    updateHud();

    // ---------- 7. KUIS ----------
    let isKuisOpen = false;
    const modal = $('modal-kuis');
    const Kuis = { g: null, daftar: [], i: 0, percobaan: 0, terjawab: false, benarPertama: 0, poin: 0, beriPoin: true };

    function acak(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    function siapkanSoal(s) {
        return {
            pertanyaan: s.pertanyaan,
            pembahasan: s.pembahasan,
            opsi: acak(s.opsi.map((teks, i) => ({ teks: teks, benar: i === s.jawaban })))
        };
    }

    function bukaKuis(gedung) {
        if (!gedung.soal || !gedung.soal.length) return;
        isKuisOpen = true;
        resetInput();
        Kuis.g = gedung;
        Kuis.beriPoin = !selesai.has(kunciSelesai(gedung.id));
        let pool = gedung.soal.filter((s) => s.t === simpan.level);
        if (!pool.length) pool = gedung.soal;
        Kuis.daftar = acak(pool).slice(0, 5).map(siapkanSoal);
        Kuis.i = 0; Kuis.benarPertama = 0; Kuis.poin = 0;
        $('kuis-judul').textContent = gedung.ikon + ' ' + gedung.nama + ' · ' + TINGKAT[simpan.level].pendek;
        $('kuis-hasil').classList.add('modal-hidden');
        $('kuis-soal').classList.remove('modal-hidden');
        modal.classList.remove('modal-hidden');
        tampilSoal();
    }

    function tutupKuis() {
        isKuisOpen = false;
        modal.classList.add('modal-hidden');
    }

    function tampilSoal() {
        const s = Kuis.daftar[Kuis.i];
        const total = Kuis.daftar.length;
        Kuis.percobaan = 0;
        Kuis.terjawab = false;

        $('kuis-progres-teks').textContent = 'Soal ' + (Kuis.i + 1) + ' dari ' + total;
        $('kuis-skor-gedung').textContent = Kuis.beriPoin ? '+' + Kuis.poin + ' poin' : 'Latihan ulang (tanpa poin)';
        $('kuis-progres-bar').style.width = (Kuis.i / total * 100) + '%';
        $('kuis-pertanyaan').textContent = (Kuis.i + 1) + '. ' + s.pertanyaan;

        const box = $('kuis-opsi');
        box.innerHTML = '';
        s.opsi.forEach((o, idx) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn-opsi';
            const huruf = document.createElement('span');
            huruf.className = 'huruf';
            huruf.textContent = 'ABCD'.charAt(idx);
            const teks = document.createElement('span');
            teks.textContent = o.teks;
            b.appendChild(huruf);
            b.appendChild(teks);
            b.addEventListener('click', () => jawab(b, o, s));
            box.appendChild(b);
        });

        const fb = $('kuis-feedback');
        fb.className = 'feedback-box';
        fb.textContent = '';
        $('btn-lanjut').classList.add('modal-hidden');
    }

    function jawab(tombol, opsi, soal) {
        if (Kuis.terjawab || tombol.disabled) return;
        const fb = $('kuis-feedback');

        if (opsi.benar) {
            Kuis.terjawab = true;
            tombol.classList.add('benar');
            bunyi([[660, 0.1], [880, 0.15]]);
            Array.prototype.forEach.call($('kuis-opsi').children, (b) => { b.disabled = true; });

            const poin = Kuis.percobaan === 0 ? 10 : 5;
            if (Kuis.percobaan === 0) Kuis.benarPertama++;
            if (Kuis.beriPoin) { skor += poin; Kuis.poin += poin; simpan.koin += poin / 5; updateHud(); }
            $('kuis-skor-gedung').textContent = Kuis.beriPoin ? '+' + Kuis.poin + ' poin' : 'Latihan ulang (tanpa poin)';
            $('kuis-progres-bar').style.width = ((Kuis.i + 1) / Kuis.daftar.length * 100) + '%';

            fb.className = 'feedback-box tampil benar';
            fb.textContent = '🎉 Benar! ' + (soal.pembahasan || '');
            const lanjut = $('btn-lanjut');
            lanjut.textContent = (Kuis.i + 1 < Kuis.daftar.length) ? 'Soal berikutnya ➜' : 'Lihat hasil 🏁';
            lanjut.classList.remove('modal-hidden');
            lanjut.focus();
        } else {
            Kuis.percobaan++;
            tombol.classList.add('salah');
            tombol.disabled = true;
            bunyi([[240, 0.22]]);
            fb.className = 'feedback-box tampil salah';
            fb.textContent = '❌ Kurang tepat. Coba lagi ya!';
        }
    }

    function tampilHasil() {
        const total = Kuis.daftar.length;
        const rasio = Kuis.benarPertama / total;
        const bintang = rasio >= 0.9 ? 3 : rasio >= 0.6 ? 2 : 1;
        selesai.add(kunciSelesai(Kuis.g.id));
        updateHud();
        bunyi([[523, 0.12], [659, 0.12], [784, 0.25]]);

        $('hasil-bintang').textContent = '⭐'.repeat(bintang) + '☆'.repeat(3 - bintang);
        $('hasil-judul').textContent = bintang === 3 ? 'Luar biasa! 🎊' : bintang === 2 ? 'Bagus sekali! 👏' : 'Terus berlatih! 💪';
        let teks = 'Benar pada percobaan pertama: ' + Kuis.benarPertama + ' dari ' + total + '.';
        teks += Kuis.beriPoin ? ' Poin didapat: +' + Kuis.poin + '.' : ' (Latihan ulang, tidak menambah poin.)';
        if (jumlahSelesai() === daftarGedung.length) teks += ' 🏆 Semua gedung sudah kamu selesaikan!';
        $('hasil-teks').textContent = teks;

        $('kuis-soal').classList.add('modal-hidden');
        $('kuis-hasil').classList.remove('modal-hidden');
    }

    $('btn-tutup').addEventListener('click', tutupKuis);
    $('btn-selesai').addEventListener('click', tutupKuis);
    $('btn-ulang').addEventListener('click', () => bukaKuis(Kuis.g));
    $('btn-lanjut').addEventListener('click', () => {
        Kuis.i++;
        if (Kuis.i < Kuis.daftar.length) tampilSoal(); else tampilHasil();
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) tutupKuis(); });

    // ---------- 7b. PILIH TINGKAT & SUARA ----------
    const modalLevel = $('modal-level');
    function levelTampil() { return !modalLevel.classList.contains('modal-hidden'); }
    function tutupLevel() { isKuisOpen = false; modalLevel.classList.add('modal-hidden'); }
    function bukaLevel() {
        isKuisOpen = true;
        resetInput();
        modal.classList.add('modal-hidden');
        const box = $('level-opsi');
        box.innerHTML = '';
        [1, 2, 3].forEach((n) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn-opsi';
            const h = document.createElement('span'); h.className = 'huruf'; h.textContent = TINGKAT[n].ikon;
            const t = document.createElement('span'); t.textContent = TINGKAT[n].nama + (simpan.level === n ? '  ✓' : '');
            b.appendChild(h); b.appendChild(t);
            b.addEventListener('click', () => { simpan.level = n; updateHud(); tutupLevel(); });
            box.appendChild(b);
        });
        modalLevel.classList.remove('modal-hidden');
    }
    $('btn-level').addEventListener('click', bukaLevel);
    $('btn-suara').addEventListener('click', () => { simpan.suara = !simpan.suara; updateHud(); bunyi([[660, 0.1]]); });
    modalLevel.addEventListener('click', (e) => { if (e.target === modalLevel && simpan.level) tutupLevel(); });

    // ---------- 7c. PANEL MISI & KARAKTER ----------
    const modalPanel = $('modal-panel');
    function panelTampil() { return !modalPanel.classList.contains('modal-hidden'); }
    function tutupPanel() { isKuisOpen = false; modalPanel.classList.add('modal-hidden'); }
    function bukaPanel(judul, isi) {
        isKuisOpen = true;
        resetInput();
        $('panel-judul').textContent = judul;
        const box = $('panel-isi');
        box.innerHTML = '';
        isi(box);
        modalPanel.classList.remove('modal-hidden');
    }
    function panelMisi() {
        bukaPanel('📋 Misi', (box) => {
            MISI.forEach((m) => {
                const selesaiM = simpan.misiSelesai.indexOf(m.id) >= 0;
                const nilai = Math.min(m.nilai(), m.target);
                const item = document.createElement('div');
                item.className = 'misi-item' + (selesaiM ? ' selesai' : '');
                const baris = document.createElement('div');
                baris.className = 'baris';
                const a = document.createElement('span'); a.textContent = (selesaiM ? '✅ ' : '') + m.teks;
                const b = document.createElement('span'); b.textContent = '+' + m.hadiah + ' 🪙';
                baris.appendChild(a); baris.appendChild(b);
                const bar = document.createElement('div'); bar.className = 'bar';
                const isiBar = document.createElement('i'); isiBar.style.width = (nilai / m.target * 100) + '%';
                bar.appendChild(isiBar);
                item.appendChild(baris); item.appendChild(bar);
                box.appendChild(item);
            });
        });
    }
    function panelKarakter() {
        bukaPanel('👕 Pilih warna baju', (box) => {
            WARNA.forEach((w, i) => {
                const punya = simpan.punya.indexOf(i) >= 0;
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'btn-opsi';
                const kotak = document.createElement('span'); kotak.className = 'warna-kotak'; kotak.style.background = '#' + w.h.toString(16).padStart(6, '0');
                const teks = document.createElement('span');
                teks.textContent = w.n + ' — ' + (simpan.warna === i ? '✓ dipakai' : punya ? 'Pakai' : '🪙 ' + w.harga + ' · Beli');
                b.appendChild(kotak); b.appendChild(teks);
                b.addEventListener('click', () => {
                    if (!punya) {
                        if (simpan.koin < w.harga) { toast('Koin belum cukup 🪙'); return; }
                        simpan.koin -= w.harga;
                        simpan.punya.push(i);
                    }
                    simpan.warna = i;
                    bahanBaju.color.setHex(w.h);
                    updateHud();
                    panelKarakter();
                });
                box.appendChild(b);
            });
        });
    }
    $('btn-misi').addEventListener('click', panelMisi);
    $('btn-karakter').addEventListener('click', panelKarakter);
    $('panel-tutup').addEventListener('click', tutupPanel);
    modalPanel.addEventListener('click', (e) => { if (e.target === modalPanel) tutupPanel(); });

    // ---------- 7c2. MENU, PENGATURAN & RESET ----------
    const menuTombol = $('menu-tombol');
    $('btn-menu').addEventListener('click', () => { if (menuTombol.classList.contains('buka')) menuTombol.classList.remove('buka'); else menuTombol.classList.add('buka'); });
    menuTombol.addEventListener('click', () => menuTombol.classList.remove('buka'));
    $('btn-kamera').addEventListener('click', () => { kameraYaw = putar + Math.PI; kameraPitch = 0.6; kameraJarak = 15.8; });
    $('btn-titik').addEventListener('click', () => { player.position.set(0, 0, 9); vx = 0; vz = 0; });

    function muatTerbaru() {
        const pergi = () => location.replace(location.pathname + '?v=' + Date.now());
        try {
            const tugas = [];
            if (window.caches && window.caches.keys) tugas.push(window.caches.keys().then((k) => Promise.all(k.map((x) => window.caches.delete(x)))));
            if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) tugas.push(navigator.serviceWorker.getRegistrations().then((r) => r.forEach((x) => x.unregister())));
            Promise.all(tugas).then(pergi, pergi);
        } catch (_) { pergi(); }
    }
    function resetProgres() {
        try { localStorage.removeItem(KUNCI); } catch (_) { /* abaikan */ }
        location.replace(location.pathname + '?v=' + Date.now());
    }
    function panelSistem() {
        bukaPanel('⚙️ Pengaturan & reset', (box) => {
            const info = (teks) => { const p = document.createElement('p'); p.className = 'level-info'; p.textContent = teks; box.appendChild(p); };
            const tombol = (teks, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn-opsi'; b.textContent = teks; b.addEventListener('click', fn); box.appendChild(b); return b; };
            info('Versi game: ' + VERSI + '. Progres (skor, koin, misi, tingkat, warna baju) tersimpan OTOMATIS di browser ini, jadi tidak perlu menekan tombol simpan. Cukup tutup halamannya, lanjutkan kapan saja.');
            tombol('▶️ Lanjutkan bermain', tutupPanel);
            tombol('📍 Kembali ke taman (titik awal)', () => { player.position.set(0, 0, 9); vx = 0; vz = 0; tutupPanel(); });
            tombol('🔄 Muat ulang versi terbaru (jika tampilan masih lama)', muatTerbaru);
            const hapus = tombol('🗑️ Hapus progres & mulai dari awal', () => {
                if (!hapus.dataset.yakin) { hapus.dataset.yakin = '1'; hapus.textContent = '⚠️ Yakin? Ketuk sekali lagi untuk menghapus semua progres'; return; }
                resetProgres();
            });
        });
    }
    $('btn-sistem').addEventListener('click', panelSistem);
    function panelTentang() {
        bukaPanel('ℹ️ Tentang', (box) => {
            const info = (t, tebal) => { const p = document.createElement('p'); p.className = 'level-info'; p.textContent = t; if (tebal) p.style.fontWeight = '700'; box.appendChild(p); };
            info(KOTA.ikon + ' ' + KOTA.nama, true);
            info('Game Edukasi 3D — belajar sambil menjelajah kota. 12 gedung = 12 mata pelajaran SD–SMA.');
            info('Dikembangkan oleh ' + KOTA.pengembang + ' · © ' + KOTA.tahun);
            info('Versi ' + VERSI);
        });
    }
    $('btn-tentang').addEventListener('click', panelTentang);

    // ---------- 7d. UNGGAH SOAL (Excel / CSV) ----------
    const KUNCI_SOAL = 'ge3d-soal-v1';
    let soalUnggahan = [];
    try { soalUnggahan = JSON.parse(localStorage.getItem(KUNCI_SOAL) || '[]'); } catch (_) { soalUnggahan = []; }
    const norm = (v) => String(v == null ? '' : v).toLowerCase().replace(/[^a-z0-9]/g, '');
    const sudahAda = (g, s) => g.data.soal.some((x) => x.pertanyaan === s.pertanyaan);
    soalUnggahan = soalUnggahan.filter((u) => {
        const g = u && daftarGedung.find((x) => x.data.id === u.gid);
        if (!g || masalahSoal(u.s) || sudahAda(g, u.s)) return false;
        g.data.soal.push(u.s);
        return true;
    });
    function simpanUnggahan() { try { localStorage.setItem(KUNCI_SOAL, JSON.stringify(soalUnggahan)); } catch (_) { /* abaikan */ } }

    function temukanGedung(teks) {
        const n = norm(teks);
        if (!n) return null;
        return daftarGedung.find((g) => g.data.id === n)
            || daftarGedung.find((g) => norm(g.data.nama) === n)
            || (n.length >= 4 ? daftarGedung.find((g) => norm(g.data.nama).indexOf(n) >= 0) : null) || null;
    }
    function parseTingkat(v) {
        const n = norm(v);
        if (['1', 'anak', 'sd', 'paud', 'mudah'].indexOf(n) >= 0) return 1;
        if (['2', 'pelajar', 'smp', 'sma', 'sedang'].indexOf(n) >= 0) return 2;
        if (['3', 'umum', 'dewasa', 'sulit'].indexOf(n) >= 0) return 3;
        return 0;
    }
    function parseJawaban(v) {
        const n = norm(v);
        if (/^[a-d]$/.test(n)) return n.charCodeAt(0) - 97;
        if (/^[1-4]$/.test(n)) return Number(n) - 1;
        return -1;
    }
    function parseCSV(teks) {
        teks = teks.replace(/^\uFEFF/, '');
        const baris1 = teks.split(/\r?\n/)[0] || '';
        const pemisah = baris1.split(';').length > baris1.split(',').length ? ';' : ',';   // Excel Indonesia memakai ;
        const rows = [];
        let row = [], sel = '', kutip = false;
        for (let i = 0; i < teks.length; i++) {
            const c = teks[i];
            if (kutip) {
                if (c === '"') { if (teks[i + 1] === '"') { sel += '"'; i++; } else kutip = false; } else sel += c;
            } else if (c === '"') kutip = true;
            else if (c === pemisah) { row.push(sel); sel = ''; }
            else if (c === '\n' || c === '\r') { if (c === '\r' && teks[i + 1] === '\n') i++; row.push(sel); rows.push(row); row = []; sel = ''; }
            else sel += c;
        }
        if (sel !== '' || row.length) { row.push(sel); rows.push(row); }
        return rows;
    }
    function impor(rows) {
        const hasil = { ok: 0, dobel: 0, galat: [] };
        const idxH = rows.findIndex((r) => r.some((c) => norm(c) === 'pertanyaan'));
        if (idxH < 0) { hasil.galat.push('Judul kolom tidak ditemukan. Pakai template (kolom "Pertanyaan" wajib ada).'); return hasil; }
        const h = rows[idxH].map(norm);
        const kol = (nama) => h.findIndex((x) => nama.indexOf(x) >= 0);
        const K = { mapel: kol(['mapel', 'matapelajaran', 'gedung']), t: kol(['tingkat', 'level']), q: kol(['pertanyaan', 'soal']),
            o: [kol(['a', 'opsia']), kol(['b', 'opsib']), kol(['c', 'opsic']), kol(['d', 'opsid'])],
            j: kol(['jawaban', 'kunci', 'jawabanbenar']), p: kol(['pembahasan', 'penjelasan']) };
        if (K.mapel < 0 || K.t < 0 || K.j < 0 || K.o[0] < 0 || K.o[1] < 0) {
            hasil.galat.push('Kolom wajib: Mapel, Tingkat, Pertanyaan, A, B, Jawaban. Pakai template yang disediakan.');
            return hasil;
        }
        const sel = (r, i) => (i >= 0 && r[i] != null ? String(r[i]).trim() : '');
        for (let n = idxH + 1; n < rows.length; n++) {
            const r = rows[n];
            if (!r.some((c) => String(c == null ? '' : c).trim())) continue;
            const no = 'Baris ' + (n + 1) + ': ';
            const g = temukanGedung(sel(r, K.mapel));
            if (!g) { hasil.galat.push(no + 'mapel "' + sel(r, K.mapel) + '" tidak dikenal'); continue; }
            const opsi = [];
            for (let i = 0; i < 4; i++) { const t = sel(r, K.o[i]); if (!t) break; opsi.push(t); }
            const s = { t: parseTingkat(sel(r, K.t)), pertanyaan: sel(r, K.q), opsi: opsi, jawaban: parseJawaban(sel(r, K.j)), pembahasan: sel(r, K.p) };
            let m = masalahSoal(s);
            if (m.indexOf('nomor jawaban') === 0) m = 'huruf Jawaban kosong/salah atau tidak sesuai opsi yang terisi';
            if (m) { hasil.galat.push(no + m); continue; }
            if (sudahAda(g, s)) { hasil.dobel++; continue; }
            g.data.soal.push(s);
            soalUnggahan.push({ gid: g.data.id, s: s });
            hasil.ok++;
        }
        simpanUnggahan();
        return hasil;
    }
    function bacaFile(file) {
        const excel = /\.(xlsx|xls)$/i.test(file.name || '');
        const baca = new FileReader();
        baca.onerror = () => toast('File tidak bisa dibaca');
        baca.onload = () => {
            let rows;
            try {
                if (excel) {
                    if (typeof XLSX === 'undefined') { toast('Pembaca Excel belum termuat (perlu internet). Simpan file sebagai CSV lalu unggah.'); return; }
                    const wb = XLSX.read(baca.result, { type: 'array' });
                    rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
                } else rows = parseCSV(String(baca.result));
            } catch (e) { toast('File tidak sesuai format. Pakai template yang disediakan.'); return; }
            panelUnggah(impor(rows));
        };
        if (excel) baca.readAsArrayBuffer(file); else baca.readAsText(file);
    }
    function unduhTemplate() {
        const contoh = [['Mapel', 'Tingkat', 'Pertanyaan', 'A', 'B', 'C', 'D', 'Jawaban', 'Pembahasan'],
            ['Matematika', 1, '2 + 3 = ?', '4', '5', '6', '7', 'B', '2 ditambah 3 sama dengan 5.'],
            ['IPA', 2, 'Planet yang paling dekat dengan Matahari adalah …', 'Merkurius', 'Venus', 'Bumi', 'Mars', 'A', 'Merkurius planet pertama.'],
            ['Bahasa Inggris', 3, 'She ___ been working here.', 'have', 'has', '', '', 'B', 'She memakai has.']];
        if (typeof XLSX !== 'undefined') {
            const petunjuk = [['PETUNJUK'], ['1. Isi sheet "Soal": satu soal per baris. Jangan ubah judul kolom.'],
                ['2. Mapel (pilih salah satu): ' + daftarGedung.map((g) => g.data.nama).join(' | ')],
                ['3. Tingkat: 1 = Anak (PAUD-SD), 2 = Pelajar (SMP-SMA), 3 = Umum/Dewasa'],
                ['4. Jawaban: huruf A, B, C, atau D. Kolom C dan D boleh kosong jika hanya 2 pilihan.'],
                ['5. Simpan, lalu unggah file ini lewat menu "Soal" di game.']];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(contoh), 'Soal');
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(petunjuk), 'Petunjuk');
            XLSX.writeFile(wb, 'template-soal.xlsx');
        } else {
            const csv = '\uFEFF' + contoh.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
            const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
            const a = document.createElement('a');
            a.href = url; a.download = 'template-soal.csv';
            document.body.appendChild(a); a.click();
            if (a.remove) a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 2000);
        }
    }
    function hapusUnggahan() {
        soalUnggahan.forEach((u) => {
            const g = daftarGedung.find((x) => x.data.id === u.gid);
            const i = g ? g.data.soal.indexOf(u.s) : -1;
            if (i >= 0) g.data.soal.splice(i, 1);
        });
        soalUnggahan = [];
        simpanUnggahan();
        toast('Soal unggahan dihapus');
        panelUnggah();
    }
    function panelUnggah(hasil) {
        bukaPanel('📥 Unggah soal (Excel / CSV)', (box) => {
            const info = (teks) => { const p = document.createElement('p'); p.className = 'level-info'; p.textContent = teks; box.appendChild(p); };
            const tombol = (teks, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn-opsi'; b.textContent = teks; b.addEventListener('click', fn); return b; };
            if (hasil) {
                info('✅ ' + hasil.ok + ' soal ditambahkan' + (hasil.dobel ? ', ' + hasil.dobel + ' dilewati (sudah ada)' : '') + (hasil.galat.length ? ', ' + hasil.galat.length + ' baris bermasalah:' : '.'));
                hasil.galat.slice(0, 6).forEach((e) => info('• ' + e));
                if (hasil.galat.length > 6) info('… dan ' + (hasil.galat.length - 6) + ' lainnya.');
            }
            info('Cara: 1) Unduh template  2) Isi soal di Excel, satu soal per baris  3) Pilih file di bawah. Soal langsung masuk ke gedung yang sesuai dan tersimpan di browser ini.');
            box.appendChild(tombol('⬇️ Unduh template Excel', unduhTemplate));
            const label = document.createElement('label');
            label.className = 'btn-opsi';
            label.textContent = '⬆️ Pilih file Excel (.xlsx) atau CSV';
            const input = document.createElement('input');
            input.type = 'file'; input.accept = '.xlsx,.xls,.csv'; input.style.display = 'none';
            input.addEventListener('change', () => { if (input.files && input.files[0]) bacaFile(input.files[0]); });
            label.appendChild(input);
            box.appendChild(label);
            info('Soal unggahan tersimpan di browser ini: ' + soalUnggahan.length);
            if (soalUnggahan.length) box.appendChild(tombol('🗑️ Hapus semua soal unggahan', hapusUnggahan));
        });
    }
    $('btn-unggah').addEventListener('click', () => panelUnggah());

    // ---------- 8. INTERAKSI DENGAN GEDUNG ----------
    const promptUI = $('prompt-interaksi');
    let dekat = null;

    function interaksi() {
        if (dekat && !isKuisOpen) bukaKuis(dekat.data);
    }
    promptUI.addEventListener('click', interaksi);

    function setDekat(g) {
        if (g === dekat) return;
        if (dekat) dekat.bahanBadan.emissive.setHex(0x000000);
        dekat = g;
        if (g) {
            g.bahanBadan.emissive.copy(g.warna).multiplyScalar(0.25);
            const sapa = selesai.has(kunciSelesai(g.data.id))
                ? 'Hebat, gedung ini sudah kamu selesaikan! Mau latihan lagi?'
                : 'Halo! Jawab benar di percobaan pertama untuk poin penuh.';
            promptUI.innerHTML = '';
            const baris1 = document.createElement('div');
            baris1.textContent = '🔔 ' + (isTouch ? 'Ketuk di sini' : 'Tekan E') + ' untuk masuk Gedung ' + g.data.nama;
            const baris2 = document.createElement('small');
            baris2.textContent = '🧑‍🏫 “' + sapa + '”';
            promptUI.appendChild(baris1);
            promptUI.appendChild(baris2);
            promptUI.classList.remove('prompt-hidden');
        } else {
            promptUI.classList.add('prompt-hidden');
        }
    }

    // ---------- 9. LOOP UTAMA ----------
    const KECEPATAN = 8;       // unit per detik (kecepatan maksimum)
    const RADIUS = 0.6;
    const JARAK_MASUK = 7.0;
    const PERCEPATAN = 9;      // makin besar = makin responsif
    const PERLAMBATAN = 11;    // makin besar = berhenti makin cepat
    let vx = 0, vz = 0;        // kecepatan saat ini (dihaluskan)
    let putar = 0, jalanT = 0, napasT = 0;
    let kameraSiap = false;
    let kameraYaw = 0, kameraPitch = 0.6, kameraJarak = 15.8;    // kamera mengorbit karakter (360°)

    function update(dt) {
        let mx = 0, mz = 0, skala = 1;
        if (!isKuisOpen) {
            if (keys.w || keys.arrowup) mz -= 1;
            if (keys.s || keys.arrowdown) mz += 1;
            if (keys.a || keys.arrowleft) mx -= 1;
            if (keys.d || keys.arrowright) mx += 1;
            if (joy.aktif) { mx = joy.x; mz = joy.z; skala = Math.min(1, Math.hypot(mx, mz)); }
        }
        const ingin = (mx !== 0 || mz !== 0);
        if (ingin) {
            const len = Math.hypot(mx, mz); mx /= len; mz /= len;
            const cs = Math.cos(kameraYaw), sn = Math.sin(kameraYaw);          // arah gerak mengikuti arah pandang kamera
            const wx = mx * cs + mz * sn, wz = -mx * sn + mz * cs;
            mx = wx; mz = wz;
        }

        // Percepatan / perlambatan halus menuju kecepatan target
        const f = 1 - Math.exp(-(ingin ? PERCEPATAN : PERLAMBATAN) * dt);
        vx += (mx * KECEPATAN * skala - vx) * f;
        vz += (mz * KECEPATAN * skala - vz) * f;
        if (!ingin && Math.hypot(vx, vz) < 0.05) { vx = 0; vz = 0; }
        const laju = Math.hypot(vx, vz);
        const rasio = Math.min(1, laju / KECEPATAN);

        if (laju > 0) {
            let px = player.position.x + vx * dt;
            let pz = player.position.z + vz * dt;
            px = Math.max(-BATAS, Math.min(BATAS, px));
            pz = Math.max(-BATAS, Math.min(BATAS, pz));

            // Tabrakan dengan gedung & air mancur (lingkaran) — menyusur, tidak menempel
            penghalang.forEach((o) => {
                const dx = px - o.x, dz = pz - o.z, d = Math.hypot(dx, dz), batas = o.r + RADIUS;
                if (d < batas && d > 0.001) { px = o.x + dx / d * batas; pz = o.z + dz / d * batas; }
            });
            player.position.x = px;
            player.position.z = pz;

            // Badan berputar halus ke arah gerak
            if (laju > 0.3) {
                const target = Math.atan2(vx, vz);
                let selisih = target - putar;
                while (selisih > Math.PI) selisih -= Math.PI * 2;
                while (selisih < -Math.PI) selisih += Math.PI * 2;
                putar += selisih * Math.min(1, dt * 10);
                player.rotation.y = putar;
            }
        }

        // Animasi berjalan: ayunan kaki & tangan mengikuti kecepatan
        jalanT += dt * (4 + laju * 1.1);
        napasT += dt * 2;
        const ayun = Math.sin(jalanT) * 0.75 * rasio;
        kakiKiri.rotation.x = ayun;
        kakiKanan.rotation.x = -ayun;
        lenganKiri.rotation.x = -ayun * 0.9;
        lenganKanan.rotation.x = ayun * 0.9;
        lenganKiri.rotation.z = 0.06 + Math.sin(napasT) * 0.02 * (1 - rasio);
        lenganKanan.rotation.z = -0.06 - Math.sin(napasT) * 0.02 * (1 - rasio);
        badanAtas.rotation.x += (0.12 * rasio - badanAtas.rotation.x) * Math.min(1, dt * 8); // condong ke depan
        badanAtas.rotation.y = Math.sin(jalanT) * 0.12 * rasio;                                // sedikit memutar badan
        kepala.rotation.x = -badanAtas.rotation.x * 0.8;                                       // pandangan tetap lurus
        player.position.y = Math.abs(Math.sin(jalanT)) * 0.09 * rasio;                         // langkah naik-turun
        badanAtas.scale.y = 1 + Math.sin(napasT) * 0.012 * (1 - rasio);                        // bernapas saat diam

        // Kamera orbit 360° mengelilingi karakter
        if (keys.q) kameraYaw += 1.8 * dt;
        if (keys.r) kameraYaw -= 1.8 * dt;
        let tx = 0, ty = 0, tz = 0;
        for (let f = 1; f >= 0.3; f -= 0.1) {                                   // dekatkan kamera jika terhalang gedung
            const j = kameraJarak * f;
            tx = player.position.x + Math.sin(kameraYaw) * Math.cos(kameraPitch) * j;
            ty = 1.2 + Math.sin(kameraPitch) * j;
            tz = player.position.z + Math.cos(kameraYaw) * Math.cos(kameraPitch) * j;
            if (!penghalang.some((o, k) => k > 0 && Math.hypot(tx - o.x, tz - o.z) < o.r + 0.6 && ty < 9.5)) break;
        }
        if (!kameraSiap) {
            camera.position.set(tx, ty, tz);
            kameraSiap = true;
        } else {
            const f2 = 1 - Math.exp(-9 * dt);
            camera.position.x += (tx - camera.position.x) * f2;
            camera.position.y += (ty - camera.position.y) * f2;
            camera.position.z += (tz - camera.position.z) * f2;
        }
        camera.lookAt(player.position.x - Math.sin(kameraYaw) * 2, 1.2, player.position.z - Math.cos(kameraYaw) * 2);

        animasiDunia(dt);
        if (window.GE3D) window.GE3D.onUpdate.forEach((f) => f(dt));

        // Koin: berputar, melayang, dan diambil saat disentuh
        koinList.forEach((c) => {
            if (c.userData.ambil) return;
            c.rotation.y += dt * 3;
            c.position.y = 1.1 + Math.sin(napasT * 1.5 + c.userData.f) * 0.15;
            if (Math.hypot(player.position.x - c.position.x, player.position.z - c.position.z) < 1.5) {
                c.userData.ambil = true;
                c.visible = false;
                simpan.koin++; simpan.koinPeta++;
                bunyi([[880, 0.07], [1175, 0.12]]);
                updateHud();
            }
        });
        // NPC menoleh ke pemain
        npcList.forEach((n) => { n.rotation.y = Math.atan2(player.position.x - n.position.x, player.position.z - n.position.z); });

        // Gedung terdekat
        let terdekat = null, jarakMin = JARAK_MASUK;
        daftarGedung.forEach((g) => {
            const d = Math.hypot(player.position.x - g.x, player.position.z - g.z);
            if (d < jarakMin) { jarakMin = d; terdekat = g; }
        });
        setDekat(terdekat);

        // Awan melayang
        awan.forEach((a) => {
            a.position.x += a.userData.v * dt;
            if (a.position.x > 90) a.position.x = -90;
        });
    }

    const jam = new THREE.Clock();
    function loop() {
        requestAnimationFrame(loop);
        update(Math.min(jam.getDelta(), 0.05));
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight, false);
    });

    // kait untuk Edisi Kelas (multipemain); tidak berpengaruh pada edisi GitHub
    window.GE3D = { THREE: THREE, scene: scene, player: player, buatManusia: buatManusia, hexBaju: () => bahanBaju.color.getHex(), simpan: simpan, toast: toast, bukaPanel: bukaPanel, menu: menuTombol, onUpdate: [], onSimpan: null };
    updateHud();
    if (soalDilewati) toast('⚠️ ' + soalDilewati + ' soal dilewati karena salah format (lihat Console)');
    if (!simpan.kamera) { toast(isTouch ? '👆 Geser layar untuk memutar kamera 360°' : '🖱️ Tahan & geser mouse (atau tombol Q / R) untuk memutar kamera'); simpan.kamera = true; tulis(); }
    if (!simpan.level) bukaLevel();
    loop();
})();
