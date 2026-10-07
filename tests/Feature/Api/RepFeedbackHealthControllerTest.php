<?php

declare(strict_types=1);

use App\Models\Exercise;

use function Pest\Laravel\getJson;

it('returns no content for an existing exercise', function (): void {
    $exercise = Exercise::factory()->create();

    getJson("/api/exercises/{$exercise->id}/rep-feedback/health")
        ->assertNoContent();
});

it('returns not found for an unknown exercise', function (): void {
    getJson('/api/exercises/999999/rep-feedback/health')
        ->assertNotFound();
});
