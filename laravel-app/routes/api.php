<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

Route::get('health', HealthController::class);

Route::get('courses', [CourseController::class, 'index']);
Route::post('courses', [CourseController::class, 'store']);

Route::prefix('courses/{course}')->group(function () {
    Route::get('students', [StudentController::class, 'index']);
    Route::post('students', [StudentController::class, 'store']);

    Route::get('attendance', [AttendanceController::class, 'index']);
    Route::post('attendance', [AttendanceController::class, 'store']);
});
