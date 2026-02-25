<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExerciseSeeder extends Seeder
{
    public function run(): void
    {
        $exercises = [
            [
                'name' => 'Bench press',
                'description' => 'Tlak na rovné lavici',
                'instructions' => 'Lehni si, chyť činku, tlač nahoru.',
                'ppl_type' => 'push',
                'ul_type' => 'upper',
                'muscle_types' => json_encode(['chest', 'shoulders', 'triceps']),
                'video_path' => null,
            ],
            [
                'name' => 'Squat',
                'description' => 'Basic bodyweight squat exercise.',
                'instructions' => 'Stand with feet shoulder-width apart. Lower your hips back and down as if sitting into a chair. Keep your chest up and knees tracking over your toes. Descend until thighs are parallel to the ground, then drive back up.',
                'ppl_type' => null,
                'ul_type' => null,
                'muscle_types' => json_encode(['quads', 'glutes', 'hamstrings', 'core']),
                'video_path' => null,
            ],
        ];

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
