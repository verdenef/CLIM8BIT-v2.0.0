<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Services\FirebaseService;

class RecentSearchController extends Controller
{
    protected FirebaseService $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function index()
    {
        $user = Auth::user();
        $recent = $user->recentSearches()
            ->orderByDesc('searched_at')
            ->limit(10)
            ->get();

        // If local is empty, attempt to restore from Firestore
        if ($recent->isEmpty()) {
            $fsSearches = $this->firebase->getRecentSearchesForUser($user->id);
            foreach ($fsSearches as $item) {
                if (!empty($item['city']) && !empty($item['country'])) {
                    $user->recentSearches()->firstOrCreate(
                        ['city' => $item['city'], 'country' => $item['country']],
                        ['searched_at' => $item['searched_at'] ?? now()]
                    );
                }
            }
            $recent = $user->recentSearches()->orderByDesc('searched_at')->limit(10)->get();
        }

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

        $search = $user->recentSearches()->create([
            'city' => $validated['city'],
            'country' => $validated['country'],
            'searched_at' => now(),
        ]);

        // Sync to Firestore
        $this->firebase->syncRecentSearch([
            'id' => (string) $search->id,
            'user_id' => $user->id,
            'city' => $search->city,
            'country' => $search->country,
            'searched_at' => now()->toIso8601String(),
        ]);

        return response()->json([
            'message' => 'Recent search saved',
        ]);
    }

    public function clear()
    {
        $user = Auth::user();
        $user->recentSearches()->delete();

        // Clear in Firestore
        $this->firebase->clearRecentSearches($user->id);

        return response()->json([
            'message' => 'Recent searches cleared',
        ]);
    }
}


