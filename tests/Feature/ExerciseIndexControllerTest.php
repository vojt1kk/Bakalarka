<?php

declare(strict_types=1);

use App\Models\Exercise;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function (): void {
    $response = $this->get(route('exercises'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can view the exercises list', function (): void {
    $user = User::factory()->create();
    $exercises = Exercise::factory()->count(3)->create();

    $response = $this->actingAs($user)->get(route('exercises'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('exercises/index')
            ->has('exercises', 3)
        );
});
