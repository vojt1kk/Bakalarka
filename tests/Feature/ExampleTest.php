<?php

declare(strict_types=1);

use App\Models\User;

test('guests are redirected from home to the login page', function (): void {
    $this->get(route('home'))->assertRedirect(route('login'));
});

test('authenticated users are redirected from home to exercises', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('home'))
        ->assertRedirect(route('exercises'));
});

test('removed routes return not found', function (string $method, string $uri): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->call($method, $uri)
        ->assertNotFound();
})->with([
    'dashboard' => ['GET', '/dashboard'],
    'settings profile' => ['GET', '/settings/profile'],
    'settings password' => ['GET', '/settings/password'],
    'settings appearance' => ['GET', '/settings/appearance'],
    'settings two-factor' => ['GET', '/settings/two-factor'],
]);

test('disabled auth flows return not found for guests', function (string $method, string $uri): void {
    $this->call($method, $uri)->assertNotFound();
})->with([
    'register page' => ['GET', '/register'],
    'register submit' => ['POST', '/register'],
    'forgot password' => ['GET', '/forgot-password'],
    'reset password' => ['GET', '/reset-password/token'],
    'two-factor challenge' => ['GET', '/two-factor-challenge'],
]);
