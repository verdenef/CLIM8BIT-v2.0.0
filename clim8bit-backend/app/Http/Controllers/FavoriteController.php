<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    public function index()
    {
        $favorites = Auth::user()->favorites()
            ->orderByDesc('created_at')
            ->get();

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
            $existing = Auth::user()->favorites()
                ->where('city', $validated['city'])
                ->where('country', $validated['country'])
                ->first();

            if ($existing) {
                return response()->json([
                    'message' => 'City already in favorites',
                    'favorites' => Auth::user()->favorites()->orderByDesc('created_at')->get(),
                ], 200);
            }

            Auth::user()->favorites()->create($validated);

            return response()->json([
                'message' => 'Added to favorites',
                'favorites' => Auth::user()->favorites()->orderByDesc('created_at')->get(),
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
            $favorite->delete();

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


