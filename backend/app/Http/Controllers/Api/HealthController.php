<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Estado del servicio para el frontend y para la verificación del ecosistema.
 *
 * A diferencia de /up (que solo confirma que Laravel arranca), este endpoint
 * ejecuta una consulta real en la base de datos. No devuelve credenciales,
 * nombres de host ni versiones: solo si cada pieza responde y cuánto tarda.
 */
class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $database = $this->checkDatabase();
        $healthy = $database['status'] === 'ok';

        return response()->json([
            'status' => $healthy ? 'ok' : 'degraded',
            'service' => 'laravel-api',
            'database' => $database,
            'checked_at' => now()->toIso8601String(),
        ], $healthy ? 200 : 503, ['Cache-Control' => 'no-store']);
    }

    /** @return array{status: string, driver: string, latency_ms: float|null, products: int|null} */
    private function checkDatabase(): array
    {
        $connection = DB::connection();
        $start = microtime(true);

        try {
            $connection->select('select 1');
            $latency = round((microtime(true) - $start) * 1000, 1);
            $products = (int) $connection->table('products')->whereNull('deleted_at')->count();
        } catch (Throwable $e) {
            // El detalle queda en el log del contenedor, nunca en la respuesta.
            Log::warning('Health check: base de datos no disponible', ['exception' => $e::class]);

            return ['status' => 'unavailable', 'driver' => $connection->getDriverName(), 'latency_ms' => null, 'products' => null];
        }

        return ['status' => 'ok', 'driver' => $connection->getDriverName(), 'latency_ms' => $latency, 'products' => $products];
    }
}
