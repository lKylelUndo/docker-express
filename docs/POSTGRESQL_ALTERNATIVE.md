# 🐘 Alternative Database Setup: PostgreSQL & pgAdmin4

If you ever want to use **PostgreSQL** instead of MySQL in this project, this guide provides the exact configuration, concepts, and Docker Compose setup required.

---

## 💡 Concept: Database Engine vs Web GUI

Just like with MySQL and phpMyAdmin:

- **`postgres` Image**: The actual **PostgreSQL Database Engine**. It stores files, processes queries, and listens on port `5432`.
- **`dpage/pgadmin4` Image**: The **pgAdmin Web UI**. It contains **no database engine** of its own. It is a web dashboard that connects over the network to a PostgreSQL server.

| Component | MySQL Stack | PostgreSQL Alternative |
| :--- | :--- | :--- |
| **Database Engine** | `mysql:8.4` (Port 3306) | `postgres:16-alpine` (Port 5432) |
| **Web GUI Dashboard** | `phpmyadmin/phpmyadmin:5` (Port 8080) | `dpage/pgadmin4` (Port 5050) |

---

## 🛠️ PostgreSQL `docker-compose.yml` Example

Below is the complete `docker-compose.yml` configuration if you decide to switch your project to PostgreSQL:

```yaml
version: '3.8'

services:
  # ==========================================
  # 1. Express TypeScript Application
  # ==========================================
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: express_app
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=development
      - PORT=8000
      - DB_HOST=postgres_db
      - DB_USER=postgres
      - DB_PASSWORD=postgres_password
      - DB_NAME=express_db
      - DB_PORT=5432
    depends_on:
      db:
        condition: service_healthy
    restart: always

  # ==========================================
  # 2. PostgreSQL Database Service
  # ==========================================
  db:
    image: postgres:16-alpine # Lightweight official PostgreSQL image
    container_name: postgres_db
    ports:
      - "5432:5432" # Default PostgreSQL port
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres_password}
      POSTGRES_DB: ${DB_NAME:-express_db}
    volumes:
      - pg_data:/var/lib/postgresql/data # Persist PostgreSQL data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 5s
      timeout: 5s
      retries: 5

  # ==========================================
  # 3. pgAdmin 4 Web Management UI
  # ==========================================
  pgadmin:
    image: dpage/pgadmin4 # Official pgAdmin 4 image
    container_name: pgadmin_ui
    ports:
      - "5050:80" # Access pgAdmin at http://localhost:5050
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com # Login email for pgAdmin UI
      PGADMIN_DEFAULT_PASSWORD: adminpassword # Login password for pgAdmin UI
    depends_on:
      - db
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    restart: always

volumes:
  pg_data:       # Volume for PostgreSQL data
  pgadmin_data:  # Volume for pgAdmin settings & saved connections
```

---

## 🔑 How to Connect pgAdmin to PostgreSQL

1. Open **`http://localhost:5050`** in your browser.
2. Log in using:
   - **Email**: `admin@admin.com`
   - **Password**: `adminpassword`
3. Click **Add New Server**:
   - **Name**: `Docker Postgres`
   - **Connection tab**:
     - **Host name / address**: `db` (or `postgres_db`)
     - **Port**: `5432`
     - **Maintenance database**: `express_db`
     - **Username**: `postgres`
     - **Password**: `postgres_password`
