# Daily Task Manager

A to-do list application with a calendar view, allowing users to create, view, mark complete, and delete tasks organized by date.

## Features

- User registration and login with JWT authentication
- Create tasks tied to specific dates
- View tasks in a calendar layout
- Fetch tasks by date range
- Mark tasks as done
- Delete tasks
- Each task is linked to its owning user (tasks are private per user)

## Tech Stack

**Backend:** Spring Boot, Spring Security + JWT, Spring Data JPA, MySQL

**Frontend:** React, FullCalendar, Tailwind CSS

## Project Structure

```
├── entity/
│   ├── User
│   └── Task            # ManyToOne relation to User
├── controller/
│   ├── AuthController    # register, login
│   └── TaskController     # CRUD + date-range queries
├── service/
├── repository/
└── security/            # JWT auth filter & config
```

## Key API Routes

| Route | Description |
|---|---|
| `POST /auth/register` | Register a new user |
| `POST /auth/login` | Login, returns JWT |
| `POST /tasks` | Create a new task |
| `GET /tasks` | Get all tasks for the logged-in user |
| `GET /tasks?from=&to=` | Get tasks within a date range |
| `PUT /tasks/{id}/done` | Mark a task as complete |
| `DELETE /tasks/{id}` | Delete a task |

## Getting Started

### Backend
```bash
cd daily-task-manager-backend
mvn spring-boot:run
```
Configure MySQL connection details and JWT secret in `application.properties` before running.

### Frontend
```bash
cd daily-task-manager-frontend
npm install
npm run dev
```

## Evaluation Criteria (for grading context)

This project was built to be assessed on: code reusability & structure, problem-solving approach, functional completeness, code efficiency, error handling & validations, naming conventions & comments, frontend quality, and bonus features.
