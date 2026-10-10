<?php

$defaultOrigins = implode(',', [
    env('FRONTEND_URL', 'http://localhost:5173'),
    'http://127.0.0.1:5173',
    'https://waratel-eta.vercel.app',
]);

$origins = array_values(array_unique(array_filter(array_map(
    'trim',
    explode(',', (string) env('FRONTEND_URLS', $defaultOrigins))
))));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $origins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
