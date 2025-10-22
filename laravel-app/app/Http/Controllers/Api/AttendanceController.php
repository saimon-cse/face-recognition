<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Course;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function index(Course $course): JsonResponse
    {
        $rows = Attendance::query()
            ->select([
                'attendance.id',
                'attendance.student_id as studentId',
                'students.name as studentName',
                'attendance.course_id as courseId',
                'courses.name as courseName',
                'attendance.recorded_at as recordedAt',
            ])
            ->join('students', 'students.id', '=', 'attendance.student_id')
            ->join('courses', 'courses.id', '=', 'attendance.course_id')
            ->where('attendance.course_id', $course->id)
            ->orderByDesc('attendance.recorded_at')
            ->get();

        return response()->json($rows);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        $studentId = (int) $request->input('studentId', 0);
        $timestamp = $request->input('timestamp');

        if ($studentId <= 0) {
            return response()->json([
                'message' => 'Invalid course or student id.',
            ], 400);
        }

        try {
            $recordedAt = $timestamp
                ? Carbon::parse($timestamp, config('app.timezone'))
                : now();
        } catch (\Exception $exception) {
            return response()->json([
                'message' => 'Invalid timestamp.',
            ], 400);
        }

        $payload = DB::transaction(function () use ($course, $studentId, $recordedAt) {
            $student = Student::query()
                ->where('id', $studentId)
                ->where('course_id', $course->id)
                ->lockForUpdate()
                ->first();

            if (!$student) {
                return null;
            }

            $attendance = Attendance::create([
                'student_id' => $student->id,
                'course_id' => $course->id,
                'recorded_at' => $recordedAt,
            ]);

            return Attendance::query()
                ->select([
                    'attendance.id',
                    'attendance.student_id as studentId',
                    'students.name as studentName',
                    'attendance.course_id as courseId',
                    'courses.name as courseName',
                    'attendance.recorded_at as recordedAt',
                ])
                ->join('students', 'students.id', '=', 'attendance.student_id')
                ->join('courses', 'courses.id', '=', 'attendance.course_id')
                ->where('attendance.id', $attendance->id)
                ->first();
        });

        if (!$payload) {
            return response()->json([
                'message' => 'Student not found in this course.',
            ], 404);
        }

        return response()->json($payload, 201);
    }
}
