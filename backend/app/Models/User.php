<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'tipo_usuario_id',
        'name',
        'apellido_paterno',
        'apellido_materno',
        'telefono',
        'nombre_usuario',
        'imagen_perfil',
        'activo',
        'ultimo_acceso',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'activo' => 'boolean',
            'ultimo_acceso' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user): void {
            $user->profile_uuid ??= (string) Str::uuid();
        });
    }

    public function tipoUsuario(): BelongsTo
    {
        return $this->belongsTo(TipoUsuario::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'usuario_id');
    }

    public function valoraciones(): HasMany
    {
        return $this->hasMany(Valoracion::class, 'valorado_por');
    }

    public function reparaciones(): HasMany
    {
        return $this->hasMany(Reparacion::class, 'realizado_por');
    }

    public function bitacorasGeneradas(): HasMany
    {
        return $this->hasMany(BitacoraReparacion::class, 'generado_por');
    }

    public function areas(): BelongsToMany
    {
        return $this->belongsToMany(Area::class, 'usuario_area', 'usuario_id', 'area_id')
            ->withPivot('activo')
            ->withTimestamps();
    }

    /**
     * Compara el rol del usuario (tipos_usuarios.nombre) contra una lista permitida.
     */
    public function hasRole(string ...$roles): bool
    {
        return in_array($this->tipoUsuario?->nombre, $roles, true);
    }
}
