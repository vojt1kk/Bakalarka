<?php

declare(strict_types=1);

use App\Models\Exercise;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('it renders the exercise show page with exercise data', function (): void {
    $user = User::factory()->create();
    $exercise = Exercise::factory()->create();

    $response = $this->actingAs($user)->get(route('exercises.detail', $exercise));

    $response->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('exercises/show')
            ->has('exercise.id')
            ->has('exercise.video_path')
            ->has('referenceAngles')
        );
});
