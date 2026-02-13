<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercises', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('video_path');
            $table->text('instructions');
            $table->string('ppl_type')->nullable();
            $table->string('ul_type')->nullable();
            $table->json('muscle_types');
            $table->timestamps();
        });
    }
};
