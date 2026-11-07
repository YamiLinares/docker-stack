<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HealthTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_reports_database_status_and_product_count(): void
    {
        Product::factory()->count(3)->create();

        $this->getJson('/api/health')
            ->assertOk()
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('service', 'laravel-api')
            ->assertJsonPath('database.status', 'ok')
            ->assertJsonPath('database.driver', DB::connection()->getDriverName())
            ->assertJsonPath('database.products', 3);
    }

    public function test_health_does_not_expose_connection_details(): void
    {
        $body = $this->getJson('/api/health')->assertOk()->getContent();

        $this->assertStringNotContainsString('password', $body);
        $this->assertStringNotContainsString('username', $body);

        $password = (string) config('database.connections.mysql.password');
        if ($password !== '') {
            $this->assertStringNotContainsString($password, $body);
        }
    }
}
