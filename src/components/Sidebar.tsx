import React, { useState, useEffect } from 'react';
import { Usuario, Empresa } from '../types';
import { 
  LayoutDashboard, 
  RefreshCw, 
  Trash2, 
  Truck, 
  AlertTriangle, 
  Calendar, 
  Search, 
  Package, 
  ClipboardCheck, 
  Download, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  Database,
  BarChart2,
  Sun,
  Moon,
  Sliders,
  Terminal,
  Activity,
  Layers,
  SearchCode,
  Shield,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  user: Usuario;
  empresa: Empresa | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  isFbOnline: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function Sidebar({
  user,
  empresa,
  activeTab,
  onSelectTab,
  onLogout,
  isFbOnline,
  theme,
  onToggleTheme
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Tick clock effect
  useEffect(() => {
    const tick = () => {
      setTimeStr(new Date().toLocaleTimeString('pt-BR', { hour12: false }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileOpen(false);
  };

  const isNixon = user.email.toLowerCase().trim() === 'nixon.a.a100.nh@gmail.com';
  const isSupervisorOrAdmin = user.isControle || user.papel === 'admin' || user.papel === 'controle' || isNixon;

  // Let's model all potential navigation items with category tags
  const navItems = [
    // General
    {
      id: 'visao-geral',
      label: 'Visão Geral',
      icon: <LayoutDashboard className="w-4 h-4" />,
      category: 'GERAL',
      visible: true
    },
    
    // BI & Analytics
    {
      id: 'repack-dashboard',
      label: 'Dashboard Repack',
      icon: <BarChart2 className="w-4 h-4 text-purple-400" />,
      category: '📊 ANALYTICS & B.I.',
      visible: isSupervisorOrAdmin
    },
    {
      id: 'despejo-dashboard',
      label: 'Dashboard Despejo',
      icon: <BarChart2 className="w-4 h-4 text-rose-500" />,
      category: '📊 ANALYTICS & B.I.',
      visible: isSupervisorOrAdmin
    },
    {
      id: 'logistica-dashboard',
      label: 'Dashboard Logística',
      icon: <Truck className="w-4 h-4 text-sky-400" />,
      category: '📊 ANALYTICS & B.I.',
      visible: isSupervisorOrAdmin
    },
    {
      id: 'quebras-dashboard',
      label: 'Dashboard Quebras',
      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
      category: '📊 ANALYTICS & B.I.',
      visible: isSupervisorOrAdmin
    },
    {
      id: 'fefo-dashboard',
      label: 'Dashboard FEFO (Validades)',
      icon: <Calendar className="w-4 h-4 text-emerald-500" />,
      category: '📊 ANALYTICS & B.I.',
      visible: isSupervisorOrAdmin
    },
    {
      id: 'blitz-dashboard',
      label: 'Dashboard Blitz (Refugo)',
      icon: <Search className="w-4 h-4 text-indigo-400" />,
      category: '📊 ANALYTICS & B.I.',
      visible: isSupervisorOrAdmin
    },

    // Operations / Sectores
    {
      id: 'repack',
      label: 'Operação Repack',
      icon: <RefreshCw className="w-4 h-4 text-purple-400 animate-spin-hover" />,
      category: '⚙️ SETORES DE OPERAÇÃO',
      visible: isSupervisorOrAdmin || user.papel === 'repack' || user.papel === 'admin'
    },
    {
      id: 'despejo',
      label: 'Operação Despejo',
      icon: <Trash2 className="w-4 h-4 text-rose-500" />,
      category: '⚙️ SETORES DE OPERAÇÃO',
      visible: isSupervisorOrAdmin || user.papel === 'despejo' || user.papel === 'admin'
    },
    {
      id: 'armazem',
      label: 'Armazém Fácil',
      icon: <Truck className="w-4 h-4 text-sky-400" />,
      category: '⚙️ SETORES DE OPERAÇÃO',
      visible: isSupervisorOrAdmin || user.papel === 'armazem' || user.papel === 'admin'
    },
    {
      id: 'quebras',
      label: 'Operação Quebras',
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      category: '⚙️ SETORES DE OPERAÇÃO',
      visible: isSupervisorOrAdmin || user.papel === 'quebras' || user.papel === 'admin'
    },
    {
      id: 'validades',
      label: 'Operação Validades',
      icon: <Calendar className="w-4 h-4 text-emerald-500" />,
      category: '⚙️ SETORES DE OPERAÇÃO',
      visible: isSupervisorOrAdmin || user.papel === 'validades' || user.papel === 'admin'
    },
    {
      id: 'refugo',
      label: 'Blitz Refugo',
      icon: <Search className="w-4 h-4 text-indigo-400" />,
      category: '⚙️ SETORES DE OPERAÇÃO',
      visible: isSupervisorOrAdmin || user.papel === 'refugo' || user.papel === 'admin'
    },
    {
      id: 'empilhador',
      label: 'Operação Picking',
      icon: <Package className="w-4 h-4 text-amber-500" />,
      category: '⚙️ SETORES DE OPERAÇÃO',
      visible: isSupervisorOrAdmin || user.papel === 'empilhador' || user.papel === 'admin'
    },
    {
      id: 'conferente',
      label: 'Conferência Geral',
      icon: <ClipboardCheck className="w-4 h-4 text-teal-400" />,
      category: '⚙️ SETORES DE OPERAÇÃO',
      visible: isSupervisorOrAdmin || user.papel === 'conferente' || user.papel === 'admin'
    },

    // Administrative / Core
    {
      id: 'controle',
      label: 'Painel Controle',
      icon: <Sliders className="w-4 h-4 text-amber-500" />,
      category: '🛡️ ADMINISTRAÇÃO & GESTÃO',
      visible: isSupervisorOrAdmin
    },
    {
      id: 'exportar',
      label: 'Exportar Base',
      icon: <Download className="w-4 h-4 text-gray-400" />,
      category: '🛡️ ADMINISTRAÇÃO & GESTÃO',
      visible: isSupervisorOrAdmin
    },
    {
      id: 'firebase',
      label: 'Status Firestore',
      icon: <Database className="w-4 h-4 text-amber-500" />,
      category: '🛡️ ADMINISTRAÇÃO & GESTÃO',
      visible: isSupervisorOrAdmin
    }
  ];

  // Filtering based on visibility and search query
  const filteredNavItems = navItems.filter(item => {
    if (!item.visible) return false;
    if (searchQuery.trim() === '') return true;
    return (
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Unique categories left after search
  const activeCategories = Array.from(new Set(filteredNavItems.map(item => item.category)));

  const renderNavItem = (item: typeof navItems[0]) => {
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => handleNavClick(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-none text-left cursor-pointer transition-all relative overflow-hidden group ${
          isActive 
            ? 'bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/15 shadow-[inset_0_1px_12px_rgba(245,166,35,0.04)] font-semibold' 
            : 'text-[#6a7d92] hover:text-[#e8eef5] hover:bg-[#151b23]'
        }`}
        title={item.label}
      >
        {isActive && (
          <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#f5a623] rounded-r animate-pulse-slow" />
        )}
        <span className={`w-5 h-5 flex items-center justify-center transition-transform duration-200 ${
          isActive ? 'text-[#f5a623] scale-110' : 'text-[#6a7d92] group-hover:text-[#e8eef5] group-hover:scale-105'
        }`}>
          {item.icon}
        </span>
        {!collapsed && (
          <span className="font-sans font-medium text-[11px] uppercase tracking-wider flex-1 truncate">
            {item.label}
          </span>
        )}
      </button>
    );
  };

  // Get user short name for badge / avatar
  const getInitials = (name: string) => {
    if (!name) return 'OP';
    const split = name.trim().split(' ');
    if (split.length === 1) return split[0].substring(0, 2).toUpperCase();
    return (split[0][0] + split[split.length - 1][0]).toUpperCase();
  };

  return (
    <>
      {/* Mobile Drawer Trigger Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
        />
      )}

      {/* Hamburger button for small screens */}
      {!mobileOpen && (
        <button 
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-40 w-10 h-10 rounded-xl bg-[#11151c]/90 backdrop-blur-md border border-[#222d3a] text-[#f5a623] text-lg flex items-center justify-center md:hidden cursor-pointer shadow-lg hover:bg-[#151b23] transition-all"
          title="Abrir Menu"
        >
          ☰
        </button>
      )}

      {/* Sidebar Layout */}
      <aside className={`fixed md:sticky top-0 h-screen bg-[#0b0e14] border-r border-[#1c2530] flex flex-col z-50 transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[250px]'
      } ${mobileOpen ? 'left-0 shadow-2xl' : '-left-[250px] md:left-0'}`}>
        
        {/* Brand Header block */}
        <div className="p-4 border-b border-[#1c2530] flex items-center justify-between relative bg-[#07090d]/30">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f5a623] to-[#d4780a] flex items-center justify-center text-sm shadow-[0_0_15px_rgba(245,166,35,0.3)] flex-shrink-0 relative overflow-hidden group">
              <Building2 className="w-4.5 h-4.5 text-[#07090d] transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </div>
            {!collapsed && (
              <div className="truncate flex flex-col">
                <span className="font-sans font-black text-xs tracking-wider text-white uppercase leading-none">
                  ARMAZÉM FÁCIL
                </span>
                <span className="text-[8px] text-[#f5a623] tracking-widest font-mono uppercase mt-1">
                  Enterprise v3.1
                </span>
              </div>
            )}
          </div>
          
          {/* Mobile close toggle */}
          {mobileOpen && (
            <button 
              onClick={() => setMobileOpen(false)}
              className="md:hidden w-8 h-8 rounded-xl bg-[#151b23] border border-[#222d3a] text-[#6a7d92] hover:text-[#ef4444] hover:border-[#ef4444]/30 flex items-center justify-center cursor-pointer transition-colors ml-2"
              title="Fechar Menu"
            >
              ✕
            </button>
          )}

          {/* Desktop/Tablet collapse toggle */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#0b0e14] border border-[#1c2530] text-[#6a7d92] hover:text-[#f5a623] hover:border-[#f5a623]/50 items-center justify-center cursor-pointer shadow-lg z-50 transition-all duration-300 hover:scale-110"
            title={collapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Dynamic SaaS Tenant User Profile Card */}
        {!collapsed ? (
          <div className="p-3.5 mx-3 mt-3 rounded-xl bg-[#11151c]/60 border border-[#1c2530] relative overflow-hidden group hover:border-[#f5a623]/25 transition-all">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#f5a623]/5 rounded-full blur-xl -mr-6 -mt-6" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f5a623]/20 to-[#f5a623]/5 border border-[#f5a623]/30 flex items-center justify-center text-[#f5a623] font-bold text-xs shadow-sm flex-shrink-0">
                {getInitials(user.nome)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase font-black text-[#f5a623] tracking-widest truncate mb-0.5">
                  {empresa?.nome || 'Unidade Pátio'}
                </div>
                <div className="text-xs text-white truncate font-bold leading-none">
                  {user.nome || 'Operador'}
                </div>
                <div className="text-[9px] text-[#6a7d92] font-semibold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] animate-pulse" />
                  {user.papel === 'admin' ? 'Administração' : (user.papel === 'controle' || user.isControle) ? 'Controle/Supervisor' : 'Operações'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-1.5 mt-3 pt-2.5 border-t border-[#1c2530]">
              <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 rounded-md">
                ✓ ATIVO
              </span>
              <button 
                onClick={onLogout}
                className="text-[10px] font-bold text-[#6a7d92] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-md px-1.5 py-1 flex items-center gap-1 cursor-pointer transition-colors ml-auto"
                title="Sair da Conta"
              >
                <LogOut className="w-3 h-3" />
                <span>SAIR</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="my-4 flex justify-center">
            <div 
              className="w-10 h-10 rounded-full bg-[#11151c] border border-[#1c2530] flex items-center justify-center text-[#f5a623] font-black text-xs cursor-pointer hover:border-[#f5a623]/40 transition-colors"
              title={`${user.nome} - Sair`}
              onClick={onLogout}
            >
              {getInitials(user.nome)}
            </div>
          </div>
        )}

        {/* Real-time search filter */}
        {!collapsed && (
          <div className="px-3 pt-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6a7d92]" />
              <input 
                type="text"
                placeholder="Ir para setor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#11151c]/50 border border-[#1c2530] hover:border-[#1c2530]*2 rounded-lg pl-8 pr-6 py-1.5 font-sans text-xs text-white placeholder-[#6a7d92] outline-none transition-all focus:border-[#f5a623]/40 focus:bg-[#11151c]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#6a7d92] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin">
          {activeCategories.map(category => {
            const items = filteredNavItems.filter(item => item.category === category);
            if (items.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                {/* Category Header */}
                {!collapsed ? (
                  <div className="text-[8px] uppercase tracking-widest font-black text-[#6a7d92]/70 px-3 py-1 flex items-center justify-between">
                    <span>{category}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1c2530]" />
                  </div>
                ) : (
                  <div className="border-t border-[#1c2530]/60 my-2" />
                )}

                {/* Nav Items */}
                <div className="space-y-0.5">
                  {items.map(renderNavItem)}
                </div>
              </div>
            );
          })}

          {filteredNavItems.length === 0 && (
            <div className="p-4 text-center">
              <HelpCircle className="w-8 h-8 text-[#6a7d92]/40 mx-auto mb-2" />
              <span className="text-[10px] text-[#6a7d92] uppercase font-bold tracking-wider block">
                Nenhum setor encontrado
              </span>
            </div>
          )}
        </nav>

        {/* Sidebar Footer block: Network indicators / Clock time */}
        <div className="p-3 border-t border-[#1c2530] bg-[#07090d]/40 flex flex-col gap-2 items-center text-center">
          <div className="font-mono text-xs text-[#f5a623] tracking-wider select-none font-bold">
            {collapsed ? '🕒' : `🕒 ${timeStr}`}
          </div>

          {/* Theme switch button */}
          <button 
            onClick={onToggleTheme}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#11151c]/60 border border-[#1c2530] text-[10px] font-sans font-black tracking-wider hover:border-[#f5a623]/40 hover:text-white transition-all cursor-pointer ${
              collapsed ? 'w-10 h-10 p-0' : 'w-full'
            }`}
            title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#f5a623] animate-pulse-slow" />
                {!collapsed && <span className="uppercase text-gray-300">Tema Claro</span>}
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-sky-400" />
                {!collapsed && <span className="uppercase text-gray-700">Tema Escuro</span>}
              </>
            )}
          </button>

          {!collapsed && (
            <div className={`w-full py-1.5 px-2.5 rounded-lg font-sans font-black text-[9px] tracking-widest text-center border transition-all ${
              isFbOnline 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
            }`}>
              {isFbOnline ? '🟢 FIRESTORE INTEGRADO' : '🔴 OFFLINE'}
            </div>
          )}
        </div>

      </aside>
    </>
  );
}
