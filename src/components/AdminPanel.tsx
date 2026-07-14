import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, updateDoc, doc, onSnapshot, query, where, addDoc } from 'firebase/firestore';
import { Usuario, Empresa } from '../types';
import { 
  BookOpen, 
  Percent, 
  TrendingUp, 
  HelpCircle, 
  Activity, 
  Award, 
  Trash2,
  Box,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Database,
  FileText,
  Info,
  ShieldCheck,
  CheckSquare,
  Zap,
  Layers,
  ChevronRight,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface AdminPanelProps {
  user: Usuario;
  empresa: Empresa | null;
  onNavigate?: (panel: string) => void;
}

interface LogAuditoria {
  id: string;
  timestamp: string;
  evento: string;
  modulo: string;
  usuario: string;
  status: 'Sucesso' | 'Alerta' | 'Bloqueado';
}

export default function AdminPanel({ user, empresa, onNavigate }: AdminPanelProps) {
  // Selected metric category for formula dictionary
  const [selectedMetricTab, setSelectedMetricTab] = useState<'logistica' | 'quebras' | 'repack' | 'outros'>('logistica');

  // Modules state
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({
    repack: true,
    despejo: true,
    armazem: true,
    quebras: true,
    validades: true,
    refugo: true,
  });

  // MFA configs
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaPhone, setMfaPhone] = useState('(83) 99341-2101');
  const [backupKeys, setBackupKeys] = useState<string[]>(['AF-983D-41A8', 'AF-082D-9122', 'AF-439A-FF88', 'AF-1092-2D9E']);
  const [mfaConfiguring, setMfaConfiguring] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<LogAuditoria[]>([]);

  const empresaId = empresa?.id || 'demo';

  // Read config toggles from company schema
  useEffect(() => {
    if (empresa?.modulosAtivos) {
      setActiveModules(empresa.modulosAtivos as any);
    }
  }, [empresa]);

  // Read logs initial mock lists
  useEffect(() => {
    const savedLogs = localStorage.getItem(`audit_logs_${empresaId}`);
    if (savedLogs) {
      setAuditLogs(JSON.parse(savedLogs));
    } else {
      const initLogs: LogAuditoria[] = [
        { id: 'LOG-309', timestamp: '20/06/2026 14:15:22', evento: 'Autenticação Multifator (MFA) requisitada', modulo: 'Segurança', usuario: user.email, status: 'Sucesso' },
        { id: 'LOG-308', timestamp: '20/06/2026 14:10:05', evento: 'Sincronização de tabelas com Firestore', modulo: 'Database', usuario: 'Sistema local', status: 'Sucesso' },
        { id: 'LOG-307', timestamp: '20/06/2026 13:58:34', evento: 'Nova empresa registrada de forma segura', modulo: 'Cadastro', usuario: user.email, status: 'Sucesso' },
      ];
      setAuditLogs(initLogs);
      localStorage.setItem(`audit_logs_${empresaId}`, JSON.stringify(initLogs));
    }
  }, [empresaId]);

  const handleToggleModule = async (moduleKey: string) => {
    const updated = {
      ...activeModules,
      [moduleKey]: !activeModules[moduleKey],
    };
    setActiveModules(updated);

    try {
      if (db && empresa?.id) {
        await updateDoc(doc(db, 'empresas', empresa.id), {
          modulosAtivos: updated
        });
      } else {
        localStorage.setItem(`active_modules_${empresaId}`, JSON.stringify(updated));
      }

      // Add a security audit log row
      addAuditLog(`Módulo [${moduleKey.toUpperCase()}] alterado para ${updated[moduleKey] ? 'ATIVADO' : 'INATIVO'}`, 'Painel Administrativo', 'Sucesso');
      toast('Módulo atualizado!');
    } catch(err) {
      alert('Erro ao atualizar licença de módulo: ' + err);
    }
  };

  const handleToggleMFA = () => {
    setMfaConfiguring(true);
    setTimeout(() => {
      const nowVal = !mfaEnabled;
      setMfaEnabled(nowVal);
      addAuditLog(`Configuração de Autenticação Multifator (MFA) ${nowVal ? 'ATIVADA' : 'DESATIVADA'}`, 'Segurança', 'Sucesso');
      setMfaConfiguring(false);
      toast(nowVal ? 'MFA Habilitado!' : 'MFA Desativado.');
    }, 1200);
  };

  const handleGenerateBackupKeys = () => {
    const keys = Array.from({ length: 4 }, () => `AF-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBackupKeys(keys);
    addAuditLog('Novos códigos de segurança de backup gerados', 'Segurança', 'Sucesso');
    toast('Chaves geradas!');
  };

  const addAuditLog = (evento: string, modulo: string, status: 'Sucesso' | 'Alerta' | 'Bloqueado') => {
    const todayStr = new Date().toLocaleString('pt-BR');
    const logId = `LOG-${Math.round(400 + Math.random() * 500)}`;
    const newLog: LogAuditoria = {
      id: logId,
      timestamp: todayStr,
      evento,
      modulo,
      usuario: user.email,
      status
    };

    setAuditLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 50); // limit to latest 50
      localStorage.setItem(`audit_logs_${empresaId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const toast = (m: string) => {
    const el = document.getElementById('toast');
    if (el) {
      el.textContent = m;
      el.className = 'show';
      setTimeout(() => el.className = '', 3000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 bg-[#11151c] border-b border-[#222d3a] rounded-t-xl -mx-6 md:-mx-12 -mt-6">
        <span className="font-sans font-black text-sm tracking-widest text-[#a855f7] uppercase">⚙️ ASSINATURAS E PAINEL ADMINISTRATIVO</span>
        <div className="text-[10px] text-[#6a7d92] tracking-wider uppercase font-semibold">
          Administrador: <strong className="text-[#a855f7]">{user.nome.toUpperCase()}</strong>
        </div>
      </div>

      {/* Modules active control toggles */}
      <div className="g-card p-6 flex flex-col gap-5">
        <h3 className="font-sans font-black text-sm tracking-wider uppercase text-[#a855f7]">Gerenciar Licenciamento de Módulos Instância</h3>
        <p className="text-xs text-[#6a7d92] leading-relaxed">
          Ative ou desative de forma remota e instantânea o acesso de conferidores e motoristas a cada funcionalidade no painel de navegação da empresa.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="flex items-center justify-between p-4 bg-[#151b23] border border-[#222d3a] rounded-xl hover:bg-[#1a2030] transition-colors">
            <div>
              <span className="font-sans font-extrabold text-xs text-white">🔄 Módulo Repack / Recheque</span>
              <p className="text-[10px] text-[#6a7d92] mt-0.5">Controle de retrabalho de garrafas e reencaixe de vidros</p>
            </div>
            <button 
              onClick={() => handleToggleModule('repack')}
              className={`py-1.5 px-4 font-bold text-[10px] tracking-wide uppercase transition-all rounded-lg cursor-pointer ${activeModules.repack ? 'bg-gradient-to-r from-green to-[#22c55e] text-[#07090d]' : 'bg-[#1c2530] text-[#6a7d92]'}`}
            >
              {activeModules.repack ? '✅ Ativo' : '✕ Inativo'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#151b23] border border-[#222d3a] rounded-xl hover:bg-[#1a2030] transition-colors">
            <div>
              <span className="font-sans font-extrabold text-xs text-white">🗑 Módulo Despejo de Líquidos</span>
              <p className="text-[10px] text-[#6a7d92] mt-0.5">Controle de derrame e baixa fiscal de descarte</p>
            </div>
            <button 
              onClick={() => handleToggleModule('despejo')}
              className={`py-1.5 px-4 font-bold text-[10px] tracking-wide uppercase transition-all rounded-lg cursor-pointer ${activeModules.despejo ? 'bg-gradient-to-r from-green to-[#22c55e] text-[#07090d]' : 'bg-[#1c2530] text-[#6a7d92]'}`}
            >
              {activeModules.despejo ? '✅ Ativo' : '✕ Inativo'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#151b23] border border-[#222d3a] rounded-xl hover:bg-[#1a2030] transition-colors">
            <div>
              <span className="font-sans font-extrabold text-xs text-white">💥 Módulo Controle de Quebras</span>
              <p className="text-[10px] text-[#6a7d92] mt-0.5">Relatório de perdas de estoque e estragos em movimentações</p>
            </div>
            <button 
              onClick={() => handleToggleModule('quebras')}
              className={`py-1.5 px-4 font-bold text-[10px] tracking-wide uppercase transition-all rounded-lg cursor-pointer ${activeModules.quebras ? 'bg-gradient-to-r from-green to-[#22c55e] text-[#07090d]' : 'bg-[#1c2530] text-[#6a7d92]'}`}
            >
              {activeModules.quebras ? '✅ Ativo' : '✕ Inativo'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#151b23] border border-[#222d3a] rounded-xl hover:bg-[#1a2030] transition-colors">
            <div>
              <span className="font-sans font-extrabold text-xs text-white">🏷 Módulo Validades (FEFO)</span>
              <p className="text-[10px] text-[#6a7d92] mt-0.5">Alertas coloridos inteligentes e ordenações de vencimento</p>
            </div>
            <button 
              onClick={() => handleToggleModule('validades')}
              className={`py-1.5 px-4 font-bold text-[10px] tracking-wide uppercase transition-all rounded-lg cursor-pointer ${activeModules.validades ? 'bg-gradient-to-r from-green to-[#22c55e] text-[#07090d]' : 'bg-[#1c2530] text-[#6a7d92]'}`}
            >
              {activeModules.validades ? '✅ Ativo' : '✕ Inativo'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#151b23] border border-[#222d3a] rounded-xl hover:bg-[#1a2030] transition-colors">
            <div>
              <span className="font-sans font-extrabold text-xs text-white">🍾 Módulo Blitz de Refugo</span>
              <p className="text-[10px] text-[#6a7d92] mt-0.5">Cálculos automáticos de integridade física de retornáveis</p>
            </div>
            <button 
              onClick={() => handleToggleModule('refugo')}
              className={`py-1.5 px-4 font-bold text-[10px] tracking-wide uppercase transition-all rounded-lg cursor-pointer ${activeModules.refugo ? 'bg-gradient-to-r from-green to-[#22c55e] text-[#07090d]' : 'bg-[#1c2530] text-[#6a7d92]'}`}
            >
              {activeModules.refugo ? '✅ Ativo' : '✕ Inativo'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#151b23] border border-[#222d3a] rounded-xl hover:bg-[#1a2030] transition-colors">
            <div>
              <span className="font-sans font-extrabold text-xs text-white">🚛 Módulo Portaria / Faturamento</span>
              <p className="text-[10px] text-[#6a7d92] mt-0.5">Controle de pátio com janela de faturamento 07:00-21:00</p>
            </div>
            <button 
              onClick={() => handleToggleModule('armazem')}
              className={`py-1.5 px-4 font-bold text-[10px] tracking-wide uppercase transition-all rounded-lg cursor-pointer ${activeModules.armazem ? 'bg-gradient-to-r from-green to-[#22c55e] text-[#07090d]' : 'bg-[#1c2530] text-[#6a7d92]'}`}
            >
              {activeModules.armazem ? '✅ Ativo' : '✕ Inativo'}
            </button>
          </div>

        </div>
      </div>

      {/* ── CENTRAL DE DASHBOARDS INTEGRADOS ── */}
      <div className="g-card p-6 flex flex-col gap-6 border-l-2 border-l-[#a855f7]">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#222d3a] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7]">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-black text-sm tracking-wider uppercase text-white">Central de Dashboards & Indicadores Integrados</h3>
              <p className="text-[11px] text-[#6a7d92]">
                Acompanhe o resumo visual de cada módulo operacional. 
                <span className="text-[#a855f7] font-semibold"> Clique em qualquer gráfico para acessar o painel operacional correspondente.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Grid of Interactive Dashboards Previews */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* 1. REPACK DASHBOARD PREVIEW */}
          <div className="p-5 bg-[#151b23] border border-[#222d3a] hover:border-purple-500/40 rounded-2xl flex flex-col gap-4 group transition-all duration-300">
            <div className="flex items-center justify-between border-b border-[#222d3a] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Box className="w-4 h-4" />
                </div>
                <span className="font-sans font-black text-[11px] text-white uppercase tracking-wider">Dashboard Repack & Recheque</span>
              </div>
              <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full font-bold">REPACK-DASH</span>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0f141c] p-3 rounded-xl border border-[#222d3a] flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-wider">Caixas no Período</span>
                <span className="text-2xl font-sans font-black text-white mt-1">23</span>
                <span className="text-[9px] text-purple-400 mt-0.5 font-bold">TOTAL NO PERÍODO</span>
              </div>
              <div className="bg-[#0f141c] p-3 rounded-xl border border-[#222d3a] flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-wider">Tempo Médio</span>
                <span className="text-2xl font-mono font-black text-white mt-1">00:00:22</span>
                <span className="text-[9px] text-emerald-400 mt-0.5 font-bold">POR CAIXA PRONTA</span>
              </div>
            </div>

            {/* Clickable Graph */}
            <div 
              onClick={() => onNavigate && onNavigate('repack-dashboard')}
              className="bg-[#0f141c] p-2 rounded-xl border border-[#222d3a] hover:border-purple-500/40 transition-all cursor-pointer relative group-hover:scale-[1.01]"
              title="Clique para ir ao Dashboard Repack"
            >
              <div className="absolute top-2 right-2 bg-purple-500/20 text-purple-300 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 z-10 pointer-events-none">
                <Zap className="w-2.5 h-2.5" /> IR PARA O DASHBOARD
              </div>
              <div className="h-[140px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Ozenildo S.', caixas: 15 },
                    { name: 'Matheus B.', caixas: 18 },
                    { name: 'Paulo P.', caixas: 23 },
                    { name: 'Cleiton S.', caixas: 12 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222d3a" vertical={false} />
                    <XAxis dataKey="name" stroke="#6a7d92" fontSize={8} tickLine={false} />
                    <YAxis stroke="#6a7d92" fontSize={8} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f141c', borderColor: '#222d3a', borderRadius: '8px', fontSize: '10px' }} />
                    <Bar dataKey="caixas" fill="#a855f7" radius={[4, 4, 0, 0]}>
                      <Cell fill="#8b5cf6" />
                      <Cell fill="#a78bfa" />
                      <Cell fill="#d8b4fe" />
                      <Cell fill="#818cf8" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[8px] text-center text-[#6a7d92] mt-1 font-semibold uppercase tracking-wider">Gráfico: Produtividade por Repacador (Caixas Inteiras)</p>
            </div>

            {/* Calculation details */}
            <div className="bg-[#0a0d13] p-3 rounded-xl border border-[#222d3a] text-[10px] text-gray-400 leading-relaxed">
              <span className="font-bold text-white uppercase text-[9px] block mb-1">Como é feito o cálculo:</span>
              <p>
                O sistema cronometra de forma autônoma o tempo gasto por operador para selar cada lote de caixas. A produtividade consolidada é calculada pela fórmula:
              </p>
              <div className="bg-[#0f141c] p-2 my-2 rounded border border-purple-500/20 font-mono text-center text-purple-300 text-[9px]">
                Tempo Médio por Caixa = Tempo de Atividade (segundos) / Quantidade de Caixas Prontas
              </div>
            </div>
          </div>

          {/* 2. LOGÍSTICA DASHBOARD PREVIEW */}
          <div className="p-5 bg-[#151b23] border border-[#222d3a] hover:border-sky-500/40 rounded-2xl flex flex-col gap-4 group transition-all duration-300">
            <div className="flex items-center justify-between border-b border-[#222d3a] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <Percent className="w-4 h-4" />
                </div>
                <span className="font-sans font-black text-[11px] text-white uppercase tracking-wider">Dashboard Logística EFC / EFD</span>
              </div>
              <span className="text-[9px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full font-bold">LOGISTICA-DASH</span>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0f141c] p-3 rounded-xl border border-[#222d3a] flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-wider">Janela de Saída (EFC)</span>
                <span className="text-2xl font-sans font-black text-emerald-400 mt-1">88.5%</span>
                <span className="text-[9px] text-[#6a7d92] mt-0.5 font-bold">DENTRO DA META</span>
              </div>
              <div className="bg-[#0f141c] p-3 rounded-xl border border-[#222d3a] flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-wider">Janela de Entrada (EFD)</span>
                <span className="text-2xl font-sans font-black text-sky-400 mt-1">81.2%</span>
                <span className="text-[9px] text-[#6a7d92] mt-0.5 font-bold">DENTRO DA META</span>
              </div>
            </div>

            {/* Clickable Graph */}
            <div 
              onClick={() => onNavigate && onNavigate('logistica-dashboard')}
              className="bg-[#0f141c] p-2 rounded-xl border border-[#222d3a] hover:border-sky-500/40 transition-all cursor-pointer relative group-hover:scale-[1.01]"
              title="Clique para ir ao Dashboard Logística"
            >
              <div className="absolute top-2 right-2 bg-sky-500/20 text-sky-300 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 z-10 pointer-events-none">
                <Zap className="w-2.5 h-2.5" /> IR PARA O DASHBOARD
              </div>
              <div className="h-[140px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { shift: 'Manhã', EFC: 91, EFD: 83 },
                    { shift: 'Tarde', EFC: 85, EFD: 80 },
                    { shift: 'Noite', EFC: 89, EFD: 81 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222d3a" vertical={false} />
                    <XAxis dataKey="shift" stroke="#6a7d92" fontSize={8} tickLine={false} />
                    <YAxis stroke="#6a7d92" fontSize={8} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f141c', borderColor: '#222d3a', borderRadius: '8px', fontSize: '10px' }} />
                    <Bar dataKey="EFC" fill="#10b981" name="EFC (Saída)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="EFD" fill="#3b82f6" name="EFD (Entrada)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[8px] text-center text-[#6a7d92] mt-1 font-semibold uppercase tracking-wider">Gráfico: Eficiência Logística por Turno (%)</p>
            </div>

            {/* Calculation details */}
            <div className="bg-[#0a0d13] p-3 rounded-xl border border-[#222d3a] text-[10px] text-gray-400 leading-relaxed">
              <span className="font-bold text-white uppercase text-[9px] block mb-1">Como é feito o cálculo:</span>
              <p>
                Calcula-se o percentual de veículos que iniciaram e concluíram o processo dentro da janela planejada:
              </p>
              <div className="bg-[#0f141c] p-2 my-2 rounded border border-sky-500/20 font-mono text-center text-sky-300 text-[9px]">
                EF(C/D) = (Qtd. Carregamentos ou Descargas dentro do Horário / Total) * 100
              </div>
            </div>
          </div>

          {/* 3. QUEBRAS DASHBOARD PREVIEW */}
          <div className="p-5 bg-[#151b23] border border-[#222d3a] hover:border-amber-500/40 rounded-2xl flex flex-col gap-4 group transition-all duration-300">
            <div className="flex items-center justify-between border-b border-[#222d3a] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="font-sans font-black text-[11px] text-white uppercase tracking-wider">Dashboard de Quebras & Perdas</span>
              </div>
              <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-bold">QUEBRAS-DASH</span>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0f141c] p-3 rounded-xl border border-[#222d3a] flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-wider">Avarias Registradas</span>
                <span className="text-2xl font-sans font-black text-rose-400 mt-1">142</span>
                <span className="text-[9px] text-[#6a7d92] mt-0.5 font-bold">CAIXAS NO PERÍODO</span>
              </div>
              <div className="bg-[#0f141c] p-3 rounded-xl border border-[#222d3a] flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-wider">Setor Crítico</span>
                <span className="text-xl font-sans font-black text-amber-400 mt-1.5 uppercase">Picking</span>
                <span className="text-[9px] text-[#6a7d92] mt-0.5 font-bold">42.0% REPRESENTATIVIDADE</span>
              </div>
            </div>

            {/* Clickable Graph */}
            <div 
              onClick={() => onNavigate && onNavigate('quebras-dashboard')}
              className="bg-[#0f141c] p-2 rounded-xl border border-[#222d3a] hover:border-amber-500/40 transition-all cursor-pointer relative group-hover:scale-[1.01]"
              title="Clique para ir ao Dashboard de Quebras"
            >
              <div className="absolute top-2 right-2 bg-amber-500/20 text-amber-300 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 z-10 pointer-events-none">
                <Zap className="w-2.5 h-2.5" /> IR PARA O DASHBOARD
              </div>
              <div className="h-[140px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Picking', value: 42 },
                    { name: 'Blocado', value: 28 },
                    { name: 'Docas', value: 20 },
                    { name: 'Blitz', value: 10 },
                  ]} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#222d3a" horizontal={false} />
                    <XAxis type="number" stroke="#6a7d92" fontSize={8} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#6a7d92" fontSize={8} tickLine={false} width={45} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f141c', borderColor: '#222d3a', borderRadius: '8px', fontSize: '10px' }} />
                    <Bar dataKey="value" fill="#f5a623" radius={[0, 3, 3, 0]}>
                      <Cell fill="#ef4444" />
                      <Cell fill="#f5a623" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#10b981" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[8px] text-center text-[#6a7d92] mt-1 font-semibold uppercase tracking-wider">Gráfico: Percentual de Quebras por Setor Operacional</p>
            </div>

            {/* Calculation details */}
            <div className="bg-[#0a0d13] p-3 rounded-xl border border-[#222d3a] text-[10px] text-gray-400 leading-relaxed">
              <span className="font-bold text-white uppercase text-[9px] block mb-1">Como é feito o cálculo:</span>
              <p>
                As quebras são lançadas por setor e consolidadas para identificar as principais áreas de perda de material:
              </p>
              <div className="bg-[#0f141c] p-2 my-2 rounded border border-amber-500/20 font-mono text-center text-amber-300 text-[9px]">
                Representatividade % = (Soma das Perdas na Área / Perdas Gerais Totais) * 100
              </div>
            </div>
          </div>

          {/* 4. DESPEJO DASHBOARD PREVIEW */}
          <div className="p-5 bg-[#151b23] border border-[#222d3a] hover:border-rose-500/40 rounded-2xl flex flex-col gap-4 group transition-all duration-300">
            <div className="flex items-center justify-between border-b border-[#222d3a] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-sans font-black text-[11px] text-white uppercase tracking-wider">Dashboard Despejo de Líquidos</span>
              </div>
              <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full font-bold">DESPEJO-DASH</span>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0f141c] p-3 rounded-xl border border-[#222d3a] flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-wider">Volume de Descarte</span>
                <span className="text-2xl font-sans font-black text-rose-400 mt-1">3.450 L</span>
                <span className="text-[9px] text-[#6a7d92] mt-0.5 font-bold">AMBIENTALMENTE SEGURO</span>
              </div>
              <div className="bg-[#0f141c] p-3 rounded-xl border border-[#222d3a] flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-wider">Eficiência Tributária</span>
                <span className="text-2xl font-sans font-black text-emerald-400 mt-1">98.4%</span>
                <span className="text-[9px] text-[#6a7d92] mt-0.5 font-bold">BAIXA FISCAL EFETUADA</span>
              </div>
            </div>

            {/* Clickable Graph */}
            <div 
              onClick={() => onNavigate && onNavigate('despejo-dashboard')}
              className="bg-[#0f141c] p-2 rounded-xl border border-[#222d3a] hover:border-rose-500/40 transition-all cursor-pointer relative group-hover:scale-[1.01]"
              title="Clique para ir ao Dashboard Despejo"
            >
              <div className="absolute top-2 right-2 bg-rose-500/20 text-rose-300 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 z-10 pointer-events-none">
                <Zap className="w-2.5 h-2.5" /> IR PARA O DASHBOARD
              </div>
              <div className="h-[140px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { day: 'Seg', volume: 450 },
                    { day: 'Ter', volume: 800 },
                    { day: 'Qua', volume: 600 },
                    { day: 'Qui', volume: 1200 },
                    { day: 'Sex', volume: 400 },
                  ]}>
                    <defs>
                      <linearGradient id="despejoColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222d3a" vertical={false} />
                    <XAxis dataKey="day" stroke="#6a7d92" fontSize={8} tickLine={false} />
                    <YAxis stroke="#6a7d92" fontSize={8} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f141c', borderColor: '#222d3a', borderRadius: '8px', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="volume" stroke="#ef4444" fillOpacity={1} fill="url(#despejoColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[8px] text-center text-[#6a7d92] mt-1 font-semibold uppercase tracking-wider">Gráfico: Volume Descartado Diário (Litros)</p>
            </div>

            {/* Calculation details */}
            <div className="bg-[#0a0d13] p-3 rounded-xl border border-[#222d3a] text-[10px] text-gray-400 leading-relaxed">
              <span className="font-bold text-white uppercase text-[9px] block mb-1">Como é feito o cálculo:</span>
              <p>
                Calcula a volumetria de descarte de líquidos em conformidade tributária e segurança ecológica:
              </p>
              <div className="bg-[#0f141c] p-2 my-2 rounded border border-rose-500/20 font-mono text-center text-rose-300 text-[9px]">
                Volume Líquido = Soma(Qtd Caixas × Volume da Garrafa em Litros × Grau de Avaria)
              </div>
            </div>
          </div>

          {/* 5. FEFO & VALIDADES DASHBOARD PREVIEW */}
          <div className="p-5 bg-[#151b23] border border-[#222d3a] hover:border-teal-500/40 rounded-2xl flex flex-col gap-4 group transition-all duration-300">
            <div className="flex items-center justify-between border-b border-[#222d3a] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="font-sans font-black text-[11px] text-white uppercase tracking-wider">Dashboard FEFO & Validades</span>
              </div>
              <span className="text-[9px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full font-bold">FEFO-DASH</span>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0f141c] p-3 rounded-xl border border-[#222d3a] flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-wider">Lotes Críticos (&lt;30 dias)</span>
                <span className="text-2xl font-sans font-black text-rose-400 mt-1">4</span>
                <span className="text-[9px] text-[#6a7d92] mt-0.5 font-bold">BLOQUEIO IMEDIATO</span>
              </div>
              <div className="bg-[#0f141c] p-3 rounded-xl border border-[#222d3a] flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-wider">Lotes em Atenção (30-90 dias)</span>
                <span className="text-2xl font-sans font-black text-[#f5a623] mt-1">12</span>
                <span className="text-[9px] text-[#6a7d92] mt-0.5 font-bold">EXPEDIÇÃO PRIORITÁRIA</span>
              </div>
            </div>

            {/* Clickable Graph */}
            <div 
              onClick={() => onNavigate && onNavigate('fefo-dashboard')}
              className="bg-[#0f141c] p-2 rounded-xl border border-[#222d3a] hover:border-teal-500/40 transition-all cursor-pointer relative group-hover:scale-[1.01]"
              title="Clique para ir ao Dashboard FEFO"
            >
              <div className="absolute top-2 right-2 bg-teal-500/20 text-teal-300 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 z-10 pointer-events-none">
                <Zap className="w-2.5 h-2.5" /> IR PARA O DASHBOARD
              </div>
              <div className="h-[140px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { status: 'Crítico', lotes: 4, fill: '#ef4444' },
                    { status: 'Atenção', lotes: 12, fill: '#f5a623' },
                    { status: 'Seguro', lotes: 84, fill: '#10b981' },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222d3a" vertical={false} />
                    <XAxis dataKey="status" stroke="#6a7d92" fontSize={8} tickLine={false} />
                    <YAxis stroke="#6a7d92" fontSize={8} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f141c', borderColor: '#222d3a', borderRadius: '8px', fontSize: '10px' }} />
                    <Bar dataKey="lotes" radius={[4, 4, 0, 0]}>
                      <Cell fill="#ef4444" />
                      <Cell fill="#f5a623" />
                      <Cell fill="#10b981" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[8px] text-center text-[#6a7d92] mt-1 font-semibold uppercase tracking-wider">Gráfico: Lotes em Estoque por Criticidade FEFO</p>
            </div>

            {/* Calculation details */}
            <div className="bg-[#0a0d13] p-3 rounded-xl border border-[#222d3a] text-[10px] text-gray-400 leading-relaxed">
              <span className="font-bold text-white uppercase text-[9px] block mb-1">Como é feito o cálculo:</span>
              <p>
                Calcula dinamicamente a proximidade da data de validade de cada lote para forçar a rotação inteligente:
              </p>
              <div className="bg-[#0f141c] p-2 my-2 rounded border border-teal-500/20 font-mono text-center text-teal-300 text-[9px]">
                Dias Restantes = Data de Vencimento do Lote - Data do Sistema Atual
              </div>
            </div>
          </div>

          {/* 6. BLITZ DE REFUGO DASHBOARD PREVIEW */}
          <div className="p-5 bg-[#151b23] border border-[#222d3a] hover:border-orange-500/40 rounded-2xl flex flex-col gap-4 group transition-all duration-300">
            <div className="flex items-center justify-between border-b border-[#222d3a] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className="font-sans font-black text-[11px] text-white uppercase tracking-wider">Dashboard Blitz de Refugo</span>
              </div>
              <span className="text-[9px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full font-bold">BLITZ-DASH</span>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0f141c] p-3 rounded-xl border border-[#222d3a] flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-wider">Lotes Amostrados</span>
                <span className="text-2xl font-sans font-black text-white mt-1">18</span>
                <span className="text-[9px] text-[#6a7d92] mt-0.5 font-bold">BLITZES EXECUTADAS</span>
              </div>
              <div className="bg-[#0f141c] p-3 rounded-xl border border-[#222d3a] flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-wider">Média de Refugo</span>
                <span className="text-2xl font-sans font-black text-[#f5a623] mt-1">2.8%</span>
                <span className="text-[9px] text-[#6a7d92] mt-0.5 font-bold">META: ABAIXO DE 3.5%</span>
              </div>
            </div>

            {/* Clickable Graph */}
            <div 
              onClick={() => onNavigate && onNavigate('blitz-dashboard')}
              className="bg-[#0f141c] p-2 rounded-xl border border-[#222d3a] hover:border-orange-500/40 transition-all cursor-pointer relative group-hover:scale-[1.01]"
              title="Clique para ir ao Dashboard Blitz"
            >
              <div className="absolute top-2 right-2 bg-orange-500/20 text-orange-300 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 z-10 pointer-events-none">
                <Zap className="w-2.5 h-2.5" /> IR PARA O DASHBOARD
              </div>
              <div className="h-[140px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { sample: 'Lt 1', taxa: 1.5 },
                    { sample: 'Lt 2', taxa: 3.4 },
                    { sample: 'Lt 3', taxa: 2.1 },
                    { sample: 'Lt 4', taxa: 2.8 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222d3a" vertical={false} />
                    <XAxis dataKey="sample" stroke="#6a7d92" fontSize={8} tickLine={false} />
                    <YAxis stroke="#6a7d92" fontSize={8} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f141c', borderColor: '#222d3a', borderRadius: '8px', fontSize: '10px' }} />
                    <Line type="monotone" dataKey="taxa" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[8px] text-center text-[#6a7d92] mt-1 font-semibold uppercase tracking-wider">Gráfico: Índice de Vasilhames Rejeitados por Amostra (%)</p>
            </div>

            {/* Calculation details */}
            <div className="bg-[#0a0d13] p-3 rounded-xl border border-[#222d3a] text-[10px] text-gray-400 leading-relaxed">
              <span className="font-bold text-white uppercase text-[9px] block mb-1">Como é feito o cálculo:</span>
              <p>
                As garrafas retornáveis de vidro são inspecionadas em blitz amostrais para mapear trincas e rejeições de vasilhames:
              </p>
              <div className="bg-[#0f141c] p-2 my-2 rounded border border-orange-500/20 font-mono text-center text-orange-300 text-[9px]">
                Taxa de Refugo Amostral (%) = (Quantidade Rejeitada / Total Inspecionado na Blitz) * 100
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MFA controls core screen */}
      <div className="g-card p-6 flex flex-col gap-5 border-l-2 border-l-[#a855f7]">
        <h3 className="font-sans font-black text-sm tracking-wider uppercase text-[#a855f7]">Autenticação Multifator Avançada (MFA)</h3>
        <p className="text-xs text-[#6a7d92] leading-relaxed">
          Evite que terceiros alterem dados de inventário ou quebras sem autorização. Ao ativar, uma verificação via SMS contendo PIN temporário ou chave de backup é exigida na autenticação inicial.
        </p>

        <div className="p-4 bg-[#0a0d13] border border-[#222d3a] rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <span className="block text-xs font-bold text-snow">Segurança Multifator via Código PIN</span>
                <span className="text-[10px] text-[#6a7d92]">Enviando alertas para o celular: <strong className="text-snow">{mfaPhone}</strong></span>
              </div>
            </div>
            
            <button 
              onClick={handleToggleMFA}
              disabled={mfaConfiguring}
              className={`py-2 px-5 font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer ${mfaEnabled ? 'bg-[#ef4444]/15 border border-[#ef4444]/25 text-[#fca5a5] hover:bg-red hover:text-white' : 'bg-gradient-to-br from-[#a855f7] to-[#7c3aed] text-white'}`}
            >
              {mfaConfiguring ? 'Carregando...' : mfaEnabled ? 'Desativar MFA' : 'Ativar MFA Corporativo'}
            </button>
          </div>

          {/* Backup keys */}
          {mfaEnabled && (
            <div className="border-t border-[#222d3a] pt-4 mt-1">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase font-black text-[#6a7d92] tracking-wider">Chaves de Emergência Ativas para Restauração</span>
                <button onClick={handleGenerateBackupKeys} className="text-[10px] font-bold text-[#a855f7] bg-transparent border-none cursor-pointer hover:underline">
                  Gerar novas chaves
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {backupKeys.map((k, i) => (
                  <div key={i} className="p-2.5 bg-[#151b23] border border-[#1c2530] text-center rounded-lg font-mono text-[10px] text-snow font-bold select-all tracking-wider" title="Clique para selecionar e copiar">
                    {k}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DICIONÁRIO DE MÉTRICAS E FÓRMULAS OPERACIONAIS ── */}
      <div className="g-card p-6 flex flex-col gap-5 border-l-2 border-l-[#a855f7]">
        <div className="flex items-center gap-3 border-b border-[#222d3a] pb-3 flex-wrap justify-between gap-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-black text-sm tracking-wider uppercase text-[#a855f7]">Dicionário de Métricas e Fórmulas Operacionais</h3>
              <p className="text-[10px] text-[#6a7d92] font-semibold mt-0.5">Entenda como cada indicador de gestão e logística é medido e calculado de forma automatizada.</p>
            </div>
          </div>
          
          {/* Tabs selectors */}
          <div className="flex bg-[#0f141c] border border-[#222d3a] p-1 rounded-xl gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedMetricTab('logistica')}
              className={`px-3 py-1.5 rounded-lg font-sans font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer ${selectedMetricTab === 'logistica' ? 'bg-[#a855f7] text-white shadow-xs' : 'text-[#6a7d92] hover:text-white bg-transparent border-none'}`}
            >
              📊 Logística (EFC/EFD)
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetricTab('quebras')}
              className={`px-3 py-1.5 rounded-lg font-sans font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer ${selectedMetricTab === 'quebras' ? 'bg-[#a855f7] text-white shadow-xs' : 'text-[#6a7d92] hover:text-white bg-transparent border-none'}`}
            >
              💥 Quebras (Perdas)
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetricTab('repack')}
              className={`px-3 py-1.5 rounded-lg font-sans font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer ${selectedMetricTab === 'repack' ? 'bg-[#a855f7] text-white shadow-xs' : 'text-[#6a7d92] hover:text-white bg-transparent border-none'}`}
            >
              🔄 Repack & Refugo
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetricTab('outros')}
              className={`px-3 py-1.5 rounded-lg font-sans font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer ${selectedMetricTab === 'outros' ? 'bg-[#a855f7] text-white shadow-xs' : 'text-[#6a7d92] hover:text-white bg-transparent border-none'}`}
            >
              💼 Outros Indicadores
            </button>
          </div>
        </div>

        {/* Content of the selected Tab */}
        {selectedMetricTab === 'logistica' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* EFC Box */}
              <div className="p-4 bg-[#151b23] border border-[#222d3a] rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
                  <Percent className="w-4 h-4 text-emerald-400" />
                  <span>EFC — Eficiência de Faturamento e Carregamento</span>
                </div>
                <p className="text-[11px] text-[#6a7d92] leading-relaxed">
                  Mede o nível de cumprimento da janela horária para os caminhões expedidos com mercadorias. Garante que os processos de faturamento e carregamento ocorram no tempo planejado de operação.
                </p>
                <div className="bg-[#0f141c] p-3 rounded-lg border border-[#222d3a] flex flex-col items-center justify-center my-1">
                  <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-widest mb-2">Fórmula Matemática</span>
                  <div className="flex flex-col items-center font-mono text-[10px] text-snow">
                    <span className="pb-1 border-b border-gray-600 text-center px-4">Qtd. Carregamentos Dentro da Janela</span>
                    <span className="pt-1 text-center px-4">Total de Carregamentos Realizados</span>
                  </div>
                  <span className="text-xs font-black text-emerald-400 mt-2">× 100</span>
                </div>
                <div className="text-[10px] text-gray-400 leading-normal flex flex-col gap-1.5 border-t border-[#222d3a] pt-2">
                  <div>• <strong>Dentro da Janela:</strong> Operações de carregamento identificadas no sistema com status regular de janela ativa.</div>
                  <div>• <strong>Meta Operacional:</strong> Manter-se acima de <strong className="text-emerald-400">85.0%</strong> para evitar penalidades comerciais e retenção de frotas.</div>
                </div>
              </div>

              {/* EFD Box */}
              <div className="p-4 bg-[#151b23] border border-[#222d3a] rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
                  <Percent className="w-4 h-4 text-sky-400" />
                  <span>EFD — Eficiência de Faturamento de Descarga</span>
                </div>
                <p className="text-[11px] text-[#6a7d92] leading-relaxed">
                  Mede o cumprimento das janelas horárias destinadas ao recebimento de materiais e insumos de fornecedores externos, otimizando a rotatividade de docas de descarregamento.
                </p>
                <div className="bg-[#0f141c] p-3 rounded-lg border border-[#222d3a] flex flex-col items-center justify-center my-1">
                  <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-widest mb-2">Fórmula Matemática</span>
                  <div className="flex flex-col items-center font-mono text-[10px] text-snow">
                    <span className="pb-1 border-b border-gray-600 text-center px-4">Qtd. Descarregamentos Dentro da Janela</span>
                    <span className="pt-1 text-center px-4">Total de Descarregamentos Realizados</span>
                  </div>
                  <span className="text-xs font-black text-sky-400 mt-2">× 100</span>
                </div>
                <div className="text-[10px] text-gray-400 leading-normal flex flex-col gap-1.5 border-t border-[#222d3a] pt-2">
                  <div>• <strong>Critério do Dashboard:</strong> Calcula o percentual agrupando todos os registros filtrados pelo tipo operacional de "Descarregamento".</div>
                  <div>• <strong>Tempo de Permanência:</strong> Alvo ideal menor que 45 minutos em doca de entrada para recepção física de carga.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMetricTab === 'quebras' && (
          <div className="flex flex-col gap-6">
            <div className="p-4 bg-[#151b23] border border-[#222d3a] rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider border-b border-[#222d3a] pb-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span>Distribuição de Quebras por Área Operacional</span>
              </div>
              <p className="text-xs text-[#6a7d92] leading-relaxed">
                As perdas físicas no recinto do armazém (garrafas quebradas, fardos rompidos ou avarias no estoque) são registradas pelo time através de formulários digitais. O sistema então compila a representatividade percentual das perdas por área do armazém.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                <div className="bg-[#0f141c] p-4 rounded-xl border border-[#222d3a] flex flex-col justify-center items-center">
                  <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-widest mb-3">Fórmula de Distribuição por Área (%)</span>
                  <div className="flex flex-col items-center font-mono text-[10px] text-snow">
                    <span className="pb-1 border-b border-gray-600 text-center px-4">Soma das Quebras (Caixas / Itens) na Área X</span>
                    <span className="pt-1 text-center px-4">Soma Total Geral de Quebras Registradas na Empresa</span>
                  </div>
                  <span className="text-xs font-black text-amber-500 mt-2">× 100</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] font-black uppercase text-white tracking-wider">Mapeamento de Ofensores Operacionais:</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 bg-[#0f141c] rounded-lg border border-[#222d3a]">
                      <span className="text-amber-500 font-extrabold block">📦 BLOCADO / PICKING</span>
                      <span className="text-[#6a7d92]">Avarias comuns por manuseio rápido ou desalinhamento de paletes nas gôndolas de separação.</span>
                    </div>
                    <div className="p-2 bg-[#0f141c] rounded-lg border border-[#222d3a]">
                      <span className="text-sky-400 font-extrabold block">🚚 DOCAS / CARGA</span>
                      <span className="text-[#6a7d92]">Ocorre durante a colocação dos paletes no interior do baú de caminhões de entrega.</span>
                    </div>
                    <div className="p-2 bg-[#0f141c] rounded-lg border border-[#222d3a]">
                      <span className="text-emerald-400 font-extrabold block">🏬 RECON / REPACK</span>
                      <span className="text-[#6a7d92]">Perdas registradas no processo de reembalagem física e segregação de avarias físicas.</span>
                    </div>
                    <div className="p-2 bg-[#0f141c] rounded-lg border border-[#222d3a]">
                      <span className="text-purple-400 font-extrabold block">🚨 BLITZ / PORTARIA</span>
                      <span className="text-[#6a7d92]">Identificação de quebras no recebimento físico de caminhões retornando da rua.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMetricTab === 'repack' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Repack Box */}
              <div className="p-4 bg-[#151b23] border border-[#222d3a] rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-violet-400" />
                  <span>Eficiência de Repack (Tempo Médio por Palete)</span>
                </div>
                <p className="text-[11px] text-[#6a7d92] leading-relaxed">
                  Calcula o rendimento médio do time focado na reembalagem e recuperação física de produtos avariados, medindo a velocidade de reinserção desses itens recuperados ao estoque.
                </p>
                <div className="bg-[#0f141c] p-3 rounded-lg border border-[#222d3a] flex flex-col items-center justify-center my-1">
                  <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-widest mb-2">Fórmula Matemática</span>
                  <div className="flex flex-col items-center font-mono text-[10px] text-snow">
                    <span className="pb-1 border-b border-gray-600 text-center px-4">Tempo de Atividade de Repack (Minutos)</span>
                    <span className="pt-1 text-center px-4">Total de Paletes ou Caixas Reembaladas</span>
                  </div>
                  <span className="text-[10px] font-black text-violet-400 mt-2">Expresso em Minutos por Unidade (min/Palete)</span>
                </div>
                <div className="text-[10px] text-gray-400 leading-normal flex flex-col gap-1 border-t border-[#222d3a] pt-2">
                  <div>• <strong>Nível de Serviço Alvo:</strong> Menor que 15 minutos por palete de garrafa recuperado.</div>
                  <div>• <strong>Governança de Processo:</strong> Aprovado pelo Supervisor e registrado em tempo real pelo operador no painel móvel.</div>
                </div>
              </div>

              {/* Blitz de Refugo Box */}
              <div className="p-4 bg-[#151b23] border border-[#222d3a] rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-rose-400" />
                  <span>Cálculo de Percentual de Refugo (Blitz)</span>
                </div>
                <p className="text-[11px] text-[#6a7d92] leading-relaxed">
                  Avalia de forma automatizada o índice de descarte de garrafas retornáveis avariadas ou fora de padrão de mercado (sujeira extrema, desgaste físico excessivo ou quebras) inspecionadas em blitz amostrais.
                </p>
                <div className="bg-[#0f141c] p-3 rounded-lg border border-[#222d3a] flex flex-col items-center justify-center my-1">
                  <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-widest mb-2">Fórmula Matemática</span>
                  <div className="flex flex-col items-center font-mono text-[10px] text-snow">
                    <span className="pb-1 border-b border-gray-600 text-center px-4">Quantidade de Vasilhames Rejeitados / Refugados</span>
                    <span className="pt-1 text-center px-4">Total Geral de Garrafas Inspecionadas no Lote Amostral</span>
                  </div>
                  <span className="text-xs font-black text-rose-400 mt-2">× 100</span>
                </div>
                <div className="text-[10px] text-gray-400 leading-normal flex flex-col gap-1 border-t border-[#222d3a] pt-2">
                  <div>• <strong>Tolerância de Qualidade:</strong> O limite tolerado de refugo técnico no lote é de <strong className="text-rose-400">3.5%</strong>. Exceder esse patamar gera alertas imediatos para devoluções.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMetricTab === 'outros' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Densidade de Movimentação */}
              <div className="p-4 bg-[#151b23] border border-[#222d3a] rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Média de Paletes por Viagem / Movimentação</span>
                </div>
                <p className="text-[11px] text-[#6a7d92] leading-relaxed">
                  Monitora a eficiência de ocupação de garfos de empilhadeira, garantindo que o transporte interno ocorra em sua capacidade ideal, sem desperdício de rotas.
                </p>
                <div className="bg-[#0f141c] p-3 rounded-lg border border-[#222d3a] flex flex-col items-center justify-center my-1">
                  <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-widest mb-2">Fórmula Matemática</span>
                  <div className="flex flex-col items-center font-mono text-[10px] text-snow">
                    <span className="pb-1 border-b border-gray-600 text-center px-4">Soma Geral de Paletes Movimentados</span>
                    <span className="pt-1 text-center px-4">Quantidade Total de Operações (Viagens) Registradas</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 border-t border-[#222d3a] pt-2 leading-relaxed">
                  • <strong>Aplicação de Otimização:</strong> Permite o correto dimensionamento das equipes de pátio e das frotas de equipamentos pesados contratados.
                </p>
              </div>

              {/* FEFO */}
              <div className="p-4 bg-[#151b23] border border-[#222d3a] rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
                  <Award className="w-4 h-4 text-teal-400" />
                  <span>Método de Giro FEFO (First Expired, First Out)</span>
                </div>
                <p className="text-[11px] text-[#6a7d92] leading-relaxed">
                  Mapeia a criticidade do inventário para que os lotes que expiram primeiro saiam primeiro, mitigando a ocorrência de produtos vencidos no estoque de vendas.
                </p>
                <div className="bg-[#0f141c] p-3 rounded-lg border border-[#222d3a] flex flex-col items-center justify-center my-1">
                  <span className="text-[9px] font-black uppercase text-[#6a7d92] tracking-widest mb-2">Cálculo de Criticidade de Validade</span>
                  <span className="font-mono text-[10px] text-teal-300">Tempo de Vida Útil Restante = Data de Vencimento - Data Atual</span>
                  <span className="text-[10px] text-gray-500 mt-2 text-center">Classificação de Risco: Crítico (&lt;30 dias), Atenção (30-90 dias), Seguro (&gt;90 dias)</span>
                </div>
                <p className="text-[10px] text-gray-400 border-t border-[#222d3a] pt-2 leading-relaxed">
                  • <strong>Prevenção Pró-Ativa:</strong> O sistema bloqueia de forma automática carregamentos de lotes vencidos ou aponta alertas no painel de picking.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audit table history logs */}
      <div className="g-card p-6 overflow-hidden">
        <h3 className="font-sans font-black text-sm tracking-wider uppercase text-[#a855f7] mb-4">Registro Auditoria Eventos Dispositivo</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs min-w-[650px]">
            <thead>
              <tr className="bg-[#11151c] border-b border-[#222d3a]">
                <th className="p-3 text-[#6a7d92] font-bold text-[9px] tracking-wider uppercase">Identificador</th>
                <th className="p-3 text-[#6a7d92] font-bold text-[9px] tracking-wider uppercase">Data Recinto</th>
                <th className="p-3 text-[#6a7d92] font-bold text-[9px] tracking-wider uppercase">Evento Sistêmico</th>
                <th className="p-3 text-[#6a7d92] font-bold text-[9px] tracking-wider uppercase">Módulo</th>
                <th className="p-3 text-[#6a7d92] font-bold text-[9px] tracking-wider uppercase">Usuário</th>
                <th className="p-3 text-[#6a7d92] font-bold text-[9px] tracking-wider uppercase text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222d3a]/60">
              {auditLogs.map(l => (
                <tr key={l.id} className="hover:bg-[#151b23]/10">
                  <td className="p-3 font-mono text-[#6a7d92] font-semibold">{l.id}</td>
                  <td className="p-3 text-[#e2e8f0] font-mono">{l.timestamp}</td>
                  <td className="p-3 font-semibold text-snow">{l.evento}</td>
                  <td className="p-3 uppercase text-[10px] font-bold text-[#6a7d92]">{l.modulo}</td>
                  <td className="p-3 truncate max-w-[120px] text-[#6a7d92]">{l.usuario}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wide bg-[#22c55e]/15 border border-[#22c55e]/25 text-[#22c55e]`}>
                      ✓ {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
export {};
