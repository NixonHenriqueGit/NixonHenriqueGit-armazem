import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoginAuth from './components/LoginAuth';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import RepackPanel from './components/RepackPanel';
import DespejoPanel from './components/DespejoPanel';
import ArmazemPanel from './components/ArmazemPanel';
import QuebrasPanel from './components/QuebrasPanel';
import ValidadesPanel from './components/ValidadesPanel';
import RefugoPanel from './components/RefugoPanel';
import EmpilhadorPanel from './components/EmpilhadorPanel';
import ConferentePanel from './components/ConferentePanel';
import ControlePanel from './components/ControlePanel';
import ExportarPanel from './components/ExportarPanel';
import AdminPanel from './components/AdminPanel';
import FirebasePanel from './components/FirebasePanel';
import RepackDashboard from './components/RepackDashboard';
import DespejoDashboard from './components/DespejoDashboard';
import LogisticaDashboard from './components/LogisticaDashboard';
import QuebrasDashboard from './components/QuebrasDashboard';
import FefoDashboard from './components/FefoDashboard';
import BlitzDashboard from './components/BlitzDashboard';

import { auth, db, isCustomFirebaseConnected } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Usuario, Empresa } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [activePanel, setActivePanel] = useState<string>('landing');
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('af-theme') as 'dark' | 'light') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  // Sync theme to body element and localStorage
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    try {
      localStorage.setItem('af-theme', theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  // Sync auth state
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        try {
          // Fetch user metadata from firestore
          const uDoc = await getDoc(doc(db, 'usuarios', fbUser.uid));
          if (uDoc.exists()) {
            const uData = uDoc.data() as Omit<Usuario, 'uid'>;
            const completeUser: Usuario = { uid: fbUser.uid, ...uData };
            const isNixon = completeUser.email.toLowerCase().trim() === 'nixon.a.a100.nh@gmail.com';
            if (isNixon) {
              completeUser.papel = 'admin';
            }
            
            const savedMode = localStorage.getItem('login_mode');
            if (savedMode === 'controle') {
              completeUser.isControle = true;
            } else if (savedMode === 'operacao') {
              completeUser.isControle = false;
            } else {
              completeUser.isControle = isNixon || uData.isControle || uData.papel === 'controle';
            }
            setUser(completeUser);

            // Fetch company metadata
            if (uData.empresaId) {
              const eDoc = await getDoc(doc(db, 'empresas', uData.empresaId));
              if (eDoc.exists()) {
                const eData = { id: uData.empresaId, ...eDoc.data() } as Empresa;
                if (completeUser.isControle || completeUser.papel === 'admin' || completeUser.papel === 'controle') {
                  eData.modulos = ['repack', 'validades', 'quebras', 'despejo', 'empilhador', 'refugo'];
                  eData.plano = 'completo';
                }
                setEmpresa(eData);
              }
            }
            setActivePanel('visao-geral');
          }
        } catch(e) {
          console.error('Error syncing auth metadata', e);
        }
      } else {
        setUser(null);
        setEmpresa(null);
        setActivePanel('landing');
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleAuthSuccess = (uProfile: any) => {
    const matchedUid = uProfile.uid || uProfile.id || 'demo-user';
    const userEmail = uProfile.email || '';
    const isNixon = userEmail.toLowerCase().trim() === 'nixon.a.a100.nh@gmail.com';
    
    const savedMode = localStorage.getItem('login_mode');
    let isControleVal = uProfile.isControle || isNixon;
    if (savedMode === 'controle') {
      isControleVal = true;
    } else if (savedMode === 'operacao') {
      isControleVal = false;
    }

    const completeUser: Usuario = {
      uid: matchedUid,
      nome: uProfile.nome || 'Operador',
      email: userEmail,
      empresaId: uProfile.empresaId || 'demo',
      papel: isNixon ? 'admin' : (uProfile.papel || uProfile.role || 'operador'),
      status: uProfile.status || 'ativo',
      isControle: isControleVal
    };
    setUser(completeUser);

    if (uProfile.empresa) {
      const eData = { ...uProfile.empresa };
      if (completeUser.isControle || completeUser.papel === 'admin' || completeUser.papel === 'controle') {
        eData.modulos = ['repack', 'validades', 'quebras', 'despejo', 'empilhador', 'refugo'];
        eData.plano = 'completo';
      }
      setEmpresa(eData);
    } else {
      setEmpresa({
        id: uProfile.empresaId || 'demo',
        nome: uProfile.empresaNome || 'Minha Empresa',
        cidade: '',
        estado: '',
        plano: uProfile.plano || 'completo',
        modulos: ['repack', 'validades', 'quebras', 'despejo', 'empilhador', 'refugo'],
        ativo: true
      });
    }

    setShowAuthGate(false);
    setActivePanel('visao-geral');
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    setEmpresa(null);
    setActivePanel('landing');
    setShowAuthGate(false);
  };

  // Main navigation orchestration router
  const renderActivePanel = () => {
    if (!user) {
      return null;
    }

    switch (activePanel) {
      case 'dashboard':
      case 'visao-geral':
        return (
          <DashboardOverview 
            user={user} 
            empresa={empresa} 
            onNavigate={setActivePanel} 
            kpiStats={{
              usuarios: 3,
              modulos: empresa?.modulos ? empresa.modulos.length : 6,
              docsHoje: 12,
              alertasFefo: 4
            }}
          />
        );
      case 'repack':
        return <RepackPanel user={user} empresa={empresa} />;
      case 'repack-dashboard':
        return <RepackDashboard user={user} empresa={empresa} onBack={() => setActivePanel('visao-geral')} />;
      case 'despejo-dashboard':
        return <DespejoDashboard user={user} empresa={empresa} onBack={() => setActivePanel('visao-geral')} />;
      case 'logistica-dashboard':
        return <LogisticaDashboard user={user} empresa={empresa} onBack={() => setActivePanel('visao-geral')} />;
      case 'quebras-dashboard':
        return <QuebrasDashboard user={user} empresa={empresa} onBack={() => setActivePanel('visao-geral')} />;
      case 'fefo-dashboard':
        return <FefoDashboard user={user} empresa={empresa} onBack={() => setActivePanel('visao-geral')} />;
      case 'blitz-dashboard':
        return <BlitzDashboard user={user} empresa={empresa} onBack={() => setActivePanel('visao-geral')} />;
      case 'despejo':
        return <DespejoPanel user={user} empresa={empresa} />;
      case 'armazem':
        return <ArmazemPanel user={user} empresa={empresa} />;
      case 'quebras':
        return <QuebrasPanel user={user} empresa={empresa} />;
      case 'validades':
        return <ValidadesPanel user={user} empresa={empresa} />;
      case 'refugo':
        return <RefugoPanel user={user} empresa={empresa} />;
      case 'empilhador':
        return <EmpilhadorPanel user={user} empresa={empresa} />;
      case 'conferente':
        return <ConferentePanel user={user} empresa={empresa} />;
      case 'controle':
        return <ControlePanel user={user} empresa={empresa} />;
      case 'firebase':
        return <FirebasePanel />;
      case 'exportar':
        return <ExportarPanel user={user} empresa={empresa} />;
      case 'configuracao':
      case 'admin':
        return <AdminPanel user={user} empresa={empresa} />;
      default:
        return (
          <DashboardOverview 
            user={user} 
            empresa={empresa} 
            onNavigate={setActivePanel} 
            kpiStats={{
              usuarios: 3,
              modulos: empresa?.modulos ? empresa.modulos.length : 6,
              docsHoje: 12,
              alertasFefo: 4
            }}
          />
        );
    }
  };

  const getHeaderInfo = (panel: string) => {
    const defaultInfo = {
      breadcrumbs: ['Armazém Fácil', 'Painel'],
      title: 'Painel Geral',
      subtitle: 'Visão operacional e de monitoramento do pátio.',
      color: 'from-amber-500/5 to-transparent'
    };
    
    switch (panel) {
      case 'visao-geral':
        return {
          breadcrumbs: ['Início', 'Visão Geral'],
          title: 'Visão Geral do Pátio',
          subtitle: 'Acompanhamento em tempo real das movimentações, alertas de vencimento e produtividade do pátio.',
          color: 'from-amber-500/10 to-transparent'
        };
      case 'repack-dashboard':
        return {
          breadcrumbs: ['Analytics & B.I.', 'Dashboard Repack'],
          title: 'Dashboard Repack',
          subtitle: 'Análise de performance, produtividade de operadores e eficiência de reembalagem.',
          color: 'from-purple-500/10 to-transparent'
        };
      case 'despejo-dashboard':
        return {
          breadcrumbs: ['Analytics & B.I.', 'Dashboard Despejo'],
          title: 'Dashboard Despejo',
          subtitle: 'Monitoramento corporativo de descarte de líquidos e eficiência operacional.',
          color: 'from-rose-500/10 to-transparent'
        };
      case 'logistica-dashboard':
        return {
          breadcrumbs: ['Analytics & B.I.', 'Dashboard Logística'],
          title: 'Dashboard Logística',
          subtitle: 'Análise de tempos de carregamento, janelas logísticas e fluxo de caminhões.',
          color: 'from-sky-500/10 to-transparent'
        };
      case 'quebras-dashboard':
        return {
          breadcrumbs: ['Analytics & B.I.', 'Dashboard Quebras'],
          title: 'Dashboard Quebras',
          subtitle: 'Análise detalhada de avarias, perdas por setor e motivos de quebra.',
          color: 'from-amber-500/10 to-transparent'
        };
      case 'fefo-dashboard':
        return {
          breadcrumbs: ['Analytics & B.I.', 'Dashboard FEFO'],
          title: 'Dashboard FEFO (Validades)',
          subtitle: 'Indicadores de produtos próximos ao vencimento, lotes em risco e perdas evitadas.',
          color: 'from-emerald-500/10 to-transparent'
        };
      case 'blitz-dashboard':
        return {
          breadcrumbs: ['Analytics & B.I.', 'Dashboard Blitz'],
          title: 'Dashboard Blitz (Refugo)',
          subtitle: 'Monitoramento de blitz preventivas e refugo de embalagens recuperáveis.',
          color: 'from-indigo-500/10 to-transparent'
        };
      case 'repack':
        return {
          breadcrumbs: ['Setores de Operação', 'Registro de Repack'],
          title: 'Operação Repack',
          subtitle: 'Área para operadores registrarem produtividade e volumes reembalados.',
          color: 'from-purple-500/10 to-transparent'
        };
      case 'despejo':
        return {
          breadcrumbs: ['Setores de Operação', 'Registro de Despejo'],
          title: 'Operação Despejo',
          subtitle: 'Lançamento de caixas de garrafas e líquidos destinados a descarte.',
          color: 'from-rose-500/10 to-transparent'
        };
      case 'armazem':
        return {
          breadcrumbs: ['Setores de Operação', 'Armazém Fácil'],
          title: 'Armazém Fácil',
          subtitle: 'Controle de posições de estoque, endereçamento e contagens cíclicas.',
          color: 'from-sky-500/10 to-transparent'
        };
      case 'quebras':
        return {
          breadcrumbs: ['Setores de Operação', 'Registro de Quebras'],
          title: 'Operação Quebras',
          subtitle: 'Registro imediato de avarias físicas identificadas nas ruas de estoque.',
          color: 'from-red-500/10 to-transparent'
        };
      case 'validades':
        return {
          breadcrumbs: ['Setores de Operação', 'Registro de Validades'],
          title: 'Operação Validades',
          subtitle: 'Cadastro de lotes e datas de vencimento para controle de giro (FEFO).',
          color: 'from-emerald-500/10 to-transparent'
        };
      case 'refugo':
        return {
          breadcrumbs: ['Setores de Operação', 'Blitz Refugo'],
          title: 'Blitz Refugo',
          subtitle: 'Auditoria de caixas descartadas para detecção de itens aproveitáveis.',
          color: 'from-indigo-500/10 to-transparent'
        };
      case 'empilhador':
        return {
          breadcrumbs: ['Setores de Operação', 'Movimentação Picking'],
          title: 'Operação Picking',
          subtitle: 'Atribuição e acompanhamento de tarefas para operadores de empilhadeira.',
          color: 'from-amber-500/10 to-transparent'
        };
      case 'conferente':
        return {
          breadcrumbs: ['Setores de Operação', 'Conferência Geral'],
          title: 'Conferência Geral',
          subtitle: 'Validação de volumes expedidos, recebimentos e auditoria de pallets.',
          color: 'from-teal-500/10 to-transparent'
        };
      case 'controle':
        return {
          breadcrumbs: ['Administrativo', 'Painel Controle'],
          title: 'Painel Controle',
          subtitle: 'Gerenciamento de operadores, atribuição de senhas, liberação de turnos.',
          color: 'from-amber-500/10 to-transparent'
        };
      case 'exportar':
        return {
          breadcrumbs: ['Sistemas', 'Exportador de Dados'],
          title: 'Exportar Base',
          subtitle: 'Extração unificada de relatórios operacionais em formato CSV e planilhas.',
          color: 'from-gray-500/10 to-transparent'
        };
      case 'firebase':
        return {
          breadcrumbs: ['Sistemas', 'Status do Banco'],
          title: 'Conexão Firestore',
          subtitle: 'Configuração e teste de latência do banco de dados na nuvem corporativa.',
          color: 'from-amber-500/10 to-transparent'
        };
      case 'admin':
        return {
          breadcrumbs: ['Sistemas', 'Painel Admin'],
          title: 'Painel do Administrador',
          subtitle: 'Gerenciamento global de unidades, parâmetros e chaves de API.',
          color: 'from-amber-500/10 to-transparent'
        };
      default:
        return defaultInfo;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090d] flex flex-col items-center justify-center text-snow">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center"
        >
          <div className="w-10 h-10 border-2 border-t-transparent border-[#f5a623] rounded-full animate-spin"></div>
          <span className="text-xs font-bold tracking-widest text-[#f5a623] uppercase mt-4">Carregando Instância de Pátio...</span>
        </motion.div>
      </div>
    );
  }

  // Active view layout branches
  if (!user) {
    return (
      <div className="min-h-screen bg-[#07090d] text-[#e8eef5] overflow-x-hidden">
        <AnimatePresence mode="wait">
          {showAuthGate ? (
            <motion.div 
              key="auth-gate"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#07090d]"
            >
              {/* Absolute close button */}
              <button 
                onClick={() => setShowAuthGate(false)} 
                className="absolute top-6 right-6 p-2.5 rounded-xl border border-[#222d3a] hover:bg-[#151b23] text-xs font-bold text-[#6a7d92] hover:text-snow cursor-pointer tracking-wider uppercase transition-all"
              >
                ✕ Voltar ao Início
              </button>
              <div className="w-full max-w-lg">
                <LoginAuth 
                  onAuthSuccess={handleAuthSuccess} 
                  onBackToLanding={() => setShowAuthGate(false)} 
                />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="landing-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LandingPage onEnterApp={() => setShowAuthGate(true)} />
            </motion.div>
          )}
        </AnimatePresence>
        <div id="toast" className="toast">Notificação do Co-pilot</div>
      </div>
    );
  }

  const headerInfo = getHeaderInfo(activePanel);

  return (
    <div className="min-h-screen bg-[#07090d] text-[#e8eef5] flex flex-col md:flex-row font-sans overflow-x-hidden">
      
      {/* Sidebar navigation */}
      <Sidebar 
        user={user} 
        empresa={empresa} 
        activeTab={activePanel} 
        onSelectTab={setActivePanel} 
        onLogout={handleLogout}
        isFbOnline={isCustomFirebaseConnected()}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
      />

      {/* Main workspace arena with smooth tab switching */}
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-y-auto overflow-x-hidden w-full max-w-full">
        
        {/* Workspace Top Header (Glassmorphic & Premium) */}
        <header className="sticky top-0 z-30 bg-[#07090d]/85 backdrop-blur-md border-b border-[#1c2530] pl-16 pr-6 md:px-6 py-4 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-[#6a7d92]">
              <span>{empresa?.nome || 'Enterprise Unit'}</span>
              <span className="text-[#1c2530] font-bold">/</span>
              <span>{headerInfo.breadcrumbs[0]}</span>
              {headerInfo.breadcrumbs[1] && (
                <>
                  <span className="text-[#1c2530] font-bold">/</span>
                  <span className="text-[#f5a623]">{headerInfo.breadcrumbs[1]}</span>
                </>
              )}
            </div>
            
            {/* Page title and description */}
            <div className="mt-1 flex items-baseline gap-2">
              <h1 className="font-sans font-black text-lg tracking-tight text-white uppercase">
                {headerInfo.title}
              </h1>
              <span className="hidden md:inline text-[10px] px-2 py-0.5 rounded bg-[#11151c] border border-[#1c2530] text-[#6a7d92] uppercase font-bold tracking-wider">
                {activePanel}
              </span>
            </div>
          </div>

          {/* Quick Stats / System Health widget */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-shrink-0">
            <div className="hidden lg:flex flex-col items-end text-right">
              <div className="text-[10px] text-white font-bold uppercase tracking-wider">
                Operador: {user.nome?.split(' ')[0]}
              </div>
              <div className="text-[9px] text-[#6a7d92] font-mono">
                IP: Intranet-Secure ({isCustomFirebaseConnected() ? 'Nuvem' : 'Local'})
              </div>
            </div>

            <div className="w-[1px] h-8 bg-[#1c2530] hidden lg:block" />

            {/* Live Indicator Widget */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#11151c] border border-[#1c2530] text-[10px] font-sans font-black tracking-wider text-[#6a7d92]">
              <span className="w-2 h-2 rounded-full bg-[#f5a623] animate-pulse" />
              <span className="uppercase text-gray-300">Setores Ativos: 8</span>
            </div>
          </div>
        </header>

        {/* Inner Content Body */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 relative">
          
          {/* Subtle decorative glow */}
          <div className={`absolute top-0 left-0 w-96 h-96 bg-gradient-to-br ${headerInfo.color} rounded-full blur-3xl pointer-events-none opacity-40 z-0`} />

          <div className={`relative z-10 ${activePanel.endsWith('-dashboard') ? 'max-w-[1600px]' : 'max-w-6xl'} mx-auto w-full transition-all duration-300`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activePanel}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {renderActivePanel()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Floating dynamic status toaster */}
      <div id="toast" className="toast">Notificação de Pátio</div>
    </div>
  );
}
