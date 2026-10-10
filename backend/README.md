# Wratel Backend

Laravel API for **نادي ورتل**. Authentication uses Laravel Sanctum bearer tokens.

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

For production, configure at least `APP_URL`, database credentials, mail settings, `FRONTEND_URL`, and optionally `FRONTEND_URLS`.

## Public API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/login` | Login and receive Sanctum token |
| POST | `/api/register` | Register a student account |
| POST | `/api/forgot-password` | Send password reset link |
| POST | `/api/reset-password` | Reset password using token |
| POST | `/api/suggestions` | Submit feedback/suggestion |
| GET | `/api/lectures` | Public active lectures and activities |

## Authenticated account API

All routes below require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/me` | Current account/profile |
| PATCH | `/api/me/profile` | Update current profile |
| PUT | `/api/change-password` | Change password |
| POST | `/api/logout` | Revoke current token |
| POST | `/api/volunteer-forms` | Submit volunteer request |

## Student self-service API

Requires the `student` role. The student id is derived from the authenticated token and is never trusted from the client.

- `GET /api/student/dashboard`
- `GET /api/student/profile`
- `GET /api/student/level`
- `GET /api/student/reports`
- `GET /api/student/exams`
- `GET /api/student/activities`
- `GET /api/student/achievements`
- `GET /api/student/links`

## Admin API additions

Requires the `admin` role.

- `GET /api/admin/dashboard`
- Existing CRUD: students, levels, student-levels, persons, supervisors, errors, activity-types, student-supervisors, exams, exam-errors, reports, report-errors, activities, student-activities.
- Volunteer requests: admin can list/show/update/delete; submission is an authenticated-user route.
- `apiResource /api/admin/level-exams`
- `apiResource /api/admin/achievements`
- `apiResource /api/admin/educational-links`
- `apiResource /api/admin/lectures`

## Frontend contract notes

- Login returns `{ message, user, token }`.
- `user.role` is one of `student`, `admin`, `supervisor`.
- Student id is available at `user.role_data.student_id`.
- Registration password minimum is 8 characters and requires `password_confirmation`.
- Part exams use the existing `exams` table and include `score` and `result`.
- Level examinations are stored separately in `level_exams` because they contain target level, evaluation axes, notes, and final decision.
- Existing lecture content is preserved by `LectureSeeder`.

## Frontend origins

Local origins and the current Vercel deployment are supported by default. Override them with:

```env
FRONTEND_URL=https://example.com
FRONTEND_URLS=https://example.com,https://preview.example.com
```
