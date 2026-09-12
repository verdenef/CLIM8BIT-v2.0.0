<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Services\FirebaseService;

class FavoriteController extends Controller
{
    protected FirebaseService $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function index()
    {
        $user = Auth::user();
        $favorites = $user->favorites()->orderByDesc('created_at')->get();

        // If local cache has 0, attempt to restore from Firestore
        if ($favorites->isEmpty()) {
            $fsFavorites = $this->firebase->getFavoritesForUser($user->id);
            foreach ($fsFavorites as $fav) {
                if (!empty($fav['city']) && !empty($fav['country'])) {
                    $user->favorites()->firstOrCreate(
                        ['city' => $fav['city'], 'country' => $fav['country']],
                        ['nickname' => $fav['nickname'] ?? null]
                    );
                }
            }
            $favorites = $user->favorites()->orderByDesc('created_at')->get();
        }

        return response()->json([
            'favorites' => $favorites,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'city' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'nickname' => 'nullable|string|max:255',
        ]);

        try {
            $user = Auth::user();

            if ($user->favorites()->count() >= 3) {
                return response()->json([
                    'error' => 'Limit reached',
                    'message' => 'You can only track 3 cities. Remove one to add another.',
                ], 422);
            }

            $existing = $user->favorites()
                ->where('city', $validated['city'])
                ->where('country', $validated['country'])
                ->first();

            if ($existing) {
                return response()->json([
                    'message' => 'City already in favorites',
                    'favorites' => $user->favorites()->orderByDesc('created_at')->get(),
                ], 200);
            }

            $favorite = $user->favorites()->create($validated);

            // Sync to Firestore
            $this->firebase->syncFavorite([
                'id' => $favorite->id,
                'user_id' => $favorite->user_id,
                'city' => $favorite->city,
                'country' => $favorite->country,
                'nickname' => $favorite->nickname,
                'created_at' => now()->toIso8601String(),
            ]);

            return response()->json([
                'message' => 'Added to favorites',
                'favorites' => $user->favorites()->orderByDesc('created_at')->get(),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to add favorite',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nickname' => 'nullable|string|max:255',
        ]);

        try {
            $favorite = Auth::user()->favorites()->findOrFail($id);
            $favorite->nickname = $validated['nickname'] ?? null;
            $favorite->save();

            // Sync to Firestore
            $this->firebase->syncFavorite([
                'id' => $favorite->id,
                'user_id' => $favorite->user_id,
                'city' => $favorite->city,
                'country' => $favorite->country,
                'nickname' => $favorite->nickname,
                'updated_at' => now()->toIso8601String(),
            ]);

            return response()->json([
                'message' => 'Nickname updated successfully',
                'favorites' => Auth::user()->favorites()->orderByDesc('created_at')->get(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update nickname',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $favorite = Auth::user()->favorites()->findOrFail($id);
            $favoriteId = $favorite->id;
            $favorite->delete();

            // Delete from Firestore
            $this->firebase->deleteFavorite($favoriteId);

            return response()->json([
                'message' => 'Removed from favorites',
                'favorites' => Auth::user()->favorites()->orderByDesc('created_at')->get(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to remove favorite',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}


