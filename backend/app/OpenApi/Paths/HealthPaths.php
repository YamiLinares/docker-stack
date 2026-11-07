<?php

namespace App\OpenApi\Paths;

use OpenApi\Attributes as OA;

final class HealthPaths
{
    #[OA\Get(
        path: '/api/health',
        operationId: 'health',
        summary: 'Estado de la API y de la conexión con MySQL',
        description: 'Ejecuta una consulta real en la base de datos. Responde 503 si MySQL no está disponible. No expone credenciales, hosts ni versiones.',
        tags: ['Sistema'],
        responses: [
            new OA\Response(response: 200, description: 'API y base de datos operativas.', content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'status', type: 'string', enum: ['ok', 'degraded'], example: 'ok'),
                    new OA\Property(property: 'service', type: 'string', example: 'laravel-api'),
                    new OA\Property(property: 'database', type: 'object', properties: [
                        new OA\Property(property: 'status', type: 'string', enum: ['ok', 'unavailable'], example: 'ok'),
                        new OA\Property(property: 'driver', type: 'string', example: 'mysql'),
                        new OA\Property(property: 'latency_ms', type: 'number', nullable: true, example: 1.4),
                        new OA\Property(property: 'products', type: 'integer', nullable: true, description: 'Productos no eliminados.', example: 21),
                    ]),
                    new OA\Property(property: 'checked_at', type: 'string', format: 'date-time'),
                ],
            )),
            new OA\Response(response: 503, description: 'La base de datos no responde (status = degraded).'),
        ],
    )]
    public function show(): void {}
}
