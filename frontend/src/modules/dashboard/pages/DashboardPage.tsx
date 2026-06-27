import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hammer, Plus, ClipboardList, Clock, CheckCircle2,
  XCircle, Wrench, MapPin, Calendar, UserCircle,
  AlertTriangle, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import dashboardService, { DashboardStats, TicketReciente } from '../services/dashboardService';

type EstadoTicket = 'pendiente' | 'valorado' | 'autorizado' | 'rechazado' | 'reparado';

const estadoConfig: Record<EstadoTicket, { label: string; cls: string }> = {
  pendiente:  { label: 'Pendiente',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  valorado:   { label: 'Valorado',   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  autorizado: { label: 'Autorizado', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rechazado:  { label: 'Rechazado',  cls: 'bg-red-50 text-red-700 border-red-200' },
  reparado:   { label: 'Reparado',   cls: 'bg-green-50 text-green-800 border-green-200' },
};

const Badge = ({ estado }: { estado: EstadoTicket }) => {
  const cfg = estadoConfig[estado] ?? { label: estado, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-black tracking-wider uppercase border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recientes, setRecientes] = useState<TicketReciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.getDashboardOverview()
      .then(data => {
        setStats(data.stats);
        setRecientes(data.recientes);
      })
      .catch(() => setError('No se pudo conectar al servidor. Verifica que el backend esté activo.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-400">
          <AlertTriangle size={28} />
        </div>
        <p className="text-slate-700 font-bold text-center">{error}</p>
        <button
          onClick={() => { setError(''); setIsLoading(true); dashboardService.getDashboardOverview().then(d => { setStats(d.stats); setRecientes(d.recientes); }).catch(() => setError('Error de conexión')).finally(() => setIsLoading(false)); }}
          className="px-4 py-2 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const s = stats!;
  const totalCalc = s.total || 1;
  const primerNombre = user?.name?.split(' ')[0] ?? 'Usuario';

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-6xl mx-auto flex flex-col gap-6 md:gap-8">

      {/* BANNER */}
      <div className="bg-gradient-to-r from-[#163d2a] to-[#2d6a4f] rounded-[2rem] p-6 md:p-10 relative overflow-hidden shadow-xl shadow-[#2d6a4f]/20">
        <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none">
          <Hammer size={240} strokeWidth={1} className="text-white transform -rotate-12" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[#a7f3d0] text-xs font-bold mb-4 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#52b788] animate-pulse" />
            Sistema activo
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
            Bienvenido, {primerNombre}
          </h1>
          <p className="text-white/80 text-[0.95rem] md:text-base font-medium max-w-md leading-relaxed">
            {s.pendientes > 0
              ? <>Tienes <strong className="text-[#fde68a]">{s.pendientes} pendiente{s.pendientes !== 1 ? 's' : ''}</strong> por atender.</>
              : 'Todo está al día. ¡Buen trabajo!'}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/tickets')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#52b788] hover:bg-[#40916c] text-white rounded-xl font-bold shadow-lg shadow-[#52b788]/30 transition-all active:scale-95 text-sm"
            >
              <Plus size={18} strokeWidth={2.5} /> Nuevo Reporte
            </button>
            <button
              onClick={() => navigate('/tickets')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold transition-all text-sm backdrop-blur-sm"
            >
              <ClipboardList size={18} /> Ver todos los tickets
            </button>
          </div>
        </div>
      </div>

      {/* TARJETAS STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {[
          { icon: <ClipboardList size={20}/>, label: 'Total tickets', value: s.total, cls: 'bg-[#2d6a4f]/10 text-[#2d6a4f]' },
          { icon: <Clock size={20}/>, label: 'Pendientes', value: s.pendientes, cls: 'bg-amber-50 text-amber-600' },
          { icon: <Wrench size={20}/>, label: 'Valorados', value: s.valorados, cls: 'bg-blue-50 text-blue-600' },
          { icon: <CheckCircle2 size={20}/>, label: 'Autorizados', value: s.autorizados, cls: 'bg-emerald-50 text-emerald-600' },
          { icon: <XCircle size={20}/>, label: 'Rechazados', value: s.rechazados, cls: 'bg-red-50 text-red-500' },
          { icon: <TrendingUp size={20}/>, label: 'Reparados', value: s.reparados, cls: 'bg-green-50 text-green-700' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.cls}`}>{card.icon}</div>
            <div>
              <h3 className="text-3xl font-black text-slate-800">{card.value}</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* BARRA DISTRIBUCIÓN */}
      {s.total > 0 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-sm font-bold text-slate-800">Distribución de tickets</h2>
            <span className="text-xs font-medium text-slate-400">{s.total} total</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full flex overflow-hidden gap-0.5">
            {s.pendientes > 0  && <div style={{ width: `${(s.pendientes  / totalCalc) * 100}%` }} className="bg-amber-400 h-full" />}
            {s.valorados > 0   && <div style={{ width: `${(s.valorados   / totalCalc) * 100}%` }} className="bg-blue-500 h-full" />}
            {s.autorizados > 0 && <div style={{ width: `${(s.autorizados / totalCalc) * 100}%` }} className="bg-emerald-500 h-full" />}
            {s.rechazados > 0  && <div style={{ width: `${(s.rechazados  / totalCalc) * 100}%` }} className="bg-red-500 h-full" />}
            {s.reparados > 0   && <div style={{ width: `${(s.reparados   / totalCalc) * 100}%` }} className="bg-green-600 h-full" />}
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {[
              { color: 'bg-amber-400', label: 'Pendiente',  count: s.pendientes  },
              { color: 'bg-blue-500',  label: 'Valorado',   count: s.valorados   },
              { color: 'bg-emerald-500', label: 'Autorizado', count: s.autorizados },
              { color: 'bg-red-500',   label: 'Rechazado',  count: s.rechazados  },
              { color: 'bg-green-600', label: 'Reparado',   count: s.reparados   },
            ].filter(x => x.count > 0).map(x => (
              <div key={x.label} className="flex items-center gap-1.5 text-[0.7rem] font-bold text-slate-500">
                <span className={`w-2 h-2 rounded-full ${x.color}`}></span> {x.label} ({x.count})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORTES RECIENTES */}
      <div>
        <div className="flex justify-between items-end mb-4 px-1">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Reportes recientes</h2>
          <button onClick={() => navigate('/tickets')} className="text-xs font-bold text-[#2d6a4f] hover:underline">
            Ver todos →
          </button>
        </div>

        {recientes.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-100">
            <Hammer size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 text-sm font-medium">No hay reportes recientes.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recientes.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => navigate('/tickets')}
                className="bg-white rounded-3xl p-4 md:p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl shrink-0 bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Hammer size={20} className="text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge estado={ticket.estado} />
                    <span className="text-[0.65rem] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{ticket.folio}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 truncate">{ticket.titulo}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-[0.7rem] font-medium text-slate-400">
                    <span className="flex items-center gap-1"><MapPin size={11} /> {ticket.ubicacion}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {ticket.fecha}</span>
                    <span className="flex items-center gap-1 ml-auto text-slate-600 font-bold"><UserCircle size={13} /> {ticket.tecnico}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
