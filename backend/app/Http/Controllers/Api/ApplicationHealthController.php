<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ApplicationHealthController extends Controller
{
    public function __invoke()
    {
        $checks = [
            'database' => false,
            'public_storage' => false,
            'private_reports' => false,
        ];

        try {
            DB::select('select 1');
            $checks['database'] = true;
            $checks['public_storage'] = $this->diskIsWritable('public');
            $checks['private_reports'] = $this->diskIsWritable('protected_reports');
        } catch (Throwable) {
            // La respuesta deliberadamente no expone credenciales ni detalles internos.
        }

        $healthy = ! in_array(false, $checks, true);

        return response()->json([
            'status' => $healthy ? 'ok' : 'degraded',
            'release' => config('deployment.release'),
            'checks' => $checks,
        ], $healthy ? 200 : 503);
    }

    private function diskIsWritable(string $disk): bool
    {
        $path = '.health/'.Str::uuid().'.txt';
        $storage = Storage::disk($disk);

        try {
            return $storage->put($path, now()->toISOString())
                && $storage->exists($path);
        } finally {
            $storage->delete($path);
        }
    }
}
