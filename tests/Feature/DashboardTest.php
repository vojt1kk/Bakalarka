<?php

declare(strict_types=1);

use App\Models\Exercise;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function (): void {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function (): void {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard displays exercise count', function (): void {
    $user = User::factory()->create();
    Exercise::factory()->count(5)->create();

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('dashboard')
            ->where('exerciseCount', 5)
        );
});
