import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-4 px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
        <ShieldAlert size={28} />
      </div>
      <h1 className="text-xl font-bold text-slate-800">No tienes acceso a esta sección</h1>
      <p className="text-sm text-slate-500 max-w-sm">
        Tu rol actual no cuenta con permisos para ver esta página. Si crees que es un error, contacta a un
        administrador del sistema.
      </p>
      <button
        onClick={() => navigate('/', { replace: true })}
        className="mt-2 px-6 py-3 bg-[#163d2a] hover:bg-[#1e4535] text-white rounded-xl font-bold text-sm transition-colors"
      >
        Volver al Dashboard
      </button>
    </div>
  );
};

export default UnauthorizedPage;
