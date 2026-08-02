<?php

namespace App\Services;

use App\Models\BitacoraReparacion;
use App\Models\User;

class ArchiveAccessService
{
    public function canView(User $user, BitacoraReparacion $archive): bool
    {
        if ($user->hasRole('Subdirector Administrativo')) {
            return true;
        }

        if ($user->hasRole('Personal de Mantenimiento')) {
            return $archive->generado_por === $user->id;
        }

        if ($user->hasRole('Responsable del Lugar')) {
            return $user->areas()
                ->where('areas.id', $archive->ticket->area_id)
                ->wherePivot('activo', true)
                ->exists();
        }

        return false;
    }

    public function ensureCanView(User $user, BitacoraReparacion $archive): void
    {
        abort_unless($this->canView($user, $archive), 403);
    }
}
