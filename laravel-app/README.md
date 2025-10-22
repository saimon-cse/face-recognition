# Face Attendance Laravel App

This repository is a Laravel 10 port of the original face-recognition attendance project.  
It ships a REST API for managing courses, students, face descriptors, and attendance logs, and serves the existing browser UI without requiring a separate Node server.

## Stack

- Laravel 10 (PHP 8.1+) for the API and web layer
- MySQL as the primary data store
- `face-api.js` (loaded from CDN) executing entirely in the browser

## Project structure

```
laravel-app/
├── app/Http/Controllers/Api      # REST endpoints compatible with the original Express API
├── app/Models                    # Eloquent models for courses, students, descriptors, attendance
├── database/migrations           # Schema aligned with db/schema.sql from the Node build
├── public/                       # Static assets (script.js, styles.css, models/)
└── resources/views/app.blade.php # Single-page UI served from the Laravel route
```

## Getting started

1. **Install dependencies**
   ```bash
   composer install
   npm install
   ```

2. **Environment configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Update the database section in `.env` to point at your MySQL instance.

3. **Create the schema**
   ```bash
   php artisan migrate
   ```

4. **Download face-api model weights**
   ```bash
   npm run download-models
   ```
   The weights are stored in `public/models` so the browser can load them from `/models`.

5. **Serve the application**
   ```bash
   php artisan serve
   ```
   Visit `http://127.0.0.1:8000` to use the UI. All fetch calls continue to hit `/api/...` just like the Express build.

## API overview

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET    | `/api/health` | Basic readiness probe |
| GET    | `/api/courses` | List courses (newest first) |
| POST   | `/api/courses` | Create or fetch a course by name |
| GET    | `/api/courses/{course}/students` | List students and their descriptor arrays |
| POST   | `/api/courses/{course}/students` | Create a student or append descriptors to an existing enrolment |
| GET    | `/api/courses/{course}/attendance` | Retrieve recorded attendance events |
| POST   | `/api/courses/{course}/attendance` | Record a recognition event |

Responses and validation semantics match the previous Express implementation to keep the front-end code unchanged.

## Authentication & Roles

- Laravel Breeze provides the login, registration, and password flows with Tailwind CSS and Vite.
- Role management is handled by [spatie/laravel-permission](https://spatie.be/docs/laravel-permission); three roles are pre-defined: `student`, `teacher`, and `staff`.
- During registration users choose their role, which is assigned immediately after the account is created.
- Remember to seed the roles after migrating:
  ```bash
  php artisan db:seed --class=RoleSeeder
  ```
- Protect sensitive routes with the shipped middleware aliases, e.g. `->middleware('role:staff')` or `->middleware('role_or_permission:teacher')`.

## Admin Panel

- Authenticated, verified users who hold the `staff` role can reach `/admin` for a Tailwind-powered overview.
- The dashboard surfaces total counts for courses, students, all attendance records, and today’s check-ins, plus the ten most recent attendance events and the latest courses created.
- Navigation elements automatically expose links back to the public attendance UI (`/` or `/attendance`) and to the admin dashboard when the current user has the correct role.

## Development tips

- Models are stored in `public/models`. If you already downloaded them previously, you can copy the directory directly instead of running the script.
- The UI assets are plain files in `public/`, so Vite is not required for everyday work. You may still use `npm run dev` if you plan to extend the front-end with modules.
- Tests are not included yet. Consider adding feature tests around the API endpoints before deploying to production.
