<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserPreferenceController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'temperature_unit' => 'required|in:C,F',
        ]);

        $user = Auth::user();
        $user->update([
            'temperature_unit' => $validated['temperature_unit'],
        ]);

        return response()->json([
            'message' => 'Preferences updated',
            'user' => $user->fresh(),
        ]);
    }
}


