# 🚀 StreamStar: 24/7 Live Streaming Dashboard

StreamStar adalah solusi *full-stack* untuk mengelola siaran langsung 24/7 ke platform seperti YouTube, Facebook, atau Twitch langsung dari VPS Anda. Dilengkapi dengan antarmuka web modern untuk kontrol penuh atas video, jadwal, dan status streaming.

## ✨ Fitur Utama

- **Live Control Dashboard**: Mulai dan hentikan streaming secara instan.
- **Smart Watchdog**: Sistem otomatis yang akan mendeteksi jika stream mati dan melakukan restart dalam 10 detik.
- **Auto-Looping**: Memutar video secara terus-menerus tanpa jeda.
- **Video Management**: Unggah, hapus, dan pilih video langsung dari browser.
- **Scheduling System**: Jadwalkan siaran otomatis di masa mendatang menggunakan *node-schedule*.
- **Real-time Logs**: Pantau keluaran FFmpeg secara langsung dari dashboard.
- **Deployment Ready**: Teroptimasi untuk Docker dan Coolify.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, Multer (File Uploads), Node-Schedule.
- **Engine**: FFmpeg (Stream Processing).
- **Infrastructure**: Docker & Coolify.

---

## 💻 Instalasi Lokal (Windows/Mac/Linux)

### Prasyarat
- Node.js (v18+)
- **FFmpeg (Wajib)**: Pastikan FFmpeg terinstal dan terdaftar di PATH sistem Anda.

### Langkah-langkah
1. **Clone Repositori**:
   ```bash
   git clone https://github.com/bintangprsda/streamstar.git
   cd streamstar
   ```
2. **Instal Dependensi**:
   ```bash
   npm install
   ```
3. **Jalankan Backend**:
   ```bash
   node server.js
   ```
4. **Jalankan Frontend**:
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:5173` di browser Anda.

---

## ☁️ Deployment VPS (Coolify)

Aplikasi ini telah dikonfigurasi untuk berjalan mulus di VPS menggunakan Coolify.

### Konfigurasi Coolify
1. **Build Pack**: Pilih `Dockerfile`.
2. **Port**: Gunakan port `3001`.
3. **Persistent Storage (PENTING)**:
   Agar video dan pengaturan Anda tidak hilang saat restart, tambahkan storage berikut di tab **Storage**:
   - **Volume Mount**: `Destination: /app/uploads` (Untuk video).
   - **File Mount**: `Destination: /app/config.json` (Untuk pengaturan stream).
   - **File Mount**: `Destination: /app/schedules.json` (Untuk jadwal).

---

## ⚠️ Troubleshooting

### 1. Error `spawn ffmpeg ENOENT`
Terjadi karena FFmpeg tidak terinstal di komputer lokal Anda. Pastikan `ffmpeg` bisa dipanggil melalui terminal.

### 2. Error `Unrecognized option 'stream_loop'`
Terjadi jika versi FFmpeg Anda terlalu lama (dibawah v3.0). Gunakan FFmpeg versi terbaru (v6.0+ disarankan).

### 3. Error `http proxy error: /api/...`
Terjadi jika frontend Vite tidak bisa terhubung ke backend Node.js. Pastikan `server.js` sudah berjalan di port 3001.

---

## 🤝 Kontribusi

Kontribusi selalu terbuka! Silakan ajukan *Pull Request* atau laporkan *issue* jika menemukan bug.

## 📄 Lisensi

Proyek ini dilisensikan di bawah MIT License.
