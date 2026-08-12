import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import apiClient from '../api/axios';

let echo: Echo<'reverb'> | null = null;

export const getEcho = (): Echo<'reverb'> | null => {
  const key = import.meta.env.VITE_REVERB_APP_KEY;

  if (!key) return null;
  if (echo) return echo;

  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

  echo = new Echo({
    broadcaster: 'reverb',
    key,
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT || 443),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel: { name: string }) => ({
      authorize: (socketId, callback) => {
        apiClient.post('/broadcasting/auth', {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((response) => callback(null, response.data))
          .catch((error: unknown) => callback(
            error instanceof Error ? error : new Error('No fue posible autorizar el canal privado.'),
            null,
          ));
      },
    }),
  });

  return echo;
};

export const disconnectEcho = (): void => {
  echo?.disconnect();
  echo = null;
};
