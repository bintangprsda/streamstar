# 🚀 StreamStar: 24/7 Live Streaming Dashboard

StreamStar adalah solusi *full-stack* untuk mengelola siaran langsung 24/7 ke platform seperti YouTube, Facebook, atau Twitch. Dilengkapi dengan antarmuka premium, sistem penjadwalan cerdas, dan optimasi siaran otomatis.

## ✨ Fitur Unggulan

- **Live Control Dashboard**: Mulai/hentikan streaming secara instan dengan indikator "Now Playing" yang dinamis.
- **Global Stop**: Tombol stop cepat yang selalu tersedia di bagian atas dashboard.
- **Stream Uptime**: Timer *real-time* yang menunjukkan sudah berapa lama siaran Anda mengudara.
- **Smart Watchdog**: Sistem otomatis yang akan merestart stream dalam 10 detik jika terdeteksi mati.
- **Enhanced Scheduler**: Penjadwalan siaran dengan format waktu Indonesia (id-ID) dan tombol "Pilih Cepat" (+30m, +1j, Besok).
- **YouTube Health Optimized**: Konfigurasi FFmpeg otomatis (GOP/Keyframes) untuk memastikan status siaran "Excellent" di YouTube Studio.
- **Secure Deletion**: Konfirmasi keamanan sebelum menghapus video secara permanen dari penyimpanan.
- **Modular Architecture**: Kode yang bersih dan terorganisir menggunakan komponen React yang terpisah.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, Multer, Node-Schedule.
- **Engine**: FFmpeg v6.0+ (Wajib).
- **Infrastructure**: Docker & Coolify.

---

## 💻 Instalasi Lokal (Windows/Mac/Linux)

### Prasyarat
- Node.js (v18+)
- **FFmpeg (v6.0+)**: Pastikan `ffmpeg` terinstal dan ada di PATH sistem.

### Langkah-langkah
1. **Clone & Install**:
   ```bash
   git clone https://github.com/bintangprsda/streamstar.git
   cd streamstar
   npm install
   ```
2. **Jalankan Backend**:
   ```bash
   node server.js
   ```
3. **Jalankan Frontend**:
   ```bash
   npm run dev
   ```
4. Akses dashboard di `http://localhost:5173`.

---

## ☁️ Deployment VPS (Coolify)

### Konfigurasi Persistent Storage
Sangat disarankan untuk mengatur **Storage** di Coolify agar data tidak hilang saat redeploy:
- **Volume**: `/app/uploads` (Penyimpanan Video).
- **File**: `/app/config.json` (Konfigurasi RTMP/Key).
- **File**: `/app/schedules.json` (Data Penjadwalan).

---

## ⚠️ Tips Optimasi

Jika YouTube memberikan peringatan "Buffering" atau "Keyframe Frequency", pastikan Anda menggunakan versi terbaru aplikasi ini. Kami telah mengunci pengaturan `-g 60` dan `-keyint_min 60` untuk memastikan siaran tetap stabil di 30fps.

---

## 🤝 Kontribusi & Lisensi
Dibuat dengan ❤️ oleh [BintangPrsda](https://www.instagram.com/bintangprsda/). Lisensi MIT.
