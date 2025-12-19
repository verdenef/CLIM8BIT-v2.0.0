<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeatherCache extends Model
{
    protected $table = 'weather_cache';

    protected $fillable = [
        'city',
        'country',
        'weather_data',
        'forecast_data',
        'cached_at',
    ];

    protected $casts = [
        'weather_data' => 'array',
        'forecast_data' => 'array',
        'cached_at' => 'datetime',
    ];
}
