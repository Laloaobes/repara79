<?php

return [
    /*
    | Local conserva el registro abierto. Railway debe establecerlo en false
    | para trabajar únicamente con las cuentas demo aprovisionadas.
    */
    'allow_public_registration' => (bool) env('ALLOW_PUBLIC_REGISTRATION', true),

    'login_attempts_per_minute' => (int) env('LOGIN_ATTEMPTS_PER_MINUTE', 5),

    'release' => env('APP_RELEASE', env('RAILWAY_GIT_COMMIT_SHA', 'local')),
];
