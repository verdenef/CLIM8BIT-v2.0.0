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

    putenv("DB_CONNECTION=sqlite");
    putenv("DB_DATABASE={$targetDb}");
    putenv("APP_STORAGE=/tmp/storage");
    putenv("VIEW_COMPILED_PATH=/tmp/storage/framework/views");
    putenv("SESSION_DRIVER=cookie");
    putenv("CACHE_STORE=array");
}

require __DIR__ . '/../clim8bit-backend/public/index.php';

