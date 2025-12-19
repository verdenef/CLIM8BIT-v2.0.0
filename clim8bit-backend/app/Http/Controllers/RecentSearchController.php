<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RecentSearchController extends Controller
{
    public function index()
    {
        $recent = Auth::user()->recentSearches()
            ->orderByDesc('searched_at')
            ->limit(10)
            ->get();

        return response()->json([
            'recent_searches' => $recent,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'city' => 'required|string|max:255',
            'country' => 'required|string|max:2',
        ]);

        $user = Auth::user();

        $user->recentSearches()->create([
            'city' => $validated['city'],
            'country' => $validated['country'],
            'searched_at' => now(),
        ]);

        return response()->json([
            'message' => 'Recent search saved',
        ]);
    }

    public function clear()
    {
        $user = Auth::user();
        $user->recentSearches()->delete();

        return response()->json([
            'message' => 'Recent searches cleared',
        ]);
    }
}


