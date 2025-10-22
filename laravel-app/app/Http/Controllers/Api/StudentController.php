<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\FaceDescriptor;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    public function index(Course $course): JsonResponse
    {
        $students = $course->students()
            ->with('descriptors')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Student $student) => $this->formatStudent($student));

        return response()->json($students);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        $name = trim((string) $request->input('name', ''));

        $descriptorsPayload = $request->input('descriptors');
        if (!is_array($descriptorsPayload)) {
            $singleDescriptor = $request->input('descriptor');
            $descriptorsPayload = $singleDescriptor ? [$singleDescriptor] : [];
        }

        if ($name === '') {
            return response()->json([
                'message' => 'Student name is required.',
            ], 400);
        }

        if (!count($descriptorsPayload)) {
            return response()->json([
                'message' => 'At least one face descriptor is required.',
            ], 400);
        }

        $normalizedDescriptors = collect($descriptorsPayload)
            ->map(function ($item) {
                if (!is_array($item)) {
                    return null;
                }

                $numbers = array_map('floatval', $item);
                return count($numbers) ? $numbers : null;
            })
            ->filter()
            ->values()
            ->all();

        if (!count($normalizedDescriptors)) {
            return response()->json([
                'message' => 'Provided descriptor payload is invalid.',
            ], 400);
        }

        $student = DB::transaction(function () use ($course, $name, $normalizedDescriptors) {
            $existing = Student::query()
                ->where('course_id', $course->id)
                ->whereRaw('LOWER(name) = ?', [Str::lower($name)])
                ->lockForUpdate()
                ->first();

            if (!$existing) {
                $existing = Student::create([
                    'course_id' => $course->id,
                    'name' => $name,
                ]);
            }

            foreach ($normalizedDescriptors as $descriptor) {
                FaceDescriptor::create([
                    'student_id' => $existing->id,
                    'descriptor' => $descriptor,
                ]);
            }

            return $existing->fresh(['descriptors']);
        });

        return response()->json(
            $this->formatStudent($student),
            201
        );
    }

    private function formatStudent(Student $student): array
    {
        return [
            'id' => $student->id,
            'courseId' => $student->course_id,
            'name' => $student->name,
            'createdAt' => $student->created_at,
            'descriptors' => $student->descriptors
                ->map(fn (FaceDescriptor $descriptor) => collect($descriptor->descriptor)
                    ->map(fn ($value) => (float) $value)
                    ->values()
                    ->all()
                )
                ->filter(fn ($values) => count($values))
                ->values()
                ->all(),
        ];
    }
}
