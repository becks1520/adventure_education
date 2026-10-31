(function () {
    'use strict';

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
    let soalDilewati = 0;
    DATA_SOAL.gedung.forEach((g) => {
        g.soal = (g.soal || []).filter((s, i) => {
            let masalah = '';
            if (!s || typeof s.pertanyaan !== 'string' || !s.pertanyaan.trim()) masalah = 'pertanyaan kosong';
            else if (!Array.isArray(s.opsi) || s.opsi.length < 2 || s.opsi.length > 4) masalah = 'opsi harus 2-4 pilihan';
            else if (new Set(s.opsi.map(String)).size !== s.opsi.length) masalah = 'ada opsi yang sama';
            else if (!Number.isInteger(s.jawaban) || s.jawaban < 0 || s.jawaban >= s.opsi.length) masalah = 'nomor jawaban di luar opsi (mulai dari 0)';
            else if ([1, 2, 3].indexOf(s.t) < 0) masalah = 'tingkat harus 1, 2, atau 3';
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
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 150;
    scene.add(sun);

    // ---------- 3. LINGKUNGAN ----------
    const BATAS = 46;           // batas area bermain (±)
    const SETENGAH_GEDUNG = 3;  // gedung berukuran 6 × 6

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({ color: 0x3fb56b })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Jalan setapak (bentuk "T")
    const bahanJalan = new THREE.MeshStandardMaterial({ color: 0xe0d2a8 });
    function buatJalan(lebar, panjang, x, z) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(lebar, panjang), bahanJalan);
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, 0.02, z);
        m.receiveShadow = true;
        scene.add(m);
    }
    buatJalan(3, 26, 0, -6);    // utara-selatan: dari titik awal ke Gedung Matematika
    buatJalan(48, 3, 0, -8);    // timur-barat: ke Gedung IPA & Bahasa
    buatJalan(3, 18, 10, -17);  // penghubung ke baris gedung belakang
    buatJalan(3, 18, -10, -17);
    buatJalan(52, 3, 0, -26);   // depan Gedung Inggris & IPS
    buatJalan(3, 8, 0, -30);    // ke Gedung Pengetahuan Umum

    // Gedung
    function buatPapanNama(teks, ikon) {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 128;
        const g = c.getContext('2d');
        g.fillStyle = 'rgba(255,255,255,0.95)';
        g.fillRect(0, 0, 512, 128);
        g.strokeStyle = '#1e293b';
        g.lineWidth = 8;
        g.strokeRect(4, 4, 504, 120);
        g.fillStyle = '#1e293b';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.font = 'bold 42px "Segoe UI", Arial, sans-serif';
        g.fillText(ikon + ' ' + teks, 256, 68, 480);
        const tex = new THREE.CanvasTexture(c);
        return new THREE.Mesh(
            new THREE.PlaneGeometry(5.2, 1.3),
            new THREE.MeshBasicMaterial({ map: tex })
        );
    }

    const daftarGedung = DATA_SOAL.gedung.map((data) => {
        const warna = new THREE.Color(data.warna);
        const grup = new THREE.Group();
        grup.position.set(data.x, 0, data.z);

        const bahanBadan = new THREE.MeshStandardMaterial({ color: warna });
        const badan = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 6), bahanBadan);
        badan.position.y = 3;
        badan.castShadow = true; badan.receiveShadow = true;
        grup.add(badan);

        const atap = new THREE.Mesh(
            new THREE.ConeGeometry(4.8, 2.6, 4),
            new THREE.MeshStandardMaterial({ color: warna.clone().multiplyScalar(0.6) })
        );
        atap.rotation.y = Math.PI / 4;
        atap.position.y = 7.3;
        atap.castShadow = true;
        grup.add(atap);

        const pintu = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 2.8, 0.2),
            new THREE.MeshStandardMaterial({ color: 0x5b3a1e })
        );
        pintu.position.set(0, 1.4, 3.05);
        grup.add(pintu);

        const bahanJendela = new THREE.MeshStandardMaterial({ color: 0xbfe9ff, emissive: 0x4aa8d8, emissiveIntensity: 0.5 });
        [-1.9, 1.9].forEach((dx) => {
            const j = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.15), bahanJendela);
            j.position.set(dx, 3.3, 3.05);
            grup.add(j);
        });

        const papan = buatPapanNama(data.nama, data.ikon);
        papan.position.set(0, 4.9, 3.07);
        grup.add(papan);

        scene.add(grup);
        return { data: data, x: data.x, z: data.z, bahanBadan: bahanBadan, warna: warna };
    });

    // Pohon (posisi acak tetap / deterministik)
    let seed = 20260;
    const acakTetap = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const geoBatang = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
    const geoDaun = new THREE.ConeGeometry(1.6, 3.2, 8);
    const bahanBatang = new THREE.MeshStandardMaterial({ color: 0x7c4a1e });
    const bahanDaun = new THREE.MeshStandardMaterial({ color: 0x1f8f4a });

    function tempatKosong(x, z) {
        if (Math.hypot(x, z) < 5) return false;
        if (Math.abs(x) < 3.5 && z > -19 && z < 8) return false;     // jalan utara-selatan
        if (Math.abs(z + 8) < 3.5 && Math.abs(x) < 26) return false; // jalan timur-barat
        if (Math.abs(z + 26) < 3.5 && Math.abs(x) < 28) return false;
        if (Math.abs(Math.abs(x) - 10) < 3.5 && z < -6 && z > -27) return false;
        if (Math.abs(x) < 3.5 && z < -25 && z > -35) return false;
        return daftarGedung.every((g) => Math.abs(x - g.x) > 8 || Math.abs(z - g.z) > 8);
    }
    for (let n = 0, coba = 0; n < 45 && coba < 400; coba++) {
        const x = (acakTetap() * 2 - 1) * (BATAS + 2);
        const z = (acakTetap() * 2 - 1) * (BATAS + 2);
        if (!tempatKosong(x, z)) continue;
        const s = 0.8 + acakTetap() * 0.7;
        const pohon = new THREE.Group();
        const batang = new THREE.Mesh(geoBatang, bahanBatang);
        batang.position.y = 1;
        const daun = new THREE.Mesh(geoDaun, bahanDaun);
        daun.position.y = 3.4;
        batang.castShadow = true; daun.castShadow = true;
        pohon.add(batang, daun);
        pohon.scale.set(s, s, s);
        pohon.position.set(x, 0, z);
        scene.add(pohon);
        n++;
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
    for (let n = 0, coba = 0; n < 24 && coba < 500; coba++) {
        const x = (acakTetap() * 2 - 1) * (BATAS - 3);
        const z = (acakTetap() * 2 - 1) * (BATAS - 3);
        if (Math.hypot(x, z) < 3 || !daftarGedung.every((g) => Math.abs(x - g.x) > 5.5 || Math.abs(z - g.z) > 5.5)) continue;
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
    const bahanKulitNpc = new THREE.MeshStandardMaterial({ color: 0xfcd9b6 });
    const npcList = daftarGedung.map((g) => {
        const n = new THREE.Group();
        const badan = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 1.1, 16), new THREE.MeshStandardMaterial({ color: g.warna }));
        badan.position.y = 0.65;
        const kepala = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), bahanKulitNpc);
        kepala.position.y = 1.5;
        const topi = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.45, 12), new THREE.MeshStandardMaterial({ color: g.warna.clone().multiplyScalar(0.6) }));
        topi.position.y = 1.95;
        badan.castShadow = true; kepala.castShadow = true;
        n.add(badan, kepala, topi);
        n.position.set(g.x + 3.2, 0, g.z + 4.8);
        scene.add(n);
        return n;
    });

    // ---------- 4. PEMAIN ----------
    const player = new THREE.Group();          // origin = telapak kaki, menghadap +Z
    const bahanBaju = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.6 });
    const bahanCelana = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
    const bahanKulit = new THREE.MeshStandardMaterial({ color: 0xfcd9b6, roughness: 0.7 });
    const bahanRambut = new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.8 });
    const bahanSepatu = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const bahanMata = new THREE.MeshBasicMaterial({ color: 0x111111 });

    function tandaiBayangan(obj) { obj.castShadow = true; return obj; }

    // Badan atas (dibungkus supaya bisa miring ke depan & "bernapas")
    const badanAtas = new THREE.Group();
    badanAtas.position.y = 0.75;
    const torso = tandaiBayangan(new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.52, 0.95, 28), bahanBaju));
    torso.position.y = 0.5;
    const bahuAtas = tandaiBayangan(new THREE.Mesh(new THREE.SphereGeometry(0.46, 28, 16), bahanBaju));
    bahuAtas.position.y = 0.97;
    bahuAtas.scale.set(1, 0.55, 0.8);
    const pinggul = tandaiBayangan(new THREE.Mesh(new THREE.SphereGeometry(0.52, 28, 16), bahanCelana));
    pinggul.position.y = 0.05;
    pinggul.scale.set(1, 0.6, 0.8);
    badanAtas.add(torso, bahuAtas, pinggul);

    // Kepala
    const kepala = new THREE.Group();
    kepala.position.y = 1.62;
    const wajah = tandaiBayangan(new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), bahanKulit));
    const rambut = tandaiBayangan(new THREE.Mesh(
        new THREE.SphereGeometry(0.445, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), bahanRambut));
    rambut.rotation.x = -0.35;
    kepala.add(wajah, rambut);
    [-0.15, 0.15].forEach((dx) => {
        const mata = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), bahanMata);
        mata.position.set(dx, 0.02, 0.385);
        mata.scale.set(1, 1.3, 0.6);
        kepala.add(mata);
    });
    badanAtas.add(kepala);

    // Lengan (pivot di bahu supaya bisa berayun)
    function buatLengan(sisi) {
        const pivot = new THREE.Group();
        pivot.position.set(sisi * 0.62, 0.95, 0);
        const lengan = tandaiBayangan(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.62, 16), bahanBaju));
        lengan.position.y = -0.31;
        const tangan = tandaiBayangan(new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 12), bahanKulit));
        tangan.position.y = -0.68;
        pivot.add(lengan, tangan);
        badanAtas.add(pivot);
        return pivot;
    }
    const lenganKiri = buatLengan(-1), lenganKanan = buatLengan(1);

    // Kaki (pivot di pinggul)
    function buatKaki(sisi) {
        const pivot = new THREE.Group();
        pivot.position.set(sisi * 0.22, 0.78, 0);
        const kaki = tandaiBayangan(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.62, 16), bahanCelana));
        kaki.position.y = -0.31;
        const sepatu = tandaiBayangan(new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), bahanSepatu));
        sepatu.position.set(0, -0.62, 0.07);
        sepatu.scale.set(1, 0.6, 1.5);
        pivot.add(kaki, sepatu);
        player.add(pivot);
        return pivot;
    }
    const kakiKiri = buatKaki(-1), kakiKanan = buatKaki(1);

    player.add(badanAtas);
    scene.add(player);

    // ---------- 5. INPUT ----------
    const keys = Object.create(null);
    const touch = { up: false, down: false, left: false, right: false };
    const TOMBOL_GERAK = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

    function resetInput() {
        Object.keys(keys).forEach((k) => { keys[k] = false; });
        Object.keys(touch).forEach((k) => { touch[k] = false; });
        document.querySelectorAll('#dpad button').forEach((b) => b.classList.remove('aktif'));
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

    document.querySelectorAll('#dpad button').forEach((btn) => {
        const arah = btn.dataset.dir;
        const nyala = (e) => {
            e.preventDefault();
            touch[arah] = true;
            btn.classList.add('aktif');
            try { btn.setPointerCapture(e.pointerId); } catch (_) { /* abaikan */ }
        };
        const mati = () => { touch[arah] = false; btn.classList.remove('aktif'); };
        btn.addEventListener('pointerdown', nyala);
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => btn.addEventListener(t, mati));
        btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });

    // ---------- 6. HUD ----------
    const KUNCI = 'ge3d-v2';
    const TINGKAT = { 1: { pendek: 'Anak', nama: 'Anak (PAUD–SD)', ikon: '🧒' },
                      2: { pendek: 'Pelajar', nama: 'Pelajar (SMP–SMA)', ikon: '🧑‍🎓' },
                      3: { pendek: 'Umum', nama: 'Umum / Dewasa', ikon: '🧑' } };
    const simpan = { skor: 0, selesai: [], level: 0, suara: true, koin: 0, koinPeta: 0, misiSelesai: [], punya: [0], warna: 0 };
    try { Object.assign(simpan, JSON.parse(localStorage.getItem(KUNCI) || '{}')); } catch (_) { /* abaikan */ }
    function tulis() { try { localStorage.setItem(KUNCI, JSON.stringify(simpan)); } catch (_) { /* abaikan */ } }

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
    function toast(pesan) {
        const el = $('toast');
        el.textContent = pesan;
        el.classList.add('tampil');
        clearTimeout(tToast);
        tToast = setTimeout(() => el.classList.remove('tampil'), 3200);
    }

    // Misi
    const MISI = [
        { id: 'm1', teks: 'Selesaikan 1 gedung', nilai: () => selesai.size, target: 1, hadiah: 10 },
        { id: 'm2', teks: 'Selesaikan 3 gedung', nilai: () => selesai.size, target: 3, hadiah: 25 },
        { id: 'm3', teks: 'Selesaikan 6 gedung (tingkat apa pun)', nilai: () => selesai.size, target: 6, hadiah: 50 },
        { id: 'm4', teks: 'Kumpulkan 20 koin di peta', nilai: () => simpan.koinPeta, target: 20, hadiah: 15 },
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
        ? '🎮 <b>Kontrol:</b> pakai tombol arah di layar'
        : '🎮 <b>Kontrol:</b> <b>W A S D</b> / <b>Panah</b> = jalan · <b>E</b> = masuk gedung';

    function updateHud() {
        periksaMisi();
        $('hud-koin').textContent = '🪙 ' + simpan.koin;
        $('hud-skor').textContent = '⭐ Skor: ' + skor;
        $('hud-gedung').textContent = '🏫 Gedung: ' + jumlahSelesai() + '/' + daftarGedung.length;
        $('btn-level').textContent = '🎚️ ' + (TINGKAT[simpan.level] ? TINGKAT[simpan.level].pendek : 'Tingkat');
        $('btn-suara').textContent = simpan.suara ? '🔊' : '🔇';
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
            baris1.textContent = '🔔 ' + (isTouch ? 'Ketuk di sini' : 'Tekan E') + ' untuk masuk ' + g.data.nama;
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

    function update(dt) {
        let mx = 0, mz = 0;
        if (!isKuisOpen) {
            if (keys.w || keys.arrowup || touch.up) mz -= 1;
            if (keys.s || keys.arrowdown || touch.down) mz += 1;
            if (keys.a || keys.arrowleft || touch.left) mx -= 1;
            if (keys.d || keys.arrowright || touch.right) mx += 1;
        }
        const ingin = (mx !== 0 || mz !== 0);
        if (ingin) { const len = Math.hypot(mx, mz); mx /= len; mz /= len; }

        // Percepatan / perlambatan halus menuju kecepatan target
        const f = 1 - Math.exp(-(ingin ? PERCEPATAN : PERLAMBATAN) * dt);
        vx += (mx * KECEPATAN - vx) * f;
        vz += (mz * KECEPATAN - vz) * f;
        if (!ingin && Math.hypot(vx, vz) < 0.05) { vx = 0; vz = 0; }
        const laju = Math.hypot(vx, vz);
        const rasio = Math.min(1, laju / KECEPATAN);

        if (laju > 0) {
            let px = player.position.x + vx * dt;
            let pz = player.position.z + vz * dt;
            px = Math.max(-BATAS, Math.min(BATAS, px));
            pz = Math.max(-BATAS, Math.min(BATAS, pz));

            // Tabrakan dengan gedung (kotak sederhana) — menyusur dinding, tidak menempel
            const batas = SETENGAH_GEDUNG + RADIUS;
            daftarGedung.forEach((g) => {
                const dx = px - g.x, dz = pz - g.z;
                if (Math.abs(dx) < batas && Math.abs(dz) < batas) {
                    if (batas - Math.abs(dx) < batas - Math.abs(dz)) { px = g.x + (dx < 0 ? -batas : batas); vx = 0; }
                    else { pz = g.z + (dz < 0 ? -batas : batas); vz = 0; }
                }
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

        // Kamera mengikuti dengan halus
        const tx = player.position.x, tz = player.position.z + 13;
        if (!kameraSiap) {
            camera.position.set(tx, 9, tz);
            kameraSiap = true;
        } else {
            const f = 1 - Math.exp(-6 * dt);
            camera.position.x += (tx - camera.position.x) * f;
            camera.position.y += (9 - camera.position.y) * f;
            camera.position.z += (tz - camera.position.z) * f;
        }
        camera.lookAt(player.position.x, 1.2, player.position.z - 2);

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

    updateHud();
    if (soalDilewati) toast('⚠️ ' + soalDilewati + ' soal dilewati karena salah format (lihat Console)');
    if (!simpan.level) bukaLevel();
    loop();
})();
