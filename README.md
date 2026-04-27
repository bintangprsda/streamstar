# StreamStar 🚀
**The Ultimate 24/7 Live Stream Orchestrator**

StreamStar adalah aplikasi manajemen live streaming 24/7 yang powerful, dirancang untuk menyiarkan konten video ke platform seperti YouTube, Facebook, atau Twitch secara terus-menerus menggunakan teknologi FFmpeg dan backend Golang yang efisien.

![Dashboard Preview](https://via.placeholder.com/1200x600?text=StreamStar+Professional+Dashboard)

## ✨ Fitur Utama
- **Backend Golang (Gin)**: Performa tinggi dan penggunaan resource rendah.
- **SQLite Database**: Penyimpanan data yang tangguh dan cepat untuk Config, Jadwal, dan Riwayat (menggantikan sistem file JSON).
- **Full-Width Dashboard**: Antarmuka luas untuk kontrol penuh atas library video dan stream.
- **System Monitoring**: Pantau CPU, RAM, dan penggunaan Disk secara real-time (Windows & Linux).
- **Stream History**: Catat setiap sesi live Anda (Start time, End time, dan Total Duration).
- **Smart Scheduler**: Jadwalkan video Anda untuk tayang secara otomatis pada jam tertentu.
- **FFmpeg Logs Modal**: Pantau log runtime FFmpeg melalui modal dengan efek **Glassmorphism** yang elegan.
- **Auto-Cleanup**: Secara otomatis membersihkan proses FFmpeg yang menggantung untuk menghindari "double ingestion" pada YouTube.
- **Coolify Ready**: Sudah dilengkapi dengan Dockerfile multi-stage untuk kemudahan deploy ke VPS.

## 🛠️ Tech Stack
- **Frontend**: React.js, Tailwind CSS, Lucide Icons.
- **Backend**: Golang (Gin Framework).
- **Database**: SQLite (ModernC - Pure Go).
- **Streaming Engine**: FFmpeg.

## 🚀 Cara Menjalankan (Lokal - Windows)

### 1. Prasyarat
- Install [Go](https://go.dev/dl/)
- Install [Node.js](https://nodejs.org/)
- Letakkan `ffmpeg.exe` di root folder proyek ini.

### 2. Setup & Jalankan
```powershell
# Install Frontend Dependencies
npm install

# Build Frontend
npm run build

# Jalankan Backend
go run main.go
```
Aplikasi akan otomatis melakukan migrasi data jika Anda sebelumnya menggunakan sistem file JSON. Database akan disimpan dalam file `streamstar.db`.

## ☁️ Deployment (VPS - Coolify/Docker)

Aplikasi ini sudah dioptimalkan untuk di-deploy menggunakan **Coolify**. Cukup hubungkan repository Anda, dan Dockerfile akan menangani semua proses build dan instalasi FFmpeg secara otomatis.

## 📁 Struktur Proyek
- `/src`: Source code Frontend (React).
- `main.go`: Inti dari Backend server (Golang).
- `streamstar.db`: Database SQLite (Dibuat otomatis).
- `/uploads`: Tempat penyimpanan video yang diupload.
- `Dockerfile`: Instruksi build untuk produksi/VPS.

---
Dikembangkan dengan ❤️ untuk para Streamer.
