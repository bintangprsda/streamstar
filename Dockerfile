# STAGE 1: Build Frontend (React)
FROM node:22-slim AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE 2: Build Backend (Golang)
# Using alpine for build stage to save RAM
FROM golang:1.25-alpine AS backend-builder
WORKDIR /app
RUN apk add --no-cache git
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# -p 1 limits parallelism to prevent OOM on small servers
# -ldflags="-s -w" reduces binary size
RUN CGO_ENABLED=0 GOOS=linux go build -p 1 -ldflags="-s -w" -o backend main.go

# STAGE 3: Final Production Image
FROM debian:bookworm-slim
WORKDIR /app

# Install FFmpeg and other essentials
RUN apt-get update && apt-get install -y \
    ffmpeg \
    ca-certificates \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Copy built assets
COPY --from=frontend-builder /app/dist ./dist
COPY --from=backend-builder /app/backend ./backend

# Create necessary directories and set permissions
RUN mkdir -p uploads && chmod 755 uploads

# Expose backend port
EXPOSE 3001

# Run the Go binary
CMD ["./backend"]
