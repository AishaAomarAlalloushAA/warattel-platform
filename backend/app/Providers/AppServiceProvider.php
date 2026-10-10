<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)
                ->by(strtolower((string) $request->input('email')) . '|' . $request->ip());
        });

        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perMinute(3)
                ->by(strtolower((string) $request->input('email')) . '|' . $request->ip());
        });

        ResetPassword::createUrlUsing(function ($user, string $token) {
            $frontendUrl = rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');

            return $frontendUrl . '/reset-password?token=' . urlencode($token)
                . '&email=' . urlencode($user->getEmailForPasswordReset());
        });
    }
}
