# SIPADI Backend

## Project Description

SIPADI Backend is a RESTful API designed to manage educational institution operations, including user management, class administration, assignments, submissions, attendance tracking, and reporting. It addresses the need for a centralized system to handle student performance assessment, teacher workflows, and administrative oversight in schools or similar environments.

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest
- **Package Manager**: pnpm

## Architecture Overview

The application follows a modular architecture using NestJS, with clear separation of concerns:

- **Controllers**: Handle HTTP requests and responses for each domain (Auth, Admin, Teacher, Student, etc.).
- **Services**: Contain business logic and interact with repositories.
- **Repositories**: Manage data access and database queries via Prisma.
- **Modules**: Organize related components (e.g., Auth, Assignment, Attendance).
- **DTOs**: Define data transfer objects for request/response validation.
- **Guards**: Implement role-based access control using JWT strategy.

The architecture supports scalability through dependency injection and modular design, with Prisma handling database interactions.

## Features

- User authentication and authorization with JWT
- Role-based access control (Admin, Teacher, Student)
- Student and teacher management
- Class and teaching assignment management
- Assignment creation, submission, and grading with file/URL support
- Attendance session management and tracking
- Report generation for grades and class summaries with export (CSV, XLSX)
- File upload handling for submissions

## Database Design

The database schema includes the following key entities and relationships:

- **User**: Represents users (students, teachers, admins) with fields like id, name, email, password, role (STUDENT, TEACHER, ADMIN), isActive, and optional classId for students.
- **Class**: Defines classrooms with id, name, year, isActive, and homeroomTeacherId linking to a User.
- **Subject**: Academic subjects with id and name.
- **TeachingAssigment**: Links teachers to classes and subjects (unique combination of teacherId, classId, subjectId).
- **Assignment**: Tasks created by teachers with title, description, dueDate, status (DRAFT, PUBLISHED, CLOSED), submissionPolicy, and teachingAssigmentId.
- **Submission**: Student submissions for assignments, including fileUrl, url, score, feedback, and relationships to assignment, student, and gradedBy (teacher).
- **AttendanceSession**: Sessions for attendance with teachingAssigmentId, openAt, closeAt, isActive.
- **Attendance**: Records with status (HADIR, IZIN, SAKIT, ALPHA), studentId, attendanceSessionId, and createById.

Relationships:

- User belongs to Class (for students), has many TeachingAssigments (for teachers), and has many Submissions/Attendances.
- Class has many Users (students), one homeroomTeacher, and many TeachingAssigments.
- TeachingAssigment belongs to User (teacher), Class, Subject; has many Assignments, Attendances, AttendanceSessions.
- Assignment belongs to TeachingAssigment; has many Submissions.
- Submission belongs to Assignment, User (student), and optional User (gradedBy).
- AttendanceSession belongs to TeachingAssigment; has many Attendances.
- Attendance belongs to User (student), AttendanceSession, TeachingAssigment, and User (createdBy).

## API Flow

1. **Authentication**: Users log in via `POST /auth/login` with email/password to receive a JWT token.
2. **Authorization**: Subsequent requests include the JWT in the Authorization header. Guards validate user roles for protected routes.
3. **Request Flow**: Requests are routed to controllers, which delegate to services. Services interact with repositories for data operations. Responses are validated and returned, with file uploads handled via Multer.
4. **Main Flow**: Admins manage system-wide entities; Teachers create assignments, grade submissions, and manage attendance; Students submit assignments and mark attendance.

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm (or npm/yarn)
- PostgreSQL database server

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/sipadi_db"
JWT_SECRET_KEY="your_secure_jwt_secret_key"
PORT=3000
```

### Database Setup

1. Ensure PostgreSQL is running and create a database.
2. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. (Optional) Seed the database if needed:
   ```bash
   npx prisma db seed
   ```

### Run Commands

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the development server:
   ```bash
   pnpm start:dev
   ```
3. The API will be available at `http://localhost:3000`.

## API Documentation

### Authentication Endpoints

- `POST /auth/login`: Authenticate user and return JWT token.
- `POST /auth/register-admin`: Register a new admin user.

### Main Resource Endpoints

- **Teacher**:
  - `POST /teacher/assignments`: Create assignment.
  - `GET /teacher/assignments`: List teacher's assignments.
  - `PATCH /teacher/assignments/:id/publish`: Publish assignment.
  - `PATCH /teacher/assignments/:id/close`: Close assignment.
  - `PATCH /teacher/submissions/:id/grade`: Grade submission.
  - `GET /teacher/reports/teaching/:id/grades`: Get grade report.
  - `GET /teacher/reports/class/:id/export`: Export class report (CSV/XLSX).
  - `POST /teacher/attendance-sessions`: Open attendance session.
  - `PATCH /teacher/attendance-sessions/:id/close`: Close attendance session.
  - `PATCH /teacher/attendances/:id`: Update attendance.
- **Student**:
  - `GET /student/dashboard`: Get student dashboard.
  - `POST /student/assignments/:id/submission/url`: Submit assignment via URL.
  - `POST /student/assignments/:id/submission/file`: Submit assignment via file upload.
  - `GET /student/classes/:classId/attendance/active`: Get active attendance sessions.
  - `POST /student/attendance`: Mark attendance.

All protected endpoints require `Authorization: Bearer <JWT_TOKEN>` header.

## Role & Permission Overview

- **ADMIN**: Full access to manage users, classes, and system-wide operations (endpoints currently commented out in code).
- **TEACHER**: Can create and manage assignments, grade submissions, manage attendance sessions, and generate reports for their teachings.
- **STUDENT**: Can view assignments, submit work (URL or file), view attendance history, and mark attendance for active sessions.

Permissions are enforced via JWT strategy and role guards.

## Error Handling Strategy

The API uses NestJS built-in exception handling:

- Validation errors (400) for invalid input data.
- Unauthorized (401) for missing/invalid JWT.
- Forbidden (403) for insufficient permissions.
- Not Found (404) for missing resources.
- Internal Server Error (500) for unexpected issues.

Custom exceptions like `ForbiddenException` are used for business logic violations. Responses include error messages for debugging.

## Security Considerations

- JWT tokens are used for stateless authentication with secure secrets.
- Passwords are hashed before storage.
- Input validation via DTOs prevents injection attacks.
- Role-based guards restrict access to sensitive endpoints.
- File uploads are limited to 2MB and stored securely.
- HTTPS should be enforced in production.
- Environment variables protect sensitive data like database credentials and JWT secrets.

## Future Improvements

- Implement refresh tokens for better session management.
- Add API rate limiting to prevent abuse.
- Integrate with external services (e.g., email notifications for assignments).
- Enhance reporting with more analytics and visualizations.
- Add unit and integration tests for better coverage.
- Implement caching for improved performance on frequent queries.
- Add admin endpoints for full CRUD operations on users and classes.

## Author

[Your Name or Team Name]
