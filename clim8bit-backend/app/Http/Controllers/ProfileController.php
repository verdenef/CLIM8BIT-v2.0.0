<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Update user email
     */
    public function updateEmail(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'email' => 'required|email|max:255|unique:users,email,' . $user->id . ',id',
            'password' => 'required',
        ]);

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The provided password is incorrect.'],
            ]);
        }

        $user->email = $request->email;
        $user->save();

        return response()->json([
            'message' => 'Email updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Update username
     */
    public function updateUsername(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'username' => 'required|string|min:3|max:255|unique:users,name,' . $user->id . ',id',
        ]);

        $user->name = $request->username;
        $user->save();

        return response()->json([
            'message' => 'Username updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }

    /**
     * Delete user account
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => 'required',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The provided password is incorrect.'],
            ]);
        }

        Auth::logout();
        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully',
        ]);
    }
}

