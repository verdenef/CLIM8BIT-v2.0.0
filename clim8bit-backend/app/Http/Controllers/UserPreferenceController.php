<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Services\FirebaseService;

class UserPreferenceController extends Controller
{
    protected FirebaseService $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'temperature_unit' => 'required|in:C,F',
        ]);

        $user = Auth::user();
        $user->update([
            'temperature_unit' => $validated['temperature_unit'],
        ]);

        // Sync to Firestore
        $this->firebase->syncUser([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'password' => $user->password,
            'temperature_unit' => $user->temperature_unit,
            'updated_at' => now()->toIso8601String(),
        ]);

        return response()->json([
            'message' => 'Preferences updated',
            'user' => $user->fresh(),
        ]);
    }
}


