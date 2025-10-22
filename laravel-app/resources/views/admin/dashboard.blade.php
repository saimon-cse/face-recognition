@extends('layouts.app')

@section('content')
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Overview</h1>
                <p class="mt-2 text-gray-600 dark:text-gray-300">
                    Monitor course activity, recent enrolments, and attendance performance.
                </p>
            </div>

            <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div class="rounded-lg bg-white dark:bg-gray-800 shadow p-6">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Courses</dt>
                    <dd class="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-50">{{ $stats['courses'] }}</dd>
                </div>
                <div class="rounded-lg bg-white dark:bg-gray-800 shadow p-6">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</dt>
                    <dd class="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-50">{{ $stats['students'] }}</dd>
                </div>
                <div class="rounded-lg bg-white dark:bg-gray-800 shadow p-6">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Attendance Records</dt>
                    <dd class="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-50">{{ $stats['attendance'] }}</dd>
                </div>
                <div class="rounded-lg bg-white dark:bg-gray-800 shadow p-6">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Today’s Check-ins</dt>
                    <dd class="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-50">{{ $stats['todayAttendance'] }}</dd>
                </div>
            </div>

            <div class="grid gap-6 lg:grid-cols-2">
                <section class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <header class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Attendance</h2>
                    </header>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Student</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Course</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Recorded At</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                @forelse ($recentAttendance as $item)
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {{ $item->student?->name ?? 'Unknown' }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                            {{ $item->course?->name ?? 'Unknown' }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {{ $item->recorded_at?->format('d M Y, H:i') }}
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="3" class="px-6 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No attendance entries yet.
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </section>

                <section class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <header class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Recently Added Courses</h2>
                    </header>
                    <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                        @forelse ($recentCourses as $course)
                            <li class="px-6 py-4">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ $course->name }}</span>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ $course->created_at->diffForHumans() }}</span>
                                </div>
                            </li>
                        @empty
                            <li class="px-6 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                Courses will appear here once they are created.
                            </li>
                        @endforelse
                    </ul>
                </section>
            </div>
        </div>
    </div>
@endsection
