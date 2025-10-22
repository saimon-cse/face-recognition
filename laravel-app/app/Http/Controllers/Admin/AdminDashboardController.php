<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Course;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard with high-level stats.
     */
    public function __invoke(Request $request)
    {
        $stats = [
            'courses' => Course::count(),
            'students' => Student::count(),
            'attendance' => Attendance::count(),
            'todayAttendance' => Attendance::whereDate('recorded_at', Carbon::today())->count(),
        ];

        $recentAttendance = Attendance::query()
            ->with(['student', 'course'])
            ->latest('recorded_at')
            ->limit(10)
            ->get();

        $recentCourses = Course::query()
            ->latest()
            ->limit(5)
            ->get();

        return view('admin.dashboard', [
            'stats' => $stats,
            'recentAttendance' => $recentAttendance,
            'recentCourses' => $recentCourses,
        ]);
    }
}
