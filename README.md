## AI Job Market + Collaboration Platform (Java + React)

This repo contains a full-stack **live collaboration platform**:

- **Backend**: Java 21, Spring Boot, PostgreSQL, JWT auth, WebSockets (STOMP) for presence/chat/notifications
- **Frontend**: React + TypeScript + MUI, real-time updates via WebSocket

### What you get

- User accounts + JWT authentication
- User profiles with skills
- Projects marketplace (create/join/members)
- **Live presence**: see who is currently in a project (real-time)
- Tasks + contributions
- **Top contributed projects** leaderboard
- Project chat (real-time)

### Quick start (local)

1) Start Postgres

```bash
docker compose up -d
```

2) Run backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend: `http://localhost:8080`  
Swagger: `http://localhost:8080/swagger-ui/index.html`

3) Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

### Environment variables

Backend (optional overrides):
- `SPRING_DATASOURCE_URL` (default `jdbc:postgresql://localhost:5432/aimarket`)
- `SPRING_DATASOURCE_USERNAME` (default `aimarket`)
- `SPRING_DATASOURCE_PASSWORD` (default `aimarket`)
- `APP_JWT_SECRET` (default is for local dev only; change in production)

