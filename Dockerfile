# STAGE 1: Build Frontend (React)
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE 2: Build Backend (Golang)
FROM golang:1.23-bullseye AS backend-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o backend main.go

# STAGE 3: Final Production Image
FROM debian:bullseye-slim
WORKDIR /app

# Install FFmpeg and other essentials
RUN apt-get update && apt-get install -y ffmpeg ca-certificates procps && rm -rf /var/lib/apt/lists/*

# Copy built assets
COPY --from=frontend-builder /app/dist ./dist
COPY --from=backend-builder /app/backend ./backend

# Copy initial config files if they exist
COPY config.json* ./
COPY schedules.json* ./

# Create necessary directories
RUN mkdir -p uploads

# Expose backend port
EXPOSE 3001

# Run the Go binary
CMD ["./backend"]
