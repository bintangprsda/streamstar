# 🎥 StreamStar - Live Control Dashboard

StreamStar is a powerful, high-fidelity web dashboard designed for managing live broadcast streams. It provides a premium interface to control FFmpeg-based streaming with advanced features like automated scheduling and self-healing mechanisms.

![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/frontend-React%2019-emerald)
![Node](https://img.shields.io/badge/backend-Node.js-slate)

## ✨ Features

- **🚀 Live Control**: Start and stop streams instantly with a single click.
- **📺 Video Preview**: Integrated video player to verify content before going live.
- **⏰ Smart Scheduler**: Plan your broadcasts ahead of time with automated execution.
- **🛡️ Watchdog System**: Automatic self-healing that restarts the stream if FFmpeg crashes or stops unexpectedly.
- **📝 Real-time Logs**: Live terminal-style logs to monitor system activity and FFmpeg output.
- **⚙️ Flexible Configuration**: Easily manage RTMP URLs and Stream Keys through a secure settings panel.
- **🎨 Premium UI**: Modern, glassmorphic dark-mode interface built with Tailwind CSS v4 and Framer Motion.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, Multer, Node-Schedule.
- **Streaming Core**: FFmpeg (Process Spawning).

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **FFmpeg** installed and added to your system's PATH.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bintangprsda/streamstar.git
   cd streamstar
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the application:**
   ```bash
   # Start both backend and frontend (separate terminals recommended)
   node server.js
   npm run dev
   ```

4. **Access the dashboard:**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## ⚙️ Configuration

1. Go to the **Settings** tab in the dashboard.
2. Enter your **RTMP URL** (e.g., `rtmp://a.rtmp.youtube.com/live2/`).
3. Paste your **Stream Key**.
4. Click **Save Settings**.

## 📖 Usage

1. **Upload Videos**: Navigate to the **Videos** tab and upload your `.mp4`, `.mov`, or `.webm` files.
2. **Preview**: Click **Select** on any video to see it in the preview player.
3. **Go Live**: Click **Start** in the dashboard to begin streaming immediately.
4. **Schedule**: Go to the **Scheduler** tab to set a future date and time for automated streaming.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
