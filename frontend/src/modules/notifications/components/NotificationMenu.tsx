import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import notificationsService, { AppNotification } from '../services/notificationsService';

const NotificationMenu = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);

  const load = async () => {
    try { const result = await notificationsService.getAll(); setItems(result.items); setUnread(result.unread); } catch { /* La campana no bloquea el flujo. */ }
  };

  useEffect(() => { load(); }, []);

  const read = async (item: AppNotification) => {
    if (!item.read_at) { await notificationsService.read(item.id); await load(); }
  };

  return <div className="relative">
    <button onClick={() => { setOpen(!open); if (!open) load(); }} aria-label="Notificaciones" className={`p-2 rounded-xl relative ${open ? 'bg-green-50 text-[#2d6a4f]' : 'text-slate-500 hover:bg-slate-100'}`}><Bell size={22} />{unread > 0 && <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black grid place-items-center">{unread}</span>}</button>
    {open && <div className="absolute right-0 mt-2 w-[min(22rem,85vw)] max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl z-50">
      <div className="sticky top-0 bg-white border-b border-slate-100 p-3 flex justify-between"><b className="text-sm text-slate-800">Notificaciones</b><button onClick={async () => { await notificationsService.readAll(); await load(); }} className="text-xs font-bold text-emerald-700 flex gap-1"><CheckCheck size={14} /> Marcar todas</button></div>
      {items.map((item) => <button key={item.id} onClick={() => read(item)} className={`w-full text-left p-4 border-b border-slate-100 ${item.read_at ? 'bg-white' : 'bg-emerald-50'}`}><p className="text-sm font-bold text-slate-800">{item.title || 'Actualización'}</p><p className="text-xs text-slate-600 mt-1">{item.message}</p></button>)}
      {items.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Sin notificaciones.</p>}
    </div>}
  </div>;
};

export default NotificationMenu;
