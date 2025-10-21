# Face Attendance Web App

This project contains a browser-based attendance application that recognises faces in real time and records attendance against a MySQL database through a small Express API layer.

## Architecture Overview

- **Frontend (static)**  
  `index.html`, `styles.css`, and `script.js` provide the UI, interact with the webcam via `getUserMedia`, run face detection in the browser with `face-api.js`, and communicate with the backend through fetch requests.

- **Backend (Node.js + Express)**  
  `server.js` exposes a REST API under `/api` for managing courses, students, face descriptors, and attendance sessions. It also serves the static frontend files so both layers can be hosted together.

- **Database (MySQL)**  
  The schema is defined in `db/schema.sql` and normalises key entities:
  - `courses` hold course metadata.
  - `students` attach people to a course.
  - `face_descriptors` stores one or more 128-length descriptor vectors per student.
  - `attendance` logs recognition events with timestamps.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set environment variables**  
   Copy `.env.example` to `.env` and set your MySQL connection details.

3. **Create the schema**
   ```bash
   mysql -u <user> -p <database> < db/schema.sql
   ```

4. **Run the server**
   ```bash
   npm start
   ```

5. **Use the app**  
   Browse to `http://localhost:3000`, create a course, enrol students (one face per capture), and start an attendance session.

## Key API Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/courses` | List courses |
| POST | `/api/courses` | Create or fetch a course by name |
| GET | `/api/courses/:courseId/students` | List students with saved descriptors |
| POST | `/api/courses/:courseId/students` | Add a new student or append a descriptor by name |
| GET | `/api/courses/:courseId/attendance` | List attendance events for the course |
| POST | `/api/courses/:courseId/attendance` | Record an attendance event |

All endpoints return JSON and validate inputs with helpful error responses.

## Next Steps

- Add authentication/authorisation if the app becomes multi-user.
- Implement reporting endpoints (per date range, export to CSV).
- Add face descriptor management (e.g., delete or retrain samples). 
