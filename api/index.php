<?php

/**
 * Vercel Serverless entrypoint (repo root).
 *
 * This repository keeps the Laravel app in `clim8bit-backend/`.
 * We delegate everything to Laravel's public front controller.
 */

require __DIR__ . '/../clim8bit-backend/public/index.php';

