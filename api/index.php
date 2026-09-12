<?php

/**
 * Vercel Serverless entrypoint (repo root).
 *
 * This repository keeps the Laravel app in `clim8bit-backend/`.
 * We delegate everything to Laravel's public front controller.
 */

// If running in Vercel serverless environment, setup writable directories in /tmp
if (isset($_ENV['VERCEL']) || isset($_SERVER['VERCEL']) || getenv('VERCEL')) {
    $storageDirs = [
        '/tmp/storage/framework/views',
        '/tmp/storage/framework/cache/data',
        '/tmp/storage/framework/sessions',
        '/tmp/storage/logs',
        '/tmp/bootstrap/cache',
    ];

    foreach ($storageDirs as $dir) {
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
    }

    // Copy bootstrap files into writable /tmp/bootstrap
    $sourceBootstrap = __DIR__ . '/../clim8bit-backend/bootstrap';
    $targetBootstrap = '/tmp/bootstrap';
    if (file_exists($sourceBootstrap . '/providers.php') && !file_exists($targetBootstrap . '/providers.php')) {
        @copy($sourceBootstrap . '/providers.php', $targetBootstrap . '/providers.php');
    }
    if (file_exists($sourceBootstrap . '/app.php') && !file_exists($targetBootstrap . '/app.php')) {
        @copy($sourceBootstrap . '/app.php', $targetBootstrap . '/app.php');
    }
    if (file_exists($sourceBootstrap . '/cache/packages.php') && !file_exists($targetBootstrap . '/cache/packages.php')) {
        @copy($sourceBootstrap . '/cache/packages.php', $targetBootstrap . '/cache/packages.php');
    }
    if (file_exists($sourceBootstrap . '/cache/services.php') && !file_exists($targetBootstrap . '/cache/services.php')) {
        @copy($sourceBootstrap . '/cache/services.php', $targetBootstrap . '/cache/services.php');
    }

    // Prepare SQLite database in /tmp
    $sourceDb = __DIR__ . '/../clim8bit-backend/database/database.sqlite';
    $targetDb = '/tmp/database.sqlite';
    if (!file_exists($targetDb)) {
        if (file_exists($sourceDb)) {
            @copy($sourceDb, $targetDb);
        } else {
            @touch($targetDb);
        }
    }

    // Default APP_KEY fallback if not provided in Vercel environment
    if (!getenv('APP_KEY') && !isset($_ENV['APP_KEY']) && !isset($_SERVER['APP_KEY'])) {
        putenv('APP_KEY=base64:NR8K6RCvNz8Fy2ibylPVDDWOGZk05k2uO6xk8awyuoQ=');
        $_ENV['APP_KEY'] = 'base64:NR8K6RCvNz8Fy2ibylPVDDWOGZk05k2uO6xk8awyuoQ=';
        $_SERVER['APP_KEY'] = 'base64:NR8K6RCvNz8Fy2ibylPVDDWOGZk05k2uO6xk8awyuoQ=';
    }

    $envOverrides = [
        'DB_CONNECTION' => 'sqlite',
        'DB_DATABASE' => $targetDb,
        'APP_STORAGE' => '/tmp/storage',
        'APP_BOOTSTRAP_PATH' => '/tmp/bootstrap',
        'VIEW_COMPILED_PATH' => '/tmp/storage/framework/views',
        'SESSION_DRIVER' => 'cookie',
        'CACHE_STORE' => 'array',
        'LOG_CHANNEL' => 'stderr',
    ];

    foreach ($envOverrides as $k => $v) {
        putenv("{$k}={$v}");
        $_ENV[$k] = $v;
        $_SERVER[$k] = $v;
    }

    // Enable debug mode if query param ?debug=clim8bit is provided
    if (isset($_GET['debug']) && $_GET['debug'] === 'clim8bit') {
        putenv('APP_DEBUG=true');
        $_ENV['APP_DEBUG'] = 'true';
        $_SERVER['APP_DEBUG'] = 'true';
    }
}

require __DIR__ . '/../clim8bit-backend/public/index.php';

