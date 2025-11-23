# Pacboy

Game Pac-Man sederhana berbasis web yang berjalan di atas HTML5 Canvas. Proyek ini menampilkan papan maze, pemain (Pac-Man), empat hantu dengan AI dasar, sistem skor, nyawa, level, serta kontrol mulai/jeda dan panel Game Over.

## Fitur

- Maze multi-level dengan layout yang berbeda.
- Sistem skor: pellet kecil `.` bernilai 10 poin, power pellet `o` bernilai 50 poin.
- Mode takut hantu (frightened) selama 6 detik setelah makan power pellet.
- HUD menampilkan `Skor`, `Nyawa`, dan `Level` secara real-time.
- Panel Game Over dengan tombol `Main Lagi` untuk memulai ulang.
- Kontrol tombol keyboard panah dan tombol `Mulai`/`Jeda` di UI.

## Cara Bermain

- Klik tombol `Mulai` untuk memulai permainan.
- Gerakkan Pac-Man menggunakan tombol panah: `←`, `→`, `↑`, `↓`.
- Makan semua pellet untuk naik level; makan `o` (power pellet) agar hantu takut sementara.
- Hindari hantu ketika tidak dalam mode takut. Kehilangan nyawa ketika bertabrakan di kondisi normal.
- Klik `Jeda` untuk pause/resume.
- Setelah Game Over, klik `Main Lagi` untuk memulai ulang.

## Cara Menjalankan

Opsi 1 — Buka langsung:
- Buka file `index.html` di browser modern (Chrome/Edge/Firefox/Safari).

Opsi 2 — Jalankan server statis lokal:
- Python: `python3 -m http.server` lalu buka `http://localhost:8000/`.
- Node (serve): `npx serve` di root proyek lalu buka URL yang ditampilkan.

Opsi 3 — Deploy ke GitHub Pages:
- Push ke GitHub, aktifkan GitHub Pages di pengaturan repository.
- Pilih sumber `Branch: main` dan folder `/root`.
- Akses situs sesuai URL yang diberikan GitHub Pages.

## Struktur Proyek

- `index.html` — Struktur halaman, HUD (skor/nyawa/level), kontrol `Mulai/Jeda`, canvas game, overlay Game Over.
- `styles.css` — Gaya visual topbar, tombol, canvas, overlay/panel.
- `game.js` — Seluruh logika game: peta, entitas, AI hantu, loop update/render, input, HUD dan manajemen level.

## Ringkasan Mekanisme

- Grid: ukuran tile `TILE = 24`; ukuran canvas dihitung dari jumlah kolom/baris peta.
- Peta: array string berisi karakter `W` (dinding), `.` (pellet), `o` (power pellet), dan spasi (kosong). Empat layout tersedia di `MAPS`.
- Spawn: posisi awal di sekitar `SPAWN = { c: 9, r: 6 }` dan disesuaikan ke sel terbuka terdekat.
- Pac-Man: bergerak dengan vektor arah saat ini dan arah berikutnya (buffer). Pergantian arah terjadi saat berada di pusat sel dan jalur tidak tertutup dinding.
- Hantu: AI memilih arah yang tersedia, menghindari membalik arah langsung; mengejar Pac-Man pada kondisi normal dan menjauh pada mode takut. Setiap hantu punya warna, kecepatan, dan delay rilis dari sudut peta.
- Tabrakan: jika jarak Pac-Man dan hantu cukup dekat, salah satu dari dua hasil terjadi:
  - Mode takut: hantu dikalahkan, memberi skor tambahan, respawn setelah jeda.
  - Normal: nyawa berkurang, Pac-Man dipulihkan ke posisi awal dengan masa aman singkat.
- Level: ketika semua pellet habis, naik `level` dan memuat layout berikutnya.

## Kustomisasi Cepat

- Ubah layout peta di `MAPS` pada `game.js` untuk membuat level baru.
- Atur jumlah maksimum hantu via `MAX_GHOSTS`.
- Sesuaikan kecepatan entitas atau warna hantu untuk variasi kesulitan/tema.

## Kebutuhan

- Browser modern yang mendukung `CanvasRenderingContext2D` dan `requestAnimationFrame`.

## Kredit

Terinspirasi dari gameplay klasik Pac-Man. Proyek ini dibuat untuk tujuan edukasi dan hiburan.