# 🌐 Nginx Reverse Proxy Setup Guide

This guide explains how to add **Nginx** as a reverse proxy in front of your Express API, MySQL, and phpMyAdmin Docker stack.

---

## 📐 Architecture with Nginx

Instead of exposing multiple individual ports (`8000`, `8080`) to the public, Nginx acts as a single gateway listening on **Port 80 (HTTP)** / **Port 443 (HTTPS)**:

```
                          +-------------------------+
                          |   Browser / Postman     |
                          +------------+------------+
                                       |
                                       | Port 80 (HTTP)
                                       v
                          +-------------------------+
                          |  Nginx Reverse Proxy    |
                          |       (container)       |
                          +------------+------------+
                                       |
               +-----------------------+-----------------------+
               | Internal Docker Network                       |
               v                                               v
  +-------------------------+                     +-------------------------+
  |   Express App Service   |                     |   phpMyAdmin Service    |
  |      (app:8000)         |                     |    (phpmyadmin:80)      |
  +-------------------------+                     +-------------------------+
```

---

## 🛠️ Step-by-Step Nginx Implementation

### Step 1: Create an `nginx/` Configuration Folder

Create a directory named `nginx/` in your project root with a configuration file `nginx/default.conf`:

#### File: `nginx/default.conf`
```nginx
server {
    listen 80;
    server_name localhost;

    # 1. Forward API requests to the Express app container
    location / {
        proxy_pass http://app:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 2. Forward phpMyAdmin traffic to the phpmyadmin container
    location /phpmyadmin/ {
        proxy_pass http://phpmyadmin:80/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### Step 2: Update `docker-compose.yml` to Include Nginx

Add the `nginx` service to your `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  # Nginx Gateway Container
  webserver:
    image: nginx:alpine
    container_name: nginx_webserver
    ports:
      - "80:80"    # Maps port 80 on host to Nginx
      - "443:443"  # Maps port 443 for HTTPS (when SSL is configured)
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - app
      - phpmyadmin
    restart: always

  # Express TypeScript App (Remove host port mapping so only Nginx communicates with it)
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: builder
    container_name: express_app
    env_file:
      - .env
    command: npm run dev
    volumes:
      - ./src:/app/src
    depends_on:
      db:
        condition: service_healthy
    restart: always

  # MySQL Database
  db:
    image: mysql:8.4
    container_name: mysql_db
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD:-root_password}
      MYSQL_DATABASE: ${DB_NAME:-express_db}
    volumes:
      - db_data:/var/lib/mysql
    restart: always
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 5s
      retries: 10

  # phpMyAdmin UI
  phpmyadmin:
    image: phpmyadmin:5
    container_name: phpmyadmin_ui
    environment:
      PMA_HOST: db
      PMA_PORT: 3306
    depends_on:
      - db
    restart: always

volumes:
  db_data:
```

---

## 🔒 Adding SSL / HTTPS (Production)

In production, you can use **Let's Encrypt** with `certbot` to issue free SSL certificates.

Nginx configuration snippet for HTTPS (Port 443):

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://app:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

## 🌟 Benefits of Adding Nginx

1. **Security**: Shields your Express application and MySQL ports directly from the public internet.
2. **Single Port**: Eliminates the need to open ports `8000`, `8080`, `3306` on your firewall.
3. **Rate Limiting**: Protects your API endpoints from abuse and brute force attacks.
4. **Gzip Compression**: Automatically compresses JSON responses before sending them to users for faster loading.
