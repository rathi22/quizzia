# Quizzia 🎮

Quizzia is a trivia quiz web app built with **React (Vite)** and **Docker**.  
It’s designed to be simple, fast, and easy to run in any environment.

---

## 📦 Prerequisites

- [Docker](https://docs.docker.com/get-docker/)  
- [Docker Compose](https://docs.docker.com/compose/install/)  
- [Git](https://git-scm.com/)  

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/quizzia.git
cd quizzia
```

### 2. Build the container
```bash
docker compose build
```

### 3. Start the development server
```bash
docker compose up
```

### 4. Open in your browser
```
http://localhost:5173
```

You should see the default Vite + React welcome page 🎉

---

## 📂 Project Structure

```
quizzia/
├── Dockerfile.dev         # Development Dockerfile
├── docker-compose.yml     # Compose configuration
├── .dockerignore          # Files ignored by Docker
└── client/                # Vite + React app
    ├── src/               # React components and code
    ├── public/            # Static assets
    └── package.json       # Scripts and dependencies
```

---

## 🔧 Useful Commands

- Stop and remove containers + volumes:
  ```bash
  docker compose down -v
  ```
- Rebuild after changes:
  ```bash
  docker compose up --build
  ```
