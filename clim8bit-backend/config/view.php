<?php

return [
    /*
    |--------------------------------------------------------------------------
    | View Storage Paths
    |--------------------------------------------------------------------------
    |
    | Most templating systems load templates from disk. Here you may specify
    | an array of paths that should be checked for your views.
    |
    */
    'paths' => [
        resource_path('views'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Compiled View Path
    |--------------------------------------------------------------------------
    |
    | On serverless platforms the filesystem is read-only except for /tmp.
    | We default compiled Blade views to the system temp directory.
    |
    */
    'compiled' => env('VIEW_COMPILED_PATH', rtrim(sys_get_temp_dir(), '/\\').DIRECTORY_SEPARATOR.'views'),
];

