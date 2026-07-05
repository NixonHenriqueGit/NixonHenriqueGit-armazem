import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, updateDoc, doc, onSnapshot, query, where, addDoc } from 'firebase/firestore';
import { Usuario, Empresa } from '../types';

interface AdminPanelProps {
  user: Usuario;
  empresa: Empresa | null;
}

interface LogAuditoria {
  id: string;
  timestamp: string;
  evento: string;
  modulo: string;
  usuario: string;
  status: 'Sucesso' | 'Alerta' | 'Bloqueado';
}

export default function AdminPanel({ user, empresa }: AdminPanelProps) {
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
