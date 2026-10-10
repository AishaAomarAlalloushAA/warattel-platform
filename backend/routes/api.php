<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AchievementController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\ActivityTypeController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminOptionsController;
use App\Http\Controllers\Api\AdminPartExamController;
use App\Http\Controllers\Api\AdminReportController;
use App\Http\Controllers\Api\AdminStudentController;
use App\Http\Controllers\Api\AdminSupervisorAccountController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\EducationalLinkController;
use App\Http\Controllers\Api\ErrorController;
use App\Http\Controllers\Api\LectureController;
use App\Http\Controllers\Api\LevelController;
use App\Http\Controllers\Api\LevelExamController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\StudentPortalController;
use App\Http\Controllers\Api\SuggestionController;
use App\Http\Controllers\Api\SupervisorController;
use App\Http\Controllers\Api\VolunteerFormController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:login');
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/forgot-password', [PasswordResetController::class, 'forgot'])->middleware('throttle:password-reset');
Route::post('/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:password-reset');

Route::post('/suggestions', [SuggestionController::class, 'store'])->middleware('throttle:20,1');
Route::post('/volunteer-forms', [VolunteerFormController::class, 'store'])->middleware('throttle:10,1');
Route::get('/lectures', [LectureController::class, 'publicIndex']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LogoutController::class, 'logout']);
    Route::get('/me', [AccountController::class, 'show']);
    Route::patch('/me/profile', [AccountController::class, 'updateProfile']);
    Route::put('/change-password', [AccountController::class, 'changePassword']);

    Route::middleware('role:student')->prefix('student')->group(function () {
        Route::get('/dashboard', [StudentPortalController::class, 'dashboard']);
        Route::get('/profile', [StudentPortalController::class, 'profile']);
        Route::get('/level', [StudentPortalController::class, 'level']);
        Route::get('/reports', [StudentPortalController::class, 'reports']);
        Route::get('/exams', [StudentPortalController::class, 'exams']);
        Route::get('/activities', [StudentPortalController::class, 'activities']);
        Route::get('/achievements', [StudentPortalController::class, 'achievements']);
        Route::get('/links', [StudentPortalController::class, 'links']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard', AdminDashboardController::class);

        Route::apiResource('levels', LevelController::class);
        Route::apiResource('supervisors', SupervisorController::class);
        Route::apiResource('errors', ErrorController::class);
        Route::apiResource('activity-types', ActivityTypeController::class);
        Route::apiResource('activities', ActivityController::class);
        Route::apiResource('volunteer-forms', VolunteerFormController::class)->except(['store']);
        Route::apiResource('suggestions', SuggestionController::class)->only(['index', 'destroy']);

        Route::prefix('admin')->group(function () {
            Route::get('/options', AdminOptionsController::class);
            Route::get('/supervisor-accounts', [AdminSupervisorAccountController::class, 'index']);
            Route::post('/supervisor-accounts', [AdminSupervisorAccountController::class, 'store']);

            Route::apiResource('students', AdminStudentController::class)->only(['index', 'store', 'show', 'update']);
            Route::apiResource('reports', AdminReportController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::apiResource('part-exams', AdminPartExamController::class)
                ->parameters(['part-exams' => 'partExam'])
                ->only(['index', 'store', 'update', 'destroy']);
            Route::apiResource('level-exams', LevelExamController::class)
                ->parameters(['level-exams' => 'levelExam']);
            Route::apiResource('achievements', AchievementController::class);
            Route::apiResource('educational-links', EducationalLinkController::class)
                ->parameters(['educational-links' => 'educationalLink']);
            Route::apiResource('lectures', LectureController::class);
        });
    });

    Route::middleware('role:supervisor')->prefix('supervisor')->group(function () {
        Route::get('/options', AdminOptionsController::class);
        Route::get('/students', [StudentController::class, 'myStudents']);
        Route::apiResource('reports', AdminReportController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::apiResource('part-exams', AdminPartExamController::class)
            ->parameters(['part-exams' => 'partExam'])
            ->only(['index', 'store', 'update', 'destroy']);
        Route::apiResource('level-exams', LevelExamController::class)
            ->parameters(['level-exams' => 'levelExam']);
    });
});
