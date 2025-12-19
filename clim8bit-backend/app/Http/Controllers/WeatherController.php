<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\WeatherService;
use Illuminate\Support\Facades\Validator;

class WeatherController extends Controller
{
    protected WeatherService $weatherService;

    public function __construct(WeatherService $weatherService)
    {
        $this->weatherService = $weatherService;
    }

    public function getWeather(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'city' => 'required_without_all:lat,lon|string|max:255',
            'lat' => 'required_without:city|numeric|between:-90,90',
            'lon' => 'required_without:city|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid input parameters',
                'details' => $validator->errors(),
            ], 400);
        }

        try {
            if ($request->has('city')) {
                $weather = $this->weatherService->getWeatherByCity($request->city);
            } else {
                $weather = $this->weatherService->getWeatherByCoords(
                    $request->lat,
                    $request->lon
                );
            }

            return response()->json($weather);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch weather data',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getForecast(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'city' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'City parameter is required',
                'details' => $validator->errors(),
            ], 400);
        }

        try {
            $forecast = $this->weatherService->getForecast($request->city);
            return response()->json($forecast);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch forecast data',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}


