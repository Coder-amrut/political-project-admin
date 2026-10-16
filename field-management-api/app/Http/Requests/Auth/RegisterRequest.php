<?php

namespace App\Http\Requests\Auth;

use App\Enums\RoleName;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public endpoint
    }

    public function rules(): array
    {
        return [
            'full_name'             => ['required', 'string', 'max:150'],
            'phone'                 => ['required', 'string', 'max:20', 'unique:users,phone'],
            'email'                 => ['nullable', 'email', 'max:150', 'unique:users,email'],
            'password'              => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'password_confirmation' => ['required'],
            'role'                  => ['required', 'string', 'in:' . implode(',', RoleName::publicRegistrable())],
        ];
    }

    public function messages(): array
    {
        return [
            'role.in' => 'The role must be WORKER or OFFICER. ADMIN accounts cannot be self-registered.',
        ];
    }
}
