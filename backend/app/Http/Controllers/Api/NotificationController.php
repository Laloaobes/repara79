<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max((int) $request->integer('per_page', 10), 1), 50);
        $paginator = $request->user()->notifications()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => collect($paginator->items())->map(fn ($notification) => [
                'id' => $notification->id,
                'type' => $notification->data['type'] ?? null,
                'title' => $notification->data['title'] ?? 'Notificación',
                'message' => $notification->data['message'] ?? '',
                'url' => $notification->data['url'] ?? null,
                'read_at' => $notification->read_at?->toISOString(),
                'created_at' => $notification->created_at?->toISOString(),
            ])->values(),
            'unread_count' => $request->user()->unreadNotifications()->count(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function read(Request $request, string $notification)
    {
        $item = $request->user()->notifications()->whereKey($notification)->firstOrFail();
        $item->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notificación marcada como leída.',
        ]);
    }

    public function readAll(Request $request)
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Notificaciones marcadas como leídas.',
        ]);
    }
}
