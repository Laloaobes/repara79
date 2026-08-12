import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notificationsService, { AppNotification } from '../services/notificationsService';
import { useAuth } from '../../auth/context/AuthContext';
import { getEcho } from '../../../realtime/echo';

const NotificationMenu = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [realtime, setRealtime] = useState(false);

  const load = async () => {
    try { const result = await notificationsService.getAll(); setItems(result.items); setUnread(result.unread); } catch { /* La campana no bloquea el flujo. */ }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!user) return;
    const echo = getEcho();
    if (!echo) return;

    const channelName = `App.Models.User.${user.id}`;
    const channel = echo.private(channelName);
    const onCreated = (notification: AppNotification) => {
      setItems((current) => {
        if (current.some((item) => item.id === notification.id)) return current;
        setUnread((count) => count + (notification.read_at ? 0 : 1));
        return [notification, ...current].slice(0, 10);
      });
      setRealtime(true);
    };

    channel.subscribed(() => setRealtime(true));
    channel.error(() => setRealtime(false));
    channel.listen('.notification.created', onCreated);

    return () => {
      channel.stopListening('.notification.created', onCreated);
      echo.leave(channelName);
      setRealtime(false);
    };
  }, [user]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const read = async (item: AppNotification) => {
    if (!item.read_at) { await notificationsService.read(item.id); await load(); }
    const allowedRoutes = /^\/(?:archivero-reparaciones(?:\/\d+)?|mis-valoraciones|valoraciones-por-aprobar)$/;
    if (item.url && allowedRoutes.test(item.url)) {
      setOpen(false);
      navigate(item.url);
    }
  };

  return <div ref={rootRef} className="relative">
    <button onClick={() => { setOpen(!open); if (!open) load(); }} aria-label={`Notificaciones, ${unread} sin leer`} aria-expanded={open} className={`p-2 rounded-xl relative ${open ? 'bg-green-50 text-[#2d6a4f]' : 'text-slate-500 hover:bg-slate-100'}`}><Bell size={22} />{unread > 0 && <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black grid place-items-center">{unread > 99 ? '99+' : unread}</span>}</button>
    {open && <div className="absolute right-0 mt-2 w-[min(22rem,85vw)] max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl z-50">
      <div className="sticky top-0 bg-white border-b border-slate-100 p-3">
        <div className="flex justify-between gap-3"><b className="text-sm text-slate-800">Notificaciones</b><button disabled={unread === 0} onClick={async () => { await notificationsService.readAll(); await load(); }} className="text-xs font-bold text-emerald-700 flex gap-1 disabled:opacity-40"><CheckCheck size={14} /> Marcar todas</button></div>
        <p className={`mt-1 flex items-center gap-1 text-[10px] font-semibold ${realtime ? 'text-emerald-600' : 'text-slate-400'}`}>{realtime ? <Wifi size={11} /> : <WifiOff size={11} />}{realtime ? 'Actualización en tiempo real' : 'Modo REST disponible'}</p>
      </div>
      {items.map((item) => <button key={item.id} onClick={() => read(item)} className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 ${item.read_at ? 'bg-white' : 'bg-emerald-50'}`}><div className="flex items-start justify-between gap-2"><p className="text-sm font-bold text-slate-800">{item.title || 'Actualización'}</p>{item.url && <ExternalLink size={13} className="mt-0.5 shrink-0 text-slate-400" />}</div><p className="text-xs text-slate-600 mt-1">{item.message}</p><time className="mt-2 block text-[10px] text-slate-400">{new Date(item.created_at).toLocaleString('es-MX')}</time></button>)}
      {items.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Sin notificaciones.</p>}
    </div>}
  </div>;
};

export default NotificationMenu;
