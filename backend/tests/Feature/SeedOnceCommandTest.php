<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeedOnceCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeds_an_empty_database(): void
    {
        $this->artisan('db:seed-once')->assertSuccessful();

        $this->assertTrue(User::query()->where('role', 'admin')->exists());
        $this->assertGreaterThan(0, Product::query()->count());
    }

    public function test_does_not_overwrite_existing_data(): void
    {
        $this->artisan('db:seed-once')->assertSuccessful();
        $product = Product::query()->where('sku', 'TEC-001')->firstOrFail();
        $product->update(['name' => 'Nombre editado desde el panel']);

        $this->artisan('db:seed-once')
            ->expectsOutputToContain('se omite la siembra')
            ->assertSuccessful();

        $this->assertSame('Nombre editado desde el panel', $product->fresh()->name);
    }
}
