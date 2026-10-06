<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExerciseSeeder extends Seeder
{
    /**
     * Seed the exercise catalogue and remove exercises that are no longer part of it.
     */
    public function run(): void
    {
        $exercises = [
            [
                'name' => 'Squat',
                'description' => 'Basic bodyweight squat exercise.',
                'instructions' => 'Stand with feet shoulder-width apart. Lower your hips back and down as if sitting into a chair. Keep your chest up and knees tracking over your toes. Descend until thighs are parallel to the ground, then drive back up.',
                'ppl_type' => null,
                'ul_type' => null,
                'muscle_types' => json_encode(['quads', 'glutes', 'hamstrings', 'core']),
                'video_path' => '',
            ],
        ];

        DB::table('exercises')
            ->whereNotIn('name', array_column($exercises, 'name'))
            ->delete();

        foreach ($exercises as $exercise) {
            DB::table('exercises')->updateOrInsert(
                ['name' => $exercise['name']],
                array_merge($exercise, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]),
            );
        }
    }
}
