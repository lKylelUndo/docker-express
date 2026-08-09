# 🐳 Docker & Architecture Documentation

Welcome to the **Docker Express Template** documentation! This guide provides a comprehensive breakdown of the project structure, Docker architecture, configuration files, and why each file is necessary.

---

## 📐 1. System Architecture Overview

This project uses **Docker Compose** to manage a multi-container microservice environment:

```
                      +-------------------------------+
                      |          User Browser         |
                      +---------------+---------------+
                                      |
                     +----------------+----------------+
                     |                                 |
         (Port 8000) |                     (Port 8080) |
                     v                                 v
        +-------------------------+       +-------------------------+
        |   Express App Service   |       |   phpMyAdmin Service    |
        |      (container)        |       |      (container)        |
        +------------+------------+       +------------+------------+
                     |                                 |
                     |   Internal Docker Network       |
                     +----------------+----------------+
                                      |
                          (Port 3306) |
                                      v
                        +---------------------------+
                        |   MySQL Database Service  |
                        |        (container)        |
                        +-------------+-------------+
                                      |
                                      v
                        +---------------------------+
                        | Persistent Docker Volume  |
                        |         (db_data)         |
                        +---------------------------+
```

---

## 📂 2. File Directory & Explanation

| File / Folder | Role & Purpose | Why it is Necessary |
| :--- | :--- | :--- |
| **`Dockerfile`** | Blueprint for creating the Node.js Express application container. | Defines how Node.js is installed, code is compiled, and the server is executed. |
| **`docker-compose.yml`** | Multi-container orchestrator file. | Launches and connects all three services (`app`, `db`, `phpmyadmin`) with a single command. |
| **`.env`** | Local environment variable definitions. | Stores sensitive secrets (database passwords, ports) separate from source code. |
| **`.env.example`** | Template for `.env`. | Committed to Git so other developers know which environment variables are required. |
| **`.dockerignore`** | Ignore filter for Docker builds. | Excludes files like local `node_modules` from being sent into the Docker build context (speeds up builds). |
| **`setup.ps1` / `setup.sh`** | Automated setup scripts for Windows / Mac / Linux. | One-click command to check prerequisites, install npm dependencies, and spin up containers. |
| **`src/db.ts`** | MySQL database connection configuration. | Connects Express to the MySQL container using credentials from environment variables. |

---

## 🔍 3. In-Depth Technical Breakdown of Docker Files

### A. `Dockerfile` (Multi-Stage Build)
The `Dockerfile` uses a **3-Stage Build** pattern:
1. **Stage 1 (`base`)**: Uses `node:22-alpine` for a lightweight base image.
2. **Stage 2 (`builder`)**: Installs all dependencies (including TypeScript devDependencies) and builds the source code into `/dist`.
3. **Stage 3 (`runner`)**: Creates the final production container. It copies only the compiled output (`/dist`) and installs runtime-only dependencies (`npm ci --omit=dev`).

> 💡 **Why Multi-Stage?** It drastically reduces the final Docker image size from ~800MB to ~150MB by removing build tools and TypeScript compilers from production.

---

### B. `docker-compose.yml` (Service Definitions)

#### Key Concepts Defined:
- **`services`**: Defines the independent containers that make up your application:
  - **`app`**: Builds and runs your Express server.
  - **`db`**: Pulls official `mysql:8.4` image.
  - **`phpmyadmin`**: Pulls official `phpmyadmin:5` web interface image.
- **`env_file`**: Instructs Docker Compose to read variables directly from `.env`.
- **`depends_on` + `healthcheck`**: Forces the `app` container to wait until MySQL has fully started and is ready to receive database connections (`mysqladmin ping`).
- **`volumes` (`db_data`)**: Mounts a persistent Docker volume to `/var/lib/mysql`. Without this, all database records would be lost whenever you stop the container!

---

### C. `phpMyAdmin` vs `MySQL` (Clarification)

> ❓ **"Why do I need a MySQL container if phpMyAdmin is installed?"**

- **MySQL (`mysql:8.4`)**: The **actual database engine**. It handles data storage, indexing, and SQL query execution.
- **phpMyAdmin (`phpmyadmin:5`)**: A **Web UI application**. It contains **NO database server**. It acts purely as a visual dashboard (like MySQL Workbench) that communicates over the network to the MySQL engine.

---

## 🚀 4. How to Use & Commands Reference

### Automated Setup
```powershell
npm run setup
```

### Manual Docker Commands
```bash
# Start all containers in the background
npm run docker:up     # or: docker compose up -d --build

# View real-time logs for all services
npm run docker:logs   # or: docker compose logs -f

# Stop and remove containers
npm run docker:down   # or: docker compose down
```

---

## 🌐 5. Service URLs & Credentials

| Service | Access URL | Default Credentials |
| :--- | :--- | :--- |
| **Express App API** | `http://localhost:8000` | N/A |
| **Database Connection Test** | `http://localhost:8000/db-test` | N/A |
| **phpMyAdmin Web UI** | `http://localhost:8080` | **Username**: `root`<br>**Password**: `root_password` |

---

## 🐘 Alternative Database Setup

Looking to use PostgreSQL and pgAdmin 4 instead of MySQL and phpMyAdmin? Check out the dedicated guide:
👉 **[docs/POSTGRESQL_ALTERNATIVE.md](POSTGRESQL_ALTERNATIVE.md)**

