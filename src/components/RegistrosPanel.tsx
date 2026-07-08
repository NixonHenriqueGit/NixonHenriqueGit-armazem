import React from 'react';
import { Usuario, Empresa } from '../types';
import { 
  RefreshCw, 
  Trash2, 
  Truck, 
  AlertTriangle, 
  Calendar, 
  Search, 
  Package, 
  ClipboardCheck, 
  ChevronRight,
  ClipboardList
} from 'lucide-react';

interface RegistrosPanelProps {
  user: Usuario;
  empresa: Empresa | null;
  onNavigate: (panelId: string) => void;
}

export default function RegistrosPanel({ user, empresa, onNavigate }: RegistrosPanelProps) {
  // Sector lists
  const sectors = [
    {
      id: 'repack',
      label: 'Operação Repack',
      description: 'Lançamentos de reembalagem, refação de caixas e produtividade de garrafas.',
      icon: <RefreshCw className="w-5 h-5 text-purple-500" />,
      color: 'border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40 text-purple-400',
      tag: 'Produtividade'
    },
    {
      id: 'despejo',
      label: 'Operação Despejo',
      description: 'Descarte controlado de líquidos e garrafas com fluxo de auditoria física.',
      icon: <Trash2 className="w-5 h-5 text-rose-500" />,
      color: 'border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40 text-rose-400',
      tag: 'Aprovação'
    },
    {
      id: 'armazem',
      label: 'Operação de Pátio',
      description: 'Controle de fluxo de caminhões, tempos de carregamento e janelas de faturamento.',
      icon: <Truck className="w-5 h-5 text-sky-500" />,
      color: 'border-sky-500/20 bg-sky-500/5 hover:border-sky-500/40 text-sky-400',
      tag: 'Logística'
    },
    {
      id: 'quebras',
      label: 'Operação Quebras',
      description: 'Registro de avarias imediatas, quebras físicas em paletes e ruas do estoque.',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      color: 'border-red-500/20 bg-red-500/5 hover:border-red-500/40 text-red-400',
      tag: 'Avarias'
    },
    {
      id: 'validades',
      label: 'Operação Validades',
      description: 'Cadastro de lotes e vencimentos de produtos para controle de giro do estoque.',
      icon: <Calendar className="w-5 h-5 text-emerald-500" />,
      color: 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 text-emerald-400',
      tag: 'Qualidade (FEFO)'
    },
    {
      id: 'refugo',
      label: 'Blitz Refugo',
      description: 'Inspeções e auditorias em paletes destinados a descarte para resgate de embalagens boas.',
      icon: <Search className="w-5 h-5 text-indigo-500" />,
      color: 'border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/40 text-indigo-400',
      tag: 'Qualidade'
    },
    {
      id: 'empilhador',
      label: 'Operação Picking',
      description: 'Atribuição de reabastecimento de picking e controle de ordens por operadores de empilhadeira.',
      icon: <Package className="w-5 h-5 text-amber-500" />,
      color: 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 text-amber-400',
      tag: 'Operacional'
    },
    {
      id: 'conferente',
      label: 'Conferência Geral',
      description: 'Vistoria de volumes e auditoria para conciliação física de cargas prontas para rota.',
      icon: <ClipboardCheck className="w-5 h-5 text-teal-500" />,
      color: 'border-teal-500/20 bg-teal-500/5 hover:border-teal-500/40 text-teal-400',
      tag: 'Controle'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#11151c]/90 to-[#07090d]/90 border border-[#1c2530] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ClipboardList className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-sans font-black uppercase tracking-tight text-white leading-none">
                Painel Geral de Registros de Setores
              </h2>
              <p className="text-xs text-[#6a7d92] mt-1.5">
                Central de atalhos rápidos para monitorar e auditar lançamentos de todos os setores operacionais.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-black px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg self-start sm:self-auto tracking-widest">
            Modo Supervisor
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sectors.map((sector) => (
          <div 
            key={sector.id}
            onClick={() => onNavigate(sector.id)}
            className={`group p-5 border rounded-xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-[180px] relative overflow-hidden ${sector.color}`}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/2 rounded-bl-full transition-all group-hover:scale-110 pointer-events-none" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-black/30 flex items-center justify-center">
                  {sector.icon}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 border border-white/10 rounded-md">
                  {sector.tag}
                </span>
              </div>
              
              <div>
                <h3 className="font-sans font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                  {sector.label}
                </h3>
                <p className="text-[11px] text-[#6a7d92] leading-snug mt-1 line-clamp-2">
                  {sector.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-white/80 group-hover:text-blue-400 transition-colors mt-4">
              <span>Acessar Registro</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
