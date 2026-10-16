<?php

namespace App\Http\Controllers\Auth;

use App\Enums\RegistrationSource;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Role;
use App\Models\Admin;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // -------------------------------------------------------------------------
    // POST /api/auth/register
    // -------------------------------------------------------------------------

    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Find the requested role — look up by name, never trust an ID from the client.
        $role = Role::where('name', $validated['role'])->first();

        if (! $role) {
            return response()->json([
                'message' => 'The requested role does not exist.',
            ], 422);
        }

        \DB::beginTransaction();
        try {
            $user = User::create([
                'uuid'                => (string) Str::uuid(),
                'full_name'           => $validated['full_name'],
                'email'               => $validated['email'] ?? null,
                'phone'               => $validated['phone'],
                'password_hash'       => Hash::make($validated['password']),
                'status'              => UserStatus::PENDING->value,
                'registration_source' => RegistrationSource::SELF_REGISTRATION->value,
            ]);

            // Assign role — prevent duplicate via syncWithoutDetaching
            $user->roles()->syncWithoutDetaching([$role->id]);

            \DB::commit();
        } catch (\Throwable $e) {
            \DB::rollBack();
            throw $e;
        }

        return response()->json([
            'message' => 'Registration submitted successfully. Your account is pending admin approval.',
        ], 201);
    }

    // -------------------------------------------------------------------------
    // POST /api/auth/login
    // -------------------------------------------------------------------------

    public function login(LoginRequest $request): JsonResponse
    {
        $loginValue = $request->input('login');

        // Admins are stored in their own table and sign in by email.
        if (filter_var($loginValue, FILTER_VALIDATE_EMAIL)) {
            $admin = Admin::where('email', $loginValue)->first();

            // Only accept the dedicated admin record when its stored hash is
            // valid. A malformed legacy row must not break login; continue to
            // the legacy role-based users table below.
            if ($admin && $this->passwordMatches($request->input('password'), $admin->password)) {
                $token = $admin->createToken('api-token')->plainTextToken;

                AuditService::log(
                    action: 'ADMIN_LOGIN',
                    entityType: 'admins',
                    entityId: (string) $admin->id,
                    request: $request,
                );

                return response()->json([
                    'message' => 'Login successful.',
                    'token' => $token,
                    'user' => $this->safeAdmin($admin),
                ]);
            }
        }

        // Determine whether the value looks like an email or a phone number.
        $field = filter_var($loginValue, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $user = User::where($field, $loginValue)->first();

        if (! $user || ! $this->passwordMatches($request->input('password'), $user->password_hash)) {
            return response()->json([
                'message' => 'These credentials do not match our records.',
            ], 401);
        }

        // Status gate — only ACTIVE users may receive a token.
        match ($user->status) {
            UserStatus::PENDING->value   => throw new \Symfony\Component\HttpKernel\Exception\HttpException(
                403,
                'Your account is pending admin approval. Please wait for approval before logging in.'
            ),
            UserStatus::REJECTED->value  => throw new \Symfony\Component\HttpKernel\Exception\HttpException(
                403,
                'Your account registration has been rejected. Please contact an administrator.'
            ),
            UserStatus::INACTIVE->value  => throw new \Symfony\Component\HttpKernel\Exception\HttpException(
                403,
                'Your account is inactive. Please contact an administrator.'
            ),
            UserStatus::SUSPENDED->value => throw new \Symfony\Component\HttpKernel\Exception\HttpException(
                403,
                'Your account has been suspended. Please contact an administrator.'
            ),
            default => null, // ACTIVE — continue
        };

        // Update last login timestamp.
        $user->update(['last_login_at' => now()]);

        // Issue Sanctum token.
        $token = $user->createToken('api-token')->plainTextToken;

        AuditService::log(
            action:      'USER_LOGIN',
            userId:      $user->id,
            entityType:  'users',
            entityId:    (string) $user->id,
            request:     $request,
        );

        return response()->json([
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => $this->safeUser($user),
        ]);
    }

    // -------------------------------------------------------------------------
    // POST /api/auth/dev-login
    // Developer bypass login without password for rapid testing
    // -------------------------------------------------------------------------

    public function devLogin(Request $request): JsonResponse
    {
        $role = strtoupper($request->input('role', 'ADMIN'));

        if ($role === 'ADMIN') {
            $admin = Admin::first();
            if (! $admin) {
                $admin = Admin::create([
                    'name' => 'Super Administrator',
                    'email' => 'admin@gmail.com',
                    'password' => Hash::make('admin123'),
                ]);
            }
            $token = $admin->createToken('api-token')->plainTextToken;

            return response()->json([
                'message' => 'Developer login successful as Admin.',
                'token' => $token,
                'user' => $this->safeAdmin($admin),
            ]);
        }

        // For OFFICER or WORKER
        $roleModel = Role::where('name', $role)->first();
        if (! $roleModel) {
            return response()->json(['message' => "Role {$role} not found in database."], 404);
        }

        $user = User::whereHas('roles', fn ($q) => $q->where('name', $role))
            ->where('status', UserStatus::ACTIVE->value)
            ->first();

        if (! $user) {
            $user = User::whereHas('roles', fn ($q) => $q->where('name', $role))->first();
            if ($user) {
                $user->update(['status' => UserStatus::ACTIVE->value]);
            } else {
                $user = User::create([
                    'uuid'                => (string) Str::uuid(),
                    'full_name'           => $role === 'OFFICER' ? 'Dev Field Officer' : 'Dev Field Worker',
                    'email'               => strtolower($role) . '.dev@field.in',
                    'phone'               => $role === 'OFFICER' ? '9822011231' : '9822011221',
                    'password_hash'       => Hash::make('Password@123'),
                    'status'              => UserStatus::ACTIVE->value,
                    'registration_source' => RegistrationSource::ADMIN_CREATED->value,
                    'approved_at'         => now(),
                ]);
                $user->roles()->syncWithoutDetaching([$roleModel->id]);
            }
        }

        $user->update(['last_login_at' => now()]);
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => "Developer login successful as {$role}.",
            'token'   => $token,
            'user'    => $this->safeUser($user),
        ]);
    }

    // -------------------------------------------------------------------------
    // POST /api/auth/logout
    // -------------------------------------------------------------------------

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    // -------------------------------------------------------------------------
    // GET /api/auth/me
    // -------------------------------------------------------------------------

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => $user instanceof Admin
                ? $this->safeAdmin($user)
                : $this->safeUser($user),
        ]);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Return safe user data — never includes password_hash.
     */
    private function safeUser(User $user): array
    {
        $user->load('roles');

        return [
            'id'                  => $user->id,
            'uuid'                => $user->uuid,
            'full_name'           => $user->full_name,
            'email'               => $user->email,
            'phone'               => $user->phone,
            'status'              => $user->status,
            'registration_source' => $user->registration_source,
            'last_login_at'       => $user->last_login_at?->toISOString(),
            'created_at'          => $user->created_at?->toISOString(),
            'roles'               => $user->roles->pluck('name'),
        ];
    }

    /** Return the admin using the profile shape expected by the frontend. */
    private function safeAdmin(Admin $admin): array
    {
        return [
            'id' => $admin->id,
            'uuid' => null,
            'full_name' => $admin->name,
            'name' => $admin->name,
            'email' => $admin->email,
            'phone' => null,
            'status' => 'ACTIVE',
            'registration_source' => 'ADMIN_CREATED',
            'last_login_at' => null,
            'created_at' => $admin->created_at?->toISOString(),
            'roles' => ['ADMIN'],
        ];
    }

    /** Invalid or incompatible stored hashes should fail authentication, not 500. */
    private function passwordMatches(string $plainPassword, ?string $storedHash): bool
    {
        if (! $storedHash) {
            return false;
        }

        try {
            return Hash::check($plainPassword, $storedHash);
        } catch (\RuntimeException) {
            return false;
        }
    }
}
