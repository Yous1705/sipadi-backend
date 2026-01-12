# Sipadi Backend

## 🔧 Project Overview

**Sipadi Backend** is a RESTful API built with NestJS and Prisma for managing school operations (users, students, teachers, classes, assignments, attendance, and submissions). This repository provides authentication using JWT, role-based access control (ADMIN / TEACHER / STUDENT), and a set of endpoints for admin, teacher, and student workflows.

---

## 🚀 Features

- JWT authentication and role-based access control
- Student, Teacher, and Admin management
- Classes and teaching assignments
- Assignment creation, submission, grading
- Attendance sessions and attendance tracking
- Built using NestJS, Prisma (Postgres/MySQL/SQLite), and TypeScript

---

## 🧰 Tech Stack

- Node.js + TypeScript
- NestJS
- Prisma (ORM)
- PostgreSQL / MySQL / SQLite (via Prisma)
- Jest for testing

---

## ⚙️ Prerequisites

- Node.js 18+ (or the version you use in the project)
- pnpm / npm / yarn
- A database (Postgres, MySQL, SQLite, etc.)

---

## 📝 Environment Variables

Create a `.env` in the root and set at least:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
JWT_SECRET_KEY="your_jwt_secret"
PORT=3000
```

Notes:

- `DATABASE_URL` is used by Prisma.
- `JWT_SECRET_KEY` is used for signing JWT tokens.

---

## 🔁 Install & Run

1. Install dependencies:

```bash
pnpm install
# or
npm install
```

2. Run database migrations (example with Prisma):

```bash
npx prisma migrate deploy
# or for development
npx prisma migrate dev --name init
```

3. Build & start the server:

```bash
pnpm start:dev
# or
npm run start:dev
```

The app runs on `http://localhost:3000` (or `process.env.PORT`).

---

## ✅ Useful Scripts

- Start dev server: `pnpm start:dev`
- Build: `pnpm build`
- Start production: `pnpm start:prod`
- Tests: `pnpm test`

---

## 📂 Project Structure

Top-level important folders/files:

```
src/
  auth/                # Authentication (login, guards)
  admin/               # Admin controllers and logic
  teacher/             # Teacher endpoints and logic
  student/             # Student endpoints and logic
  assignment/          # Assignment domain logic
  submission/          # Submission and grading
  attendance/          # Attendance handling
  attendance-session/  # Attendance session management
  classes/             # Class management
  teaching/            # Teaching assignment logic
  prisma/              # Prisma service & module
  app.module.ts
  main.ts
prisma/
  schema.prisma
package.json
README.md
```

> The controllers define the HTTP routes and role restrictions.

---

## 🔐 Authentication

This API uses **JWT**. After you log in, you'll receive an access token:

```json
{ "access_token": "<JWT_TOKEN>" }
```

Use the token in `Authorization: Bearer <token>` header for protected routes.

---

## 📡 API Endpoints (Overview & Examples)

Base URL: `http://localhost:3000`

Note: endpoints below show the path, brief description, and an example curl request. Replace `<TOKEN>` with a valid JWT.

### Auth

- POST /auth/login — Login and receive JWT

Example:

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret"}'
```

Response:

```json
{ "access_token": "..." }
```

- POST /auth/register-admin — Register an admin

```bash
curl -s -X POST http://localhost:3000/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"secret"}'
```

### Admin (Requires ADMIN role)

- POST /admin/students — Create student

```bash
curl -X POST http://localhost:3000/admin/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Student A","email":"student@example.com","password":"secret","classId":1}'
```

- POST /admin/teachers — Create teacher

```bash
curl -X POST http://localhost:3000/admin/teachers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Teacher A","email":"teacher@example.com","password":"secret"}'
```

- GET /admin/users — List all users

```bash
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer <TOKEN>"
```

- Classes endpoints: GET /admin/classes, POST /admin/classes, PATCH /admin/classes/:id, DELETE /admin/classes/:id

Example create class:

```bash
curl -X POST http://localhost:3000/admin/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Class A","year":2025}'
```

- Attendance session management (admin):
  - POST /admin/attendance-session
  - PATCH /admin/attendance-session/:id/close
  - PATCH /admin/attendance-session/:id/force-close

### Teacher (Requires TEACHER role)

- POST /teacher/assignment — Create an assignment

```bash
curl -X POST http://localhost:3000/teacher/assignment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Assignment 1","description":"Write an essay","dueDate":"2026-02-01T00:00:00.000Z","teachingAssigmentId":1}'
```

- PATCH /teacher/assignments/:id/publish — Publish assignment
- PATCH /teacher/assignments/:id/close — Close assignment
- GET /teacher/assignments — List teacher's assignments
- PATCH /teacher/submission/:id/grade — Grade a submission

- Attendance session (teacher):
  - POST /teacher/attendance-session — open a session
  - PATCH /teacher/attendance-session/:id/close — close a session
  - GET /teacher/attendance-session/:id — get session details
  - GET /teacher/attendance-session/:id/attendances — list attendances for session
  - PATCH /teacher/attendances/:id — update attendance
  - POST /teacher/attendances/bulk — create attendance in bulk

### Student (Requires STUDENT role)

- POST /student/assignments/submission — Submit an assignment

```bash
curl -X POST http://localhost:3000/student/assignments/submission \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"assignmentId":5,"fileUrl":"https://example.com/submission.pdf"}'
```

- GET /student/dashboard — Get student's dashboard
- GET /student/assignments — List assignments for student
- GET /student/assignments/:id — Get assignment detail
- GET /student/attendances — Get student's attendances
- POST /student/attendance/session — Attend session (based on session DTO)
- POST /student/attendance — Mark attendance (student)

---

## 📌 Validation & DTOs

This project uses class-validator for DTO validation. Requests that do not satisfy DTO constraints will return 400 with relevant validation messages.

---

## 🧪 Testing

Run tests with:

```bash
pnpm test
# or
npm test
```

End-to-end tests are available with `pnpm test:e2e`.

---

## 💡 Tips & Notes

- Use a Postman or HTTP client to manage tokens and test protected endpoints quickly.
- Ensure your `JWT_SECRET_KEY` is set before starting the app to avoid runtime errors.
- Prisma migrations and seeding are managed via `npx prisma` commands — adapt to your DB provider.

---

## 🤝 Contributing

Contributions are welcome — open an issue or a pull request with a clear description, tests, and any migration steps.

---

## 📄 License

This project is marked as UNLICENSED in `package.json`. Update as necessary.

---

If you'd like, I can also:

- Add Postman collection examples
- Create example .env.sample
- Add more detailed request/response examples for each endpoint

---

Happy hacking! 👩‍💻👨‍💻
