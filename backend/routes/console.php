<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
| Siembra los datos de demostración solo en una base de datos nueva.
| Docker Compose lo ejecuta en cada arranque (servicio "migrate"); como el
| ProductSeeder sincroniza por SKU, volver a sembrar desharía los cambios
| hechos desde el panel. Si ya existe algún usuario, no hace nada.
*/
Artisan::command('db:seed-once', function () {
    if (User::query()->exists()) {
        $this->info('La base de datos ya tiene datos: se omite la siembra.');

        return 0;
    }

    $this->call('db:seed', ['--class' => DatabaseSeeder::class, '--force' => true]);

    return 0;
})->purpose('Ejecuta los seeders solo si la base de datos está vacía');
