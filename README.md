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

## Database ERD

![Database ERD](<public/images/prisma-erd%20(1).svg>)

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

### Admin Endpoints

#### Dashboard

- `GET /admin/dashboard`: Get admin dashboard overview.

#### Users

- `POST /admin/students`: Create a new student.
- `POST /admin/teachers`: Create a new teacher.
- `PATCH /admin/users/:id/reset-password`: Reset user password.
- `PATCH /admin/users/:id/role`: Change user role.
- `GET /admin/users`: List all users (with optional filters: role, isActive).
- `GET /admin/users/:id`: Get user by ID.
- `GET /admin/users/role/:role`: Get users by role.
- `GET /admin/classes/:id/users`: Get users in a class.

#### Classes

- `GET /admin/classes`: List all classes.
- `GET /admin/classes/by-name/:name/:year`: Find class by name and year.
- `GET /admin/classes/:id`: Get class by ID.
- `POST /admin/classes`: Create a new class.
- `PATCH /admin/classes/:id`: Update class.
- `DELETE /admin/classes/:id`: Delete class.
- `POST /admin/classes/homeroom`: Assign homeroom teacher.
- `PATCH /admin/classes/student/move`: Move student to another class.
- `PATCH /admin/classes/student/:id/remove-class`: Remove student from class.

#### Teaching Assignments

- `GET /admin/teaching-assignments`: List all teaching assignments.
- `POST /admin/teaching-assignments`: Assign teacher to class and subject.
- `DELETE /admin/teaching-assignments/:id`: Unassign teacher.

#### Subjects

- `GET /admin/subjects`: List all subjects.
- `POST /admin/subjects`: Create a new subject.
- `PATCH /admin/subjects/:id`: Update subject.
- `DELETE /admin/subjects/:id`: Delete subject.

#### Attendance Sessions

- `PATCH /admin/attendance-session/:id/close`: Close attendance session.

#### Attendances

- `GET /admin/attendances`: Get attendances (with query filters).
- `PATCH /admin/attendances/:id`: Update attendance.

#### Reports

- `GET /admin/reports/class/:classId`: Get class summary report.
- `GET /admin/reports/teaching/:teachingId/grades`: Get grade report for teaching.
- `GET /admin/reports/class/:classId/export`: Export class report (CSV/XLSX).

### Teacher Endpoints

#### Assignments

- `POST /teacher/assignments`: Create assignment.
- `PATCH /teacher/assignments/:id`: Update assignment.
- `GET /teacher/assignments`: List teacher's assignments (with optional teachingAssigmentId filter).
- `GET /teacher/assignments/:id`: Get assignment by ID.
- `GET /teacher/assignments/:id/detail`: Get assignment detail.
- `PATCH /teacher/assignments/:id/publish`: Publish assignment.
- `PATCH /teacher/assignments/:id/close`: Close assignment.
- `DELETE /teacher/assignments/:id`: Soft delete assignment.
- `DELETE /teacher/assignments/:id/hard`: Hard delete assignment.
- `GET /teacher/assignments/:id/submissions`: Get submissions for assignment.

#### Submissions

- `PATCH /teacher/submissions/:id/grade`: Grade submission.
- `PATCH /teacher/submissions/:id/reset-grade`: Reset grade.

#### Reports

- `GET /teacher/reports/teaching/:id/grades`: Get grade report.
- `GET /teacher/reports/teaching/:id/grades/export`: Export grade report (CSV/XLSX).
- `GET /teacher/reports/class/:id/export`: Export class report (CSV/XLSX).
- `GET /teacher/reports/class/:id`: Get class summary report.

#### Teachings

- `GET /teacher/teachings`: Get teacher's teachings.
- `GET /teacher/teachings/:id/students`: Get students in teaching.
- `GET /teacher/teachings/:id/assignment`: Get assignments in teaching.
- `GET /teacher/homeroom/class`: Get homeroom class.

#### Attendance Sessions

- `POST /teacher/attendance-sessions`: Open attendance session.
- `DELETE /teacher/attendance-sessions/:id`: Delete attendance session.
- `PATCH /teacher/attendance-sessions/:id/close`: Close attendance session.
- `GET /teacher/attendance-sessions/teaching/:id`: List sessions by teaching.
- `GET /teacher/attendance-sessions/:id/detail`: Get session detail with students.
- `GET /teacher/attendance-sessions/:id/attendances`: Get attendances for session.
- `GET /teacher/attendance-sessions/teaching/:id/progress`: Get attendance progress.
- `PATCH /teacher/attendance-sessions/:id`: Update attendance session.

#### Attendances

- `PATCH /teacher/attendances/:id`: Update attendance.
- `POST /teacher/attendances/bulk`: Bulk create attendances.

### Student Endpoints

- `GET /student/dashboard`: Get student dashboard.
- `GET /student/subjects`: Get student's subjects.
- `GET /student/subjects/:teachingAssigmentId`: Get subject hub.
- `GET /student/classes`: Get student's classes.
- `GET /student/classes/:classId`: Get class detail.
- `GET /student/assignments/:assignmentId`: Get assignment detail.
- `POST /student/assignments/:id/submission/url`: Submit assignment via URL.
- `POST /student/assignments/:id/submission/file`: Submit assignment via file upload.
- `GET /student/attendance/session/:sessionId`: Get attendance session detail.
- `GET /student/classes/:classId/attendance/active`: Get active attendance sessions.
- `GET /student/classes/:classId/attendance/history`: Get attendance history.
- `GET /student/classes/:classId/assignments/history`: Get assignment history.
- `POST /student/attendance`: Mark attendance.

All protected endpoints require `Authorization: Bearer <JWT_TOKEN>` header.

## Role & Permission Overview

- **ADMIN**: Full access to manage users, classes, teaching assignments, subjects, attendance, and generate reports.
- **TEACHER**: Can create and manage assignments, grade submissions, manage attendance sessions, and generate reports for their teachings.
- **STUDENT**: Can view assignments, submit work (URL or file), view attendance history, and mark attendance for active sessions.

Permissions are enforced via JWT strategy and role guards.

## Live Demo

[https://sipadi-backend-production.up.railway.app/](https://sipadi-backend-production.up.railway.app/)

## Author

[Yous Markus Syalom Sibarani]
