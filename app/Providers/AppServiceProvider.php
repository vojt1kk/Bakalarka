<?php

declare(strict_types=1);

namespace App\Providers;

use App\Http\Integrations\Gemini\GeminiConnector;
use App\Support\Macros\Testing\AssertApiStructure;
use App\Support\Macros\Testing\AssertPaginatedApiCount;
use App\Support\Macros\Testing\AssertPaginatedApiStructure;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Testing\TestResponse;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(GeminiConnector::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (str_starts_with((string) config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }

        $this->configureDefaults();
        $this->configureTesting();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }

    private function configureTesting(): void
    {
        TestResponse::macro('assertApiStructure', (new AssertApiStructure)());
        TestResponse::macro('assertPaginatedApiStructure', (new AssertPaginatedApiStructure)());
        TestResponse::macro('assertPaginatedApiCount', (new AssertPaginatedApiCount)());
    }
}
