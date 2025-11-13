# Naama-AI Deployment Guide

Complete deployment guide for Naama-AI with local Hebrew LLM integration.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Local Hebrew LLM Setup](#local-hebrew-llm-setup)
4. [Frontend Setup](#frontend-setup)
5. [Production Deployment](#production-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### System Requirements

**Minimum (Development):**
- OS: Linux, macOS, or Windows 10/11
- CPU: 4+ cores
- RAM: 16GB
- Storage: 20GB free space
- Node.js: v18+
- MongoDB: v6.0+

**Recommended (Production with GPU):**
- OS: Ubuntu 22.04 LTS
- CPU: 8+ cores
- RAM: 32GB
- GPU: NVIDIA with 8GB+ VRAM (RTX 3060 Ti or better)
- Storage: 50GB+ SSD
- Node.js: v20 LTS
- MongoDB: v7.0+

### Software Dependencies

```bash
# Install Node.js (via nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Install MongoDB (Ubuntu/Debian)
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# For GPU support (NVIDIA)
# Install CUDA toolkit and drivers
sudo apt install nvidia-driver-535
sudo apt install nvidia-cuda-toolkit
```

---

## Backend Setup

### 1. Clone Repository

```bash
git clone https://github.com/thamam/Naama-AI.git
cd Naama-AI/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
nano .env
```

**Required Configuration:**

```bash
# Server
NODE_ENV=production
PORT=5000
API_BASE_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com

# Database
MONGODB_URI=mongodb://localhost:27017/naama-ai

# JWT (CHANGE THIS!)
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_EXPIRES_IN=7d

# Anthropic (Required for fallback)
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-3-5-haiku-20241022
ANTHROPIC_MAX_TOKENS=2048

# Local Hebrew LLM (Phase 2)
LOCAL_HEBREW_LLM_ENABLED=true
LOCAL_HEBREW_LLM_ENDPOINT=http://localhost:11434
LOCAL_HEBREW_LLM_MODEL=dicta-il/dictalm2.0-instruct
LOCAL_HEBREW_LLM_BACKEND=ollama
LOCAL_HEBREW_LLM_MAX_TOKENS=2048
LOCAL_HEBREW_LLM_TEMPERATURE=0.7
LOCAL_HEBREW_LLM_TIMEOUT=120000
```

### 4. Test Backend

```bash
# Development mode
npm run dev

# Production mode
npm start

# Check health
curl http://localhost:5000/api
```

---

## Local Hebrew LLM Setup

### Option 1: Ollama (Recommended)

#### Install Ollama

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**macOS:**
```bash
brew install ollama
```

**Windows:**
Download from: https://ollama.com/download/windows

#### Install DictaLM 2.0

```bash
# Pull the model (~8GB download)
ollama pull dicta-il/dictalm2.0-instruct

# Verify installation
ollama list

# Expected output:
# NAME                              SIZE
# dicta-il/dictalm2.0-instruct     7.5GB
```

#### Configure Ollama

**For CPU-only:**
```bash
# Start Ollama service
ollama serve
```

**For GPU (NVIDIA):**
```bash
# Verify CUDA is available
nvidia-smi

# Ollama will auto-detect GPU
ollama serve
```

**Custom Host/Port:**
```bash
# Bind to all interfaces on port 8080
OLLAMA_HOST=0.0.0.0:8080 ollama serve

# Update .env
LOCAL_HEBREW_LLM_ENDPOINT=http://localhost:8080
```

#### Test Ollama

```bash
# Quick test
ollama run dicta-il/dictalm2.0-instruct "שלום! איך אתה?"

# API test
curl http://localhost:11434/api/generate -d '{
  "model": "dicta-il/dictalm2.0-instruct",
  "prompt": "צור רשימה של 5 חיות בעברית עם ניקוד",
  "stream": false
}'
```

#### Systemd Service (Linux Production)

```bash
# Create service file
sudo nano /etc/systemd/system/ollama.service
```

```ini
[Unit]
Description=Ollama Service
After=network.target

[Service]
Type=simple
User=ollama
Group=ollama
WorkingDirectory=/home/ollama
Environment="OLLAMA_HOST=0.0.0.0:11434"
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable ollama
sudo systemctl start ollama
sudo systemctl status ollama
```

---

### Option 2: LM Studio

#### Install LM Studio

1. Download from: https://lmstudio.ai/
2. Install for your OS
3. Launch LM Studio

#### Download Model

1. Click "Discover" tab
2. Search for "DictaLM"
3. Download "dicta-il/dictalm2.0-instruct"
4. Wait for download to complete

#### Start Server

1. Click "Local Server" tab
2. Select "dicta-il/dictalm2.0-instruct"
3. Configure:
   - Port: 1234
   - GPU Offload: Maximum (if GPU available)
   - Context Length: 4096
   - Temperature: 0.7
4. Click "Start Server"

#### Update Configuration

```bash
# In .env
LOCAL_HEBREW_LLM_ENDPOINT=http://localhost:1234
LOCAL_HEBREW_LLM_BACKEND=lmstudio
```

---

### Option 3: vLLM (High-Performance)

For production deployments with high throughput needs.

#### Install vLLM

```bash
# Install with CUDA support
pip install vllm

# Or with specific CUDA version
pip install vllm-cuda117  # for CUDA 11.7
```

#### Start vLLM Server

```bash
python -m vllm.entrypoints.openai.api_server \
  --model dicta-il/dictalm2.0-instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --gpu-memory-utilization 0.9 \
  --max-model-len 4096

# Update .env
LOCAL_HEBREW_LLM_ENDPOINT=http://localhost:8000
LOCAL_HEBREW_LLM_BACKEND=vllm
```

---

## Performance Optimization

### GPU Configuration

**For NVIDIA GPUs:**

```bash
# Check GPU status
nvidia-smi

# Monitor GPU usage during generation
watch -n 1 nvidia-smi

# Optimize GPU memory
# In .env
LOCAL_HEBREW_LLM_TIMEOUT=60000  # Reduce for faster feedback
```

**Expected Performance:**
- CPU (16 cores): 20-60 seconds per generation
- GPU (RTX 3060 12GB): 3-8 seconds per generation
- GPU (RTX 4090 24GB): 1-3 seconds per generation

### Model Quantization

**Trade-off: Size vs. Quality**

```bash
# Q4 (smallest, fastest) - ~4GB
ollama pull dicta-il/dictalm2.0-instruct:q4_0

# Q5 (balanced) - ~5GB
ollama pull dicta-il/dictalm2.0-instruct:q5_0

# Q8 (high quality) - ~8GB
ollama pull dicta-il/dictalm2.0-instruct:q8_0

# FP16 (full precision) - ~12GB
ollama pull dicta-il/dictalm2.0-instruct:fp16
```

Update `.env`:
```bash
LOCAL_HEBREW_LLM_MODEL=dicta-il/dictalm2.0-instruct:q4_0
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd ../  # Back to root
npm install
```

### 2. Configure

```bash
# Create .env
nano .env
```

```bash
VITE_API_URL=http://localhost:5000
```

### 3. Build & Serve

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview
```

---

## Production Deployment

### Using PM2 (Process Manager)

#### Install PM2

```bash
npm install -g pm2
```

#### Start Services

```bash
# Backend
cd backend
pm2 start npm --name "naama-backend" -- start

# Frontend (if serving with Node)
cd ..
pm2 start npm --name "naama-frontend" -- run preview

# Save configuration
pm2 save
pm2 startup
```

#### Manage Processes

```bash
# View logs
pm2 logs naama-backend
pm2 logs naama-frontend

# Restart
pm2 restart naama-backend

# Monitor
pm2 monit

# Stop
pm2 stop all
```

---

### Using Docker

#### Create Dockerfile

**Backend:**
```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

**Docker Compose:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_models:/root/.ollama
    ports:
      - "11434:11434"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  backend:
    build: ./backend
    depends_on:
      - mongodb
      - ollama
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/naama-ai
      - LOCAL_HEBREW_LLM_ENDPOINT=http://ollama:11434
    ports:
      - "5000:5000"

volumes:
  mongodb_data:
  ollama_models:
```

#### Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

### Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/naama-ai
server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        root /var/www/naama-ai/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Increase timeout for LLM requests
        proxy_read_timeout 180s;
        proxy_connect_timeout 180s;
        proxy_send_timeout 180s;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/naama-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://localhost:5000/api

# Ollama health
curl http://localhost:11434/api/tags

# MongoDB health
mongosh --eval "db.adminCommand('ping')"
```

### Log Monitoring

```bash
# Backend logs
pm2 logs naama-backend --lines 100

# Ollama logs
journalctl -u ollama -f

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Backup Strategy

```bash
# MongoDB backup
mongodump --db naama-ai --out /backup/$(date +%Y%m%d)

# Restore
mongorestore --db naama-ai /backup/20241113/naama-ai

# Automated daily backups
crontab -e
# Add: 0 2 * * * mongodump --db naama-ai --out /backup/$(date +\%Y\%m\%d)
```

### Performance Monitoring

```bash
# Monitor system resources
htop

# Monitor GPU
watch -n 1 nvidia-smi

# Monitor disk usage
df -h

# Monitor network
iftop

# Application metrics
pm2 monit
```

### Scaling Considerations

**Vertical Scaling:**
- Add more RAM for larger models
- Upgrade GPU for faster inference
- Use SSD for better I/O

**Horizontal Scaling:**
- Run multiple Ollama instances (round-robin)
- Use MongoDB replica sets
- Load balance with Nginx

---

## Troubleshooting

### Common Issues

#### 1. Ollama Not Starting

```bash
# Check logs
journalctl -u ollama -n 50

# Check port
sudo lsof -i :11434

# Kill conflicting process
sudo kill -9 <PID>

# Restart
sudo systemctl restart ollama
```

#### 2. Out of Memory

```bash
# Check memory
free -h

# Reduce model size
ollama pull dicta-il/dictalm2.0-instruct:q4_0

# Or reduce context
# In Ollama: set num_ctx to 2048
```

#### 3. Slow Generation

```bash
# Enable GPU
nvidia-smi  # Verify GPU detected

# Check GPU utilization
watch -n 1 nvidia-smi

# If GPU not used, reinstall Ollama with CUDA
curl -fsSL https://ollama.com/install.sh | sh
```

#### 4. Backend Connection Refused

```bash
# Check backend running
pm2 status

# Check ports
sudo netstat -tulpn | grep 5000

# Check firewall
sudo ufw status
sudo ufw allow 5000
```

---

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use HTTPS in production
- [ ] Enable MongoDB authentication
- [ ] Configure firewall (ufw)
- [ ] Regular security updates
- [ ] Restrict API access (rate limiting)
- [ ] Backup encryption
- [ ] Log rotation
- [ ] Monitor failed login attempts

---

## Support

Need help? Check:
- [Phase 2 Documentation](./PHASE2_DOCUMENTATION.md)
- [README](./README.md)
- [GitHub Issues](https://github.com/thamam/Naama-AI/issues)

---

**Last Updated:** November 2025
**Version:** Phase 2
