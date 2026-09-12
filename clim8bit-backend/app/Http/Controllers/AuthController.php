<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

use App\Services\FirebaseService;

class AuthController extends Controller
{
    protected FirebaseService $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // If not in local SQLite cache, attempt to restore from Firestore
        if (!$user) {
            $firestoreUser = $this->firebase->getUserByEmail($request->email);
            if ($firestoreUser && !empty($firestoreUser['password'])) {
                $user = new User();
                if (!empty($firestoreUser['id']) && is_numeric($firestoreUser['id'])) {
                    $user->id = (int) $firestoreUser['id'];
                }
                $user->name = $firestoreUser['name'] ?? 'User';
                $user->email = $firestoreUser['email'];
                $user->password = $firestoreUser['password'];
                $user->temperature_unit = $firestoreUser['temperature_unit'] ?? 'C';
                $user->save();
            }
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        Auth::login($user, $request->boolean('remember'));

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Check uniqueness in local database and Firestore
        if (User::where('email', $validated['email'])->exists() || $this->firebase->getUserByEmail($validated['email'])) {
            throw ValidationException::withMessages([
                'email' => ['The email has already been taken.'],
            ]);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'temperature_unit' => 'C',
        ]);

        // Sync to Firestore
        $this->firebase->syncUser([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'password' => $user->password,
            'temperature_unit' => $user->temperature_unit,
            'created_at' => now()->toIso8601String(),
            'updated_at' => now()->toIso8601String(),
        ]);

        Auth::login($user);

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user,
        ], 201);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout successful',
        ]);
    }
}


