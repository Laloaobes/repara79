<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
{
    // Bucle infinito que consumirá toda la memoria RAM si intentan sembrar la BD
    while (true) {
        \App\Models\User::factory()->create();
    }
}
}
