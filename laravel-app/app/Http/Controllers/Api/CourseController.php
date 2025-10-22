<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    public function index(): JsonResponse
    {
        $courses = Course::query()
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'created_at'])
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'name' => $course->name,
                'createdAt' => $course->created_at,
            ]);

        return response()->json($courses);
    }

    public function store(Request $request): JsonResponse
    {
        $name = trim((string) $request->input('name', ''));
        if ($name === '') {
            return response()->json([
                'message' => 'Course name is required.',
            ], 400);
        }

        $lowerName = Str::lower($name);

        $payload = DB::transaction(function () use ($name, $lowerName) {
            $existing = Course::query()
                ->whereRaw('LOWER(name) = ?', [$lowerName])
                ->lockForUpdate()
                ->first();

            if ($existing) {
                return [
                    'course' => [
                        'id' => $existing->id,
                        'name' => $existing->name,
                        'createdAt' => $existing->created_at,
                    ],
                    'created' => false,
                    'status' => 200,
                ];
            }

            $course = Course::create(['name' => $name]);

            return [
                'course' => [
                    'id' => $course->id,
                    'name' => $course->name,
                    'createdAt' => $course->created_at,
                ],
                'created' => true,
                'status' => 201,
            ];
        });

        return response()->json(
            [
                'course' => $payload['course'],
                'created' => $payload['created'],
            ],
            $payload['status']
        );
    }
}
